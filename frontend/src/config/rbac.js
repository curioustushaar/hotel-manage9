// RBAC Configuration for Bireena Atithi Hotel Management System

// ==================== ROLE DEFINITIONS ====================
export const ROLES = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Admin',
    MANAGER: 'Manager',
    RECEPTIONIST: 'Receptionist',
    ACCOUNTANT: 'Accountant',
    WAITER: 'Waiter',
    STAFF: 'Staff'
};

// Role descriptions for real-world hotel scenario
export const ROLE_DESCRIPTIONS = {
    [ROLES.SUPER_ADMIN]: 'System-wide control, multi-hotel management, subscription oversight',
    [ROLES.ADMIN]: 'Hotel-level full control, staff management, all operations',
    [ROLES.MANAGER]: 'Operational management, reservations, KOT oversight, reports',
    [ROLES.RECEPTIONIST]: 'Front desk operations, check-in/out, reservations, basic billing',
    [ROLES.ACCOUNTANT]: 'Financial operations, billing, reports, payment management',
    [ROLES.WAITER]: 'Food service operations, KOT system, table management',
    [ROLES.STAFF]: 'Limited access to assigned tasks only'
};

// ==================== PERMISSION TYPES ====================
export const PERMISSIONS = {
    VIEW: 'view',
    CREATE: 'create',
    EDIT: 'edit',
    DELETE: 'delete',
    FULL: 'full'
};

// ==================== MODULE DEFINITIONS ====================
export const MODULES = {
    DASHBOARD: 'dashboard',
    ROOMS: 'rooms',
    RESERVATIONS: 'reservations',
    CASHIER_SECTION: 'cashier-section',
    GUEST_MEAL_SERVICE: 'guest-meal-service',
    FOOD_MENU: 'food-menu',
    PROPERTY_SETUP: 'property-setup',
    PROPERTY_CONFIG: 'property-configuration',
    CUSTOMERS: 'customers',
    STAFF_MANAGEMENT: 'settings',
    CASHIER_LOGS: 'cashier-report',
    PAYMENT_LOGS: 'food-payment-report',
    PROFILE: 'my-profile',
    ACTIVITY_LOGS: 'activity-logs',
    SUBSCRIPTION: 'subscription'
};

