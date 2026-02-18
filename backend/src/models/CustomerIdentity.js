const mongoose = require('mongoose');

const customerIdentitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Identity Type is required'],
        unique: true,
        trim: true
    },
    requiredByLaw: {
        type: Boolean,
        default: false
    },
    usedForReservations: {
        type: Boolean,
        default: false
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CustomerIdentity', customerIdentitySchema);
