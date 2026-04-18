import axios from 'axios';

// Reads from .env.production (Cloud Run URL) in production build
// Falls back to localhost:5000 in development
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:5000/api';

const API = axios.create({ baseURL: BASE_URL });

export const getDashboard  = ()              => API.get('/dashboard');
export const getProducts   = ()              => API.get('/products');
export const addProduct    = (data)          => API.post('/products', data);
export const updateProduct = (id, data)      => API.put(`/products/${id}`, data);
export const getOrders     = ()              => API.get('/orders');
export const updateOrder   = (id, data)      => API.put(`/orders/${id}`, data);
export const getDemand     = (productId)     => API.get(`/demand/${productId}`);
export const getDemandAll  = ()              => API.get('/demand');

export default API;
