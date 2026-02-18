const mongoose = require('mongoose');

const businessSourceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Business Source is required'],
        unique: true,
        trim: true
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('BusinessSource', businessSourceSchema);
