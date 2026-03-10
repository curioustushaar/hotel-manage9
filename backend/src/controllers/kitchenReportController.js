const Order = require('../models/Order');
const Menu = require('../models/Menu');

const ACTIVE_STATUSES = ['Active', 'Pending', 'Preparing', 'Started'];
const READY_STATUSES = ['Ready'];
const DONE_STATUSES = ['Completed', 'Billed', 'Closed', 'Served', 'Pending Payment'];

function getMinutesSince(date) {
    if (!date) return 0;
    return Math.floor((Date.now() - new Date(date).getTime()) / 60000);
}

function getPrepMinutes(order) {
    const start = order.createdAt ? new Date(order.createdAt) : null;
    const end = order.closedAt ? new Date(order.closedAt) : (order.updatedAt ? new Date(order.updatedAt) : null);
    if (!start || !end) return 0;
    return Math.max(0, Math.floor((end - start) / 60000));
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

        const orders = await Order.find(query).sort({ createdAt: -1 }).lean();

        const categoryFilter = category && category !== 'All' ? category : null;

        // --- Summary Stats ---
        let totalOrders = 0;
        let kotPending = 0;
        let ordersPrep = 0;
        let ordersReady = 0;
        let delayedCount = 0;
        let prepTimesSum = 0;
        let prepTimesCount = 0;

        // --- Pending KOT Table ---
        const pendingOrders = [];

        // --- Hourly Distribution ---
        const hourlyMap = {};
        for (let h = 0; h < 24; h++) hourlyMap[h] = { hour: h, total: 0, pending: 0, avgPrep: 0, prepSums: 0, prepCounts: 0 };

        // --- Chef Workload (use guestName or orderType as proxy since no chef field) ---
        // We'll aggregate by orderType as "station"
        const stationMap = {};

        orders.forEach(order => {
            const normType = normalizeOrderType(order.orderType);
            const status = order.status || 'Active';
            const isPending = ACTIVE_STATUSES.includes(status);
            const isReady = READY_STATUSES.includes(status);
            const isDone = DONE_STATUSES.includes(status);
            const pendingMins = isPending ? getMinutesSince(order.createdAt) : 0;
            const prepMins = isDone ? getPrepMinutes(order) : 0;
            const isDelayed = (isPending && pendingMins > 20) || (isDone && prepMins > 25);
            const itemCount = (order.items || []).length;
            const hour = order.createdAt ? new Date(order.createdAt).getHours() : 0;

            // Apply category filter check (does any item match?)
            let hasMatchingItem = !categoryFilter;
            if (categoryFilter && order.items) {
                hasMatchingItem = order.items.some(i => (i.category || 'Uncategorized') === categoryFilter);
            }
            if (!hasMatchingItem) return;

            totalOrders++;
            if (isPending) kotPending++;
            else if (isReady) ordersReady++;
            if (isPending || isReady) ordersPrep++;
            if (isDelayed) delayedCount++;
            if (isDone && prepMins > 0) {
                prepTimesSum += prepMins;
                prepTimesCount++;
            }

            // Hourly
            hourlyMap[hour].total++;
            if (isPending) hourlyMap[hour].pending++;
            if (isDone && prepMins > 0) {
                hourlyMap[hour].prepSums += prepMins;
                hourlyMap[hour].prepCounts++;
            }

            // Station/Chef workload
            if (!stationMap[normType]) stationMap[normType] = { chef: normType, assigned: 0, pending: 0 };
            stationMap[normType].assigned++;
            if (isPending || isReady) stationMap[normType].pending++;

            // Build pending KOT table row
            if (isPending || isReady) {
                const tableOrRoom = order.roomNumber
                    ? `Room ${order.roomNumber}`
                    : (order.tableNumber ? `Table ${order.tableNumber}` : 'Walk-In');

                let priorityLabel = 'Normal';
                if (pendingMins >= 10) priorityLabel = 'High';
                else if (pendingMins >= 5) priorityLabel = 'Medium';

                pendingOrders.push({
                    kotNo: `KOT-${order._id.toString().slice(-6).toUpperCase()}`,
                    tableRoom: tableOrRoom,
                    orderType: normType,
                    itemsCount: itemCount,
                    chef: normType + ' Station',
                    orderTime: formatTime(order.createdAt),
                    pendingMins,
                    priority: priorityLabel,
                    status: isReady ? 'Ready' : status
                });
            }
        });

        // Finalize hourly
        const hourlyData = Object.values(hourlyMap).map(h => ({
            hour: `${String(h.hour).padStart(2, '0')}:00`,
            total: h.total,
            pending: h.pending,
            avgPrep: h.prepCounts > 0 ? Math.round(h.prepSums / h.prepCounts) : 0
        }));

        const avgPrepTime = prepTimesCount > 0 ? Math.round(prepTimesSum / prepTimesCount) : 0;

        const summary = {
            totalOrders,
            kotPending,
            ordersPrep,
            ordersReady,
            avgPrepTime,
            delayedCount
        };

        // Sort pending orders: High priority first, then by pendingMins desc
        pendingOrders.sort((a, b) => {
            const priorityOrder = { High: 0, Medium: 1, Normal: 2 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) return priorityOrder[a.priority] - priorityOrder[b.priority];
            return b.pendingMins - a.pendingMins;
        });

        res.json({
            success: true,
            summary,
            pendingOrders,
            hourlyData,
            chefWorkload: Object.values(stationMap),
            categories
        });
    } catch (error) {
        console.error('Error generating kitchen report:', error);
        res.status(500).json({ success: false, message: 'Failed to generate kitchen report' });
    }
};
