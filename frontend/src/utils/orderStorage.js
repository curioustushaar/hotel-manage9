// Order storage service for managing room orders in localStorage

const STORAGE_KEY = 'bireena_room_orders';

export const orderStorage = {
    // Save order for a room
    saveOrder: (roomId, orderData) => {
        const orders = orderStorage.getAllOrders();
        orders[roomId] = {
            ...orderData,
            savedAt: new Date().toISOString(),
            orderId: `ORD-${Date.now()}`,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
        return orders[roomId];
    },

    // Get order for a specific room
    getOrder: (roomId) => {
        const orders = orderStorage.getAllOrders();
        return orders[roomId] || null;
    },

    // Get all orders
    getAllOrders: () => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    },

    // Delete order for a room
    deleteOrder: (roomId) => {
        const orders = orderStorage.getAllOrders();
        delete orders[roomId];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    },

    // Check if room has active order
    hasOrder: (roomId) => {
        return orderStorage.getOrder(roomId) !== null;
    },

    // Clear all orders (for testing/reset)
    clearAll: () => {
        localStorage.removeItem(STORAGE_KEY);
    }
};
