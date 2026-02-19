import { createContext, useContext, useState, useEffect } from 'react';
<<<<<<< HEAD
import { authenticateUser, getUserById, MOCK_USERS } from '../data/mockUsers';
import { ROLES } from '../config/rbac';

const AuthContext = createContext(null);

=======
import axios from 'axios';
// import { MOCK_USERS } from '../data/mockUsers'; // Removed for security
import { ROLES } from '../config/rbac';

import API_URL from '../config/api';

const AuthContext = createContext(null);

// Configure axios
if (API_URL) {
    axios.defaults.baseURL = API_URL;
}

// Add a request interceptor to include the auth token
axios.interceptors.request.use(
    (config) => {
        const savedUser = localStorage.getItem('authUser');
        if (savedUser) {
            try {
                const { token } = JSON.parse(savedUser);
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (error) {
                console.error('Error parsing authUser for token:', error);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

>>>>>>> main
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
<<<<<<< HEAD
    const login = (email, password) => {
        const authenticatedUser = authenticateUser(email, password);

        if (!authenticatedUser) {
            return { success: false, error: 'Invalid email or password' };
        }

        if (authenticatedUser.error) {
            return { success: false, error: authenticatedUser.error };
        }

        // Update last login time
        const userWithUpdatedLogin = {
            ...authenticatedUser,
            lastLogin: new Date().toISOString()
        };

        setUser(userWithUpdatedLogin);
        localStorage.setItem('authUser', JSON.stringify(userWithUpdatedLogin));

        return { success: true, user: userWithUpdatedLogin };
=======
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
            let errorMessage = 'An unexpected error occurred';

            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                errorMessage = error.response.data.message || 'Invalid email or password';
            } else if (error.request) {
                // The request was made but no response was received
                errorMessage = 'Server is unreachable. Please try again later.';
            } else {
                // Something happened in setting up the request that triggered an Error
                errorMessage = error.message;
            }

            return {
                success: false,
                error: errorMessage
            };
        }
>>>>>>> main
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

<<<<<<< HEAD
    // Quick login for testing (development only)
    const quickLogin = (role) => {
        // Find first active user with this role
        const testUser = MOCK_USERS.find(u => u.role === role && u.active);

        if (testUser) {
            const { password, ...userWithoutPassword } = testUser;
            const userWithUpdatedLogin = {
                ...userWithoutPassword,
                lastLogin: new Date().toISOString()
            };
            setUser(userWithUpdatedLogin);
            localStorage.setItem('authUser', JSON.stringify(userWithUpdatedLogin));
            return { success: true, user: userWithUpdatedLogin };
        }

        return { success: false, error: 'No test user found for this role' };
    };
=======
    // Quick login removed for security
>>>>>>> main

    const value = {
        user,
        login,
        logout,
        updateUser,
        isAuthenticated,
        getUserRole,
        getSubscriptionTier,
<<<<<<< HEAD
        quickLogin,
=======
>>>>>>> main
        loading
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
