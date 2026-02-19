import { ROLES, SUBSCRIPTION_TIERS } from '../config/rbac';

// Mock user data for testing RBAC system
export const MOCK_USERS = [
    // SUPER ADMIN
    {
        id: 'user_1',
        email: import.meta.env.VITE_SUPER_ADMIN_EMAIL || 'superadmin@bireena.com',
        password: import.meta.env.VITE_SUPER_ADMIN_PASSWORD || 'super123',
        fullName: 'Rajesh Kumar',
        role: ROLES.SUPER_ADMIN,
        phone: '+91 98765 00001',
        hotelId: null, // Can access all hotels
        subscriptionTier: SUBSCRIPTION_TIERS.ENTERPRISE,
        active: true,
        createdAt: '2025-01-15T10:00:00Z',
        lastLogin: '2026-02-14T09:30:00Z',
        profileImage: null
    },
    {
        id: 'user_2',
        email: 'superadmin2@bireena.com',
        password: 'super123',
        fullName: 'Priya Sharma',
        role: ROLES.SUPER_ADMIN,
        phone: '+91 98765 00002',
        hotelId: null,
        subscriptionTier: SUBSCRIPTION_TIERS.ENTERPRISE,
        active: true,
        createdAt: '2025-01-20T10:00:00Z',
        lastLogin: '2026-02-13T14:20:00Z',
        profileImage: null
    },

    // ADMIN
    {
        id: 'user_3',
        email: import.meta.env.VITE_ADMIN_EMAIL || 'admin@bireena.com',
        password: import.meta.env.VITE_ADMIN_PASSWORD || 'admin123',
        fullName: 'Himanshu Yadav',
        role: ROLES.ADMIN,
        phone: '+91 98765 43210',
        hotelId: 'hotel_001',
        subscriptionTier: SUBSCRIPTION_TIERS.PRO,
        active: true,
        createdAt: '2025-02-01T10:00:00Z',
        lastLogin: '2026-02-14T10:15:00Z',
        profileImage: null
    },
    {
        id: 'user_4',
        email: 'admin2@bireena.com',
        password: 'admin123',
        fullName: 'Arjun Patel',
        role: ROLES.ADMIN,
        phone: '+91 98765 43211',
        hotelId: 'hotel_001',
        subscriptionTier: SUBSCRIPTION_TIERS.PRO,
        active: true,
        createdAt: '2025-02-05T10:00:00Z',
        lastLogin: '2026-02-13T18:45:00Z',
        profileImage: null
    },

    // MANAGER
    {
        id: 'user_5',
        email: 'manager@bireena.com',
        password: 'manager123',
        fullName: 'Sneha Desai',
        role: ROLES.MANAGER,
        phone: '+91 98765 11111',
        hotelId: 'hotel_001',
        subscriptionTier: SUBSCRIPTION_TIERS.PRO,
        active: true,
        createdAt: '2025-03-10T10:00:00Z',
        lastLogin: '2026-02-14T08:00:00Z',
        profileImage: null
    },
    {
        id: 'user_6',
        email: 'manager2@bireena.com',
        password: 'manager123',
        fullName: 'Vikram Singh',
        role: ROLES.MANAGER,
        phone: '+91 98765 11112',
        hotelId: 'hotel_001',
        subscriptionTier: SUBSCRIPTION_TIERS.PRO,
        active: true,
        createdAt: '2025-03-15T10:00:00Z',
        lastLogin: '2026-02-13T20:30:00Z',
        profileImage: null
    },

    // RECEPTIONIST
    {
        id: 'user_7',
        email: 'receptionist@bireena.com',
        password: 'reception123',
        fullName: 'Ananya Iyer',
        role: ROLES.RECEPTIONIST,
        phone: '+91 98765 22222',
        hotelId: 'hotel_001',
        subscriptionTier: SUBSCRIPTION_TIERS.PRO,
        active: true,
        createdAt: '2025-04-01T10:00:00Z',
        lastLogin: '2026-02-14T07:30:00Z',
        profileImage: null
    },
    {
        id: 'user_8',
        email: 'receptionist2@bireena.com',
        password: 'reception123',
        fullName: 'Rahul Mehta',
        role: ROLES.RECEPTIONIST,
        phone: '+91 98765 22223',
        hotelId: 'hotel_001',
        subscriptionTier: SUBSCRIPTION_TIERS.PRO,
        active: true,
        createdAt: '2025-04-05T10:00:00Z',
        lastLogin: '2026-02-13T16:00:00Z',
        profileImage: null
    },

    // ACCOUNTANT
    {
        id: 'user_9',
        email: 'accountant@bireena.com',
        password: 'account123',
        fullName: 'Deepak Gupta',
        role: ROLES.ACCOUNTANT,
        phone: '+91 98765 33333',
        hotelId: 'hotel_001',
        subscriptionTier: SUBSCRIPTION_TIERS.PRO,
        active: true,
        createdAt: '2025-05-01T10:00:00Z',
        lastLogin: '2026-02-14T09:45:00Z',
        profileImage: null
    },
    {
        id: 'user_10',
        email: 'accountant2@bireena.com',
        password: 'account123',
        fullName: 'Kavita Reddy',
        role: ROLES.ACCOUNTANT,
        phone: '+91 98765 33334',
        hotelId: 'hotel_001',
        subscriptionTier: SUBSCRIPTION_TIERS.PRO,
        active: true,
        createdAt: '2025-05-10T10:00:00Z',
        lastLogin: '2026-02-13T15:20:00Z',
        profileImage: null
    },

    // WAITER
    {
        id: 'user_11',
        email: 'waiter@bireena.com',
        password: 'waiter123',
        fullName: 'Amar Krishna',
        role: ROLES.WAITER,
        phone: '+91 98765 44444',
        hotelId: 'hotel_001',
        subscriptionTier: SUBSCRIPTION_TIERS.PRO,
        active: true,
        createdAt: '2025-06-01T10:00:00Z',
        lastLogin: '2026-02-14T11:00:00Z',
        profileImage: null
    },
    {
        id: 'user_12',
        email: 'waiter2@bireena.com',
        password: 'waiter123',
        fullName: 'Rohit Verma',
        role: ROLES.WAITER,
        phone: '+91 98765 44445',
        hotelId: 'hotel_001',
        subscriptionTier: SUBSCRIPTION_TIERS.PRO,
        active: true,
        createdAt: '2025-06-05T10:00:00Z',
        lastLogin: '2026-02-14T10:30:00Z',
        profileImage: null
    },

    // STAFF
    {
        id: 'user_13',
        email: import.meta.env.VITE_STAFF_EMAIL || 'staff@bireena.com',
        password: import.meta.env.VITE_STAFF_PASSWORD || 'staff123',
        fullName: 'Meera Nair',
        role: ROLES.STAFF,
        phone: '+91 98765 55555',
        hotelId: 'hotel_001',
        subscriptionTier: SUBSCRIPTION_TIERS.BASIC,
        active: true,
        createdAt: '2025-07-01T10:00:00Z',
        lastLogin: '2026-02-13T17:00:00Z',
        profileImage: null
    },
    {
        id: 'user_14',
        email: 'staff2@bireena.com',
        password: 'staff123',
        fullName: 'Suresh Rao',
        role: ROLES.STAFF,
        phone: '+91 98765 55556',
        hotelId: 'hotel_001',
        subscriptionTier: SUBSCRIPTION_TIERS.BASIC,
        active: false, // Inactive user for testing
        createdAt: '2025-07-10T10:00:00Z',
        lastLogin: '2026-01-20T12:00:00Z',
        profileImage: null
    }
];

// Helper function to find user by email
export const findUserByEmail = (email) => {
    return MOCK_USERS.find(user => user.email.toLowerCase() === email.toLowerCase());
};

// Helper function to authenticate user
export const authenticateUser = (email, password) => {
    const user = findUserByEmail(email);
    if (!user) return null;
    if (user.password !== password) return null;
    if (!user.active) return { error: 'Account is inactive' };

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

// Helper function to get user by ID
export const getUserById = (userId) => {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (!user) return null;
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

export default {
    MOCK_USERS,
    findUserByEmail,
    authenticateUser,
    getUserById
};
