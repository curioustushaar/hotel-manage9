import API_URL from '../config/api';

/**
 * Search for bookings/reservations based on keyword
 * @param {string} keyword - Guest Name, Mobile, or Room Number
 * @returns {Promise} - Search results
 */
export const searchBookings = async (keyword) => {
    try {
        if (!keyword || keyword.trim() === '') {
            return { success: true, data: [] };
        }

        const response = await fetch(`${API_URL}/api/bookings/search?q=${encodeURIComponent(keyword)}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('[searchService] API Error:', error);
        throw error;
    }
};
