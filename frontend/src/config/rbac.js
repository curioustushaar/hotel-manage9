// RBAC Configuration for Bireena Atithi Hotel Management System

// ==================== ROLE DEFINITIONS ====================
export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    SUPERADMIN: 'superadmin',
    ADMIN: 'admin',
    MANAGER: 'manager',
    RECEPTIONIST: 'receptionist',
    ACCOUNTANT: 'accountant',
    WAITER: 'waiter',
    STAFF: 'staff'
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
    SUPER_ADMIN_DASHBOARD: 'super-admin-dashboard',
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
    SUBSCRIPTION: 'subscription',
    VIEW_ORDER: 'view-order',
    RESERVATION_CARD: 'reservation-card',
    FOOD_ORDER: 'food-order',
    REPORTS: 'reports',
    REPORTS_SALES: 'reports-sales',
    REPORTS_PAYMENTS: 'reports-payments',
    REPORTS_ROOMS: 'reports-rooms',
    REPORTS_KITCHEN: 'reports-kitchen',
    REPORTS_INVENTORY: 'reports-inventory',
    REPORTS_GST: 'reports-gst',
    REPORTS_STAFF: 'reports-staff',
    REPORTS_BILLING: 'reports-billing',
    REPORTS_RESERVATIONS: 'reports-reservations',
    REPORTS_ANALYTICS: 'reports-analytics'
};

