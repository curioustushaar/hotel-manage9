import axios from 'axios';

// Create a configured axios instance
// Using localhost:5000 directly as requested to eliminate env var ambiguity during debug
const API = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to log outgoing requests
API.interceptors.request.use(request => {
    console.log(`📡 Starting Request: ${request.method.toUpperCase()} ${request.baseURL}${request.url}`);
    console.log('📦 Request Payload:', request.data);
    return request;
});

// Add response interceptor to log incoming responses and errors
API.interceptors.response.use(
    response => {
        console.log(`✅ Response from ${response.config.url}:`, response.status);
        return response;
    },
    error => {
        console.error(`❌ API Error for ${error.config?.url}:`, error.message);
        if (error.response) {
            console.error('🔴 Server Response:', error.response.data);
            console.error('🔴 Status Code:', error.response.status);
        }
        return Promise.reject(error);
    }
);

// Named exports for visitor service
export const addVisitor = async (data) => {
    try {
        const response = await API.post('/visitors', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getVisitorsByReservation = async (reservationId) => {
    try {
        const response = await API.get(`/visitors/reservation/${reservationId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const exitVisitor = async (visitorId) => {
    try {
        const response = await API.put(`/visitors/${visitorId}/exit`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const convertToGuest = async (visitorId, chargeAmount) => {
    try {
        const response = await API.put(`/visitors/${visitorId}/convert`, { chargeAmount });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Default export for object-style usage if needed
const visitorService = {
    addVisitor,
    getVisitorsByReservation,
    exitVisitor,
    convertToGuest
};

export default visitorService;
