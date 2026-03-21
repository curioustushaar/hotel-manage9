const Order = require('../models/Order');
const Menu = require('../models/Menu');
const Table = require('../models/Table');
const Room = require('../models/Room');

const ACTIVE_STATUSES = ['Active', 'Pending', 'Preparing', 'Started'];
const READY_STATUSES = ['Ready'];
const DONE_STATUSES = ['Completed', 'Billed', 'Closed', 'Served', 'Pending Payment'];

const TARGET_PREP_MIN = 20;

function toDate(value) {
    return value ? new Date(value) : null;
}

function getMinutesSince(date) {
    if (!date) return 0;
    return Math.floor((Date.now() - new Date(date).getTime()) / 60000);
}

function getPrepMinutes(order) {
    const start = order.createdAt ? new Date(order.createdAt) : null;
    const end = order.closedAt ? new Date(order.closedAt) : (order.updatedAt ? new Date(order.updatedAt) : null);
    if (!start || !end) return 0;
    const mins = Math.max(0, Math.floor((end - start) / 60000));
    // Ignore unrealistic spans coming from legacy/backfilled timestamps.
    if (mins > 240) return 0;
    return mins;
}

function formatDuration(minutes) {
    const mins = Math.max(0, Math.floor(minutes || 0));
    const hours = Math.floor(mins / 60);
    const remaining = mins % 60;
    if (hours > 0) return `${hours}h ${remaining}m`;
    return `${remaining}m`;
}

