const Order = require('../models/Order');
const Transaction = require('../models/Transaction');

exports.getAnalyticsReport = async (req, res) => {
    try {
        const { tab = 'Top Selling Items', metric = 'All Metrics', startDate, endDate } = req.query;

        // Default Date Range: Today
        let start = new Date();
        start.setHours(0, 0, 0, 0);
        if (startDate) {
            const parsedStart = new Date(startDate);
            if (!isNaN(parsedStart)) {
                start = parsedStart;
                start.setHours(0, 0, 0, 0);
            }
        }

        let end = new Date();
        end.setHours(23, 59, 59, 999);
        if (endDate) {
            const parsedEnd = new Date(endDate);
            if (!isNaN(parsedEnd)) {
                end = parsedEnd;
                end.setHours(23, 59, 59, 999);
            }
        }

        let results = [];

        // Common order match filter for date range
        const orderDateMatch = { createdAt: { $gte: start, $lte: end }, status: { $nin: ['Cancelled'] } };
        // Common transaction match filter for date range
        const txDateMatch = { date: { $gte: start, $lte: end }, status: 'Success' };

        // --- 1. Top Selling Items ---
        if (tab === 'Top Selling Items') {
            const itemsPipeline = [
                { $match: orderDateMatch },
                { $unwind: '$items' },
                {
                    $group: {
                        _id: '$items.name',
                        quantitySold: { $sum: '$items.quantity' },
                        revenueGenerated: { $sum: '$items.total' },
                        ordersCount: { $sum: 1 }
                    }
                },
                { $sort: { revenueGenerated: -1 } }, // Default sort by revenue
                { $limit: 10 }
            ];

            const aggregatedData = await Order.aggregate(itemsPipeline);

            results = aggregatedData.map(item => {
                const profitMargin = item.revenueGenerated * 0.40; // Simulated 40% margin
                return {
                    metric: item._id || 'Unknown Item',
                    metrics: {
                        'Quantity Sold': item.quantitySold,
                        'Revenue Generated': `₹${item.revenueGenerated.toFixed(2)}`,
                        'Profit Margin': `₹${profitMargin.toFixed(2)}`,
                        'Orders Count': item.ordersCount
                    },
                    // We'll return based on selected Metric filter on frontend
                    value: metric === 'All Metrics' || metric === 'Revenue Generated' ? `₹${item.revenueGenerated.toFixed(2)}` :
                        metric === 'Quantity Sold' ? item.quantitySold :
                            metric === 'Profit Margin' ? `₹${profitMargin.toFixed(2)}` : item.ordersCount,
                    growth: '+5%', // Mocked growth
                    trend: 'up'
                };
            });
        }

        // --- 2. Peak Hours ---
        else if (tab === 'Peak Hours') {
            const hoursPipeline = [
                { $match: orderDateMatch },
                {
                    $group: {
                        _id: { $hour: '$createdAt' },
                        ordersCount: { $sum: 1 },
                        revenue: { $sum: '$finalAmount' },
                        avgOrderValue: { $avg: '$finalAmount' }
                    }
                },
                { $sort: { _id: 1 } }
            ];

            const aggregatedData = await Order.aggregate(hoursPipeline);

            results = aggregatedData.map(hr => {
                // Convert hour strictly to simple format (e.g. 14:00)
                const hourString = `${String(hr._id).padStart(2, '0')}:00`;
                return {
                    metric: hourString,
                    metrics: {
                        'Orders Count': hr.ordersCount,
                        'Revenue': `₹${(hr.revenue || 0).toFixed(2)}`,
                        'Avg Order Value': `₹${(hr.avgOrderValue || 0).toFixed(2)}`,
                        'Table Occupancy': `${Math.floor(hr.ordersCount * 1.5)}%` // Mock table occupancy
                    },
                    value: metric === 'All Metrics' || metric === 'Orders Count' ? hr.ordersCount :
                        metric === 'Revenue' ? `₹${(hr.revenue || 0).toFixed(2)}` :
                            metric === 'Avg Order Value' ? `₹${(hr.avgOrderValue || 0).toFixed(2)}` : `${Math.floor(hr.ordersCount * 1.5)}%`,
                    growth: '+2%',
                    trend: 'stable'
                };
            });
        }

        // --- 3. Best Table Revenue ---
        else if (tab === 'Best Table Revenue') {
            const tablesPipeline = [
                { $match: { ...orderDateMatch, tableNumber: { $exists: true, $ne: null } } },
                {
                    $group: {
                        _id: '$tableNumber',
                        revenue: { $sum: '$finalAmount' },
                        ordersCount: { $sum: 1 },
                        avgBillSize: { $avg: '$finalAmount' }
                    }
                },
                { $sort: { revenue: -1 } },
                { $limit: 10 }
            ];

            const aggregatedData = await Order.aggregate(tablesPipeline);

            results = aggregatedData.map(tbl => {
                return {
                    metric: `Table ${tbl._id}`,
                    metrics: {
                        'Revenue': `₹${(tbl.revenue || 0).toFixed(2)}`,
                        'Orders Count': tbl.ordersCount,
                        'Avg Bill Size': `₹${(tbl.avgBillSize || 0).toFixed(2)}`,
                        'Turnover Rate': `${tbl.ordersCount}x/day` // Mock turnover
                    },
                    value: metric === 'All Metrics' || metric === 'Revenue' ? `₹${(tbl.revenue || 0).toFixed(2)}` :
                        metric === 'Orders Count' ? tbl.ordersCount :
                            metric === 'Avg Bill Size' ? `₹${(tbl.avgBillSize || 0).toFixed(2)}` : `${tbl.ordersCount}x/day`,
                    growth: '+10%',
                    trend: 'up'
                };
            });
        }

        // --- 4. Room vs Restaurant Revenue ---
        else if (tab === 'Room vs Restaurant Revenue') {
            const revenuePipeline = [
                { $match: { ...txDateMatch, type: 'Income' } },
                {
                    $group: {
                        _id: '$category',
                        amount: { $sum: '$amount' }
                    }
                }
            ];

            const aggregatedData = await Transaction.aggregate(revenuePipeline);

            let roomTotal = 0;
            let restaurantTotal = 0;

            aggregatedData.forEach(item => {
                if (item._id === 'Room') roomTotal += item.amount;
                if (item._id === 'Restaurant') restaurantTotal += item.amount;
            });

            const total = roomTotal + restaurantTotal || 1; // Prevent division by zero

            results = [
                {
                    metric: 'Room Revenue',
                    metrics: {
                        'Room Revenue': `₹${roomTotal.toFixed(2)}`,
                        'Restaurant Revenue': `₹${restaurantTotal.toFixed(2)}`,
                        'Contribution %': `${((roomTotal / total) * 100).toFixed(1)}%`,
                        'Profit': `₹${(roomTotal * 0.6).toFixed(2)}` // Assume 60% profit on rooms
                    },
                    value: metric === 'All Metrics' || metric === 'Room Revenue' ? `₹${roomTotal.toFixed(2)}` :
                        metric === 'Contribution %' ? `${((roomTotal / total) * 100).toFixed(1)}%` :
                            metric === 'Profit' ? `₹${(roomTotal * 0.6).toFixed(2)}` : `₹${roomTotal.toFixed(2)}`,
                    growth: '+12%',
                    trend: 'up'
                },
                {
                    metric: 'Restaurant Revenue',
                    metrics: {
                        'Room Revenue': `₹${roomTotal.toFixed(2)}`,
                        'Restaurant Revenue': `₹${restaurantTotal.toFixed(2)}`,
                        'Contribution %': `${((restaurantTotal / total) * 100).toFixed(1)}%`,
                        'Profit': `₹${(restaurantTotal * 0.35).toFixed(2)}` // Assume 35% profit on restaurant
                    },
                    value: metric === 'All Metrics' || metric === 'Restaurant Revenue' ? `₹${restaurantTotal.toFixed(2)}` :
                        metric === 'Contribution %' ? `${((restaurantTotal / total) * 100).toFixed(1)}%` :
                            metric === 'Profit' ? `₹${(restaurantTotal * 0.35).toFixed(2)}` : `₹${restaurantTotal.toFixed(2)}`,
                    growth: '+8%',
                    trend: 'up'
                }
            ];
        }

        // --- 5. Daily Profit Estimate ---
        else if (tab === 'Daily Profit Estimate') {
            const profitPipeline = [
                { $match: txDateMatch },
                {
                    $group: {
                        _id: {
                            year: { $year: '$date' },
                            month: { $month: '$date' },
                            day: { $dayOfMonth: '$date' }
                        },
                        totalIncome: {
                            $sum: { $cond: [{ $eq: ['$type', 'Income'] }, '$amount', 0] }
                        },
                        totalExpense: {
                            $sum: { $cond: [{ $eq: ['$type', 'Expense'] }, '$amount', 0] }
                        }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
            ];

            const aggregatedData = await Transaction.aggregate(profitPipeline);

            results = aggregatedData.map(dayData => {
                const dayString = `${dayData._id.year}-${String(dayData._id.month).padStart(2, '0')}-${String(dayData._id.day).padStart(2, '0')}`;
                const income = dayData.totalIncome || 0;
                // Assuming some fixed baseline expenses if no transactions (for estmate realism)
                const expense = (dayData.totalExpense || 0) + (income * 0.5); // 50% fixed operating costs in this demo
                const netProfit = income - expense;

                return {
                    metric: dayString,
                    metrics: {
                        'Revenue': `₹${income.toFixed(2)}`,
                        'Expenses': `₹${expense.toFixed(2)}`,
                        'Net Profit': `₹${netProfit.toFixed(2)}`,
                        'Cash Flow': `₹${income.toFixed(2)}`
                    },
                    value: metric === 'All Metrics' || metric === 'Net Profit' ? `₹${netProfit.toFixed(2)}` :
                        metric === 'Revenue' ? `₹${income.toFixed(2)}` :
                            metric === 'Expenses' ? `₹${expense.toFixed(2)}` : `₹${income.toFixed(2)}`,
                    growth: netProfit > 0 ? '+15%' : '-5%',
                    trend: netProfit > 0 ? 'up' : 'down'
                };
            });
        }

        res.json({
            success: true,
            tab,
            metric,
            dateRange: { start, end },
            data: results
        });
    } catch (error) {
        console.error('Analytics Report Error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate analytics report', error: error.message });
    }
};
