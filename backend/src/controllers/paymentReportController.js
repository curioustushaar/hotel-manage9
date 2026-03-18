const GuestMealOrder = require('../models/Order');
const Booking = require('../models/Booking');
const Folio = require('../models/Folio');

const toNum = (value) => Number(value) || 0;

const normalizeMode = (mode) => {
    const normalized = String(mode || '').toLowerCase();
    if (normalized.includes('cash')) return 'Cash';
    if (normalized.includes('upi')) return 'UPI';
    if (normalized.includes('card')) return 'Card';
    if (normalized.includes('bank')) return 'Bank Transfer';
    if (normalized.includes('transfer')) return 'Bank Transfer';
    if (normalized.includes('room')) return 'Room Billing';
    return mode || 'N/A';
};

const isWithinShift = (dateValue, shift) => {
    if (!dateValue || !shift || shift === 'All' || shift === 'All Shifts') return true;
    const hour = new Date(dateValue).getHours();
    if (shift === 'Morning') return hour >= 6 && hour < 14;
    if (shift === 'Evening') return hour >= 14 && hour < 21;
    if (shift === 'Night') return hour >= 21 || hour < 6;
    return true;
};

const matchesPaymentMode = (mode, paymentModeFilter) => {
    if (!paymentModeFilter || paymentModeFilter === 'All' || paymentModeFilter === 'All Payment Modes') return true;
    return String(normalizeMode(mode)).toLowerCase() === String(normalizeMode(paymentModeFilter)).toLowerCase();
};

const matchesCashier = (cashier, cashierFilter) => {
    if (!cashierFilter || cashierFilter === 'All' || cashierFilter === 'All Cashiers') return true;
    const normalizedCashier = String(cashier || '').toLowerCase();
    const normalizedFilter = String(cashierFilter || '').toLowerCase();
    return normalizedCashier === normalizedFilter;
};

