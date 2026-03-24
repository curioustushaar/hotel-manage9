const Order = require('../models/Order');

const ORDER_TYPE_ALIASES = {
    'Dine-In': ['Dine-In', 'Table Order', 'Table', 'Direct Payment', 'Dine In'],
    'Take Away': ['Take Away', 'TakeAway', 'Take-Away'],
    'Room Service': ['Room Service', 'Room Order', 'Post to Room'],
    'Delivery': ['Delivery'],
    'Online': ['Online', 'Online Order']
};

const normalizeValue = (value) => String(value || '').trim().toLowerCase();

const getNormalizedOrderType = (orderType) => {
    const normalized = normalizeValue(orderType);
    if (!normalized) return null;

    for (const [canonical, aliases] of Object.entries(ORDER_TYPE_ALIASES)) {
        if (aliases.some(alias => normalizeValue(alias) === normalized)) {
            return canonical;
        }
    }

    if (normalized.includes('room')) return 'Room Service';
    if (normalized.includes('take')) return 'Take Away';
    if (normalized.includes('online')) return 'Online';
    if (normalized.includes('deliver')) return 'Delivery';
    if (normalized.includes('dine') || normalized.includes('table') || normalized.includes('direct')) return 'Dine-In';

    return null;
};

const getOrderTypeFilterValues = (orderTypeFilter) => {
    const normalizedFilter = getNormalizedOrderType(orderTypeFilter);
    if (!normalizedFilter) return null;
    return ORDER_TYPE_ALIASES[normalizedFilter] || [orderTypeFilter];
};

