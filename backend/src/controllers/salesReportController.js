const GuestMealOrder = require('../models/Order');

exports.getSalesReport = async (req, res) => {
    try {
        const { outlet, category, item, startDate, endDate } = req.query;

        let query = {};

        // 1. Date Filter
        if (startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            query.createdAt = { $gte: start, $lte: end };
        }

        // 2. Outlet Filter
        if (outlet && outlet !== 'All') {
            if (outlet === 'Dine-In') {
                query.orderType = { $in: ['Dine-In', 'Table Order', 'Table', 'Direct Payment'] };
            } else if (outlet === 'Room Service') {
                query.orderType = { $in: ['Room Service', 'Room Order', 'Post to Room'] };
            } else if (outlet === 'Take Away') {
                query.orderType = { $in: ['Take Away', 'TakeAway'] };
            } else if (outlet === 'Online') {
                query.orderType = { $in: ['Online', 'Online Order', 'Delivery'] };
            } else {
                query.orderType = outlet;
            }
        }

        // Fetch Orders
        let orders = await GuestMealOrder.find(query).sort({ createdAt: -1 });

        // Transform and Filter locally for category and items
        let transactions = [];

        orders.forEach(order => {
            const items = order.items || [];
            items.forEach(orderItem => {
                let matchCategory = true;
                let matchItem = true;

                // Category filter
                if (category && category !== 'All' && category !== 'All Categories' && category !== 'All Categorys') {
                    matchCategory = orderItem.category === category;
                }

                // Item filter 
                if (item && item !== 'All' && item !== 'All Items') {
                    matchItem = (orderItem.name || orderItem.itemName) === item;
                }

                if (matchCategory && matchItem) {
                    transactions.push({
                        id: Math.random().toString(36).substr(2, 9),
                        billNo: `BILL-${order._id.toString().slice(-6).toUpperCase()}`,
                        date: order.createdAt,
                        itemName: orderItem.name || orderItem.itemName || 'Unknown Item',
                        category: orderItem.category || 'Uncategorized',
                        price: orderItem.price || 0,
                        qty: orderItem.quantity || 1,
                        subtotal: orderItem.total || ((orderItem.price || 0) * (orderItem.quantity || 1)),
                        status: order.status || 'Active',
                        outlet: order.orderType || 'Dine-In',
                        paymentMethod: order.paymentMethod || 'Cash'
                    });
                }
            });
        });

        res.status(200).json({
            success: true,
            data: transactions,
            count: transactions.length
        });
    } catch (error) {
        console.error("Sales Report Error:", error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sales report',
            error: error.message
        });
    }
};
