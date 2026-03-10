const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const Table = require('../models/Table');
const Guest = require('../models/Guest');

// Helper: parse date range from query
function parseDateRange(startDate, endDate) {
    let start = new Date();
    start.setHours(0, 0, 0, 0);
    if (startDate) {
        const p = new Date(startDate);
        if (!isNaN(p)) { start = p; start.setHours(0, 0, 0, 0); }
    }
    let end = new Date();
    end.setHours(23, 59, 59, 999);
    if (endDate) {
        const p = new Date(endDate);
        if (!isNaN(p)) { end = p; end.setHours(23, 59, 59, 999); }
    }
    return { start, end };
}

// Helper: compute growth string
function growthStr(current, previous) {
    if (!previous || previous === 0) return current > 0 ? '+100%' : '0%';
    const pct = ((current - previous) / previous * 100).toFixed(1);
    return pct >= 0 ? `+${pct}%` : `${pct}%`;
}

exports.getAnalyticsReport = async (req, res) => {
    try {
        const { metric = 'All Metrics', startDate, endDate } = req.query;
        const { start, end } = parseDateRange(startDate, endDate);

        const orderMatch = { createdAt: { $gte: start, $lte: end }, status: { $nin: ['Cancelled'] } };
        const completedMatch = { createdAt: { $gte: start, $lte: end }, status: { $in: ['Completed', 'Closed', 'Billed', 'Served'] } };

        // Days in range for per-day calculations
        const daysDiff = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

        // ---------- Fetch all orders in range ----------
        const allOrders = await Order.find(orderMatch).lean();
        const completedOrders = allOrders.filter(o => ['Completed', 'Closed', 'Billed', 'Served'].includes(o.status));

        // ---------- METRIC CALCULATIONS ----------
        const totalRevenue = allOrders.reduce((s, o) => s + (o.finalAmount || o.totalAmount || 0), 0);
        const totalProfit = totalRevenue * 0.38; // ~38% avg margin
        const totalOrders = allOrders.length;
        const avgBillSize = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Orders per hour
        const hourBuckets = {};
        allOrders.forEach(o => {
            const hr = new Date(o.createdAt).getHours();
            hourBuckets[hr] = (hourBuckets[hr] || 0) + 1;
        });
        const activeHours = Object.keys(hourBuckets).length || 1;
        const ordersPerHour = totalOrders / activeHours;

        // Table analytics
        const tableOrders = allOrders.filter(o => o.tableNumber);
        const tableGroups = {};
        tableOrders.forEach(o => {
            const t = o.tableNumber;
            if (!tableGroups[t]) tableGroups[t] = { orders: 0, revenue: 0 };
            tableGroups[t].orders += 1;
            tableGroups[t].revenue += (o.finalAmount || o.totalAmount || 0);
        });
        const allTables = await Table.countDocuments();
        const usedTables = Object.keys(tableGroups).length;
        const tableUtilization = allTables > 0 ? ((usedTables / allTables) * 100) : 0;
        const tableTurnoverRate = usedTables > 0
            ? (tableOrders.length / usedTables / daysDiff)
            : 0;

        // Top selling items
        const itemMap = {};
        allOrders.forEach(o => {
            (o.items || []).forEach(it => {
                const name = it.name || it.itemName || 'Unknown';
                if (!itemMap[name]) itemMap[name] = { qty: 0, revenue: 0, orders: 0 };
                itemMap[name].qty += (it.quantity || 1);
                itemMap[name].revenue += (it.total || it.subtotal || (it.price || 0) * (it.quantity || 1));
                itemMap[name].orders += 1;
            });
        });
        const topItems = Object.entries(itemMap)
            .sort((a, b) => b[1].revenue - a[1].revenue)
            .slice(0, 10);

        // Customer Count — unique by guestName or guestPhone
        const customerSet = new Set();
        allOrders.forEach(o => {
            const key = o.guestPhone || o.guestName || '';
            if (key) customerSet.add(key.toLowerCase().trim());
        });
        const customerCount = customerSet.size;

        // Repeat Customers — guests who ordered more than once (across table/room/takeaway)
        const customerOrderCount = {};
        allOrders.forEach(o => {
            const key = o.guestPhone || o.guestName || '';
            if (key) {
                const k = key.toLowerCase().trim();
                if (!customerOrderCount[k]) customerOrderCount[k] = { count: 0, name: o.guestName || '', phone: o.guestPhone || '', types: new Set(), totalSpent: 0 };
                customerOrderCount[k].count += 1;
                customerOrderCount[k].types.add(o.orderType || 'Dine-In');
                customerOrderCount[k].totalSpent += (o.finalAmount || o.totalAmount || 0);
            }
        });
        const repeatCustomers = Object.values(customerOrderCount).filter(c => c.count > 1);
        const repeatCustomerRate = customerCount > 0 ? ((repeatCustomers.length / customerCount) * 100) : 0;

        // ---------- BUILD RESPONSE BY METRIC ----------
        let data = [];

        if (metric === 'All Metrics') {
            data = [
                { metric: 'Revenue', value: `₹${totalRevenue.toFixed(2)}`, growth: '-', trend: totalRevenue > 0 ? 'up' : 'stable' },
                { metric: 'Profit', value: `₹${totalProfit.toFixed(2)}`, growth: '-', trend: totalProfit > 0 ? 'up' : 'stable' },
                { metric: 'Orders Count', value: totalOrders, growth: '-', trend: totalOrders > 0 ? 'up' : 'stable' },
                { metric: 'Avg Bill Size', value: `₹${avgBillSize.toFixed(2)}`, growth: '-', trend: 'stable' },
                { metric: 'Orders per Hour', value: ordersPerHour.toFixed(1), growth: '-', trend: 'stable' },
                { metric: 'Table Turnover Rate', value: `${tableTurnoverRate.toFixed(2)}x/day`, growth: '-', trend: 'stable' },
                { metric: 'Table Utilization', value: `${tableUtilization.toFixed(1)}%`, growth: '-', trend: tableUtilization > 50 ? 'up' : 'down' },
                { metric: 'Top Selling Item', value: topItems.length > 0 ? `${topItems[0][0]} (${topItems[0][1].qty} sold)` : 'N/A', growth: '-', trend: 'up' },
                { metric: 'Customer Count', value: customerCount, growth: '-', trend: customerCount > 0 ? 'up' : 'stable' },
                { metric: 'Repeat Customer Rate', value: `${repeatCustomerRate.toFixed(1)}%`, growth: `${repeatCustomers.length} repeat`, trend: repeatCustomerRate > 20 ? 'up' : 'down' },
            ];
        } else if (metric === 'Revenue') {
            // Revenue by order type
            const byType = {};
            allOrders.forEach(o => {
                const t = o.orderType || 'Dine-In';
                if (!byType[t]) byType[t] = 0;
                byType[t] += (o.finalAmount || o.totalAmount || 0);
            });
            data = Object.entries(byType).map(([type, amt]) => ({
                metric: type,
                value: `₹${amt.toFixed(2)}`,
                growth: `${totalRevenue > 0 ? ((amt / totalRevenue) * 100).toFixed(1) : 0}%`,
                trend: amt > 0 ? 'up' : 'stable'
            }));
            data.push({ metric: 'Total Revenue', value: `₹${totalRevenue.toFixed(2)}`, growth: '100%', trend: 'up' });
        } else if (metric === 'Profit') {
            const byType = {};
            allOrders.forEach(o => {
                const t = o.orderType || 'Dine-In';
                if (!byType[t]) byType[t] = 0;
                byType[t] += (o.finalAmount || o.totalAmount || 0) * 0.38;
            });
            data = Object.entries(byType).map(([type, prof]) => ({
                metric: type,
                value: `₹${prof.toFixed(2)}`,
                growth: `${totalProfit > 0 ? ((prof / totalProfit) * 100).toFixed(1) : 0}%`,
                trend: prof > 0 ? 'up' : 'stable'
            }));
            data.push({ metric: 'Total Profit', value: `₹${totalProfit.toFixed(2)}`, growth: '~38% margin', trend: 'up' });
        } else if (metric === 'Orders Count') {
            // Orders by hour
            const hourData = [];
            for (let h = 0; h < 24; h++) {
                if (hourBuckets[h]) {
                    hourData.push({
                        metric: `${String(h).padStart(2, '0')}:00`,
                        value: hourBuckets[h],
                        growth: `${totalOrders > 0 ? ((hourBuckets[h] / totalOrders) * 100).toFixed(1) : 0}%`,
                        trend: hourBuckets[h] > (totalOrders / activeHours) ? 'up' : 'down'
                    });
                }
            }
            data = hourData;
            data.push({ metric: 'Total Orders', value: totalOrders, growth: `${daysDiff} day(s)`, trend: 'up' });
        } else if (metric === 'Avg Bill Size') {
            const byType = {};
            const countByType = {};
            allOrders.forEach(o => {
                const t = o.orderType || 'Dine-In';
                if (!byType[t]) { byType[t] = 0; countByType[t] = 0; }
                byType[t] += (o.finalAmount || o.totalAmount || 0);
                countByType[t] += 1;
            });
            data = Object.entries(byType).map(([type, amt]) => ({
                metric: type,
                value: `₹${countByType[type] > 0 ? (amt / countByType[type]).toFixed(2) : '0.00'}`,
                growth: `${countByType[type]} orders`,
                trend: 'stable'
            }));
            data.push({ metric: 'Overall Avg Bill', value: `₹${avgBillSize.toFixed(2)}`, growth: `${totalOrders} orders`, trend: 'stable' });
        } else if (metric === 'Orders per Hour') {
            for (let h = 0; h < 24; h++) {
                if (hourBuckets[h]) {
                    data.push({
                        metric: `${String(h).padStart(2, '0')}:00 - ${String(h).padStart(2, '0')}:59`,
                        value: hourBuckets[h],
                        growth: `${(hourBuckets[h] / daysDiff).toFixed(1)}/day`,
                        trend: hourBuckets[h] > ordersPerHour ? 'up' : 'down'
                    });
                }
            }
            data.push({ metric: 'Avg Orders/Hour', value: ordersPerHour.toFixed(1), growth: `${activeHours} active hrs`, trend: 'stable' });
        } else if (metric === 'Table Turnover Rate') {
            const sorted = Object.entries(tableGroups).sort((a, b) => b[1].orders - a[1].orders);
            data = sorted.map(([tbl, info]) => ({
                metric: `Table ${tbl}`,
                value: `${(info.orders / daysDiff).toFixed(2)}x/day`,
                growth: `${info.orders} orders`,
                trend: (info.orders / daysDiff) > 2 ? 'up' : 'down'
            }));
            data.push({ metric: 'Avg Turnover', value: `${tableTurnoverRate.toFixed(2)}x/day`, growth: `${usedTables} tables used`, trend: 'stable' });
        } else if (metric === 'Table Utilization') {
            const sorted = Object.entries(tableGroups).sort((a, b) => b[1].revenue - a[1].revenue);
            data = sorted.map(([tbl, info]) => ({
                metric: `Table ${tbl}`,
                value: `₹${info.revenue.toFixed(2)}`,
                growth: `${info.orders} orders`,
                trend: info.orders > 3 ? 'up' : 'down'
            }));
            data.push({ metric: 'Overall Utilization', value: `${tableUtilization.toFixed(1)}%`, growth: `${usedTables}/${allTables} tables`, trend: tableUtilization > 50 ? 'up' : 'down' });
        } else if (metric === 'Top Selling Items') {
            data = topItems.map(([name, info]) => ({
                metric: name,
                value: `${info.qty} sold`,
                growth: `₹${info.revenue.toFixed(2)}`,
                trend: info.qty > 5 ? 'up' : 'stable'
            }));
        } else if (metric === 'Customer Count') {
            // Customers by order type
            const typeCust = {};
            allOrders.forEach(o => {
                const t = o.orderType || 'Dine-In';
                const key = (o.guestPhone || o.guestName || '').toLowerCase().trim();
                if (key) {
                    if (!typeCust[t]) typeCust[t] = new Set();
                    typeCust[t].add(key);
                }
            });
            data = Object.entries(typeCust).map(([type, set]) => ({
                metric: type,
                value: set.size,
                growth: `${totalOrders > 0 ? ((set.size / customerCount) * 100).toFixed(1) : 0}%`,
                trend: set.size > 3 ? 'up' : 'stable'
            }));
            data.push({ metric: 'Total Unique Customers', value: customerCount, growth: `${daysDiff} day(s)`, trend: 'up' });
        } else if (metric === 'Repeat Customer Rate') {
            // Show repeat customer details
            const sortedRepeat = repeatCustomers.sort((a, b) => b.count - a.count).slice(0, 20);
            data = sortedRepeat.map(c => ({
                metric: c.name || c.phone || 'Unknown',
                value: `${c.count} visits`,
                growth: `₹${c.totalSpent.toFixed(2)} spent | ${[...c.types].join(', ')}`,
                trend: c.count > 3 ? 'up' : 'stable'
            }));
            data.push({
                metric: 'Overall Repeat Rate',
                value: `${repeatCustomerRate.toFixed(1)}%`,
                growth: `${repeatCustomers.length}/${customerCount} customers`,
                trend: repeatCustomerRate > 20 ? 'up' : 'down'
            });
        }

        res.json({
            success: true,
            metric,
            dateRange: { start, end },
            data
        });
    } catch (error) {
        console.error('Analytics Report Error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate analytics report', error: error.message });
    }
};