exports.getBillingReport = async (req, res) => {
    try {
        const { startDate, endDate, orderType, paymentMethod, cashier, status } = req.query;

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

        const query = {
            createdAt: { $gte: start, $lte: end }
        };

        // Filters
        if (orderType && orderType !== 'All') {
            const typeFilters = getOrderTypeFilterValues(orderType);
            query.orderType = (typeFilters && typeFilters.length > 0)
                ? { $in: typeFilters }
                : orderType;
        }
        if (paymentMethod && paymentMethod !== 'All') {
            query.paymentMethod = paymentMethod;
        }
        if (cashier && cashier !== 'All') {
            query.guestName = { $regex: cashier, $options: 'i' }; // In this schema, 'staff' isn't explicitly on Order, using guestName as a proxy for search or assuming search by staff name if available
        }
        if (status && status !== 'All') {
            query.status = status;
        }

        const orders = await Order.find(query).sort({ createdAt: -1 });

        // Calculate Summaries
        let totalRevenue = 0;
        let totalBills = orders.length;
        let totalItemsSold = 0;
        let totalDiscounts = 0;
        let totalTaxes = 0;

        const paymentBreakdown = {
            Cash: 0,
            UPI: 0,
            Card: 0,
            'Bank Transfer': 0,
            'Add to Room': 0
        };

        const typeBreakdown = {
            'Dine-In': 0,
            'Take Away': 0,
            'Room Service': 0,
            'Delivery': 0,
            'Online': 0
        };

        const itemSales = {};
        const cancelledBills = [];

        orders.forEach(order => {
            const billTotal = order.finalAmount || order.totalAmount || 0;
            const billDiscount = order.discountAmount || 0;
            const billTax = order.tax || 0;

            if (order.status === 'Cancelled' || order.status === 'Void') {
                cancelledBills.push({
                    billNo: order._id.toString().substr(-6).toUpperCase(),
                    amount: billTotal,
                    reason: order.notes || 'Customer Request',
                    date: new Date(order.createdAt).toLocaleDateString() + ' ' + new Date(order.createdAt).toLocaleTimeString()
                });
            } else {
                totalRevenue += billTotal;
                totalDiscounts += billDiscount;
                totalTaxes += billTax;

                // Payment Breakdown
                const method = order.paymentMethod || 'Cash';
                if (paymentBreakdown[method] !== undefined) {
                    paymentBreakdown[method] += billTotal;
                } else {
                    paymentBreakdown['Cash'] += billTotal;
                }

                // Type Breakdown
                const normalizedType = getNormalizedOrderType(order.orderType);
                if (normalizedType && typeBreakdown[normalizedType] !== undefined) {
                    typeBreakdown[normalizedType] += billTotal;
                } else if (!order.orderType) {
                    typeBreakdown['Dine-In'] += billTotal;
                }
            }

            // Items Sold
            if (order.items && order.items.length > 0) {
                order.items.forEach(item => {
                    const qty = Number(item.quantity || item.qty || 1);
                    totalItemsSold += qty;

                    // Support multiple naming conventions
                    const itemName = (item.name || item.itemName || item.item_name || 'Item').toString().trim() || 'Item';
                    const itemCategory = (item.category || '-').toString().trim();
                    const itemPrice = Number(item.price || item.rate || 0);

                    if (!itemSales[itemName]) {
                        itemSales[itemName] = { quantity: 0, revenue: 0, category: itemCategory };
                    }
                    itemSales[itemName].quantity += qty;
                    itemSales[itemName].revenue += itemPrice * qty;
                });
            }
        });

        // Format Table Data
        const tableData = orders.map(order => {
            const billNo = `#${order._id.toString().substr(-6).toUpperCase()}`;
            const printableItems = (order.items || []).map(item => {
                const qty = Number(item.quantity || item.qty || 1);
                const price = Number(item.price || item.rate || item.total || item.subtotal || 0);
                const amount = Number(item.subtotal || item.total || price * qty || 0);

                return {
                    name: item.name || item.itemName || 'Item',
                    qty,
                    price,
                    amount
                };
            });

            const subtotal = Number(order.subtotal || 0);
            const taxAmount = Number(order.tax || 0);
            const serviceCharge = Number(
                order.serviceChargeAmount ??
                (order.billing && (order.billing.serviceChargeAmount ?? order.billing.serviceCharge)) ??
                0
            );
            const discountAmount = Number(order.discountAmount || 0);
            const grossTotal = subtotal + taxAmount + serviceCharge;
            const finalAmount = Number(order.finalAmount || order.totalAmount || grossTotal - discountAmount);
            const netPayable = Math.max(0, grossTotal - discountAmount);
            const paymentMethod = order.paymentMethod || 'Pending';
            const orderType = getNormalizedOrderType(order.orderType) || order.orderType || 'Dine-In';
            const guestName = order.guestName || 'Guest';
            const tableNo = order.tableNumber || order.roomNumber || 'W-In';

            return {
                billNo,
                orderId: order._id.toString(),
                date: new Date(order.createdAt).toLocaleDateString(),
                tableNo,
                items: printableItems.map(i => `${i.name} (x${i.qty})`).join(', '),
                amount: subtotal,
                tax: taxAmount,
                discount: discountAmount,
                total: finalAmount,
                payment: paymentMethod,
                staff: guestName,
                orderType,
                guestName,
                roomNumber: order.roomNumber || '',
                tableNumber: order.tableNumber || '',
                printData: {
                    billNo,
                    orderId: order._id.toString(),
                    createdAt: order.createdAt,
                    guest: guestName,
                    orderType,
                    tableNumber: order.tableNumber || '',
                    roomNumber: order.roomNumber || '',
                    items: printableItems,
                    subtotal,
                    tax: taxAmount,
                    serviceCharge,
                    discount: discountAmount,
                    discountMeta: order.discountMeta || null,
                    taxRate: Number(order.taxRate || 0),
                    finalAmount,
                    netPayable,
                    paymentMethod,
                    notes: order.notes || ''
                }
            };
        });

        // Top Selling Items
        const topSelling = Object.entries(itemSales)
            .map(([displayName, stats]) => ({
                name: displayName,
                itemName: displayName, // Add alias for frontend compatibility
                category: stats.category || '-',
                qty: stats.quantity,
                quantity: stats.quantity, // Add alias
                revenue: stats.revenue
            }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);

        res.json({
            success: true,
            summary: {
                totalBills,
                totalRevenue,
                avgBillValue: totalBills > 0 ? (totalRevenue / totalBills) : 0,
                totalItemsSold,
                totalDiscounts,
                totalTaxes
            },
            breakdowns: {
                payment: paymentBreakdown,
                orderType: typeBreakdown
            },
            tableData,
            topSelling,
            cancelledBills
        });

    } catch (error) {
        console.error('Error generating billing report:', error);
        res.status(500).json({ success: false, message: 'Failed to generate billing report' });
    }
};
