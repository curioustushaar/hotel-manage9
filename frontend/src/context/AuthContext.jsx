import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
// import { MOCK_USERS } from '../data/mockUsers'; // Removed for security
import { ROLES } from '../config/rbac';

import API_URL from '../config/api';

const AuthContext = createContext(null);

// Configure axios default base URL if not already set
if (API_URL) {
    axios.defaults.baseURL = API_URL;
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('authUser');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (error) {
                console.error('Failed to parse saved user:', error);
                localStorage.removeItem('authUser');
            }
        }
        setLoading(false);
    }, []);

    // Login function
    const login = async (email, password) => {
        try {
            const response = await axios.post('/api/auth/login', { username: email, password });

            if (response.data) {
                const userWithToken = response.data;

                // Ensure lastLogin is updated
                const userWithUpdatedLogin = {
                    ...userWithToken,
                    lastLogin: new Date().toISOString()
                };

                setUser(userWithUpdatedLogin);
                localStorage.setItem('authUser', JSON.stringify(userWithUpdatedLogin));

                return { success: true, user: userWithUpdatedLogin };
            }
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Invalid email or password'
            };
        }
    };

    // Logout function
    const logout = () => {
        setUser(null);
        localStorage.removeItem('authUser');
    };

    // Update user data
    const updateUser = (updatedData) => {
        const updatedUser = { ...user, ...updatedData };
        setUser(updatedUser);
        localStorage.setItem('authUser', JSON.stringify(updatedUser));
    };

    // Check if user is authenticated
    const isAuthenticated = () => {
        return user !== null;
    };

    // Get user role
    const getUserRole = () => {
        return user?.role || null;
    };

    // Get subscription tier
    const getSubscriptionTier = () => {
        return user?.subscriptionTier || null;
    };

    // Quick login removed for security

    const value = {
        user,
        login,
        logout,
        updateUser,
        isAuthenticated,
        getUserRole,
        getSubscriptionTier,
        loading
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
