const Order = require('../models/Order');
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');

const toNum = (value) => Number(value) || 0;

const normalizeAppliesTo = (value) => {
    const normalized = String(value || '').toUpperCase();
    if (normalized.includes('FOOD')) return 'FOOD';
    if (normalized.includes('ROOM')) return 'ROOM';
    if (normalized.includes('BILL')) return 'BILL';
    if (normalized.includes('SERVICE') || normalized.includes('SPA')) return 'SERVICE';
    return normalized || 'BILL';
};

const parseCustomTaxes = (rawValue) => {
    if (!rawValue) return [];
    try {
        const parsed = JSON.parse(rawValue);
        if (!Array.isArray(parsed)) return [];
        return parsed
            .filter(t => t && t.name && t.value !== undefined)
            .map(t => ({
                name: String(t.name),
                rate: toNum(t.value),
                type: String(t.type || 'PERCENTAGE').toUpperCase(),
                appliesTo: normalizeAppliesTo(t.appliesTo),
                status: String(t.status || 'ACTIVE').toUpperCase(),
                source: 'CUSTOM'
            }));
    } catch {
        return [];
    }
};

exports.getGstReport = async (req, res) => {
    try {
        let start = new Date();
        start.setHours(0, 0, 0, 0);
        if (req.query.startDate && !isNaN(new Date(req.query.startDate))) {
            start = new Date(req.query.startDate);
            start.setHours(0, 0, 0, 0);
        }

        let end = new Date();
        end.setHours(23, 59, 59, 999);
        if (req.query.endDate && !isNaN(new Date(req.query.endDate))) {
            end = new Date(req.query.endDate);
            end.setHours(23, 59, 59, 999);
        }

        const selectedTaxType = req.query.taxType && req.query.taxType !== 'All' ? req.query.taxType : 'All';
        const customTaxes = parseCustomTaxes(req.query.customTaxes || '[]');

        const hotel = await Hotel.findOne({}).sort({ createdAt: -1 }).lean();
        const fixedTaxes = [
            { name: 'Room GST', rate: toNum(hotel?.roomGst) || 12, type: 'PERCENTAGE', appliesTo: 'ROOM', status: 'ACTIVE', source: 'SYSTEM' },
            { name: 'Food GST', rate: toNum(hotel?.foodGst) || 5, type: 'PERCENTAGE', appliesTo: 'FOOD', status: 'ACTIVE', source: 'SYSTEM' },
            { name: 'Service Charge', rate: toNum(hotel?.serviceCharge) || 10, type: 'PERCENTAGE', appliesTo: 'BILL', status: 'ACTIVE', source: 'SYSTEM' }
        ];

        const allTaxes = [...fixedTaxes, ...customTaxes];
        const activeTaxes = allTaxes.filter(t => String(t.status || 'ACTIVE').toUpperCase() !== 'INACTIVE');

        const [orders, bookings] = await Promise.all([
            Order.find({ createdAt: { $gte: start, $lte: end } }).select('createdAt orderType subtotal totalAmount finalAmount tax taxRate items paymentMethod').lean(),
            Booking.find({
                $or: [
                    { createdAt: { $gte: start, $lte: end } },
                    { updatedAt: { $gte: start, $lte: end } },
                    { checkOutDate: { $gte: start, $lte: end } }
                ]
            }).select('bookingId createdAt checkOutDate roomNumber guestName duration billing').lean()
        ]);

        const applyTaxes = (scope, taxableValue, baseTaxAmount) => {
            const entries = [];
            const filterByType = (entry) => selectedTaxType === 'All' || entry.name.toLowerCase() === String(selectedTaxType).toLowerCase();

            if (scope === 'FOOD') {
                const foodGst = activeTaxes.find(t => t.name.toLowerCase() === 'food gst');
                if (foodGst) {
                    const taxAmount = baseTaxAmount > 0 ? baseTaxAmount : (toNum(taxableValue) * toNum(foodGst.rate)) / 100;
                    const entry = { name: 'Food GST', appliesTo: 'FOOD', rate: foodGst.rate, amount: taxAmount, source: foodGst.source };
                    if (filterByType(entry)) entries.push(entry);
                }
            }

            if (scope === 'ROOM') {
                const roomGst = activeTaxes.find(t => t.name.toLowerCase() === 'room gst');
                if (roomGst) {
                    const taxAmount = baseTaxAmount > 0 ? baseTaxAmount : (toNum(taxableValue) * toNum(roomGst.rate)) / 100;
                    const entry = { name: 'Room GST', appliesTo: 'ROOM', rate: roomGst.rate, amount: taxAmount, source: roomGst.source };
                    if (filterByType(entry)) entries.push(entry);
                }
            }

            const serviceTax = activeTaxes.find(t => t.name.toLowerCase() === 'service charge');
            if (serviceTax && (serviceTax.appliesTo === 'BILL' || serviceTax.appliesTo === scope || scope === 'SERVICE')) {
                const entry = { name: 'Service Charge', appliesTo: serviceTax.appliesTo, rate: serviceTax.rate, amount: (toNum(taxableValue) * toNum(serviceTax.rate)) / 100, source: serviceTax.source };
                if (filterByType(entry)) entries.push(entry);
            }

            activeTaxes
                .filter(t => t.source === 'CUSTOM' && t.name.toLowerCase() !== 'room gst' && t.name.toLowerCase() !== 'food gst' && t.name.toLowerCase() !== 'service charge')
                .forEach(t => {
                    if (!(t.appliesTo === 'BILL' || t.appliesTo === scope)) return;
                    const amount = t.type === 'FLAT' ? toNum(t.rate) : (toNum(taxableValue) * toNum(t.rate)) / 100;
                    const entry = { name: t.name, appliesTo: t.appliesTo, rate: t.rate, amount, source: t.source };
                    if (filterByType(entry)) entries.push(entry);
                });

            return entries;
        };

        const rows = [];

        orders.forEach(order => {
            const taxableValue = toNum(order.subtotal || order.totalAmount || order.finalAmount);
            const baseTax = toNum(order.tax);
            const appliedTaxes = applyTaxes('FOOD', taxableValue, baseTax);
            const taxAmount = appliedTaxes.reduce((sum, t) => sum + toNum(t.amount), 0);
            const reference = `ORD-${String(order._id).slice(-6).toUpperCase()}`;

            rows.push({
                date: order.createdAt,
                source: order.orderType || 'Cashier',
                reference,
                section: 'Food & Beverage',
                taxableValue,
                cgst: baseTax > 0 ? baseTax / 2 : 0,
                sgst: baseTax > 0 ? baseTax / 2 : 0,
                igst: 0,
                totalTax: taxAmount,
                appliedTaxes,
                isTaxable: taxAmount > 0
            });
        });

        bookings.forEach(booking => {
            const nights = Math.max(1, toNum(booking.duration?.nights) || 1);
            const taxableValue = toNum(booking.billing?.roomRate) > 0
                ? toNum(booking.billing?.roomRate) * nights
                : Math.max(0, toNum(booking.billing?.totalAmount) - toNum(booking.billing?.tax));
            const baseRoomTax = toNum(booking.billing?.tax);

            const appliedRoomTaxes = applyTaxes('ROOM', taxableValue, baseRoomTax);
            const roomTaxAmount = appliedRoomTaxes.reduce((sum, t) => sum + toNum(t.amount), 0);
            rows.push({
                date: booking.checkOutDate || booking.createdAt,
                source: `Room ${booking.roomNumber || '-'}`,
                reference: booking.bookingId || String(booking._id).slice(-6).toUpperCase(),
                section: 'Room',
                taxableValue,
                cgst: baseRoomTax > 0 ? baseRoomTax / 2 : 0,
                sgst: baseRoomTax > 0 ? baseRoomTax / 2 : 0,
                igst: 0,
                totalTax: roomTaxAmount,
                appliedTaxes: appliedRoomTaxes,
                isTaxable: roomTaxAmount > 0
            });

            const serviceChargeBase = toNum(booking.billing?.serviceCharge);
            if (serviceChargeBase > 0) {
                const serviceTaxes = applyTaxes('SERVICE', serviceChargeBase, 0);
                const serviceTaxAmount = serviceTaxes.reduce((sum, t) => sum + toNum(t.amount), 0);
                rows.push({
                    date: booking.checkOutDate || booking.createdAt,
                    source: `Room ${booking.roomNumber || '-'}`,
                    reference: booking.bookingId || String(booking._id).slice(-6).toUpperCase(),
                    section: 'Service',
                    taxableValue: serviceChargeBase,
                    cgst: 0,
                    sgst: 0,
                    igst: 0,
                    totalTax: serviceTaxAmount,
                    appliedTaxes: serviceTaxes,
                    isTaxable: serviceTaxAmount > 0
                });
            }
        });

        const taxSummaryMap = {};
        rows.forEach(row => {
            row.appliedTaxes.forEach(tax => {
                if (!taxSummaryMap[tax.name]) {
                    taxSummaryMap[tax.name] = {
                        taxName: tax.name,
                        appliesTo: tax.appliesTo,
                        transactions: 0,
                        taxableValue: 0,
                        taxRate: tax.rate,
                        taxAmount: 0,
                        sources: new Set()
                    };
                }
                taxSummaryMap[tax.name].transactions += 1;
                taxSummaryMap[tax.name].taxableValue += toNum(row.taxableValue);
                taxSummaryMap[tax.name].taxAmount += toNum(tax.amount);
                taxSummaryMap[tax.name].sources.add(row.source);
            });
        });

        const gstSummary = Object.values(taxSummaryMap).map(item => ({
            ...item,
            sources: Array.from(item.sources).join(', ')
        }));

        const gstItemWise = rows.flatMap(row => row.appliedTaxes.map(tax => ({
            date: row.date,
            source: row.source,
            reference: row.reference,
            section: row.section,
            taxName: tax.name,
            rate: tax.rate,
            taxableValue: row.taxableValue,
            taxAmount: tax.amount
        })));

        const cgstSgstIgst = rows.map(row => ({
            date: row.date,
            source: row.source,
            reference: row.reference,
            taxableValue: row.taxableValue,
            cgst: row.cgst,
            sgst: row.sgst,
            igst: row.igst,
            totalTax: row.totalTax
        }));

        const taxableRows = [
            { category: 'Taxable', transactions: rows.filter(r => r.isTaxable).length, taxableValue: rows.filter(r => r.isTaxable).reduce((s, r) => s + toNum(r.taxableValue), 0), taxAmount: rows.filter(r => r.isTaxable).reduce((s, r) => s + toNum(r.totalTax), 0) },
            { category: 'Non-Taxable', transactions: rows.filter(r => !r.isTaxable).length, taxableValue: rows.filter(r => !r.isTaxable).reduce((s, r) => s + toNum(r.taxableValue), 0), taxAmount: 0 }
        ];
        const totalTxn = taxableRows[0].transactions + taxableRows[1].transactions;
        taxableRows.forEach(r => {
            r.percentage = totalTxn > 0 ? (r.transactions * 100) / totalTxn : 0;
        });

        const taxTypeOptions = ['All', ...new Set(allTaxes.map(t => t.name))];

        const sourceBreakdown = rows.reduce((acc, row) => {
            const key = `${row.section}::${row.source}`;
            if (!acc[key]) {
                acc[key] = {
                    section: row.section,
                    source: row.source,
                    transactions: 0,
                    taxableValue: 0,
                    taxAmount: 0
                };
            }
            acc[key].transactions += 1;
            acc[key].taxableValue += toNum(row.taxableValue);
            acc[key].taxAmount += toNum(row.totalTax);
            return acc;
        }, {});

        res.json({
            success: true,
            filtersApplied: { start, end, selectedTaxType },
            taxTypeOptions,
            summaryTotals: {
                taxableValue: rows.reduce((s, r) => s + toNum(r.taxableValue), 0),
                totalTax: rows.reduce((s, r) => s + toNum(r.totalTax), 0),
                cgst: rows.reduce((s, r) => s + toNum(r.cgst), 0),
                sgst: rows.reduce((s, r) => s + toNum(r.sgst), 0),
                igst: rows.reduce((s, r) => s + toNum(r.igst), 0)
            },
            gstSummary,
            gstItemWise,
            cgstSgstIgst,
            taxableVsNonTaxable: taxableRows,
            sourceBreakdown: Object.values(sourceBreakdown)
        });
    } catch (error) {
        console.error('Error generating GST report:', error);
        res.status(500).json({ success: false, message: 'Failed to generate GST report', error: error.message });
    }
};

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
