// Mock Activity Logs for RBAC System
export const ACTION_TYPES = {
    RESERVATION_CREATED: 'Reservation Created',
    RESERVATION_UPDATED: 'Reservation Updated',
    RESERVATION_CANCELLED: 'Reservation Cancelled',
    INVOICE_GENERATED: 'Invoice Generated',
    PAYMENT_RECEIVED: 'Payment Received',
    ROOM_UPDATED: 'Room Updated',
    ROOM_STATUS_CHANGED: 'Room Status Changed',
    STAFF_ADDED: 'Staff Added',
    STAFF_UPDATED: 'Staff Updated',
    STAFF_REMOVED: 'Staff Removed',
    KOT_CREATED: 'KOT Created',
    KOT_UPDATED: 'KOT Updated',
    KOT_CLOSED: 'KOT Closed',
    PASSWORD_CHANGED: 'Password Changed',
    LOGIN: 'User Login',
    LOGOUT: 'User Logout',
    PERMISSION_UPDATED: 'Permission Updated',
    CUSTOMER_ADDED: 'Customer Added',
    CUSTOMER_UPDATED: 'Customer Updated',
    MENU_ITEM_ADDED: 'Menu Item Added',
    MENU_ITEM_UPDATED: 'Menu Item Updated',
    DISCOUNT_APPLIED: 'Discount Applied',
    TABLE_ASSIGNED: 'Table Assigned'
};

