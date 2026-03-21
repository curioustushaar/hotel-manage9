// API Configuration
const configuredApiUrl = (import.meta.env.VITE_API_URL || '').trim();

// In development, always use Vite proxy (/api -> localhost:5000)
// to avoid stale/incorrect host mappings from shell env vars.
const API_URL = import.meta.env.DEV ? '' : configuredApiUrl;

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
