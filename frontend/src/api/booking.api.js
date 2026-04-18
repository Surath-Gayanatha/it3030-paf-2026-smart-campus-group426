import axios from 'axios';

const API_URL = 'http://localhost:8081/api/bookings';

// Helper to get auth header if using JWT
const getAuthHeaders = () => {
    const token = localStorage.getItem('token'); // Adjust based on where token is stored
    return {
        headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
        }
    };
};

export const createBooking = async (bookingData) => {
    const response = await axios.post(API_URL, bookingData, getAuthHeaders());
    return response.data;
};

export const getBookings = async () => {
    const response = await axios.get(API_URL, getAuthHeaders());
    return response.data;
};

export const getBookingById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`, getAuthHeaders());
    return response.data;
};

export const updateBooking = async (id, bookingData) => {
    const response = await axios.put(`${API_URL}/${id}`, bookingData, getAuthHeaders());
    return response.data;
};

export const updateBookingStatus = async (id, statusData) => {
    const response = await axios.patch(`${API_URL}/${id}/status`, statusData, getAuthHeaders());
    return response.data;
};

export const deleteBooking = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
    return response.data;
};