function formatTime(d) {
    if (!d) return 'N/A';
    return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function normalizeOrderType(raw) {
    if (!raw) return 'Dine-In';
    const r = raw.trim();
    if (['Room Service', 'Post to Room', 'Room Order'].includes(r)) return 'Room Order';
    if (['Online', 'Online Order', 'Delivery'].includes(r)) return 'Online Order';
    if (r === 'Take Away') return 'Take Away';
    return 'Dine-In';
}

exports.getKitchenReport = async (req, res) => {
    try {
        const { category, orderType, startDate, endDate } = req.query;

        let start = new Date();
        start.setHours(0, 0, 0, 0);
        if (startDate && !isNaN(new Date(startDate))) {
            start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
        }

        let end = new Date();
        end.setHours(23, 59, 59, 999);
        if (endDate && !isNaN(new Date(endDate))) {
            end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
        }

        // Fetch distinct categories from Menu
        const categories = await Menu.distinct('category');

        const query = { createdAt: { $gte: start, $lte: end } };

        // Filter by orderType
        if (orderType && orderType !== 'All') {
            if (orderType === 'Room Order') {
                query.orderType = { $in: ['Room Service', 'Post to Room', 'Room Order'] };
            } else if (orderType === 'Online Order') {
                query.orderType = { $in: ['Online Order', 'Online', 'Delivery'] };
            } else if (orderType === 'Take Away') {
                query.orderType = 'Take Away';
            } else {
                query.orderType = { $in: ['Dine-In', 'Direct Payment', 'Table Order'] };
            }
        }

        const [orders, totalTablesDb, totalRoomsDb] = await Promise.all([
            Order.find(query).sort({ createdAt: -1 }).lean(),
            Table.countDocuments(),
            Room.countDocuments().catch(() => 0)
        ]);

        const categoryFilter = category && category !== 'All' ? category : null;

        let totalOrders = 0;
        let kotPending = 0;
        let preparingCount = 0;
        let readyCount = 0;
        let deliveredCount = 0;
        let delayedCount = 0;
        let prepTimesSum = 0;
        let prepTimesCount = 0;

        const pendingItems = [];
        const delayItems = [];
        const prepItems = [];
        const readyVsDeliveredRows = [];

        const hourlyMap = {};
        for (let h = 0; h < 24; h++) {
            hourlyMap[h] = {
                hour: `${String(h).padStart(2, '0')}:00`,
                pending: 0,
                delayed: 0,
                prepMinutesSum: 0,
                prepCount: 0,
                ready: 0,
                delivered: 0
            };
        }

        const stationMap = {};
        const engagedTables = new Set();
        const activeTables = new Set();
        const engagedRooms = new Set();
        const activeRooms = new Set();
        const outletMix = {
            dineInOrders: 0,
            roomOrders: 0,
            takeAwayOrders: 0,
            onlineOrders: 0
        };
        const statusByType = {
            dineIn: { total: 0, pending: 0, preparing: 0, ready: 0 },
            roomOrder: { total: 0, pending: 0, preparing: 0, ready: 0 },
            takeAway: { total: 0, pending: 0, preparing: 0, ready: 0 },
            onlineOrder: { total: 0, pending: 0, preparing: 0, ready: 0 }
        };

        orders.forEach(order => {
            const normType = normalizeOrderType(order.orderType);
            const status = order.status || 'Active';
            const isPending = ACTIVE_STATUSES.includes(status);
            const isReady = READY_STATUSES.includes(status);
            const isDone = DONE_STATUSES.includes(status);
            const pendingMins = isPending ? getMinutesSince(order.createdAt) : 0;
            const prepMins = isDone ? getPrepMinutes(order) : 0;
            const isDelayed = (isPending && pendingMins > 20) || (isDone && prepMins > 25);
            const hour = order.createdAt ? new Date(order.createdAt).getHours() : 0;
            const readyAt = toDate(order.updatedAt || order.closedAt);
            const deliveredAt = toDate(order.closedAt || order.updatedAt);

            // Apply category filter check (does any item match?)
            let hasMatchingItem = !categoryFilter;
            if (categoryFilter && order.items) {
                hasMatchingItem = order.items.some(i => (i.category || 'Uncategorized') === categoryFilter);
            }
            if (!hasMatchingItem) return;

            totalOrders++;
            const typeKey = normType === 'Dine-In'
                ? 'dineIn'
                : normType === 'Room Order'
                    ? 'roomOrder'
                    : normType === 'Take Away'
                        ? 'takeAway'
                        : 'onlineOrder';
            statusByType[typeKey].total += 1;
            statusByType[typeKey].pending += isPending ? 1 : 0;
            statusByType[typeKey].preparing += (status === 'Preparing' || status === 'Started') ? 1 : 0;
            statusByType[typeKey].ready += isReady ? 1 : 0;

            if (normType === 'Dine-In') outletMix.dineInOrders += 1;
            if (normType === 'Room Order') outletMix.roomOrders += 1;
            if (normType === 'Take Away') outletMix.takeAwayOrders += 1;
            if (normType === 'Online Order') outletMix.onlineOrders += 1;

            const tableKey = order.tableNumber ? String(order.tableNumber) : '';
            const roomKey = order.roomNumber ? String(order.roomNumber) : '';
            if (tableKey) {
                engagedTables.add(tableKey);
                if (isPending || status === 'Preparing' || status === 'Started' || isReady) {
                    activeTables.add(tableKey);
                }
            }
            if (roomKey) {
                engagedRooms.add(roomKey);
                if (isPending || status === 'Preparing' || status === 'Started' || isReady) {
                    activeRooms.add(roomKey);
                }
            }

            if (isPending) kotPending++;
            if (status === 'Preparing' || status === 'Started') preparingCount++;
            if (isReady) readyCount++;
            if (isDone) deliveredCount++;
            if (isDelayed) delayedCount++;
            if (isDone && prepMins > 0) {
                prepTimesSum += prepMins;
                prepTimesCount++;
            }

            hourlyMap[hour].pending += isPending ? 1 : 0;
            hourlyMap[hour].delayed += isDelayed ? 1 : 0;
            hourlyMap[hour].ready += isReady ? 1 : 0;
            hourlyMap[hour].delivered += isDone ? 1 : 0;
            if (isDone && prepMins > 0) {
                hourlyMap[hour].prepMinutesSum += prepMins;
                hourlyMap[hour].prepCount += 1;
            }

            if (!stationMap[normType]) {
                stationMap[normType] = { station: normType, total: 0, pending: 0, delayed: 0, avgPrep: 0, prepSum: 0, prepCount: 0 };
            }
            stationMap[normType].total += 1;
            stationMap[normType].pending += isPending ? 1 : 0;
            stationMap[normType].delayed += isDelayed ? 1 : 0;
            if (prepMins > 0) {
                stationMap[normType].prepSum += prepMins;
                stationMap[normType].prepCount += 1;
            }

            const tableOrRoom = order.roomNumber
                ? `Room ${order.roomNumber}`
                : (order.tableNumber ? `Table ${order.tableNumber}` : 'Walk-In');

            const orderItems = (order.items || []).filter(item => {
                if (!categoryFilter) return true;
                return (item.category || 'Uncategorized') === categoryFilter;
            });

            // Fallback: some legacy orders have no item array. Keep them visible in reports.
            const normalizedItems = orderItems.length
                ? orderItems
                : (categoryFilter
                    ? []
                    : [{
                        itemName: order.guestName || `${normType} Order`,
                        name: order.guestName || `${normType} Order`,
                        category: 'Uncategorized',
                        quantity: 1
                    }]);

            normalizedItems.forEach((item, idx) => {
                const itemName = item.itemName || item.name || `Item ${idx + 1}`;
                const itemCategory = item.category || 'Uncategorized';
                const qty = Number(item.quantity) || 1;
                const kotNo = `KOT-${order._id.toString().slice(-6).toUpperCase()}`;

                const completedSpanMinutes = getPrepMinutes(order);
                const pendingDurationMinutes = isPending
                    ? pendingMins
                    : (isReady || isDone)
                        ? completedSpanMinutes
                        : 0;

                const baseRecord = {
                    kotNo,
                    itemName,
                    category: itemCategory,
                    qty,
                    orderType: normType,
                    tableRoom: tableOrRoom,
                    startTime: formatTime(order.createdAt),
                    readyTime: formatTime(readyAt),
                    deliveredTime: formatTime(deliveredAt),
                    pendingMinutes: pendingDurationMinutes,
                    prepMinutes: prepMins,
                    delayMinutes: isDelayed ? (isPending ? Math.max(0, pendingMins - TARGET_PREP_MIN) : Math.max(0, prepMins - TARGET_PREP_MIN)) : 0,
                    status,
                    createdAt: order.createdAt
                };

                if (baseRecord.pendingMinutes > 0) {
                    pendingItems.push(baseRecord);
                }

                if (baseRecord.delayMinutes > 0) {
                    delayItems.push(baseRecord);
                }

                if (prepMins > 0) {
                    prepItems.push(baseRecord);
                }

                if (isReady || isDone) {
                    const deliveryGap = isDone && readyAt && deliveredAt
                        ? Math.max(0, Math.floor((deliveredAt - readyAt) / 60000))
                        : 0;
                    readyVsDeliveredRows.push({
                        ...baseRecord,
                        deliveryGapMinutes: deliveryGap,
                        deliveryGapLabel: formatDuration(deliveryGap),
                        stage: isDone ? 'Delivered' : 'Ready'
                    });
                }
            });
        });

        const hourlyData = Object.values(hourlyMap).map(h => ({
            hour: h.hour,
            pending: h.pending,
            delayed: h.delayed,
            ready: h.ready,
            delivered: h.delivered,
            avgPrep: h.prepCount > 0 ? Math.round(h.prepMinutesSum / h.prepCount) : 0
        }));

        const avgPrepTime = prepTimesCount > 0 ? Math.round(prepTimesSum / prepTimesCount) : 0;

        const stations = Object.values(stationMap).map(st => ({
            station: st.station,
            total: st.total,
            pending: st.pending,
            delayed: st.delayed,
            avgPrep: st.prepCount > 0 ? Math.round(st.prepSum / st.prepCount) : 0,
            loadRatio: st.total > 0 ? Number(((st.pending / st.total) * 100).toFixed(1)) : 0
        })).sort((a, b) => b.total - a.total);

        const totalTables = totalTablesDb > 0 ? totalTablesDb : engagedTables.size;
        const occupiedTables = activeTables.size > 0 ? activeTables.size : engagedTables.size;
        const availableTables = Math.max(0, totalTables - occupiedTables);
        const totalRooms = totalRoomsDb > 0 ? totalRoomsDb : engagedRooms.size;
        const occupiedRooms = activeRooms.size > 0 ? activeRooms.size : engagedRooms.size;
        const availableRooms = Math.max(0, totalRooms - occupiedRooms);
        const combinedTotal = totalTables + totalRooms;
        const combinedOccupied = occupiedTables + occupiedRooms;
        const combinedAvailable = Math.max(0, combinedTotal - combinedOccupied);
        const kitchenLoadRatio = totalOrders > 0 ? Number((((kotPending + preparingCount) / totalOrders) * 100).toFixed(1)) : 0;
        const readyVsDeliveredRatio = deliveredCount > 0 ? Number(((readyCount / deliveredCount) * 100).toFixed(1)) : 0;

        const kitchenLoadLabel = kitchenLoadRatio >= 70 ? 'High' : kitchenLoadRatio >= 40 ? 'Medium' : 'Low';
        const staffLoadLabel = stations.some(st => st.pending >= 8) ? 'High' : stations.some(st => st.pending >= 4) ? 'Normal' : 'Low';
        const delayRiskLabel = delayedCount >= 10 ? 'High' : delayedCount >= 4 ? 'Moderate' : 'Minimal';

        const summary = {
            totalOrders,
            kotPending,
            preparingCount,
            ordersReady: readyCount,
            deliveredCount,
            avgPrepTime,
            delayedCount,
            readyVsDeliveredRatio,
            kitchenLoadRatio,
            kitchenLoadLabel,
            staffLoadLabel,
            delayRiskLabel
        };

        pendingItems.sort((a, b) => b.pendingMinutes - a.pendingMinutes);
        delayItems.sort((a, b) => b.delayMinutes - a.delayMinutes);
        prepItems.sort((a, b) => b.prepMinutes - a.prepMinutes);
        readyVsDeliveredRows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            success: true,
            summary,
            tableStatus: {
                total: combinedTotal,
                occupied: combinedOccupied,
                available: combinedAvailable,
                totalTables,
                occupiedTables,
                availableTables,
                totalRooms,
                occupiedRooms,
                availableRooms,
                ...outletMix,
                statusByType
            },
            pendingItems,
            delayItems,
            prepItems,
            readyVsDelivered: {
                rows: readyVsDeliveredRows,
                graph: hourlyData.map(h => ({ hour: h.hour, ready: h.ready, delivered: h.delivered }))
            },
            kitchenLoad: {
                stations,
                ratio: kitchenLoadRatio,
                pending: kotPending,
                preparing: preparingCount,
                ready: readyCount,
                avgPrepTime,
                delayRisk: delayRiskLabel,
                staffLoad: staffLoadLabel,
                loadLabel: kitchenLoadLabel
            },
            hourlyData,
            chefWorkload: stations,
            categories
        });
    } catch (error) {
        console.error('Error generating kitchen report:', error);
        res.status(500).json({ success: false, message: 'Failed to generate kitchen report' });
    }
};