// ==================== ACCESS MATRIX ====================
// Define granular permissions for each role per module
export const ACCESS_MATRIX = {
    // DASHBOARD
    [MODULES.DASHBOARD]: {
        [ROLES.SUPER_ADMIN]: [],
        [ROLES.ADMIN]: [PERMISSIONS.FULL],
        [ROLES.MANAGER]: [PERMISSIONS.VIEW],
        [ROLES.RECEPTIONIST]: [PERMISSIONS.VIEW],
        [ROLES.ACCOUNTANT]: [PERMISSIONS.VIEW],
        [ROLES.WAITER]: [],
        [ROLES.STAFF]: [PERMISSIONS.VIEW]
    },

    // SUPER ADMIN DASHBOARD
    [MODULES.SUPER_ADMIN_DASHBOARD]: {
        [ROLES.SUPER_ADMIN]: [PERMISSIONS.FULL],
        [ROLES.ADMIN]: [],
        [ROLES.MANAGER]: [],
        [ROLES.RECEPTIONIST]: [],
        [ROLES.ACCOUNTANT]: [],
        [ROLES.WAITER]: [],
        [ROLES.STAFF]: []
    },

    // ROOMS
    [MODULES.ROOMS]: {
        [ROLES.SUPER_ADMIN]: [PERMISSIONS.FULL],
        [ROLES.ADMIN]: [PERMISSIONS.FULL],
        [ROLES.MANAGER]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT],
        [ROLES.RECEPTIONIST]: [PERMISSIONS.VIEW],
        [ROLES.ACCOUNTANT]: [],
        [ROLES.WAITER]: [],
        [ROLES.STAFF]: [PERMISSIONS.VIEW]
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
        [ROLES.STAFF]: [PERMISSIONS.VIEW]
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
        [ROLES.STAFF]: [PERMISSIONS.VIEW]
    },

    // PROPERTY SETUP (Discount, Taxes, etc.)
    [MODULES.PROPERTY_SETUP]: {
        [ROLES.SUPER_ADMIN]: [PERMISSIONS.FULL],
        [ROLES.ADMIN]: [PERMISSIONS.FULL],
        [ROLES.MANAGER]: [PERMISSIONS.VIEW],
        [ROLES.RECEPTIONIST]: [],
        [ROLES.ACCOUNTANT]: [PERMISSIONS.VIEW],
        [ROLES.WAITER]: [],
        [ROLES.STAFF]: [PERMISSIONS.VIEW]
    },

    // PROPERTY CONFIGURATION (Room Setup, Floor Setup, etc.)
    [MODULES.PROPERTY_CONFIG]: {
        [ROLES.SUPER_ADMIN]: [PERMISSIONS.FULL],
        [ROLES.ADMIN]: [PERMISSIONS.FULL],
        [ROLES.MANAGER]: [PERMISSIONS.VIEW],
        [ROLES.RECEPTIONIST]: [],
        [ROLES.ACCOUNTANT]: [],
        [ROLES.WAITER]: [],
        [ROLES.STAFF]: [PERMISSIONS.VIEW]
    },

    // CUSTOMERS
    [MODULES.CUSTOMERS]: {
        [ROLES.SUPER_ADMIN]: [PERMISSIONS.FULL],
        [ROLES.ADMIN]: [PERMISSIONS.FULL],
        [ROLES.MANAGER]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT],
        [ROLES.RECEPTIONIST]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE, PERMISSIONS.EDIT],
        [ROLES.ACCOUNTANT]: [PERMISSIONS.VIEW],
        [ROLES.WAITER]: [],
        [ROLES.STAFF]: [PERMISSIONS.VIEW]
    },

    // STAFF MANAGEMENT
    [MODULES.STAFF_MANAGEMENT]: {
        [ROLES.SUPER_ADMIN]: [PERMISSIONS.FULL],
        [ROLES.ADMIN]: [PERMISSIONS.FULL],
        [ROLES.MANAGER]: [PERMISSIONS.VIEW],
        [ROLES.RECEPTIONIST]: [],
        [ROLES.ACCOUNTANT]: [],
        [ROLES.WAITER]: [],
        [ROLES.STAFF]: [PERMISSIONS.VIEW]
    },

    // CASHIER LOGS
    [MODULES.CASHIER_LOGS]: {
        [ROLES.SUPER_ADMIN]: [PERMISSIONS.FULL],
        [ROLES.ADMIN]: [PERMISSIONS.FULL],
        [ROLES.MANAGER]: [PERMISSIONS.VIEW],
        [ROLES.RECEPTIONIST]: [],
        [ROLES.ACCOUNTANT]: [PERMISSIONS.VIEW],
        [ROLES.WAITER]: [],
        [ROLES.STAFF]: [PERMISSIONS.VIEW]
    },

    // PAYMENT LOGS
    [MODULES.PAYMENT_LOGS]: {
        [ROLES.SUPER_ADMIN]: [PERMISSIONS.FULL],
        [ROLES.ADMIN]: [PERMISSIONS.FULL],
        [ROLES.MANAGER]: [PERMISSIONS.VIEW],
        [ROLES.RECEPTIONIST]: [],
        [ROLES.ACCOUNTANT]: [PERMISSIONS.FULL],
        [ROLES.WAITER]: [],
        [ROLES.STAFF]: [PERMISSIONS.VIEW]
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
    },

    // VIEW ORDER
    [MODULES.VIEW_ORDER]: {
        [ROLES.SUPER_ADMIN]: [PERMISSIONS.FULL],
        [ROLES.ADMIN]: [PERMISSIONS.FULL],
        [ROLES.MANAGER]: [PERMISSIONS.FULL],
        [ROLES.RECEPTIONIST]: [PERMISSIONS.VIEW],
        [ROLES.ACCOUNTANT]: [PERMISSIONS.VIEW],
        [ROLES.WAITER]: [PERMISSIONS.VIEW],
        [ROLES.STAFF]: [PERMISSIONS.VIEW]
    },

    // RESERVATION CARD
    [MODULES.RESERVATION_CARD]: {
        [ROLES.SUPER_ADMIN]: [PERMISSIONS.FULL],
        [ROLES.ADMIN]: [PERMISSIONS.FULL],
        [ROLES.MANAGER]: [PERMISSIONS.FULL],
        [ROLES.RECEPTIONIST]: [PERMISSIONS.VIEW, PERMISSIONS.EDIT],
        [ROLES.ACCOUNTANT]: [],
        [ROLES.WAITER]: [],
        [ROLES.STAFF]: [PERMISSIONS.VIEW]
    },

    // FOOD ORDER (POS)
    [MODULES.FOOD_ORDER]: {
        [ROLES.SUPER_ADMIN]: [PERMISSIONS.FULL],
        [ROLES.ADMIN]: [PERMISSIONS.FULL],
        [ROLES.MANAGER]: [PERMISSIONS.FULL],
        [ROLES.RECEPTIONIST]: [PERMISSIONS.VIEW, PERMISSIONS.CREATE],
        [ROLES.ACCOUNTANT]: [PERMISSIONS.VIEW],
        [ROLES.WAITER]: [PERMISSIONS.FULL],
        [ROLES.STAFF]: [PERMISSIONS.VIEW]
    },

    // REPORTS (Parent)
    [MODULES.REPORTS]: {
        'super_admin': [PERMISSIONS.FULL],
        'superadmin': [PERMISSIONS.FULL],
        [ROLES.ADMIN]: [PERMISSIONS.FULL],
        [ROLES.MANAGER]: [PERMISSIONS.VIEW],
        [ROLES.ACCOUNTANT]: [PERMISSIONS.VIEW],
        [ROLES.RECEPTIONIST]: [PERMISSIONS.VIEW],
        [ROLES.STAFF]: [PERMISSIONS.VIEW]
    },
    // INDIVIDUAL REPORTS
    [MODULES.REPORTS_SALES]: { 'super_admin': [PERMISSIONS.FULL], 'superadmin': [PERMISSIONS.FULL], [ROLES.ADMIN]: [PERMISSIONS.FULL], [ROLES.MANAGER]: [PERMISSIONS.VIEW], [ROLES.ACCOUNTANT]: [PERMISSIONS.VIEW] },
    [MODULES.REPORTS_PAYMENTS]: { 'super_admin': [PERMISSIONS.FULL], 'superadmin': [PERMISSIONS.FULL], [ROLES.ADMIN]: [PERMISSIONS.FULL], [ROLES.MANAGER]: [PERMISSIONS.VIEW], [ROLES.ACCOUNTANT]: [PERMISSIONS.VIEW] },
    [MODULES.REPORTS_ROOMS]: { 'super_admin': [PERMISSIONS.FULL], 'superadmin': [PERMISSIONS.FULL], [ROLES.ADMIN]: [PERMISSIONS.FULL], [ROLES.MANAGER]: [PERMISSIONS.VIEW], [ROLES.RECEPTIONIST]: [PERMISSIONS.VIEW] },
    [MODULES.REPORTS_KITCHEN]: { 'super_admin': [PERMISSIONS.FULL], 'superadmin': [PERMISSIONS.FULL], [ROLES.ADMIN]: [PERMISSIONS.FULL], [ROLES.MANAGER]: [PERMISSIONS.VIEW] },
    [MODULES.REPORTS_INVENTORY]: { 'super_admin': [PERMISSIONS.FULL], 'superadmin': [PERMISSIONS.FULL], [ROLES.ADMIN]: [PERMISSIONS.FULL], [ROLES.MANAGER]: [PERMISSIONS.VIEW] },
    [MODULES.REPORTS_GST]: { 'super_admin': [PERMISSIONS.FULL], 'superadmin': [PERMISSIONS.FULL], [ROLES.ADMIN]: [PERMISSIONS.FULL], [ROLES.ACCOUNTANT]: [PERMISSIONS.FULL] },
    [MODULES.REPORTS_STAFF]: { 'super_admin': [PERMISSIONS.FULL], 'superadmin': [PERMISSIONS.FULL], [ROLES.ADMIN]: [PERMISSIONS.FULL], [ROLES.MANAGER]: [PERMISSIONS.VIEW] },
    [MODULES.REPORTS_BILLING]: { 'super_admin': [PERMISSIONS.FULL], 'superadmin': [PERMISSIONS.FULL], [ROLES.ADMIN]: [PERMISSIONS.FULL], [ROLES.MANAGER]: [PERMISSIONS.VIEW], [ROLES.ACCOUNTANT]: [PERMISSIONS.VIEW] },
    [MODULES.REPORTS_RESERVATIONS]: { 'super_admin': [PERMISSIONS.FULL], 'superadmin': [PERMISSIONS.FULL], [ROLES.ADMIN]: [PERMISSIONS.FULL], [ROLES.MANAGER]: [PERMISSIONS.VIEW], [ROLES.RECEPTIONIST]: [PERMISSIONS.VIEW] },
    [MODULES.REPORTS_ANALYTICS]: { 'super_admin': [PERMISSIONS.FULL], 'superadmin': [PERMISSIONS.FULL], [ROLES.ADMIN]: [PERMISSIONS.FULL], [ROLES.MANAGER]: [PERMISSIONS.VIEW] }
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
        basicReports: true,
        advancedReports: true,
        analytics: true
    }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Check if a user has permission for a specific module and action
 */
