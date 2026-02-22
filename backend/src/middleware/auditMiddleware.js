const AuditLog = require('../models/AuditLog');

/**
 * REASONING FOR AUDIT MIDDLEWARE:
 * 
 * 1. AUTOMATIC LOGGING: Capture actions without manual logging in each controller
 * 2. CONSISTENT FORMAT: Ensure all logs have the same structure
 * 3. MINIMAL OVERHEAD: Non-blocking async logging doesn't slow down responses
 * 4. COMPREHENSIVE DATA: Captures user, action, target, IP, and user agent
 */

/**
 * Create an audit log entry
 * @param {Object} logData - The audit log data
 */
const createAuditLog = async (logData) => {
    try {
        await AuditLog.create(logData);
    } catch (error) {
        console.error('Error creating audit log:', error);
        // Don't throw error - logging failures shouldn't break the app
    }
};

/**
 * Middleware to log super admin actions
 * Usage: router.post('/create-hotel', auditLog('hotel_created', 'hotel'), createHotel);
 */
const auditLog = (action, targetType) => {
    return async (req, res, next) => {
        // Store original res.json to intercept response
        const originalJson = res.json.bind(res);
        
        res.json = function(data) {
            // Determine if request was successful
            const status = res.statusCode >= 200 && res.statusCode < 300 ? 'success' : 'failed';
            
            // Create audit log entry (non-blocking)
            createAuditLog({
                userId: req.user?._id,
                userEmail: req.user?.username || req.user?.email,
                userRole: req.user?.role,
                action,
                targetType,
                targetId: data?.hotel?._id || data?.hotel?.id || data?.admin?._id || req.params?.id || null,
                targetName: data?.hotel?.name || data?.admin?.name || null,
                details: {
                    method: req.method,
                    path: req.originalUrl,
                    body: sanitizeBody(req.body),
                    responseData: sanitizeResponse(data)
                },
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('user-agent'),
                status,
                errorMessage: status === 'failed' ? data?.message : null
            });
            
            return originalJson(data);
        };
        
        next();
    };
};

/**
 * Manually log an audit entry (for use in controllers)
 */
const logAction = async (req, action, targetType, targetId, targetName, details = {}) => {
    await createAuditLog({
        userId: req.user?._id,
        userEmail: req.user?.username || req.user?.email,
        userRole: req.user?.role,
        action,
        targetType,
        targetId,
        targetName,
        details,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'success'
    });
};

/**
 * Sanitize request body to remove sensitive data
 */
const sanitizeBody = (body) => {
    if (!body) return {};
    
    const sanitized = { ...body };
    
    // Remove sensitive fields
    delete sanitized.password;
    delete sanitized.adminPassword;
    delete sanitized.currentPassword;
    delete sanitized.newPassword;
    
    return sanitized;
};

/**
 * Sanitize response data
 */
const sanitizeResponse = (data) => {
    if (!data) return {};
    
    const sanitized = { ...data };
    
    // Remove sensitive or large fields
    delete sanitized.password;
    
    return {
        id: sanitized.id || sanitized._id,
        message: sanitized.message,
        success: true
    };
};

module.exports = {
    auditLog,
    logAction,
    createAuditLog
};
