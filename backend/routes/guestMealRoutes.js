const express = require('express');
const router = express.Router();
const guestMealController = require('../controllers/guestMealController');

// ============================================================================
// TABLE ROUTES
// ============================================================================

// Get all tables
router.get('/tables', guestMealController.getAllTables);

// Get table by ID
router.get('/tables/:tableId', guestMealController.getTableById);

// Get tables by status
router.get('/tables/status/:status', guestMealController.getTablesByStatus);

// Initialize tables
router.post('/tables/initialize', guestMealController.initializeTables);

// ============================================================================
// ORDER ROUTES
// ============================================================================

// Create new order
router.post('/orders/create', guestMealController.createOrder);

// Get order by ID
router.get('/orders/:orderId', guestMealController.getOrderById);

// Get order by table ID
router.get('/orders/table/:tableId', guestMealController.getOrderByTableId);

// Update order items
router.put('/orders/:orderId/items', guestMealController.updateOrderItems);

// Apply discount
router.put('/orders/:orderId/discount', guestMealController.applyDiscount);

// Bill order
router.post('/orders/:orderId/bill', guestMealController.billOrder);

// Close order
router.post('/orders/:orderId/close', guestMealController.closeOrder);

// ============================================================================
// ANALYTICS ROUTES
// ============================================================================

// Get dashboard stats
router.get('/analytics/dashboard', guestMealController.getDashboardStats);

// Get revenue report
router.get('/analytics/revenue', guestMealController.getRevenueReport);

module.exports = router;