const buildDiscountReport = async ({ startDate, endDate, cashierFilter, paymentModeFilter, shiftFilter }) => {
    const bookings = await Booking.find({
        $or: [
            { updatedAt: { $gte: startDate, $lte: endDate } },
            { checkOutDate: { $gte: startDate, $lte: endDate } }
        ]
    }).select('bookingId guestName status billing transactions updatedAt checkOutDate duration').lean();

    const bookingIds = bookings.map(b => b._id);

    const targetOrders = await GuestMealOrder.find({
        $or: [
            { closedAt: { $gte: startDate, $lte: endDate } },
            { updatedAt: { $gte: startDate, $lte: endDate } },
            { createdAt: { $gte: startDate, $lte: endDate } }
        ]
    }).select('booking orderType paymentMethod items finalAmount totalAmount discountAmount status closedAt updatedAt createdAt').lean();

    const ordersByBooking = new Map();
    const standaloneOrders = [];

    targetOrders.forEach(order => {
        if (order.booking && bookingIds.some(id => String(id) === String(order.booking))) {
            const key = String(order.booking);
            if (!ordersByBooking.has(key)) ordersByBooking.set(key, []);
            ordersByBooking.get(key).push(order);
        } else {
            standaloneOrders.push(order);
        }
    });

    const folios = await Folio.find({
        reservationId: { $in: bookingIds },
        updatedAt: { $gte: startDate, $lte: endDate }
    }).select('reservationId entries discountTotal grandTotal totalPaid balance updatedAt').lean();

    const foliosByBooking = new Map();
    folios.forEach(folio => {
        const key = String(folio.reservationId);
        if (!foliosByBooking.has(key)) foliosByBooking.set(key, []);
        foliosByBooking.get(key).push(folio);
    });

    const rows = [];
    const sectionSummaryMap = {};
    const totals = {
        totalDiscount: 0,
        totalRoomCharge: 0,
        totalRoomGst: 0,
        totalServiceCharge: 0,
        totalFood: 0,
        totalBeverage: 0,
        totalNetPayable: 0,
        totalPaid: 0
    };

    bookings.forEach(booking => {
        const bookingKey = String(booking._id);
        const bookingOrders = ordersByBooking.get(bookingKey) || [];
        const bookingFolios = foliosByBooking.get(bookingKey) || [];

        const billing = booking.billing || {};
        const roomCharge = toNum(billing.roomRate) * Math.max(1, toNum(booking?.duration?.nights) || 1);
        const roomGst = toNum(billing.tax);
        const serviceCharge = toNum(billing.serviceCharge);
        const roomDiscount = toNum(billing.discount);

        let foodAmountCountable = 0;
        let beverageAmountCountable = 0;
        let foodDiscount = 0;
        let lastOrderPaymentMode = 'N/A';

        bookingOrders.forEach(order => {
            let beverageSubtotal = 0;
            let foodSubtotal = 0;

            (order.items || []).forEach(item => {
                const category = String(item.category || '').toLowerCase();
                const itemTotal = toNum(item.total) || (toNum(item.price) * toNum(item.quantity));
                if (category.includes('beverage') || category.includes('drink') || category.includes('juice')) {
                    beverageSubtotal += itemTotal;
                } else {
                    foodSubtotal += itemTotal;
                }
            });

            // Ensure we use gross amounts (before discount) for the component breakdown
            // If order.totalAmount exists, use that, otherwise use sum of items
            const orderGross = toNum(order.totalAmount) || (foodSubtotal + beverageSubtotal);
            const ordDis = toNum(order.discountAmount);

            foodAmountCountable += foodSubtotal > 0 ? foodSubtotal : Math.max(0, orderGross - beverageSubtotal);
            beverageAmountCountable += beverageSubtotal;
            foodDiscount += ordDis;
            if (order.paymentMethod) lastOrderPaymentMode = order.paymentMethod;
        });

        let folioDiscount = 0;
        let folioDiscountModes = [];
        bookingFolios.forEach(folio => {
            folioDiscount += toNum(folio.discountTotal);
            (folio.entries || []).forEach(entry => {
                if (entry.type === 'DISCOUNT') {
                    folioDiscount += toNum(entry.amount);
                }
                if (entry.type === 'PAYMENT' && entry.paymentMode && entry.paymentMode !== 'NONE') {
                    folioDiscountModes.push(entry.paymentMode);
                }
            });
        });

        const transactionDiscount = (booking.transactions || [])
            .filter(tx => String(tx.type || '').toLowerCase() === 'discount')
            .reduce((sum, tx) => sum + toNum(tx.amount), 0);

        const totalDiscount = roomDiscount + foodDiscount + folioDiscount + transactionDiscount;
        if (totalDiscount <= 0) return;

        const totalBeforeDiscount = roomCharge + roomGst + serviceCharge + foodAmountCountable + beverageAmountCountable;
        const netPayable = Math.max(0, totalBeforeDiscount - totalDiscount);

        const paymentTrans = (booking.transactions || []).filter(tx => String(tx.type || '').toLowerCase() === 'payment');
        const totalPaid = paymentTrans.reduce((sum, tx) => sum + Math.abs(toNum(tx.amount)), 0);
        const paymentMode = normalizeMode(paymentTrans[0]?.method || folioDiscountModes[0] || lastOrderPaymentMode || 'N/A');

        let cashier = 'Room';
        if (bookingOrders.length) {
            const firstType = bookingOrders[0].orderType || '';
            if (firstType.toLowerCase().includes('take')) cashier = 'Take Away';
            else if (firstType.toLowerCase().includes('online')) cashier = 'Online Order';
            else if (firstType.toLowerCase().includes('room')) cashier = 'Room';
            else cashier = 'Dine-In';
        }

        const createdAt = booking.updatedAt || booking.checkOutDate;

        if (!matchesCashier(cashier, cashierFilter)) return;
        if (!matchesPaymentMode(paymentMode, paymentModeFilter)) return;
        if (!isWithinShift(createdAt, shiftFilter)) return;

        const sectionRows = [
            { section: 'Room Discount', amount: roomDiscount },
            { section: 'Food Discount', amount: foodDiscount },
            { section: 'Folio Discount', amount: folioDiscount },
            { section: 'Other Discount', amount: transactionDiscount }
        ].filter(section => section.amount > 0);

        if (sectionRows.length === 0) return;

        totals.totalDiscount += totalDiscount;
        totals.totalRoomCharge += roomCharge;
        totals.totalRoomGst += roomGst;
        totals.totalServiceCharge += serviceCharge;
        totals.totalFood += foodAmountCountable;
        totals.totalBeverage += beverageAmountCountable;
        totals.totalNetPayable += netPayable;
        totals.totalPaid += totalPaid;

        sectionRows.forEach(section => {
            const ratio = toNum(section.amount) / totalDiscount;
            const sectionNetPayable = netPayable * ratio;
            const sectionTotalPaid = totalPaid * ratio;

            if (!sectionSummaryMap[section.section]) {
                sectionSummaryMap[section.section] = { section: section.section, totalDiscount: 0, totalNetPayable: 0, totalPaid: 0, records: 0 };
            }
            sectionSummaryMap[section.section].totalDiscount += toNum(section.amount);
            sectionSummaryMap[section.section].totalNetPayable += sectionNetPayable;
            sectionSummaryMap[section.section].totalPaid += sectionTotalPaid;
            sectionSummaryMap[section.section].records += 1;

            rows.push({
                id: `${booking._id}-${section.section}`,
                billNo: booking.bookingId || String(booking._id).slice(-6).toUpperCase(),
                guestName: booking.guestName || 'Guest',
                section: section.section,
                cashier,
                paymentMode,
                roomCharge: ratio * roomCharge,
                roomGst: ratio * roomGst,
                serviceCharge: ratio * serviceCharge,
                foodAmount: ratio * foodAmountCountable,
                beverageAmount: ratio * beverageAmountCountable,
                discountAmount: toNum(section.amount),
                totalDiscount: totalDiscount,
                netPayable: sectionNetPayable,
                totalPaid: sectionTotalPaid,
                status: booking.status || 'N/A',
                createdAt
            });
        });
    });

    // Handle Standalone F&B Orders
    standaloneOrders.forEach(order => {
        const orderDiscount = toNum(order.discountAmount);
        if (orderDiscount <= 0 || (order.status !== 'Closed' && order.status !== 'Completed' && order.status !== 'Settled')) return; // Ignore unpaid discounts if necessary, though report usually shows all closed

        let beverageSubtotal = 0;
        let foodSubtotal = 0;

        (order.items || []).forEach(item => {
            const category = String(item.category || '').toLowerCase();
            const itemTotal = toNum(item.total) || (toNum(item.price) * toNum(item.quantity));
            if (category.includes('beverage') || category.includes('drink') || category.includes('juice')) {
                beverageSubtotal += itemTotal;
            } else {
                foodSubtotal += itemTotal;
            }
        });

        const orderGross = toNum(order.totalAmount) || (foodSubtotal + beverageSubtotal);
        const foodAmountCountable = foodSubtotal > 0 ? foodSubtotal : Math.max(0, orderGross - beverageSubtotal);
        const beverageAmountCountable = beverageSubtotal;

        const netPayable = Math.max(0, orderGross - orderDiscount);

        // Standalone orders usually are fully paid if closed
        const paymentTrans = (order.transactions || []).filter(tx => String(tx.type || '').toLowerCase() === 'payment');
        let totalPaid = paymentTrans.reduce((sum, tx) => sum + Math.abs(toNum(tx.amount)), 0);
        if (totalPaid === 0 && (order.status === 'Closed' || order.status === 'Billed' || order.status === 'Settled')) {
            totalPaid = netPayable; // Assume fully paid
        }

        let cashier = order.orderType || 'Dine-In';
        if (cashier.toLowerCase().includes('take')) cashier = 'Take Away';
        else if (cashier.toLowerCase().includes('online')) cashier = 'Online Order';

        const paymentMode = normalizeMode(order.paymentMethod || 'N/A');
        const createdAt = order.closedAt || order.updatedAt;

        if (!matchesCashier(cashier, cashierFilter)) return;
        if (!matchesPaymentMode(paymentMode, paymentModeFilter)) return;
        if (!isWithinShift(createdAt, shiftFilter)) return;

        totals.totalDiscount += orderDiscount;
        totals.totalFood += foodAmountCountable;
        totals.totalBeverage += beverageAmountCountable;
        totals.totalNetPayable += netPayable;
        totals.totalPaid += totalPaid;

        const sectionName = 'Food Discount';
        if (!sectionSummaryMap[sectionName]) {
            sectionSummaryMap[sectionName] = { section: sectionName, totalDiscount: 0, totalNetPayable: 0, totalPaid: 0, records: 0 };
        }
        sectionSummaryMap[sectionName].totalDiscount += orderDiscount;
        sectionSummaryMap[sectionName].totalNetPayable += netPayable;
        sectionSummaryMap[sectionName].totalPaid += totalPaid;
        sectionSummaryMap[sectionName].records += 1;

        rows.push({
            id: `order-${order._id}`,
            billNo: String(order._id).slice(-6).toUpperCase(),
            guestName: order.guestName || 'Walk-In Customer',
            section: sectionName,
            cashier,
            paymentMode,
            roomCharge: 0,
            roomGst: 0,
            serviceCharge: 0,
            foodAmount: foodAmountCountable,
            beverageAmount: beverageAmountCountable,
            discountAmount: orderDiscount,
            totalDiscount: orderDiscount,
            netPayable: netPayable,
            totalPaid,
            status: order.status || 'Closed',
            createdAt
        });
    });

    return {
        rows: rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
        sectionSummary: Object.values(sectionSummaryMap).sort((a, b) => b.totalDiscount - a.totalDiscount),
        totals
    };
};

