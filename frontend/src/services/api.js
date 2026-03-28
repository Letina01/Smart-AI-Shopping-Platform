import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: false,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    login: (email, password) => api.post('/auth/token', { email, password }),
    register: (name, email, password) => api.post('/auth/register', { name, email, password }),
};

export const productService = {
    search: (q, email) => api.get(`/products/search?q=${q}&email=${email}`),
};

export const aiService = {
    recommend: (products, criteria) => api.post(`/ai/recommend?criteria=${criteria}`, products),
};

export const orderService = {
    placeOrder: (order) => api.post('/orders', order),
    buyNow: (order) => api.post('/orders/buy-now', order),
    checkoutCart: (userId, payload) => api.post(`/orders/checkout/${userId}`, payload),
    getHistory: (userId) => api.get(`/orders/history?userId=${userId}`),
};

export const cartService = {
    add: (item) => api.post('/cart/add', item),
    get: (userId) => api.get(`/cart/${userId}`),
};

export const paymentService = {
    request: (payment) => api.post('/payment/request', payment),
    confirm: (payment) => api.post('/payment/confirm', payment),
    pay: (payment) => api.post('/payment', payment),
};

export const userService = {
    getProfile: (email) => api.get(`/users/profile?email=${email}`),
    updateProfile: (profile) => api.put('/users/profile', profile),
    addAddress: (email, address) => api.post(`/users/address?email=${email}`, address),
    deleteAddress: (email, id) => api.delete(`/users/address/${id}?email=${email}`),
};

export default api;