export const MOCK_ACTIVITY_LOGS = [
    {
        id: 'log_001',
        userId: 'user_3',
        userName: 'Himanshu Yadav',
        userRole: 'Admin',
        action: ACTION_TYPES.LOGIN,
        description: 'Admin logged into the system',
        timestamp: '2026-02-14T10:15:00Z',
        ipAddress: '192.168.1.100',
        module: 'Authentication',
        details: null
    },
    {
        id: 'log_002',
        userId: 'user_7',
        userName: 'Ananya Iyer',
        userRole: 'Receptionist',
        action: ACTION_TYPES.RESERVATION_CREATED,
        description: 'Created reservation for Room 101',
        timestamp: '2026-02-14T10:30:00Z',
        ipAddress: '192.168.1.105',
        module: 'Reservations',
        details: {
            roomNumber: '101',
            guestName: 'Mr. Sharma',
            checkIn: '2026-02-15',
            checkOut: '2026-02-17'
        }
    },
    {
        id: 'log_003',
        userId: 'user_9',
        userName: 'Deepak Gupta',
        userRole: 'Accountant',
        action: ACTION_TYPES.INVOICE_GENERATED,
        description: 'Generated invoice #INV-2026-001',
        timestamp: '2026-02-14T11:00:00Z',
        ipAddress: '192.168.1.110',
        module: 'Billing',
        details: {
            invoiceNumber: 'INV-2026-001',
            amount: 15000,
            customer: 'Mr. Sharma'
        }
    },
    {
        id: 'log_004',
        userId: 'user_11',
        userName: 'Amar Krishna',
        userRole: 'Waiter',
        action: ACTION_TYPES.KOT_CREATED,
        description: 'Created KOT for Table 5',
        timestamp: '2026-02-14T11:15:00Z',
        ipAddress: '192.168.1.115',
        module: 'KOT System',
        details: {
            tableNumber: '5',
            items: ['Butter Chicken', 'Naan', 'Dal Makhani'],
            totalAmount: 850
        }
    },
    {
        id: 'log_005',
        userId: 'user_5',
        userName: 'Sneha Desai',
        userRole: 'Manager',
        action: ACTION_TYPES.ROOM_STATUS_CHANGED,
        description: 'Changed Room 205 status from Available to Under Maintenance',
        timestamp: '2026-02-14T09:45:00Z',
        ipAddress: '192.168.1.108',
        module: 'Rooms',
        details: {
            roomNumber: '205',
            oldStatus: 'Available',
            newStatus: 'Under Maintenance'
        }
    },
    {
        id: 'log_006',
        userId: 'user_3',
        userName: 'Himanshu Yadav',
        userRole: 'Admin',
        action: ACTION_TYPES.STAFF_ADDED,
        description: 'Added new staff member: John Doe',
        timestamp: '2026-02-13T14:20:00Z',
        ipAddress: '192.168.1.100',
        module: 'Staff Management',
        details: {
            staffName: 'John Doe',
            role: 'Receptionist',
            email: 'john@bireena.com'
        }
    },
    {
        id: 'log_007',
        userId: 'user_11',
        userName: 'Amar Krishna',
        userRole: 'Waiter',
        action: ACTION_TYPES.KOT_CLOSED,
        description: 'Closed KOT for Table 3 - Payment completed',
        timestamp: '2026-02-14T12:30:00Z',
        ipAddress: '192.168.1.115',
        module: 'KOT System',
        details: {
            tableNumber: '3',
            totalAmount: 1250,
            paymentMethod: 'Cash'
        }
    },
    {
        id: 'log_008',
        userId: 'user_7',
        userName: 'Ananya Iyer',
        userRole: 'Receptionist',
        action: ACTION_TYPES.PASSWORD_CHANGED,
        description: 'Password changed successfully',
        timestamp: '2026-02-14T08:00:00Z',
        ipAddress: '192.168.1.105',
        module: 'Security',
        details: null
    },
    {
        id: 'log_009',
        userId: 'user_9',
        userName: 'Deepak Gupta',
        userRole: 'Accountant',
        action: ACTION_TYPES.PAYMENT_RECEIVED,
        description: 'Payment received for Invoice #INV-2026-001',
        timestamp: '2026-02-14T13:00:00Z',
        ipAddress: '192.168.1.110',
        module: 'Payments',
        details: {
            invoiceNumber: 'INV-2026-001',
            amount: 15000,
            paymentMethod: 'UPI',
            transactionId: 'TXN20260214001'
        }
    },
    {
        id: 'log_010',
        userId: 'user_5',
        userName: 'Sneha Desai',
        userRole: 'Manager',
        action: ACTION_TYPES.DISCOUNT_APPLIED,
        description: 'Applied 15% discount on Room 305',
        timestamp: '2026-02-13T16:45:00Z',
        ipAddress: '192.168.1.108',
        module: 'Reservations',
        details: {
            roomNumber: '305',
            discountPercentage: 15,
            originalPrice: 5000,
            discountedPrice: 4250
        }
    },
    {
        id: 'log_011',
        userId: 'user_1',
        userName: 'Rajesh Kumar',
        userRole: 'Super Admin',
        action: ACTION_TYPES.PERMISSION_UPDATED,
        description: 'Updated permissions for Manager role',
        timestamp: '2026-02-13T10:00:00Z',
        ipAddress: '192.168.1.50',
        module: 'Permissions',
        details: {
            role: 'Manager',
            changesApplied: 'Added Food Menu edit permission'
        }
    },
    {
        id: 'log_012',
        userId: 'user_7',
        userName: 'Ananya Iyer',
        userRole: 'Receptionist',
        action: ACTION_TYPES.CUSTOMER_ADDED,
        description: 'Added new customer: Mrs. Patel',
        timestamp: '2026-02-14T09:00:00Z',
        ipAddress: '192.168.1.105',
        module: 'Customers',
        details: {
            customerName: 'Mrs. Patel',
            phone: '+91 98765 99999',
            email: 'patel@example.com'
        }
    },
    {
        id: 'log_013',
        userId: 'user_12',
        userName: 'Rohit Verma',
        userRole: 'Waiter',
        action: ACTION_TYPES.TABLE_ASSIGNED,
        description: 'Assigned Table 8 to customer',
        timestamp: '2026-02-14T11:45:00Z',
        ipAddress: '192.168.1.116',
        module: 'Table Management',
        details: {
            tableNumber: '8',
            guestCount: 4,
            assignedBy: 'Rohit Verma'
        }
    },
    {
        id: 'log_014',
        userId: 'user_3',
        userName: 'Himanshu Yadav',
        userRole: 'Admin',
        action: ACTION_TYPES.MENU_ITEM_ADDED,
        description: 'Added new menu item: Paneer Tikka',
        timestamp: '2026-02-13T15:30:00Z',
        ipAddress: '192.168.1.100',
        module: 'Food Menu',
        details: {
            itemName: 'Paneer Tikka',
            category: 'Starters',
            price: 280
        }
    },
    {
        id: 'log_015',
        userId: 'user_11',
        userName: 'Amar Krishna',
        userRole: 'Waiter',
        action: ACTION_TYPES.LOGIN,
        description: 'Waiter logged into the system',
        timestamp: '2026-02-14T11:00:00Z',
        ipAddress: '192.168.1.115',
        module: 'Authentication',
        details: null
    }
];

// Helper function to get logs for a specific user
export const getLogsByUserId = (userId) => {
    return MOCK_ACTIVITY_LOGS.filter(log => log.userId === userId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

// Helper function to get logs by role (Admin/Super Admin see all)
export const getLogsByRole = (userRole, userId) => {
    // Super Admin and Admin can see all logs
    if (userRole === 'Super Admin' || userRole === 'Admin') {
        return MOCK_ACTIVITY_LOGS.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // Other roles see only their own logs
    return getLogsByUserId(userId);
};

// Helper function to filter logs by action type
export const getLogsByAction = (actionType) => {
    return MOCK_ACTIVITY_LOGS.filter(log => log.action === actionType)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

// Helper function to get recent logs (last N)
export const getRecentLogs = (count = 10) => {
    return [...MOCK_ACTIVITY_LOGS]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, count);
};

export default {
    ACTION_TYPES,
    MOCK_ACTIVITY_LOGS,
    getLogsByUserId,
    getLogsByRole,
    getLogsByAction,
    getRecentLogs
};