const buildRefundReport = async ({ startDate, endDate, cashierFilter, paymentModeFilter, shiftFilter }) => {
    const bookings = await Booking.find({
        $or: [
            { updatedAt: { $gte: startDate, $lte: endDate } },
            { checkOutDate: { $gte: startDate, $lte: endDate } }
        ]
    }).select('bookingId guestName status source transactions updatedAt').lean();

    const rows = [];

    bookings.forEach(booking => {
        const refunds = (booking.transactions || []).filter(tx => {
            const type = String(tx.type || '').toLowerCase();
            const txDate = new Date(tx.date || tx.createdAt || booking.updatedAt || Date.now());
            return type === 'refund' && txDate >= startDate && txDate <= endDate;
        });

        if (!refunds.length) return;

        const cashier = booking.source === 'Online' ? 'Online Order' : (booking.source === 'Walk-In' ? 'Dine-In' : 'Room');
        if (!matchesCashier(cashier, cashierFilter)) return;

        refunds.forEach((tx, index) => {
            const mode = normalizeMode(tx.method || tx.paymentMode || 'Cash');
            const createdAt = new Date(tx.date || tx.createdAt || booking.updatedAt || Date.now());

            if (!matchesPaymentMode(mode, paymentModeFilter)) return;
            if (!isWithinShift(createdAt, shiftFilter)) return;

            rows.push({
                id: `${booking._id}-refund-${index}`,
                billNo: booking.bookingId || String(booking._id).slice(-6).toUpperCase(),
                cashier,
                paymentMode: mode,
                amount: Math.abs(toNum(tx.amount)),
                status: 'Refunded',
                reason: tx.notes || tx.description || 'Booking refund',
                createdAt
            });
        });
    });

    const totals = rows.reduce((acc, row) => {
        acc.totalRefund += toNum(row.amount);
        if (row.paymentMode === 'Cash') acc.cash += toNum(row.amount);
        else if (row.paymentMode === 'UPI') acc.upi += toNum(row.amount);
        else if (row.paymentMode === 'Card') acc.card += toNum(row.amount);
        else acc.other += toNum(row.amount);
        return acc;
    }, { totalRefund: 0, cash: 0, upi: 0, card: 0, other: 0 });

    return {
        rows: rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
        totals
    };
};

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
                    return hours >= 6 && hours < 14;
                } else if (req.query.shift === 'Evening') {
                    return hours >= 14 && hours < 21;
                } else if (req.query.shift === 'Night') {
                    return hours >= 21 || hours < 6;
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

        const discountReport = await buildDiscountReport({
            startDate,
            endDate,
            cashierFilter: req.query.cashier || 'All',
            paymentModeFilter: req.query.paymentMode || 'All',
            shiftFilter: req.query.shift || 'All'
        });

        const refundReport = await buildRefundReport({
            startDate,
            endDate,
            cashierFilter: req.query.cashier || 'All',
            paymentModeFilter: req.query.paymentMode || 'All',
            shiftFilter: req.query.shift || 'All'
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
                totalOther,
                totalRefundAmount: refundReport.totals?.totalRefund || 0
            },
            transactions: formattedOrders,
            discountReport,
            refundReport
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
