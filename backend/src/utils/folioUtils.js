const CATEGORIES_MAPPING = {
    roomCharges: ['Room Tariff', 'Room Stay', 'Room Charges', 'Rent', 'Accommodation'],
    roomPosting: ['Room Posting', 'Food Order', 'Room Order', 'Restaurant', 'In House Order', 'Restaurant Bill', 'Meal', 'Breakfast', 'Lunch', 'Dinner', 'Beverage', 'Drink', 'Mini Bar'],
    laundry: ['Laundry', 'Wash', 'Iron', 'Press', 'Cleaning'],
    dryCleaning: ['Dry Cleaning'],
    spa: ['Spa', 'Wellness', 'Massage', 'Therapy', 'Steam', 'Sauna'],
    gym: ['Gym', 'Fitness', 'Trainer', 'Workout'],
    pool: ['Pool', 'Swimming'],
    pets: ['Pet', 'Dog', 'Cat'],
    special: ['Special Request', 'Extra Person', 'Bed', 'Mattress'],
    deposit: ['Deposit', 'Security', 'Advance'],
    key: ['Key', 'Card Replacement', 'Lost Card'],
    smoking: ['Smoking', 'Cleaning Fee'],
    towels: ['Towel', 'Toiletries', 'Linen'],
    parking: ['Parking', 'Garage'],
    valet: ['Valet']
};

const determineTransactionCategory = (transaction) => {
    const text = `${transaction.particulars || ''} ${transaction.description || ''}`.toLowerCase();
    for (const [category, keywords] of Object.entries(CATEGORIES_MAPPING)) {
        if (keywords.some(kw => text.includes(kw.toLowerCase()))) {
            return category;
        }
    }
    return null;
};

const applyRoutingRules = (booking, transaction) => {
    if (transaction.type?.toLowerCase() !== 'charge' || transaction.amount <= 0) return;

    const category = determineTransactionCategory(transaction);
    if (!category) return;

    if (booking.routingRules && booking.routingRules.length > 0) {
        const rule = booking.routingRules.find(r => r.category === category);
        if (rule) {
            transaction.folioId = rule.targetFolioId;
            transaction.routedBy = 'auto-rule';
        }
    }
};

module.exports = {
    CATEGORIES_MAPPING,
    determineTransactionCategory,
    applyRoutingRules
};
