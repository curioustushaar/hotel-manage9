const Transaction = require('../models/transactionModel');

// Get cashier report data
const getCashierReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Parse dates
        let start = startDate ? new Date(startDate) : new Date();
        let end = endDate ? new Date(endDate) : new Date();

        // Set time to start and end of day
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        // Get all transactions within date range
        const transactions = await Transaction.find({
            date: { $gte: start, $lte: end }
        }).sort({ date: 1 });

        // Calculate totals
        const collections = transactions.filter(t => t.category === 'collection');
        const payouts = transactions.filter(t => t.category === 'payout');

        const totalCollections = collections.reduce((sum, t) => sum + t.amount, 0);
        const totalPayouts = payouts.reduce((sum, t) => sum + t.amount, 0);
        const netCashFlow = totalCollections - totalPayouts;

        // Calculate opening balance (all transactions before start date)
        const previousTransactions = await Transaction.find({
            date: { $lt: start }
        });
        
        const previousCollections = previousTransactions
            .filter(t => t.category === 'collection')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const previousPayouts = previousTransactions
            .filter(t => t.category === 'payout')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const openingBalance = previousCollections - previousPayouts;
        const closingBalance = openingBalance + netCashFlow;

        // Calculate payment breakdowns
        const paymentsReceived = {
            cash: collections.filter(t => t.paymentMethod === 'cash').reduce((sum, t) => sum + t.amount, 0),
            card: collections.filter(t => t.paymentMethod === 'card').reduce((sum, t) => sum + t.amount, 0),
            upi: collections.filter(t => t.paymentMethod === 'upi').reduce((sum, t) => sum + t.amount, 0),
            bankTransfer: collections.filter(t => t.paymentMethod === 'bank-transfer').reduce((sum, t) => sum + t.amount, 0)
        };

        const paymentsMade = {
            cash: payouts.filter(t => t.type === 'Expense' || t.type === 'Other Payment').reduce((sum, t) => sum + t.amount, 0),
            expensePaid: payouts.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0),
            refunds: payouts.filter(t => t.type === 'Refund').reduce((sum, t) => sum + t.amount, 0),
            salaries: payouts.filter(t => t.type === 'Salary').reduce((sum, t) => sum + t.amount, 0)
        };

        // Format activity log
        const activityLog = transactions.map(t => ({
            id: t._id,
            date: t.date,
            type: t.type,
            amount: t.amount,
            by: t.by,
            reference: t.reference,
            notes: t.notes,
            category: t.category
        }));

        res.json({
            success: true,
            data: {
                totalCollections,
                totalPayments: collections.length,
                totalPayouts,
                totalPayoutsCount: payouts.length,
                netCashFlow,
                netTransactions: transactions.length,
                openingBalance,
                openingPayments: previousTransactions.filter(t => t.category === 'collection').length,
                closingBalance,
                paymentsReceived,
                paymentsMade,
                activityLog
            }
        });
    } catch (error) {
        console.error('Error fetching cashier report:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching cashier report',
            error: error.message 
        });
    }
};

// Add new transaction
const addTransaction = async (req, res) => {
    try {
        const { date, type, category, amount, by, reference, notes, paymentMethod } = req.body;

        const transaction = await Transaction.create({
            date: date || new Date(),
            type,
            category,
            amount,
            by: by || 'Admin',
            reference: reference || '',
            notes: notes || '',
            paymentMethod: paymentMethod || 'cash'
        });

        res.status(201).json({
            success: true,
            message: 'Transaction added successfully',
            data: transaction
        });
    } catch (error) {
        console.error('Error adding transaction:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error adding transaction',
            error: error.message 
        });
    }
};

// Get all transactions
const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ date: -1 });
        
        res.json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching transactions',
            error: error.message 
        });
    }
};

// Delete transaction
const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await Transaction.findByIdAndDelete(id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        res.json({
            success: true,
            message: 'Transaction deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting transaction',
            error: error.message 
        });
    }
};

// Initialize sample data (for testing)
const initializeSampleData = async (req, res) => {
    try {
        // Clear existing transactions
        await Transaction.deleteMany({});

        // Create sample transactions
        const sampleTransactions = [
            {
                date: new Date('2026-02-05'),
                type: 'Opening Balance',
                category: 'collection',
                amount: 5000,
                by: 'Shahrukh Ahmed',
                reference: 'EMP-001',
                paymentMethod: 'cash'
            },
            {
                date: new Date('2026-02-05'),
                type: 'Collection Cash',
                category: 'collection',
                amount: 5000,
                by: 'Shahrukh Ahmed',
                reference: 'EMP-001',
                paymentMethod: 'cash'
            },
            {
                date: new Date('2026-02-05'),
                type: 'Collection Card',
                category: 'collection',
                amount: 3000,
                by: 'Shahrukh Ahmed',
                reference: 'EMP-001',
                paymentMethod: 'card'
            },
            {
                date: new Date('2026-02-05'),
                type: 'Collection UPI',
                category: 'collection',
                amount: 1000,
                by: 'Shahrukh Ahmed',
                reference: 'EMP-001',
                paymentMethod: 'upi'
            },
            {
                date: new Date('2026-02-05'),
                type: 'Collection Bank Transfer',
                category: 'collection',
                amount: 1500,
                by: 'Shahrukh Ahmed',
                reference: 'EMP-001',
                paymentMethod: 'bank-transfer'
            },
            {
                date: new Date('2026-02-05'),
                type: 'Expense',
                category: 'payout',
                amount: 1200,
                by: 'CHE receipt',
                reference: 'INV-0932',
                notes: 'cross mesh',
                paymentMethod: 'cash'
            },
            {
                date: new Date('2026-02-05'),
                type: 'Expense',
                category: 'payout',
                amount: 2000,
                by: 'Admin',
                reference: 'EXP-001',
                notes: 'Office supplies',
                paymentMethod: 'cash'
            },
            {
                date: new Date('2026-02-05'),
                type: 'Refund',
                category: 'payout',
                amount: 500,
                by: 'Admin',
                reference: 'REF-001',
                notes: 'Customer refund',
                paymentMethod: 'cash'
            },
            {
                date: new Date('2026-02-05'),
                type: 'Salary',
                category: 'payout',
                amount: 250,
                by: 'Admin',
                reference: 'SAL-001',
                notes: 'Staff payment',
                paymentMethod: 'cash'
            }
        ];

        await Transaction.insertMany(sampleTransactions);

        res.json({
            success: true,
            message: 'Sample data initialized successfully',
            count: sampleTransactions.length
        });
    } catch (error) {
        console.error('Error initializing sample data:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error initializing sample data',
            error: error.message 
        });
    }
};

module.exports = {
    getCashierReport,
    addTransaction,
    getAllTransactions,
    deleteTransaction,
    initializeSampleData
};
