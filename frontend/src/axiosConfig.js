// src/axiosConfig.js
import axios from "axios";
import { getAuthToken } from './contexts/AuthContext';

// Create an Axios instance with the base URL of your API
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to attach the token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - Please check if the server is running');
      return Promise.reject(new Error('Unable to connect to the server. Please try again later.'));
    }
    
    if (error.response?.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default instance;
