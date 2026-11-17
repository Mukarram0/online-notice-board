/**
 * Axios API Configuration (src/api.js)
 * -------------------------------------
 * What it does:
 *   Configures a centralized Axios HTTP client instance.
 * Why it is needed:
 *   Avoids hardcoding backend URLs across individual components and automatically
 *   attaches the JWT Bearer token from localStorage to every outgoing request.
 * How it connects:
 *   Points to the Express backend running on http://localhost:5000/api.
 */

import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Request interceptor to attach Bearer token automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
