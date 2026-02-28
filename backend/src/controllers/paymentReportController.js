const GuestMealOrder = require('../models/Order');

// Get filtered payment report
exports.getPaymentReport = async (req, res) => {
    try {
        // Disable Caching
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');

        const filter = {
            status: 'Closed' // We only want settled payments/closed orders here
        };

        // Date Filter
        let startDate, endDate;
        if (req.query.startDate && req.query.endDate) {
            startDate = new Date(req.query.startDate);
            endDate = new Date(req.query.endDate);
            endDate.setHours(23, 59, 59, 999);
        } else {
            const today = new Date();
            startDate = new Date(today.setHours(0, 0, 0, 0));
            const todayEnd = new Date();
            endDate = new Date(todayEnd.setHours(23, 59, 59, 999));
        }

        filter.closedAt = {
            $gte: startDate,
            $lte: endDate
        };

        // Cashier Filter (Maps to orderType in our system for now)
        if (req.query.cashier && req.query.cashier !== 'All' && req.query.cashier !== 'All Cashiers') {
            const cashier = req.query.cashier;
            if (cashier === 'Dine-In') {
                filter.orderType = { $in: ['Dine-In', 'Table Order', 'Table', 'Direct Payment'] };
            } else if (cashier === 'Room') {
                filter.orderType = { $in: ['Room Service', 'Room Order', 'Post to Room'] };
            } else if (cashier === 'Take Away') {
                filter.orderType = 'Take Away';
            } else if (cashier === 'Online Order') {
                filter.orderType = 'Online Order';
            } else if (cashier === 'Delivery') {
                filter.orderType = 'Delivery';
            } else {
                filter.orderType = cashier;
            }
        }

        // Payment Mode Filter
        if (req.query.paymentMode && req.query.paymentMode !== 'All' && req.query.paymentMode !== 'All Payment Modes') {
            filter.paymentMethod = req.query.paymentMode;
        }

        // Fetch Orders
        let orders = await GuestMealOrder.find(filter).sort({ closedAt: -1 }).lean();

        // Shift Filter (Morning: 06:00-15:00, Lunch: 15:00-19:00, Night: 19:00-06:00)
        if (req.query.shift && req.query.shift !== 'All' && req.query.shift !== 'All Shifts') {
            orders = orders.filter(order => {
                if (!order.closedAt) return false;
                const hours = new Date(order.closedAt).getHours();
                if (req.query.shift === 'Morning') {
                    return hours >= 6 && hours < 15;
                } else if (req.query.shift === 'Lunch') {
                    return hours >= 15 && hours < 19;
                } else if (req.query.shift === 'Night') {
                    return hours >= 19 || hours < 6;
                }
                return true;
            });
        }

        // Define initial totals
        let totalAmount = 0;
        let totalCash = 0;
        let totalUPI = 0;
        let totalCard = 0;
        let totalRoom = 0;
        let totalOther = 0;

        // Map and Aggregate
        const formattedOrders = orders.map(o => {
            const amount = o.revenue || o.finalAmount || 0;
            const mode = o.paymentMethod || 'Unknown';
            const cashierString = o.orderType || 'Dine-In';
            const statusStr = o.paymentStatus || 'Completed';

            // Accumulate totals
            totalAmount += amount;
            if (mode === 'Cash') totalCash += amount;
            else if (mode === 'UPI') totalUPI += amount;
            else if (mode === 'Card') totalCard += amount;
            else if (mode === 'Room Billing') totalRoom += amount;
            else totalOther += amount;

            return {
                id: o._id,
                billNo: o._id.toString().substr(-6).toUpperCase(),
                cashier: cashierString,
                paymentMode: mode,
                amount: amount,
                status: statusStr,
                createdAt: o.closedAt
            };
        });

        return res.status(200).json({
            success: true,
            message: "Payment report fetched successfully",
            filtersApplied: {
                startDate,
                endDate,
                cashier: req.query.cashier || 'All',
                paymentMode: req.query.paymentMode || 'All',
                shift: req.query.shift || 'All'
            },
            totalTransactions: formattedOrders.length,
            totals: {
                totalAmount,
                totalCash,
                totalUPI,
                totalCard,
                totalRoom,
                totalOther
            },
            transactions: formattedOrders
        });

    } catch (error) {
        console.error('Error fetching payment report:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payment report data',
            error: error.message
        });
    }
};