export const hasPermission = (user, module, permission) => {
    if (!user) return false;
    const userRole = user.role;

    // If user is Staff, check their specific permissions array first for module access
    if (userRole === ROLES.STAFF) {
        const userPermissions = user.permissions || [];
        const moduleLabelMap = {
            [MODULES.DASHBOARD]: 'Dashboard',
            [MODULES.ROOMS]: 'Rooms (Dashboard)',
            [MODULES.RESERVATIONS]: 'Rooms (New Reservation)',
            [MODULES.CASHIER_SECTION]: ['Cashier Section (Table)', 'Cashier Section (Room Service)', 'Cashier Section (Take Away)'],
            [MODULES.GUEST_MEAL_SERVICE]: 'Table View',
            [MODULES.FOOD_MENU]: 'Food Order',
            [MODULES.CUSTOMERS]: 'Customer List',
            [MODULES.CASHIER_LOGS]: 'Cashier Logs',
            [MODULES.PAYMENT_LOGS]: 'Payment Logs',
            'housekeeping': 'Rooms (Housekeeping)',
            'room-service': 'Rooms (Room Service)',
            'view-order': 'View Order',
            [MODULES.RESERVATION_CARD]: 'Reservation Card',
            [MODULES.FOOD_ORDER]: 'Food Order',
            [MODULES.PROPERTY_SETUP]: 'Property Setup',
            [MODULES.PROPERTY_CONFIG]: 'Property Configuration',
            [MODULES.REPORTS]: 'Reports'
        };

        const permissionLabel = moduleLabelMap[module];
        if (permissionLabel) {
            if (Array.isArray(permissionLabel)) {
                return permissionLabel.some(label => userPermissions.includes(label));
            }
            return userPermissions.includes(permissionLabel);
        }

        // Everyone has permission for their own profile
        if (module === MODULES.PROFILE) return true;

        // If it's a staff member and the module is not explicitly granted, deny access
        return false;
    }

    if (!ACCESS_MATRIX[module]) return false;
    const modulePermissions = ACCESS_MATRIX[module][userRole] || [];

    // If user has FULL permission, they have all permissions
    if (modulePermissions.includes(PERMISSIONS.FULL)) return true;

    return modulePermissions.includes(permission);
};

