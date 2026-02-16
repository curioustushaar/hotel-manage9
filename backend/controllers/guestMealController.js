const Table = require('../models/tableModel');
const GuestMealOrder = require('../models/guestMealOrderModel');
const MenuItem = require('../models/menuModel');

// ============================================================================
// TABLE MANAGEMENT CONTROLLERS
// ============================================================================

// Get all tables with their current status and details
exports.getAllTables = async (req, res) => {
    try {
        const tables = await Table.find()
            .populate('currentOrderId')
            .sort({ tableNumber: 1 });

        // Enhance table data
        const enhancedTables = tables.map(table => ({
            _id: table._id,
            tableId: table._id, // Frontend uses tableId
            tableNumber: table.tableNumber,
            tableName: table.tableName || `T${table.tableNumber}`,
            type: table.type,
            status: table.status,
            capacity: table.capacity,
            guests: table.guests,
            reservations: table.reservations || [],
            runningOrderAmount: table.runningOrderAmount,
            orderDuration: table.getOrderDuration(),
            formattedDuration: table.getFormattedDuration(),
            orderStartTime: table.orderStartTime,
            currentOrderId: table.currentOrderId,
            orderStatus: table.currentOrderId ? table.currentOrderId.status : null,
            mergedTableIds: table.mergedTableIds || [],
            amount: table.runningOrderAmount || 0,
            duration: table.getOrderDuration() || 0,
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

// Create new table
exports.createTable = async (req, res) => {
    try {
        const { tableName, capacity, type } = req.body;

        if (!tableName) {
            return res.status(400).json({ success: false, message: 'Table name is required' });
        }

        // Check if table name already exists
        const existingTable = await Table.findOne({ tableName: { $regex: new RegExp(`^${tableName}$`, 'i') } });
        if (existingTable) {
            return res.status(400).json({ success: false, message: `Table "${tableName}" already exists` });
        }

        // Auto-generate table number
        const lastTable = await Table.findOne({ tableNumber: { $exists: true } }).sort({ tableNumber: -1 });
        let tableNumber = 1;
        if (lastTable && typeof lastTable.tableNumber === 'number') {
            tableNumber = lastTable.tableNumber + 1;
        }

        // Ensure tableNumber is unique by checking again
        let isUnique = false;
        while (!isUnique) {
            const collision = await Table.findOne({ tableNumber });
            if (collision) {
                tableNumber++;
            } else {
                isUnique = true;
            }
        }

        const table = new Table({
            tableName,
            tableNumber,
            capacity: capacity || 4,
            type: type || 'General',
            status: 'Available'
        });

        await table.save();

        res.status(201).json({
            success: true,
            data: table,
            message: 'Table created successfully'
        });
    } catch (error) {
        console.error('Error in createTable:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Error creating table',
            error: error.message
        });
    }
};

// Delete table
exports.deleteTable = async (req, res) => {
    try {
        const table = await Table.findByIdAndDelete(req.params.tableId);

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Table not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Table deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error deleting table',
            error: error.message
        });
    }
};

// Update table details (status, type, reservation, etc.)
exports.updateTable = async (req, res) => {
    try {
        const { status, type, capacity, tableName, guests, reservation } = req.body;

        let updateData = {};
        if (status) updateData.status = status;
        if (type) updateData.type = type;
        if (capacity) updateData.capacity = capacity;
        if (tableName) updateData.tableName = tableName;
        if (guests !== undefined) updateData.guests = guests;
        // Handle reservation: if explicit null sent, it clears it. If object, updates it.
        // Handle reservation updates
        if (req.body.reservations) {
            updateData.reservations = req.body.reservations;
        } else if (req.body.reservation) {
            // If legacy single reservation or "add reservation" request, append to array
            // We need to use $push for this if not replacing entire object
            // But since we are using findByIdAndUpdate with $set, we can't easily mix.
            // Strategy: First fetch table, modify array, then save. Or use specific update operator.
            // Let's use specific operator logic below.
        }

        let updateOperation = { $set: updateData };

        // If adding a single reservation (special validation or push)
        if (req.body.newReservation) {
            updateOperation.$push = { reservations: req.body.newReservation };
        }
        // If removing a reservation (by ID) which frontend might send as removeReservationId
        if (req.body.removeReservationId) {
            updateOperation.$pull = { reservations: { id: req.body.removeReservationId } };
        }

        const table = await Table.findByIdAndUpdate(
            req.params.tableId,
            updateOperation,
            { new: true, runValidators: true }
        );

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Table not found'
            });
        }

        res.status(200).json({
            success: true,
            data: table,
            message: 'Table updated successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating table',
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

// Merge Multiple Tables
exports.mergeTables = async (req, res) => {
    try {
        const { sourceTableId, targetTableIds } = req.body;

        if (!sourceTableId || !targetTableIds || !Array.isArray(targetTableIds) || targetTableIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Source table and target tables (array) are required'
            });
        }

        const sourceTable = await Table.findById(sourceTableId).populate('currentOrderId');
        const targetTables = await Table.find({ _id: { $in: targetTableIds } }).populate('currentOrderId');

        if (!sourceTable) {
            return res.status(404).json({ success: false, message: 'Source table not found' });
        }

        // Combine logic
        const allTables = [sourceTable, ...targetTables];
        const combinedName = allTables.map(t => t.tableName.replace('_MERGED_', '')).join(', ');
        const totalCapacity = allTables.reduce((sum, t) => sum + (t.capacity || 4), 0);
        const totalGuests = allTables.reduce((sum, t) => sum + (t.guests || 0), 0);

        // Merge Orders
        let sourceOrder = sourceTable.currentOrderId;

        // If source has no order but targets do, the first target with an order becomes the "base" or we create one.
        if (!sourceOrder) {
            const firstTargetWithOrder = targetTables.find(t => t.currentOrderId);
            if (firstTargetWithOrder) {
                sourceOrder = firstTargetWithOrder.currentOrderId;
                sourceTable.currentOrderId = sourceOrder._id;
            }
        }

        if (sourceOrder) {
            for (const target of targetTables) {
                if (target.currentOrderId && target.currentOrderId._id.toString() !== sourceOrder._id.toString()) {
                    // Move items from target order to source order
                    sourceOrder.items = [...(sourceOrder.items || []), ...(target.currentOrderId.items || [])];
                    // Close target order as "Merged"
                    target.currentOrderId.status = 'Closed';
                    target.currentOrderId.closedAt = new Date();
                    target.currentOrderId.note = `Merged into ${sourceTable.tableName}`;
                    await target.currentOrderId.save();
                }
            }
            // Recalculate source order totals (Order model should have a middleware or we do it here)
            // For now, assume save() triggers any logic or we do it manually if needed.
            await sourceOrder.save();
            sourceTable.runningOrderAmount = sourceOrder.totalAmount || 0;
        }

        // Store original state if not already stored (to handle multiple merges)
        if (!sourceTable.originalTableName) {
            sourceTable.originalTableName = sourceTable.tableName.replace('_MERGED_', '');
            sourceTable.originalCapacity = sourceTable.capacity;
        }

        // Update Source Table
        sourceTable.tableName = combinedName;
        sourceTable.capacity = totalCapacity;
        sourceTable.guests = totalGuests;
        sourceTable.status = 'Running';
        sourceTable.mergedTableIds = Array.from(new Set([...(sourceTable.mergedTableIds || []), ...targetTableIds]));
        await sourceTable.save();

        // Update Target Tables
        for (const target of targetTables) {
            target.tableName = `_MERGED_${target.tableName}`;
            target.status = 'Available'; // Or some hidden state
            target.currentOrderId = null;
            target.guests = 0;
            target.runningOrderAmount = 0;
            await target.save();
        }

        res.status(200).json({
            success: true,
            message: `Tables merged successfully into ${combinedName}`,
            data: sourceTable
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error merging tables',
            error: error.message
        });
    }
};

// Release/Unmerge Table
exports.releaseTable = async (req, res) => {
    try {
        const { tableId } = req.params;
        const table = await Table.findById(tableId);

        if (!table) {
            return res.status(404).json({ success: false, message: 'Table not found' });
        }

        // Identify target tables to release
        let targetIds = table.mergedTableIds || [];

        // If no explicit IDs, try to find by name for legacy merges
        if (targetIds.length === 0 && table.tableName.includes(',')) {
            const tableNames = table.tableName.split(',').map(n => n.trim());
            // The first one is (likely) the source, others are targets
            const potentialTargets = tableNames.slice(1);
            const foundTargets = await Table.find({
                tableName: { $in: potentialTargets.map(name => `_MERGED_${name}`) }
            });
            targetIds = foundTargets.map(t => t._id);
        }

        if (targetIds.length > 0) {
            const mergedTables = await Table.find({ _id: { $in: targetIds } });
            for (const target of mergedTables) {
                target.tableName = target.tableName.replace('_MERGED_', '');
                target.status = 'Available';
                target.mergedTableIds = [];
                await target.save();
            }
        }

        // Restore source table
        table.tableName = table.originalTableName || table.tableName.split(',')[0].trim();
        table.capacity = table.originalCapacity || 4;
        table.mergedTableIds = [];
        table.originalTableName = null;
        table.originalCapacity = null;

        // If it was only a release (not a checkout), we keep the status as it is?
        // But usually unmerging happens during checkout or when clearing a mess.
        // Let's set it to 'Available' if it has no running order after unmerge.
        if (!table.currentOrderId) {
            table.status = 'Available';
            table.guests = 0;
            table.runningOrderAmount = 0;
        }

        await table.save();

        res.status(200).json({
            success: true,
            message: 'Tables released successfully',
            data: table
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error releasing table',
            error: error.message
        });
    }
};

// Create new order for a table
exports.createOrder = async (req, res) => {
    try {
        const { tableId, tableNumber, orderType = 'Direct Payment', roomNumber, guestName, numberOfGuests = 1, taxRate = 0 } = req.body;

        let table = null;

        // Skip table validation for Take Away and Post to Room
        if (orderType !== 'Take Away' && orderType !== 'Post to Room') {
            // Validate table exists and is available
            table = await Table.findById(tableId);
            if (!table) {
                return res.status(404).json({
                    success: false,
                    message: 'Table not found'
                });
            }

            if (table.status === 'Billed') {
                return res.status(409).json({
                    success: false,
                    message: 'Table is currently billed. Please close the existing order first.'
                });
            }

            // Check if an active order already exists to prevent duplicates
            const existingOrder = await GuestMealOrder.findOne({ tableId, status: 'Active' });
            if (existingOrder) {
                return res.status(200).json({
                    success: true,
                    message: 'Active order already exists',
                    data: existingOrder
                });
            }
        }

        // Create new order
        const orderData = {
            tableId: (orderType === 'Take Away' || orderType === 'Post to Room') ? null : tableId,
            tableNumber: (orderType === 'Take Away') ? 0 : tableNumber, // Keep tableNumber for Post to Room if provided (e.g. room number as int), or strict 0
            orderType,
            roomNumber: orderType === 'Post to Room' ? roomNumber : null,
            guestName: guestName || (orderType === 'Take Away' ? 'Walk-in Customer' : null),
            guestPhone: req.body.guestPhone || null, // Capture phone
            numberOfGuests,
            items: req.body.items || [],
            taxRate,
            status: 'Active',
            paymentMethod: 'Pending',
            paymentStatus: 'Pending'
        };

        const order = new GuestMealOrder(orderData);
        await order.save();

        if (table) {
            // Update table status and set current order
            table.status = 'Running';
            table.currentOrderId = order._id;
            table.orderStartTime = new Date();
            table.runningOrderAmount = order.finalAmount || 0;
            await table.save();
        }

        // DECREMENT STOCK LOGIC
        if (req.body.items && req.body.items.length > 0) {
            for (const item of req.body.items) {
                try {
                    // Try to find by ID first, then Name
                    let menuItem;
                    const menuItemId = item.id || item.menuItemId || item._id;

                    if (menuItemId && menuItemId.match(/^[0-9a-fA-F]{24}$/)) {
                        menuItem = await MenuItem.findById(menuItemId);
                    }

                    if (!menuItem && (item.name || item.itemName)) {
                        menuItem = await MenuItem.findOne({ itemName: item.name || item.itemName });
                    }

                    if (menuItem) {
                        const qtyToDeduct = parseInt(item.quantity) || 1;
                        // Avoid negative stock, cap at 0
                        menuItem.quantity = Math.max(0, (menuItem.quantity || 0) - qtyToDeduct);
                        await menuItem.save();
                    }
                } catch (stockError) {
                    console.error(`Error updating stock for item ${item.name}:`, stockError);
                    // Continue with other items even if one fails
                }
            }
        }

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
            return res.status(200).json({
                success: true,
                data: null,
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
        const { items, taxRate } = req.body;

        const order = await GuestMealOrder.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (items) {
            // STOCK SYNC LOGIC: Compare old items and new items to adjust stock
            const oldItemsMap = new Map();
            order.items.forEach(item => {
                const id = (item.id || item.menuItemId || item._id)?.toString();
                if (id) oldItemsMap.set(id, (oldItemsMap.get(id) || 0) + (item.quantity || 0));
            });

            const newItemsMap = new Map();
            items.forEach(item => {
                const id = (item.id || item.menuItemId || item._id)?.toString();
                if (id) newItemsMap.set(id, (newItemsMap.get(id) || 0) + (item.quantity || 0));
            });

            // Iterate through all unique item IDs from both sets
            const allItemIds = new Set([...oldItemsMap.keys(), ...newItemsMap.keys()]);

            for (const itemId of allItemIds) {
                const oldQty = oldItemsMap.get(itemId) || 0;
                const newQty = newItemsMap.get(itemId) || 0;
                const diff = newQty - oldQty; // Positive means we need more stock (deduct), negative means return

                if (diff !== 0) {
                    try {
                        const menuItem = await MenuItem.findById(itemId);
                        if (menuItem) {
                            // Deduct the difference from stock
                            menuItem.quantity = Math.max(0, (menuItem.quantity || 0) - diff);
                            await menuItem.save();
                        }
                    } catch (err) {
                        console.error(`Error updating stock for item ${itemId} during order update:`, err);
                    }
                }
            }

            order.items = items;
        }

        if (taxRate !== undefined) order.taxRate = taxRate;
        await order.save();

        // Update table running order amount
        const table = await Table.findById(order.tableId);
        if (table) {
            table.runningOrderAmount = order.finalAmount;
            await table.save();
        }

        res.status(200).json({
            success: true,
            message: 'Order items updated and stock adjusted successfully',
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

// Send order to cashier (Pending Payment)
exports.sendToCashier = async (req, res) => {
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
        order.status = 'Pending Payment';
        await order.save();

        // Update table status to indicate billing phase
        const table = await Table.findById(order.tableId);
        if (table) {
            table.status = 'Billed'; // Table UI usually treats 'Billed' as yellow/attention needed
            await table.save();
        }

        res.status(200).json({
            success: true,
            message: 'Order sent to cashier successfully',
            data: order
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error sending order to cashier',
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

// Get all orders (for View Order page - Active/Billed)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await GuestMealOrder.find({
            status: { $ne: 'Closed' }
        }).populate('tableId').sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: orders,
            count: orders.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
};

// Update order status (Pending, Preparing, Ready, Billed)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const order = await GuestMealOrder.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const validStatuses = ['Pending', 'Preparing', 'Ready', 'Served', 'Pending Payment', 'Billed'];

        console.log(`[updateOrderStatus] Received status: "${status}" for Order ID: ${orderId}`);
        console.log(`[updateOrderStatus] Valid statuses: ${JSON.stringify(validStatuses)}`);

        if (validStatuses.includes(status)) {
            // Update the status
            order.status = status;
            await order.save();

            // If status is Billed, update the table status as well to reflect it
            if (status === 'Billed') {
                const table = await Table.findById(order.tableId);
                if (table) {
                    table.status = 'Billed';
                    await table.save();
                }
            }

            return res.status(200).json({
                success: true,
                message: `Order status updated to ${status}`,
                data: order
            });
        } else {
            return res.status(400).json({
                success: false,
                message: `Invalid status provided: "${status}". Valid: ${validStatuses.join(', ')}`
            });
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating order status',
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

        // Calculate payment breakdowns for today
        const collections = {
            Cash: 0,
            UPI: 0,
            Card: 0,
            Online: 0,
            Room: 0
        };

        todayClosed.forEach(order => {
            const method = order.paymentMethod;
            if (method && collections.hasOwnProperty(method)) {
                collections[method] += order.finalAmount || 0;
            } else if (method === 'Room Billing') {
                collections.Room += order.finalAmount || 0;
            }
        });

        res.status(200).json({
            success: true,
            data: {
                totalTables,
                availableTables,
                runningTables,
                billedTables,
                totalRevenue,
                totalOrders,
                collections
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

// Duplicate function removed - using the first updateOrderStatus function above


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

// Get pending orders for Cashier View
exports.getPendingOrders = async (req, res) => {
    try {
        // Fetch orders that are 'Pending Payment' (sent to cashier) or 'Pending' (newly created/active?)
        // The user specifically asked for 'sent' orders, which set status to 'Pending Payment'.
        const query = {
            status: { $in: ['Pending Payment', 'Pending'] }
        };

        const orders = await GuestMealOrder.find(query)
            .populate('tableId', 'tableNumber tableName') // Populate basic table info
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching pending orders',
            error: error.message
        });
    }
};

// Settle order (Cash, UPI, Card, or Post to Room)
exports.settleOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { paymentMethod, paymentMode, amount, roomNumber } = req.body;

        const order = await GuestMealOrder.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // 1. Handle "Post to Room" (Add to Folio)
        if (paymentMethod === 'Add to Room') {
            const Booking = require('../models/bookingModel');
            // Find active booking for this room
            const booking = await Booking.findOne({
                roomNumber: roomNumber,
                status: 'Checked-in'
            });

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: `No active check-in found for Room ${roomNumber}`
                });
            }

            // Create folio transaction
            const transactionData = {
                type: 'charge',
                day: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', weekday: 'short' }),
                particulars: `Restaurant Bill - Table ${order.tableNumber}`,
                description: `Food Order #${orderId.toString().substr(-6).toUpperCase()}`,
                amount: order.finalAmount,
                user: 'cashier',
                folioId: 0
            };

            booking.transactions.push(transactionData);
            await booking.save();

            order.paymentMethod = 'Room Billing';
            order.paymentStatus = 'Completed';
        } else {
            // 2. Handle Direct Payment
            order.paymentMethod = paymentMode; // Cash, Card, UPI
            order.paymentStatus = 'Completed';

            // Also record in overall cashier Transaction model
            const Transaction = require('../models/transactionModel');

            // Map paymentMode to transaction type enum
            let transType = 'Collection Cash';
            if (paymentMode === 'UPI') transType = 'Collection UPI';
            else if (paymentMode === 'Card') transType = 'Collection Card';
            else if (paymentMode === 'Bank Transfer') transType = 'Collection Bank Transfer';

            await Transaction.create({
                date: new Date(),
                type: transType,
                category: 'collection',
                amount: order.finalAmount,
                by: 'Cashier',
                reference: `ORDER-${orderId.toString().substr(-6).toUpperCase()}`,
                notes: `Restaurant Bill - Table ${order.tableNumber}`,
                paymentMethod: paymentMode.toLowerCase()
            });
        }

        // 3. Mark Order as Closed
        order.status = 'Closed';
        order.closedAt = new Date();
        order.revenue = order.finalAmount;
        await order.save();

        // 4. Release Table
        const Table = require('../models/tableModel');
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
            message: 'Order settled successfully',
            data: { order, table }
        });

    } catch (error) {
        console.error('Error settling order:', error);
        res.status(500).json({
            success: false,
            message: 'Error settling order',
            error: error.message
        });
    }
};

// Get live outlet status for dashboard
exports.getOutletStatus = async (req, res) => {
    try {
        console.log('[getOutletStatus] Fetching live status...');

        // Table Stats
        const totalTables = await Table.countDocuments();
        const occupiedTables = await Table.countDocuments({ status: 'Running' });
        const billedTables = await Table.countDocuments({ status: 'Billed' });
        const availableTables = totalTables - occupiedTables - billedTables;

        console.log(`[getOutletStatus] Tables: Total=${totalTables}, Occupied=${occupiedTables}, Billed=${billedTables}`);

        // Order/Kitchen Stats (Live Load)
        // Explicitly include all active-like statuses
        const pendingOrders = await GuestMealOrder.countDocuments({
            status: { $in: ['Active', 'Pending', 'Pending Payment'] }
        });
        const preparingOrders = await GuestMealOrder.countDocuments({ status: 'Preparing' });
        const readyOrders = await GuestMealOrder.countDocuments({ status: 'Ready' });

        console.log(`[getOutletStatus] Orders: Pending=${pendingOrders}, Preparing=${preparingOrders}, Ready=${readyOrders}`);

        // Calculate Average Preparation Time from recently closed orders (last 24h)
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentOrders = await GuestMealOrder.find({
            status: 'Closed',
            closedAt: { $gte: dayAgo }
        });

        let totalPrepTime = 0;
        let countedOrders = 0;

        recentOrders.forEach(order => {
            if (order.updatedAt && order.createdAt) {
                const prepTime = (order.updatedAt - order.createdAt) / 60000; // in minutes
                if (prepTime > 0 && prepTime < 180) { // filter out anomalies
                    totalPrepTime += prepTime;
                    countedOrders++;
                }
            }
        });

        const avgPrepTime = countedOrders > 0 ? Math.round(totalPrepTime / countedOrders) : 0;

        // Load Assessment
        let kitchenLoad = 'Low';
        let staffLoad = 'Normal';
        let delayRisk = 'Minimal';

        const totalActive = pendingOrders + preparingOrders;
        if (totalActive > 15) {
            kitchenLoad = 'High';
            staffLoad = 'Busy';
            delayRisk = 'High';
        } else if (totalActive > 7) {
            kitchenLoad = 'Moderate';
            staffLoad = 'Active';
            delayRisk = 'Moderate';
        }

        res.status(200).json({
            success: true,
            data: {
                tables: {
                    total: totalTables,
                    occupied: occupiedTables + billedTables, // Group both as occupied for this view
                    available: Math.max(0, availableTables)
                },
                kitchen: {
                    pending: pendingOrders,
                    preparing: preparingOrders,
                    ready: readyOrders,
                    avgPrepTime: avgPrepTime,
                    load: kitchenLoad,
                    staffLoad: staffLoad,
                    delayRisk: delayRisk
                }
            }
        });
    } catch (error) {
        console.error('[getOutletStatus] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching outlet status',
            error: error.message
        });
    }
};
