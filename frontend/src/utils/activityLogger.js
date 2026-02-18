// Activity Logger Utility
// Helper functions to log and retrieve user activities

const STORAGE_KEY = 'activityLogs';
const MAX_LOGS = 500; // Keep last 500 logs

/**
 * Log an activity action
 */
export const logActivity = (action, description, module, details = null) => {
    // Get current user from localStorage
    const authUser = localStorage.getItem('authUser');
    if (!authUser) return;

    const user = JSON.parse(authUser);

    const log = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        userName: user.fullName,
        userRole: user.role,
        action,
        description,
        timestamp: new Date().toISOString(),
        ipAddress: '192.168.1.100', // Mock IP for demo
        module,
        details
    };

    // Get existing logs
    const existingLogs = getStoredLogs();

    // Add new log at the beginning
    const updatedLogs = [log, ...existingLogs];

    // Keep only last MAX_LOGS entries
    const trimmedLogs = updatedLogs.slice(0, MAX_LOGS);

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedLogs));

    return log;
};

/**
 * Get all stored logs from localStorage
 */
const getStoredLogs = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    try {
        return JSON.parse(stored);
    } catch (error) {
        console.error('Failed to parse activity logs:', error);
        return [];
    }
};

/**
 * Initialize logs with mock data if empty
 */
export const initializeLogsIfEmpty = () => {
    const existingLogs = getStoredLogs();
    if (existingLogs.length === 0) {
        // Import mock logs
        const { MOCK_ACTIVITY_LOGS } = require('../data/mockActivityLogs');
        localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_ACTIVITY_LOGS));
    }
};

/**
 * Get logs filtered by user ID
 */
export const getLogsByUserId = (userId) => {
    const logs = getStoredLogs();
    return logs.filter(log => log.userId === userId);
};

/**
 * Get logs filtered by role
 * Admin and Super Admin see all logs, others see only their own
 */
export const getLogsByRole = (userRole, userId) => {
    const logs = getStoredLogs();

    if (userRole === 'Super Admin' || userRole === 'Admin') {
        return logs;
    }

    return logs.filter(log => log.userId === userId);
};

/**
 * Get logs filtered by action type
 */
export const getLogsByAction = (actionType) => {
    const logs = getStoredLogs();
    return logs.filter(log => log.action === actionType);
};

/**
 * Get recent logs (last N)
 */
export const getRecentLogs = (count = 10) => {
    const logs = getStoredLogs();
    return logs.slice(0, count);
};

/**
 * Get logs filtered by date range
 */
export const getLogsByDateRange = (startDate, endDate) => {
    const logs = getStoredLogs();
    const start = new Date(startDate);
    const end = new Date(endDate);

    return logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= start && logDate <= end;
    });
};

/**
 * Get logs filtered by module
 */
export const getLogsByModule = (module) => {
    const logs = getStoredLogs();
    return logs.filter(log => log.module === module);
};

/**
 * Clear all logs (Admin only)
 */
export const clearAllLogs = () => {
    localStorage.removeItem(STORAGE_KEY);
};

/**
 * Export logs as JSON
 */
export const exportLogs = () => {
    const logs = getStoredLogs();
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `activity-logs-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
};

export default {
    logActivity,
    initializeLogsIfEmpty,
    getLogsByUserId,
    getLogsByRole,
    getLogsByAction,
    getRecentLogs,
    getLogsByDateRange,
    getLogsByModule,
    clearAllLogs,
    exportLogs
};
