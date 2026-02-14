
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
