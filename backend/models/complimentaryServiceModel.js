const mongoose = require('mongoose');

const complimentaryServiceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Service Name is required'],
        unique: true,
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required']
    },
    linkedWith: {
        type: String,
        required: [true, 'Linked With field is required']
    },
    quantityLimit: {
        type: String,
        required: [true, 'Quantity Limit is required']
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ComplimentaryService', complimentaryServiceSchema);