// ==================== ACCESS MATRIX ====================
// Define granular permissions for each role per module
export const ACCESS_MATRIX = {
    // DASHBOARD
    [MODULES.DASHBOARD]: {
        [ROLES.SUPER_ADMIN]: [PERMISSIONS.FULL],
        [ROLES.ADMIN]: [PERMISSIONS.FULL],
        [ROLES.MANAGER]: [PERMISSIONS.VIEW],
        [ROLES.RECEPTIONIST]: [PERMISSIONS.VIEW],
        [ROLES.ACCOUNTANT]: [PERMISSIONS.VIEW],
        [ROLES.WAITER]: [],
        [ROLES.STAFF]: [PERMISSIONS.VIEW]
    },

    // ROOMS
    [MODULES.ROOMS]: {
        [ROLES.SUPER_ADMIN]: [PERMISSIONS.FULL],
        [ROLES.ADMIN]: [PERMISSIONS.FULL],
        [ROLES.MANAGER]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT],
        [ROLES.RECEPTIONIST]: [PERMISSIONS.VIEW],
        [ROLES.ACCOUNTANT]: [],
        [ROLES.WAITER]: [],
        [ROLES.STAFF]: []
    },

    // RESERVATIONS & STAY MANAGEMENT
    [MODULES.RESERVATIONS]: {
        [ROLES.SUPER_ADMIN]: [PERMISSIONS.FULL],
        [ROLES.ADMIN]: [PERMISSIONS.FULL],
        [ROLES.MANAGER]: [PERMISSIONS.FULL],
        [ROLES.RECEPTIONIST]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT],
        [ROLES.ACCOUNTANT]: [PERMISSIONS.VIEW],
        [ROLES.WAITER]: [],
        [ROLES.STAFF]: [PERMISSIONS.VIEW]
    },

    // CASHIER SECTION
    [MODULES.CASHIER_SECTION]: {
        [ROLES.SUPER_ADMIN]: [PERMISSIONS.FULL],
        [ROLES.ADMIN]: [PERMISSIONS.FULL],
        [ROLES.MANAGER]: [PERMISSIONS.FULL],
        [ROLES.RECEPTIONIST]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE],
        [ROLES.ACCOUNTANT]: [PERMISSIONS.FULL],
        [ROLES.WAITER]: [],
        [ROLES.STAFF]: []
    },

    // GUEST MEAL SERVICE (Table View)
    [MODULES.GUEST_MEAL_SERVICE]: {
        [ROLES.SUPER_ADMIN]: [PERMISSIONS.FULL],
        [ROLES.ADMIN]: [PERMISSIONS.FULL],
        [ROLES.MANAGER]: [PERMISSIONS.FULL],
        [ROLES.RECEPTIONIST]: [PERMISSIONS.VIEW],
        [ROLES.ACCOUNTANT]: [PERMISSIONS.VIEW],
        [ROLES.WAITER]: [PERMISSIONS.FULL],
        [ROLES.STAFF]: [PERMISSIONS.VIEW]
    },

    // FOOD MENU
    [MODULES.FOOD_MENU]: {
        [ROLES.SUPER_ADMIN]: [PERMISSIONS.FULL],
        [ROLES.ADMIN]: [PERMISSIONS.FULL],
        [ROLES.MANAGER]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT],
        [ROLES.RECEPTIONIST]: [PERMISSIONS.VIEW],
        [ROLES.ACCOUNTANT]: [PERMISSIONS.VIEW],
        [ROLES.WAITER]: [PERMISSIONS.VIEW],
        [ROLES.STAFF]: []
    },

    // PROPERTY SETUP (Discount, Taxes, etc.)
    [MODULES.PROPERTY_SETUP]: {
        [ROLES.SUPER_ADMIN]: [PERMISSIONS.FULL],
        [ROLES.ADMIN]: [PERMISSIONS.FULL],
        [ROLES.MANAGER]: [PERMISSIONS.VIEW],
        [ROLES.RECEPTIONIST]: [],
        [ROLES.ACCOUNTANT]: [PERMISSIONS.VIEW],
        [ROLES.WAITER]: [],
        [ROLES.STAFF]: []
    },

    // PROPERTY CONFIGURATION (Room Setup, Floor Setup, etc.)
    [MODULES.PROPERTY_CONFIG]: {
        [ROLES.SUPER_ADMIN]: [PERMISSIONS.FULL],
        [ROLES.ADMIN]: [PERMISSIONS.FULL],
        [ROLES.MANAGER]: [PERMISSIONS.VIEW],
        [ROLES.RECEPTIONIST]: [],
        [ROLES.ACCOUNTANT]: [],
        [ROLES.WAITER]: [],
        [ROLES.STAFF]: []
    },

    // CUSTOMERS
    [MODULES.CUSTOMERS]: {
        [ROLES.SUPER_ADMIN]: [PERMISSIONS.FULL],
        [ROLES.ADMIN]: [PERMISSIONS.FULL],
        [ROLES.MANAGER]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT],
        [ROLES.RECEPTIONIST]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT],
        [ROLES.ACCOUNTANT]: [PERMISSIONS.VIEW],
        [ROLES.WAITER]: [],
        [ROLES.STAFF]: []
    },

    // STAFF MANAGEMENT
    [MODULES.STAFF_MANAGEMENT]: {
        [ROLES.SUPER_ADMIN]: [PERMISSIONS.FULL],
        [ROLES.ADMIN]: [PERMISSIONS.FULL],
        [ROLES.MANAGER]: [PERMISSIONS.VIEW],
        [ROLES.RECEPTIONIST]: [],
        [ROLES.ACCOUNTANT]: [],
        [ROLES.WAITER]: [],
        [ROLES.STAFF]: []
    },

    // CASHIER LOGS
    [MODULES.CASHIER_LOGS]: {
        [ROLES.SUPER_ADMIN]: [PERMISSIONS.FULL],
        [ROLES.ADMIN]: [PERMISSIONS.FULL],
        [ROLES.MANAGER]: [PERMISSIONS.VIEW],
        [ROLES.RECEPTIONIST]: [],
        [ROLES.ACCOUNTANT]: [PERMISSIONS.VIEW],
        [ROLES.WAITER]: [],
        [ROLES.STAFF]: []
    },

    // PAYMENT LOGS
    [MODULES.PAYMENT_LOGS]: {
        [ROLES.SUPER_ADMIN]: [PERMISSIONS.FULL],
        [ROLES.ADMIN]: [PERMISSIONS.FULL],
        [ROLES.MANAGER]: [PERMISSIONS.VIEW],
        [ROLES.RECEPTIONIST]: [],
        [ROLES.ACCOUNTANT]: [PERMISSIONS.FULL],
        [ROLES.WAITER]: [],
        [ROLES.STAFF]: []
    },

    // PROFILE
    [MODULES.PROFILE]: {
        [ROLES.SUPER_ADMIN]: [PERMISSIONS.FULL],
        [ROLES.ADMIN]: [PERMISSIONS.FULL],
        [ROLES.MANAGER]: [PERMISSIONS.FULL],
        [ROLES.RECEPTIONIST]: [PERMISSIONS.FULL],
        [ROLES.ACCOUNTANT]: [PERMISSIONS.FULL],
        [ROLES.WAITER]: [PERMISSIONS.FULL],
        [ROLES.STAFF]: [PERMISSIONS.FULL]
    },

    // ACTIVITY LOGS
    [MODULES.ACTIVITY_LOGS]: {
        [ROLES.SUPER_ADMIN]: [PERMISSIONS.FULL],
        [ROLES.ADMIN]: [PERMISSIONS.FULL],
        [ROLES.MANAGER]: [PERMISSIONS.VIEW],
        [ROLES.RECEPTIONIST]: [PERMISSIONS.VIEW], // Own logs only
        [ROLES.ACCOUNTANT]: [PERMISSIONS.VIEW], // Own logs only
        [ROLES.WAITER]: [PERMISSIONS.VIEW], // Own logs only
        [ROLES.STAFF]: [PERMISSIONS.VIEW] // Own logs only
    },

    // SUBSCRIPTION (Super Admin only)
    [MODULES.SUBSCRIPTION]: {
        [ROLES.SUPER_ADMIN]: [PERMISSIONS.FULL],
        [ROLES.ADMIN]: [],
        [ROLES.MANAGER]: [],
        [ROLES.RECEPTIONIST]: [],
        [ROLES.ACCOUNTANT]: [],
        [ROLES.WAITER]: [],
        [ROLES.STAFF]: []
    }
};

