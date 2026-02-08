const Table = require('../models/tableModel');
const GuestMealOrder = require('../models/guestMealOrderModel');

// ============================================================================
// TABLE MANAGEMENT CONTROLLERS
// ============================================================================

// Get all tables with their current status and details
exports.getAllTables = async (req, res) => {
    try {
        const tables = await Table.find()
            .populate('currentOrderId')
            .sort({ tableNumber: 1 });

        // Enhance table data with calculated fields
        const enhancedTables = tables.map(table => ({
            _id: table._id,
            tableNumber: table.tableNumber,
            status: table.status,
            capacity: table.capacity,
            runningOrderAmount: table.runningOrderAmount,
            orderDuration: table.getOrderDuration(),
            formattedDuration: table.getFormattedDuration(),
            orderStartTime: table.orderStartTime,
            currentOrderId: table.currentOrderId,
            createdAt: table.createdAt,
            updatedAt: table.updatedAt
        }));

        res.status(200).json({
            success: true,
            data: enhancedTables,
            count: enhancedTables.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching tables',
            error: error.message
        });
    }
};

// Get table by ID
exports.getTableById = async (req, res) => {
    try {
        const table = await Table.findById(req.params.tableId)
            .populate('currentOrderId');

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Table not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                ...table.toObject(),
                formattedDuration: table.getFormattedDuration()
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching table',
            error: error.message
        });
    }
};

// Initialize all tables (create default tables if they don't exist)
exports.initializeTables = async (req, res) => {
    try {
        const { numberOfTables = 12 } = req.body;

        // Check existing tables
        const existingTables = await Table.find();
        if (existingTables.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Tables already initialized'
            });
        }

        // Create new tables
        const tablesData = Array.from({ length: numberOfTables }, (_, i) => ({
            tableNumber: i + 1,
            status: 'Available',
            capacity: 4
        }));

        const tables = await Table.insertMany(tablesData);

        res.status(201).json({
            success: true,
            message: `${tables.length} tables initialized successfully`,
            data: tables
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error initializing tables',
            error: error.message
        });
    }
};

// Get tables by status (filter)
exports.getTablesByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        
        if (!['Available', 'Running', 'Billed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const tables = await Table.find({ status })
            .populate('currentOrderId')
            .sort({ tableNumber: 1 });

        res.status(200).json({
            success: true,
            data: tables,
            count: tables.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching tables by status',
            error: error.message
        });
    }
};

// ============================================================================
// ORDER MANAGEMENT CONTROLLERS
// ============================================================================

// Create new order for a table
exports.createOrder = async (req, res) => {
    try {
        const { tableId, tableNumber, orderType = 'Direct Payment', roomNumber, guestName, numberOfGuests = 1 } = req.body;

        // Validate table exists and is available
        const table = await Table.findById(tableId);
        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Table not found'
            });
        }

        if (table.status !== 'Available') {
            return res.status(409).json({
                success: false,
                message: 'Table is not available for new orders'
            });
        }

        // Create new order
        const orderData = {
            tableId,
            tableNumber,
            orderType,
            roomNumber: orderType === 'Post to Room' ? roomNumber : null,
            guestName: guestName || null,
            numberOfGuests,
            items: [],
            subtotal: 0,
            tax: 0,
            totalAmount: 0,
            status: 'Active',
            paymentMethod: 'Pending',
            paymentStatus: 'Pending'
        };

        const order = new GuestMealOrder(orderData);
        await order.save();

        // Update table status and set current order
        table.status = 'Running';
        table.currentOrderId = order._id;
        table.orderStartTime = new Date();
        table.runningOrderAmount = 0;
        await table.save();

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: {
                order,
                table
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating order',
            error: error.message
        });
    }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await GuestMealOrder.findById(req.params.orderId)
            .populate('tableId');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching order',
            error: error.message
        });
    }
};

// Get order by table ID
exports.getOrderByTableId = async (req, res) => {
    try {
        const { tableId } = req.params;

        const order = await GuestMealOrder.findOne({
            tableId,
            status: 'Active'
        }).populate('tableId');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'No active order found for this table'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching order',
            error: error.message
        });
    }
};