/**
 * Check if a user has any access to a module
 */
export const hasModuleAccess = (user, module) => {
    if (!user) return false;
    const userRole = user.role;

    // Special handling for Staff role based on their custom permissions
    if (userRole === ROLES.STAFF) {
        const userPermissions = user.permissions || [];
        const moduleLabelMap = {
            [MODULES.DASHBOARD]: 'Dashboard',
            [MODULES.ROOMS]: 'Rooms (Dashboard)',
            [MODULES.RESERVATIONS]: 'Rooms (New Reservation)',
            [MODULES.CASHIER_SECTION]: ['Cashier Section (Table)', 'Cashier Section (Room Service)', 'Cashier Section (Take Away)'],
            [MODULES.GUEST_MEAL_SERVICE]: 'Table View',
            [MODULES.FOOD_MENU]: 'Food Order',
            [MODULES.CUSTOMERS]: 'Customer List',
            [MODULES.CASHIER_LOGS]: 'Cashier Logs',
            [MODULES.PAYMENT_LOGS]: 'Payment Logs',
            [MODULES.PROPERTY_SETUP]: 'Property Setup',
            [MODULES.PROPERTY_CONFIG]: 'Property Configuration',
            [MODULES.REPORTS]: 'Reports'
        };

        const staffPermissionLabel = moduleLabelMap[module];
        if (staffPermissionLabel) {
            if (Array.isArray(staffPermissionLabel)) {
                return staffPermissionLabel.some(label => userPermissions.includes(label));
            }
            return userPermissions.includes(staffPermissionLabel);
        }

        // Check for specific sub-modules that might be checked individually
        const subModuleMap = {
            'housekeeping': 'Rooms (Housekeeping)',
            'room-service': 'Rooms (Room Service)',
            'view-order': 'View Order',
            [MODULES.RESERVATION_CARD]: 'Reservation Card',
            [MODULES.FOOD_ORDER]: 'Food Order'
        };

        const subPermissionLabel = subModuleMap[module];
        if (subPermissionLabel) {
            return userPermissions.includes(subPermissionLabel);
        }

        // Everyone can access their own profile
        if (module === MODULES.PROFILE) return true;

        // If it's a staff member and the module is not explicitly granted, deny access
        return false;
    }

    if (!ACCESS_MATRIX[module]) return false;
    const modulePermissions = ACCESS_MATRIX[module][userRole] || [];
    return modulePermissions.length > 0;
};

