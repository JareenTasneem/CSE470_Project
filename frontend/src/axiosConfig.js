// src/axiosConfig.js
import axios from "axios";

// Create an Axios instance with the base URL of your API
const instance = axios.create({
  baseURL: "http://localhost:5000/api/", // Adjust if needed
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

export default instance;
