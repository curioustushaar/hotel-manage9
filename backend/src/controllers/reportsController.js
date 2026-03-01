const Order = require('../models/Order');

exports.getTopSellingItems = async (req, res) => {
    try {
        const { startDate, endDate, metric = 'All Metrics' } = req.query;

        // Parse dates safely
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

        const matchStage = {
            createdAt: { $gte: start, $lte: end },
            paymentStatus: { $in: ['Paid', 'Completed'] }
        };

        const pipeline = [
            { $match: matchStage },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.name',
                    totalQuantity: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: '$items.total' },
                    totalOrders: { $sum: 1 },
                    // Mocking costPrice if it doesn't exist to assume 60% is cost, 40% profit
                    totalCost: {
                        $sum: {
                            $ifNull: [
                                { $multiply: ['$items.costPrice', '$items.quantity'] },
                                { $multiply: ['$items.total', 0.6] }
                            ]
                        }
                    }
                }
            },
            {
                $addFields: {
                    itemName: '$_id',
                    totalProfit: { $subtract: ['$totalRevenue', '$totalCost'] },
                    profitPercentage: {
                        $cond: [
                            { $gt: ['$totalRevenue', 0] },
                            { $multiply: [{ $divide: [{ $subtract: ['$totalRevenue', '$totalCost'] }, '$totalRevenue'] }, 100] },
                            0
                        ]
                    }
                }
            }
        ];

        // Apply dynamic sorting based on metric
        if (metric === 'Quantity Sold') {
            pipeline.push({ $sort: { totalQuantity: -1 } });
        } else if (metric === 'Revenue Generated') {
            pipeline.push({ $sort: { totalRevenue: -1 } });
        } else if (metric === 'Profit Margin') {
            pipeline.push({ $sort: { totalProfit: -1 } });
        } else if (metric === 'Orders Count') {
            pipeline.push({ $sort: { totalOrders: -1 } });
        } else {
            pipeline.push({ $sort: { totalRevenue: -1 } }); // Default sort for All Metrics
        }

        const aggregatedData = await Order.aggregate(pipeline);

        res.json({
            success: true,
            metric,
            dateRange: { start, end },
            data: aggregatedData
        });
    } catch (error) {
        console.error('Error generating Top Selling report:', error);
        res.status(500).json({ success: false, message: 'Failed to generate report', error: error.message });
    }
};
