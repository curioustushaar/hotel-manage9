const mongoose = require('mongoose');

/**
 * REASONING FOR AUDIT LOG MODEL:
 * 
 * 1. ACCOUNTABILITY: Track all super admin actions for transparency
 * 2. SECURITY: Detect unauthorized or suspicious activities
 * 3. COMPLIANCE: Meet regulatory requirements for action logging
 * 4. DEBUGGING: Help troubleshoot issues by reviewing historical actions
 * 5. ANALYTICS: Understand usage patterns and system health
 */

const auditLogSchema = new mongoose.Schema({
    // Who performed the action
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    userEmail: {
        type: String,
        required: true
    },
    userRole: {
        type: String,
        required: true
    },
    
    // What action was performed
    action: {
        type: String,
        required: true,
        enum: [
            // Hotel Management
            'hotel_created',
            'hotel_updated',
            'hotel_suspended',
            'hotel_activated',
            'hotel_deleted',
            
            // Subscription Management
            'subscription_renewed',
            'subscription_upgraded',
            'subscription_downgraded',
            'subscription_cancelled',
            
            // Admin Management
            'admin_created',
            'admin_updated',
            'admin_deleted',
            'admin_password_reset',
            
            // Bulk Operations
            'bulk_hotels_suspended',
            'bulk_subscriptions_renewed',
            'bulk_hotels_activated',
            
            // Profile & Settings
            'profile_updated',
            'password_changed',
            'settings_changed',
            
            // Login/Logout
            'superadmin_login',
            'superadmin_logout',
            
            // Other
            'data_exported',
            'report_generated'
        ]
    },
    
    // What was affected
    targetType: {
        type: String,
        enum: ['hotel', 'admin', 'subscription', 'profile', 'system', 'multiple'],
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        index: true
    },
    targetName: {
        type: String
    },
    
    // Additional context
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    
    // Request metadata
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    
    // Status
    status: {
        type: String,
        enum: ['success', 'failed', 'pending'],
        default: 'success'
    },
    errorMessage: {
        type: String
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });
auditLogSchema.index({ createdAt: -1 });

// Auto-delete logs older than 1 year (optional - for data management)
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 }); // 365 days

module.exports = mongoose.model('AuditLog', auditLogSchema);