// Update order items
exports.updateOrderItems = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { items } = req.body;

        const order = await GuestMealOrder.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.items = items;
        await order.save();

        // Update table running order amount
        const table = await Table.findById(order.tableId);
        if (table) {
            table.runningOrderAmount = order.finalAmount;
            await table.save();
        }

        res.status(200).json({
            success: true,
            message: 'Order items updated successfully',
            data: order
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating order items',
            error: error.message
        });
    }
};

// Apply discount to order
exports.applyDiscount = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { discountAmount } = req.body;

        const order = await GuestMealOrder.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.discountAmount = discountAmount;
        await order.save();

        // Update table running order amount
        const table = await Table.findById(order.tableId);
        if (table) {
            table.runningOrderAmount = order.finalAmount;
            await table.save();
        }

        res.status(200).json({
            success: true,
            message: 'Discount applied successfully',
            data: order
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error applying discount',
            error: error.message
        });
    }
};

// Bill the order
exports.billOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { paymentMethod = 'Cash' } = req.body;

        const order = await GuestMealOrder.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (order.status !== 'Active') {
            return res.status(409).json({
                success: false,
                message: 'Order is not in active status'
            });
        }

        // Update order status
        order.status = 'Billed';
        order.paymentMethod = paymentMethod;
        order.paymentStatus = 'Completed';
        order.billedAt = new Date();
        order.revenue = order.finalAmount;
        await order.save();

        // Update table status
        const table = await Table.findById(order.tableId);
        if (table) {
            table.status = 'Billed';
            table.runningOrderAmount = order.finalAmount;
            await table.save();
        }

        res.status(200).json({
            success: true,
            message: 'Order billed successfully',
            data: order
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error billing order',
            error: error.message
        });
    }
};

// Close order and reset table
exports.closeOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await GuestMealOrder.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Update order status
        order.status = 'Closed';
        order.closedAt = new Date();
        await order.save();

        // Reset table
        const table = await Table.findById(order.tableId);
        if (table) {
            table.status = 'Available';
            table.currentOrderId = null;
            table.runningOrderAmount = 0;
            table.orderStartTime = null;
            table.orderDuration = 0;
            await table.save();
        }

        res.status(200).json({
            success: true,
            message: 'Order closed and table reset successfully',
            data: {
                order,
                table
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error closing order',
            error: error.message
        });
    }
};

// ============================================================================
// ANALYTICS & REPORTING
// ============================================================================

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        const totalTables = await Table.countDocuments();
        const availableTables = await Table.countDocuments({ status: 'Available' });
        const runningTables = await Table.countDocuments({ status: 'Running' });
        const billedTables = await Table.countDocuments({ status: 'Billed' });

        // Get today's revenue
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayClosed = await GuestMealOrder.find({
            status: 'Closed',
            closedAt: { $gte: today }
        });

        const totalRevenue = todayClosed.reduce((sum, order) => sum + order.revenue, 0);
        const totalOrders = await GuestMealOrder.countDocuments({ status: 'Closed', closedAt: { $gte: today } });

        res.status(200).json({
            success: true,
            data: {
                tables: {
                    total: totalTables,
                    available: availableTables,
                    running: runningTables,
                    billed: billedTables
                },
                revenue: {
                    total: totalRevenue,
                    orders: totalOrders,
                    average: totalOrders > 0 ? totalRevenue / totalOrders : 0
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard stats',
            error: error.message
        });
    }
};

// Get revenue report
exports.getRevenueReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const query = {
            status: 'Closed',
            closedAt: {
                $gte: new Date(startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
                $lte: new Date(endDate || new Date())
            }
        };

        const orders = await GuestMealOrder.find(query)
            .populate('tableId')
            .sort({ closedAt: -1 });

        const totalRevenue = orders.reduce((sum, order) => sum + order.revenue, 0);
        const totalOrders = orders.length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Group by payment method
        const byPaymentMethod = {};
        orders.forEach(order => {
            const method = order.paymentMethod;
            if (!byPaymentMethod[method]) {
                byPaymentMethod[method] = { count: 0, amount: 0 };
            }
            byPaymentMethod[method].count += 1;
            byPaymentMethod[method].amount += order.revenue;
        });

        res.status(200).json({
            success: true,
            data: {
                totalRevenue,
                totalOrders,
                averageOrderValue,
                byPaymentMethod,
                orders
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching revenue report',
            error: error.message
        });
    }
};