// ==================== SUBSCRIPTION TIERS ====================
export const SUBSCRIPTION_TIERS = {
    BASIC: 'Basic',
    PRO: 'Pro',
    ENTERPRISE: 'Enterprise'
};

// Subscription feature matrix
export const SUBSCRIPTION_FEATURES = {
    [SUBSCRIPTION_TIERS.BASIC]: {
        maxRooms: 20,
        maxStaff: 5,
        advancedReports: false,
        activityLogs: false,
        multiHotel: false,
        analytics: false,
        qrGeneration: true,
        kotSystem: true,
        basicReports: true
    },
    [SUBSCRIPTION_TIERS.PRO]: {
        maxRooms: 100,
        maxStaff: 20,
        advancedReports: true,
        activityLogs: true,
        multiHotel: false,
        analytics: true,
        qrGeneration: true,
        kotSystem: true,
        basicReports: true
    },
    [SUBSCRIPTION_TIERS.ENTERPRISE]: {
        maxRooms: Infinity,
        maxStaff: Infinity,
        advancedReports: true,
        activityLogs: true,
        multiHotel: true,
        analytics: true,
        qrGeneration: true,
        kotSystem: true,
        basicReports: true
    }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Check if a user has permission for a specific module and action
 */
export const hasPermission = (userRole, module, permission) => {
    if (!ACCESS_MATRIX[module]) return false;
    const modulePermissions = ACCESS_MATRIX[module][userRole] || [];

    // If user has FULL permission, they have all permissions
    if (modulePermissions.includes(PERMISSIONS.FULL)) return true;

    return modulePermissions.includes(permission);
};

/**
 * Check if a user has any access to a module
 */
export const hasModuleAccess = (userRole, module) => {
    if (!ACCESS_MATRIX[module]) return false;
    const modulePermissions = ACCESS_MATRIX[module][userRole] || [];
    return modulePermissions.length > 0;
};

/**
 * Get all permissions for a user on a specific module
 */
export const getModulePermissions = (userRole, module) => {
    if (!ACCESS_MATRIX[module]) return [];
    return ACCESS_MATRIX[module][userRole] || [];
};

/**
 * Get all modules accessible by a role
 */
export const getAccessibleModules = (userRole) => {
    return Object.keys(ACCESS_MATRIX).filter(module => {
        const permissions = ACCESS_MATRIX[module][userRole] || [];
        return permissions.length > 0;
    });
};

/**
 * Check subscription feature availability
 */
export const hasSubscriptionFeature = (subscriptionTier, feature) => {
    if (!SUBSCRIPTION_FEATURES[subscriptionTier]) return false;
    return SUBSCRIPTION_FEATURES[subscriptionTier][feature] || false;
};

/**
 * Combined permission check (Role + Subscription)
 * Access = Role Permission + Subscription Permission
 */
export const canAccess = (userRole, module, permission, subscriptionTier) => {
    // First check role-based permission
    const hasRolePermission = hasPermission(userRole, module, permission);

    if (!hasRolePermission) return false;

    // If no subscription tier provided, only check role
    if (!subscriptionTier) return true;

    // Check subscription-based restrictions
    // For Basic plan, restrict some advanced features
    if (subscriptionTier === SUBSCRIPTION_TIERS.BASIC) {
        // Restrict activity logs for Basic plan
        if (module === MODULES.ACTIVITY_LOGS) return false;

        // Restrict advanced property config for Basic plan
        if (module === MODULES.PROPERTY_CONFIG && permission !== PERMISSIONS.VIEW) {
            return false;
        }
    }

    return true;
};

/**
 * Get sidebar menu items filtered by role
 */
export const getFilteredMenuItems = (userRole) => {
    const allMenuItems = [
        { id: MODULES.DASHBOARD, label: 'Dashboard' },
        { id: MODULES.ROOMS, label: 'Rooms' },
        { id: MODULES.RESERVATIONS, label: 'Reservations' },
        { id: MODULES.CASHIER_SECTION, label: 'Cashier Section' },
        { id: MODULES.GUEST_MEAL_SERVICE, label: 'Table View' },
        { id: MODULES.FOOD_MENU, label: 'Food Menu' },
        { id: MODULES.PROPERTY_SETUP, label: 'Property Setup' },
        { id: MODULES.PROPERTY_CONFIG, label: 'Property Configuration' },
        { id: MODULES.CUSTOMERS, label: 'Customer List' },
        { id: MODULES.STAFF_MANAGEMENT, label: 'Add Staff' },
        { id: MODULES.CASHIER_LOGS, label: 'Cashier Logs' },
        { id: MODULES.PAYMENT_LOGS, label: 'Payment Logs' }
    ];

    return allMenuItems.filter(item => hasModuleAccess(userRole, item.id));
};

/**
 * Get default route for a role after login
 * Returns the first accessible page based on role permissions
 */
export const getDefaultRoute = (userRole) => {
    // Define route priority order
    const routePriority = [
        { module: MODULES.DASHBOARD, route: '/admin/dashboard' },
        { module: MODULES.GUEST_MEAL_SERVICE, route: '/admin/guest-meal-service' },
        { module: MODULES.FOOD_MENU, route: '/admin/food-menu' },
        { module: MODULES.RESERVATIONS, route: '/admin/reservations' },
        { module: MODULES.ROOMS, route: '/admin/rooms' },
        { module: MODULES.CASHIER_SECTION, route: '/admin/cashier-section' },
        { module: MODULES.CUSTOMERS, route: '/admin/customers' },
        { module: MODULES.PROFILE, route: '/admin/my-profile' }
    ];

    // Find first accessible route
    for (const { module, route } of routePriority) {
        if (hasModuleAccess(userRole, module)) {
            return route;
        }
    }

    // Fallback to profile (everyone has access)
    return '/admin/my-profile';
};

export default {
    ROLES,
    ROLE_DESCRIPTIONS,
    PERMISSIONS,
    MODULES,
    ACCESS_MATRIX,
    SUBSCRIPTION_TIERS,
    SUBSCRIPTION_FEATURES,
    hasPermission,
    hasModuleAccess,
    getModulePermissions,
    getAccessibleModules,
    hasSubscriptionFeature,
    canAccess,
    getFilteredMenuItems,
    getDefaultRoute
};
