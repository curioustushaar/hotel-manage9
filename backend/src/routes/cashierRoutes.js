const express = require('express');
const router = express.Router();
const {
    getCashierReport,
    addTransaction,
    getAllTransactions,
    deleteTransaction,
    initializeSampleData,
    getFoodPaymentReport
} = require('../controllers/cashierController');

// Get cashier report with date filter
router.get('/report', getCashierReport);

// Get food payment report with date filter
router.get('/food-payment-report', getFoodPaymentReport);

// Get all transactions
router.get('/transactions', getAllTransactions);

// Add new transaction
router.post('/transactions', addTransaction);

// Delete transaction
router.delete('/transactions/:id', deleteTransaction);

// Initialize sample data (for testing)
router.post('/initialize-sample', initializeSampleData);

module.exports = router;
