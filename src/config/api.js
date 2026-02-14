// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default API_URL;

// Helper function for making API calls
export const apiCall = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        return response;
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
};