/**
 * Get all permissions for a user on a specific module
 */
export const getModulePermissions = (user, module) => {
    if (!user || user.role === ROLES.STAFF) {
        // Staff permissions are binary (module access or not)
        return hasModuleAccess(user, module) ? [PERMISSIONS.VIEW] : [];
    }
    const userRole = user.role;
    if (!ACCESS_MATRIX[module]) return [];
    return ACCESS_MATRIX[module][userRole] || [];
};

/**
 * Get all modules accessible by a user
 */
export const getAccessibleModules = (user) => {
    if (!user) return [];
    return Object.keys(ACCESS_MATRIX).filter(module => {
        return hasModuleAccess(user, module);
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
 * Combined permission check (User + Subscription)
 * Access = User Permission + Subscription Permission
 */
export const canAccess = (user, module, permission, subscriptionTier) => {
    // First check role/user-based permission
    const hasRolePermission = hasPermission(user, module, permission);

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
 * Get sidebar menu items filtered by user
 */
export const getFilteredMenuItems = (user) => {
    if (!user) return [];
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

    return allMenuItems.filter(item => hasModuleAccess(user, item.id));
};

/**
 * Get default route for a user after login
 * Returns the first accessible page based on user permissions
 */
export const getDefaultRoute = (user) => {
    if (!user) return '/login';

    // Determine prefix based on role
    const prefix = user.role === ROLES.STAFF ? '/staff' : '/admin';

    // Define route priority order (generic paths)
    const routePriority = [
        { module: MODULES.SUPER_ADMIN_DASHBOARD, route: '/super-admin/dashboard', absolute: true },
        { module: MODULES.DASHBOARD, route: '/dashboard' },
        { module: MODULES.GUEST_MEAL_SERVICE, route: '/guest-meal-service' },
        { module: MODULES.FOOD_MENU, route: '/food-menu' },
        { module: MODULES.RESERVATIONS, route: '/reservations' },
        { module: MODULES.ROOMS, route: '/rooms' },
        { module: MODULES.CASHIER_SECTION, route: '/cashier-section' },
        { module: MODULES.CUSTOMERS, route: '/customers' },
        { module: MODULES.STAFF_MANAGEMENT, route: '/settings' },
        { module: MODULES.CASHIER_LOGS, route: '/cashier-report' },
        { module: MODULES.PAYMENT_LOGS, route: '/food-payment-report' },
        { module: MODULES.PROPERTY_SETUP, route: '/discount' },
        { module: MODULES.PROPERTY_CONFIG, route: '/room-setup' },
        { module: MODULES.PROFILE, route: '/my-profile' }
    ];

    // Find first accessible route
    for (const { module, route, absolute } of routePriority) {
        if (hasModuleAccess(user, module)) {
            return absolute ? route : `${prefix}${route}`;
        }
    }

    // Fallback to profile
    return `${prefix}/my-profile`;
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
