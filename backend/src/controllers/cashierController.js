const Transaction = require('../models/Transaction');

const isCollectionTxn = (t) => {
    const type = String(t?.type || '').toLowerCase();
    const category = String(t?.category || '').toLowerCase();
    return type === 'income' || category === 'collection';
};

const isPayoutTxn = (t) => {
    const type = String(t?.type || '').toLowerCase();
    const category = String(t?.category || '').toLowerCase();
    return ['expense', 'refund', 'void'].includes(type) || category === 'payout';
};

const paymentMethodSum = (txns, matcher) => txns
    .filter(t => matcher(String(t?.paymentMethod || '').toLowerCase()))
    .reduce((sum, t) => sum + (Number(t?.amount) || 0), 0);

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
        const collections = transactions.filter(isCollectionTxn);
        const payouts = transactions.filter(isPayoutTxn);

        const totalCollections = collections.reduce((sum, t) => sum + t.amount, 0);
        const totalPayouts = payouts.reduce((sum, t) => sum + t.amount, 0);
        const netCashFlow = totalCollections - totalPayouts;

        // Calculate opening balance (all transactions before start date)
        const previousTransactions = await Transaction.find({
            date: { $lt: start }
        });
        
        const previousCollections = previousTransactions
            .filter(isCollectionTxn)
            .reduce((sum, t) => sum + t.amount, 0);
        
        const previousPayouts = previousTransactions
            .filter(isPayoutTxn)
            .reduce((sum, t) => sum + t.amount, 0);
        
        const openingBalance = previousCollections - previousPayouts;
        const closingBalance = openingBalance + netCashFlow;

        // Calculate payment breakdowns
        const paymentsReceived = {
            cash: paymentMethodSum(collections, (m) => m.includes('cash')),
            card: paymentMethodSum(collections, (m) => m.includes('card') || m.includes('credit') || m.includes('debit')),
            upi: paymentMethodSum(collections, (m) => m.includes('upi') || m.includes('online') || m.includes('wallet')),
            bankTransfer: paymentMethodSum(collections, (m) => m.includes('bank') || m.includes('transfer') || m.includes('neft') || m.includes('rtgs') || m.includes('imps'))
        };

        const paymentsMade = {
            cash: paymentMethodSum(payouts, (m) => m.includes('cash')),
            expensePaid: payouts.filter(t => String(t?.type || '').toLowerCase() === 'expense').reduce((sum, t) => sum + t.amount, 0),
            refunds: payouts.filter(t => String(t?.type || '').toLowerCase() === 'refund').reduce((sum, t) => sum + t.amount, 0),
            salaries: payouts.filter(t => String(t?.type || '').toLowerCase() === 'salary').reduce((sum, t) => sum + t.amount, 0)
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
                openingPayments: previousTransactions.filter(isCollectionTxn).length,
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

// Get food payment report
const getFoodPaymentReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Parse dates
        let start = startDate ? new Date(startDate) : new Date();
        let end = endDate ? new Date(endDate) : new Date();

        // Set time to start and end of day
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        console.log(`[getFoodPaymentReport] Fetching food payments from ${start} to ${end}`);

        // Get all restaurant transactions within date range
        const transactions = await Transaction.find({
            category: 'Restaurant',
            date: { $gte: start, $lte: end }
        })
        .populate('order')
        .populate('performedBy', 'name username')
        .sort({ date: 1 });

        console.log(`[getFoodPaymentReport] Found ${transactions.length} transactions`);

        // Separate collections and refunds
        const collections = transactions.filter(t => t.type === 'Income');
        const refunds = transactions.filter(t => t.type === 'Refund');

        // Calculate totals
        const totalCollections = collections.reduce((sum, t) => sum + t.amount, 0);
        const totalRefunds = refunds.reduce((sum, t) => sum + t.amount, 0);
        const netCollection = totalCollections - totalRefunds;

        // Payment method breakdowns - normalize to lowercase for comparison
        const normalizeMethod = (method) => {
            if (!method) return 'cash';
            const lower = method.toLowerCase();
            if (lower.includes('bank') || lower.includes('transfer')) return 'bank-transfer';
            return lower;
        };

        const paymentsReceived = {
            cash: collections.filter(t => normalizeMethod(t.paymentMethod) === 'cash').reduce((sum, t) => sum + t.amount, 0),
            card: collections.filter(t => normalizeMethod(t.paymentMethod) === 'card').reduce((sum, t) => sum + t.amount, 0),
            upi: collections.filter(t => normalizeMethod(t.paymentMethod) === 'upi').reduce((sum, t) => sum + t.amount, 0),
            bankTransfer: collections.filter(t => normalizeMethod(t.paymentMethod) === 'bank-transfer').reduce((sum, t) => sum + t.amount, 0)
        };

        const refundsGiven = {
            cash: refunds.filter(t => normalizeMethod(t.paymentMethod) === 'cash').reduce((sum, t) => sum + t.amount, 0),
            card: refunds.filter(t => normalizeMethod(t.paymentMethod) === 'card').reduce((sum, t) => sum + t.amount, 0),
            upi: refunds.filter(t => normalizeMethod(t.paymentMethod) === 'upi').reduce((sum, t) => sum + t.amount, 0),
            bankTransfer: refunds.filter(t => normalizeMethod(t.paymentMethod) === 'bank-transfer').reduce((sum, t) => sum + t.amount, 0)
        };

        // Group by date for trends
        const trendsByDate = {};
        transactions.forEach(t => {
            const dateKey = t.date.toISOString().split('T')[0]; // YYYY-MM-DD
            
            if (!trendsByDate[dateKey]) {
                trendsByDate[dateKey] = {
                    date: dateKey,
                    totalPayments: 0,
                    totalRefunds: 0,
                    cashPayments: 0,
                    cardPayments: 0,
                    upiPayments: 0,
                    bankTransfer: 0,
                    cashRefunds: 0,
                    cardRefunds: 0,
                    upiRefunds: 0,
                    bankRefunds: 0,
                    paymentsCount: 0,
                    refundsCount: 0
                };
            }

            const method = normalizeMethod(t.paymentMethod);
            
            if (t.type === 'Income') {
                trendsByDate[dateKey].totalPayments += t.amount;
                trendsByDate[dateKey].paymentsCount += 1;
                
                if (method === 'cash') trendsByDate[dateKey].cashPayments += t.amount;
                else if (method === 'card') trendsByDate[dateKey].cardPayments += t.amount;
                else if (method === 'upi') trendsByDate[dateKey].upiPayments += t.amount;
                else if (method === 'bank-transfer') trendsByDate[dateKey].bankTransfer += t.amount;
            } else if (t.type === 'Refund') {
                trendsByDate[dateKey].totalRefunds += t.amount;
                trendsByDate[dateKey].refundsCount += 1;
                
                if (method === 'cash') trendsByDate[dateKey].cashRefunds += t.amount;
                else if (method === 'card') trendsByDate[dateKey].cardRefunds += t.amount;
                else if (method === 'upi') trendsByDate[dateKey].upiRefunds += t.amount;
                else if (method === 'bank-transfer') trendsByDate[dateKey].bankRefunds += t.amount;
            }
        });

        // Calculate net collection for each date
        const trendsArray = Object.values(trendsByDate).map(day => ({
            ...day,
            netCollection: day.totalPayments - day.totalRefunds,
            transactions: day.paymentsCount + day.refundsCount
        }));

        // Format transactions data for frontend
        const transactionsData = transactions.map(t => ({
            id: t._id,
            date: t.date,
            time: t.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            type: t.type,
            orderId: t.referenceId || (t.order ? `ORDER-${t.order._id.toString().substr(-6).toUpperCase()}` : 'N/A'),
            description: t.description || 'Food Order Payment',
            paymentMethod: t.paymentMethod,
            amount: t.amount,
            status: t.status || 'Success',
            performedBy: t.performedBy ? (t.performedBy.name || t.performedBy.username) : 'Cashier'
        }));

        // Calculate food order statistics from transactions
        const totalOrders = collections.length;
        const totalOrderAmount = totalCollections;
        const totalPaid = totalCollections;

        res.json({
            success: true,
            data: {
                summary: {
                    totalCollections,
                    totalRefunds,
                    netCollection,
                    totalPaymentsCount: collections.length,
                    totalRefundsCount: refunds.length,
                    totalTransactions: transactions.length,
                    totalOrders,
                    totalOrderAmount,
                    totalPaid
                },
                paymentsReceived,
                refundsGiven,
                trends: trendsArray,
                transactions: transactionsData
            }
        });
    } catch (error) {
        console.error('Error fetching food payment report:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching food payment report',
            error: error.message 
        });
    }
};

module.exports = {
    getCashierReport,
    addTransaction,
    getAllTransactions,
    deleteTransaction,
    initializeSampleData,
    getFoodPaymentReport
};
