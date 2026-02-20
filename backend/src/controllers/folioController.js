const Folio = require('../models/Folio');
const Booking = require('../models/Booking');

// Central Recalculation Function
const recalculateFolio = async (folioId) => {
    const folio = await Folio.findById(folioId);
    if (!folio) return null;

    let subtotal = 0;
    let discountTotal = 0;
    let totalPaid = 0;

    folio.entries.forEach(entry => {
        if (entry.type === 'ROOM_CHARGE' || entry.type === 'EXTRA_CHARGE') {
            subtotal += entry.amount;
        } else if (entry.type === 'DISCOUNT') {
            discountTotal += entry.amount;
        } else if (entry.type === 'PAYMENT') {
            totalPaid += entry.amount;
        } else if (entry.type === 'REFUND') {
            totalPaid -= entry.amount;
        }
    });

    // Tax calculation (12% as per common rules in this project)
    const tax = Math.round((subtotal - discountTotal) * 0.12);
    const grandTotal = (subtotal - discountTotal) + tax;
    const balance = grandTotal - totalPaid;

    folio.subtotal = subtotal;
    folio.discountTotal = discountTotal;
    folio.tax = tax;
    folio.grandTotal = grandTotal;
    folio.totalPaid = totalPaid;
    folio.balance = balance;
    folio.updatedAt = new Date();

    await folio.save();
    return folio;
};

// Routing Engine Function
const routeCharge = async (reservationId, chargeType) => {
    const booking = await Booking.findById(reservationId).populate('folios');
    if (!booking) return null;

    // Check routing rules
    let routeTo = 'PRIMARY';
    if (booking.routingRules && booking.routingRules.length > 0) {
        const rule = booking.routingRules.find(r => r.chargeType === chargeType);
        if (rule) routeTo = rule.routeTo;
    }

    // Find existing folio of that type
    let folio = booking.folios.find(f => f.type === routeTo);

    // Fallback: If requested type doesn't exist, use PRIMARY
    if (!folio && routeTo !== 'PRIMARY') {
        folio = booking.folios.find(f => f.type === 'PRIMARY');
    }

    // Final Fallback: If no folios at all (old system), look for one directly
    if (!folio) {
        folio = await Folio.findOne({ reservationId, type: 'PRIMARY' });
    }

    return folio;
};

// Add Extra Charge
exports.addExtraCharge = async (req, res) => {
    try {
        const { reservationId, folioId, description, amount, chargeType, addedBy } = req.body;

        let folio;
        if (folioId) {
            folio = await Folio.findById(folioId);
        } else if (reservationId) {
            folio = await routeCharge(reservationId, chargeType || 'EXTRA_CHARGE');
        }

        if (!folio) {
            return res.status(404).json({ success: false, message: 'Matching folio not found' });
        }

        folio.entries.push({
            type: 'EXTRA_CHARGE',
            description,
            amount: Number(amount),
            addedBy: addedBy || 'Staff'
        });

        await folio.save();
        const updatedFolio = await recalculateFolio(folio._id);

        res.status(200).json({
            success: true,
            message: 'Extra charge added successfully',
            data: updatedFolio
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add Payment
exports.addPayment = async (req, res) => {
    try {
        const { reservationId, folioId, folioType, amount, paymentMode, addedBy } = req.body;

        let folio;
        if (folioId) {
            folio = await Folio.findById(folioId);
        } else if (reservationId) {
            // Find by type or default to PRIMARY
            folio = await Folio.findOne({
                reservationId,
                type: folioType || 'PRIMARY'
            });
        }

        if (!folio) {
            return res.status(404).json({ success: false, message: 'Folio not found' });
        }

        folio.entries.push({
            type: 'PAYMENT',
            description: `Payment via ${paymentMode}`,
            amount: Number(amount),
            paymentMode: paymentMode,
            addedBy: addedBy || 'Staff'
        });

        await folio.save();
        const updatedFolio = await recalculateFolio(folio._id);

        res.status(200).json({
            success: true,
            message: 'Payment added successfully',
            data: updatedFolio
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Apply Discount
exports.applyDiscount = async (req, res) => {
    try {
        const { folioId, amount, description, addedBy } = req.body;

        const folio = await Folio.findById(folioId);
        if (!folio) {
            return res.status(404).json({ success: false, message: 'Folio not found' });
        }

        folio.entries.push({
            type: 'DISCOUNT',
            description: description || 'Special Discount',
            amount: Number(amount),
            addedBy: addedBy || 'Staff'
        });

        await folio.save();
        const updatedFolio = await recalculateFolio(folio._id);

        res.status(200).json({
            success: true,
            message: 'Discount applied successfully',
            data: updatedFolio
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Folio by Reservation ID
exports.getFolioByReservation = async (req, res) => {
    try {
        const { reservationId } = req.params;
        const folios = await Folio.find({ reservationId });

        if (!folios || folios.length === 0) {
            return res.status(404).json({ success: false, message: 'No folios found' });
        }

        res.status(200).json({
            success: true,
            data: folios.length === 1 ? folios[0] : folios,
            allFolios: folios
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    ...exports,
    recalculateFolio,
    routeCharge
};
