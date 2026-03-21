const Table = require('../models/Table');
const Order = require('../models/Order');

const toYmdLocal = (value) => {
    if (!value) return null;
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return null;

    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

// @desc    Get table reservation report data
// @route   GET /api/reservation-report
// @access  Private
const getReservationReport = async (req, res) => {
    try {
        const { startDate, endDate, source, tableType } = req.query;

        const tables = await Table.find().lean();
        const tableTypes = [...new Set(tables.map(t => t.type || 'General'))];

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = toYmdLocal(today);

        const start = startDate ? new Date(startDate) : new Date(today);
        start.setHours(0, 0, 0, 0);
        const end = endDate ? new Date(endDate) : new Date(today);
        end.setHours(23, 59, 59, 999);

        const allDineInOrders = await Order.find({
            orderType: 'Dine-In',
            createdAt: { $gte: start, $lte: end }
        }).lean();

        let combinedData = [];
        const srcFilter = source && source !== 'All' ? source : null;

        // 1. Fetch RESERVATIONS from Table embedded array
        tables.forEach(table => {
            if (tableType && tableType !== 'All' && (table.type || 'General') !== tableType) return;
            if (!table.reservations || table.reservations.length === 0) return;

            table.reservations.forEach(r => {
                const rDate = r.date ? new Date(r.date) : null;
                if (!rDate || rDate < start || rDate > end) return;

                const rSource = r.source || 'Phone';
                if (srcFilter && srcFilter !== 'Walk-In' && rSource !== srcFilter) return;
                if (srcFilter === 'Walk-In') return; // Walk-In filter only shows orders

                let currentStatus = r.status || 'Upcoming';

                // Auto No-Show detection for past upcoming reservations
                if (currentStatus === 'Upcoming') {
                    const [rHour, rMin] = (r.startTime || '00:00').split(':').map(Number);
                    const fullRDate = new Date(r.date);
                    fullRDate.setHours(rHour, rMin, 0, 0);

                    if (new Date() > new Date(fullRDate.getTime() + 2 * 60 * 60 * 1000)) {
                        const hadOrder = allDineInOrders.some(ord => {
                            const ordDate = new Date(ord.createdAt);
                            return ord.tableId?.toString() === table._id.toString() &&
                                Math.abs(ordDate - fullRDate) < 2 * 60 * 60 * 1000;
                        });
                        currentStatus = hadOrder ? 'Arrived' : 'No Show';
                    }
                }

                combinedData.push({
                    id: r.id || r._id,
                    guestName: r.guestName || r.name || 'Guest',
                    phone: r.phone || r.contact || '-',
                    tableName: table.tableName || `Table ${table.tableNumber}`,
                    tableNumber: table.tableNumber,
                    tableId: table._id,
                    date: r.date,
                    startTime: r.startTime || '-',
                    endTime: r.endTime || '-',
                    guests: r.guests || 1,
                    status: currentStatus,
                    source: rSource,
                    type: table.type || 'General',
                    note: r.note || '',
                    advancePayment: r.advancePayment || 0,
                    cancellationCharge: Number(r.cancellationCharge) || 0,
                    cancellationReason: r.cancellationReason || ''
                });
            });
        });

        // 2. Fetch WALK-INS from Dine-In Orders (not from reservations)
        if (!srcFilter || srcFilter === 'Walk-In') {
            for (const order of allDineInOrders) {
                const orderTable = tables.find(t => t._id.toString() === (order.tableId || order.table || '').toString());
                if (tableType && tableType !== 'All' && orderTable && (orderTable.type || 'General') !== tableType) continue;

                combinedData.push({
                    id: order._id,
                    guestName: order.guestName || 'Walk-In Guest',
                    phone: order.guestPhone || '-',
                    tableName: orderTable ? (orderTable.tableName || `Table ${orderTable.tableNumber}`) : (order.tableName || '-'),
                    tableNumber: orderTable ? orderTable.tableNumber : null,
                    tableId: order.tableId || order.table,
                    date: new Date(order.createdAt).toISOString().split('T')[0],
                    startTime: new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
                    endTime: '-',
                    guests: order.numberOfGuests || 1,
                    status: order.status === 'Completed' ? 'Completed' : 'Arrived',
                    source: 'Walk-In',
                    type: orderTable ? (orderTable.type || 'General') : 'General',
                    note: '',
                    advancePayment: 0,
                    cancellationCharge: 0,
                    cancellationReason: ''
                });
            }
        }

        // --- Summary Stats ---
        const reservationCountByDate = {};
        combinedData.forEach((d) => {
            const key = toYmdLocal(d.date);
            if (!key) return;
            reservationCountByDate[key] = (reservationCountByDate[key] || 0) + 1;
        });

        const totalCount = combinedData.length;
        const todayCount = reservationCountByDate[todayStr] || 0;

        let noShowCount = 0;
        let cancelledCount = 0;
        let cancellationRevenue = 0;
        combinedData.forEach(d => {
            const st = (d.status || '').toLowerCase();
            if (st.includes('no show') || st.includes('noshow')) noShowCount++;
            if (st.includes('cancel')) {
                cancelledCount++;
                cancellationRevenue += Number(d.cancellationCharge) || 0;
            }
        });

        const totalGuests = combinedData.reduce((sum, d) => sum + (Number(d.guests) || 1), 0);
        const avgGuests = totalCount > 0 ? Number((totalGuests / totalCount).toFixed(1)) : 0;

        // --- Time Distribution (hourly bar chart) ---
        const timeDistribution = {};
        combinedData.forEach(d => {
            if (d.startTime && d.startTime !== '-') {
                const hour = d.startTime.split(':')[0].padStart(2, '0');
                const label = `${hour}:00`;
                timeDistribution[label] = (timeDistribution[label] || 0) + 1;
            }
        });

        // --- Source Distribution (pie chart) ---
        const sourceDistribution = { 'Walk-In': 0, 'Phone': 0, 'Online': 0 };
        combinedData.forEach(d => {
            const s = d.source || 'Phone';
            sourceDistribution[s] = (sourceDistribution[s] || 0) + 1;
        });

        // --- Guest Insights ---
        const guestMap = {};
        combinedData.forEach(d => {
            const key = (d.phone && d.phone !== '-') ? d.phone : (d.guestName || '').toLowerCase();
            if (!key) return;
            if (!guestMap[key]) {
                guestMap[key] = { name: d.guestName, phone: d.phone, visits: 0, totalGuests: 0, lastVisit: null };
            }
            guestMap[key].visits++;
            guestMap[key].totalGuests += Number(d.guests) || 1;
            const dDate = d.date ? new Date(d.date) : null;
            if (dDate && (!guestMap[key].lastVisit || dDate > new Date(guestMap[key].lastVisit))) {
                guestMap[key].lastVisit = d.date;
            }
        });
        const guestInsights = Object.values(guestMap).sort((a, b) => b.visits - a.visits);
        const repeatGuests = guestInsights.filter(g => g.visits > 1);

        // --- Table Utilization ---
        const tableUtilization = tables
            .filter(t => !tableType || tableType === 'All' || (t.type || 'General') === tableType)
            .map(t => {
                const resCount = combinedData.filter(d => d.tableId && d.tableId.toString() === t._id.toString()).length;
                const maxPossible = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
                const utilization = Math.min(100, Math.round((resCount / maxPossible) * 100));
                return {
                    tableName: t.tableName || `Table ${t.tableNumber}`,
                    tableNumber: t.tableNumber,
                    type: t.type || 'General',
                    capacity: t.capacity || 4,
                    location: t.location || 'Main Hall',
                    reservationCount: resCount,
                    utilization
                };
            })
            .sort((a, b) => b.reservationCount - a.reservationCount);

        res.json({
            success: true,
            summary: {
                totalReservations: totalCount,
                todayCount,
                noShowCount,
                cancelledCount,
                avgGuests,
                cancellationRevenue: Number(cancellationRevenue.toFixed(2)),
                reservationCountByDate
            },
            distributions: {
                time: timeDistribution,
                source: sourceDistribution
            },
            reservationList: combinedData,
            guestInsights,
            repeatGuests,
            tableUtilization,
            tableTypes
        });
    } catch (error) {
        console.error('[ReservationReport] Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getReservationReport };
