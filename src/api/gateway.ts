
import axios from 'axios';
import { auth } from '@/lib/firebase';

// Base URL for API endpoints
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://api.example.com';

// Create an axios instance with default configs
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add auth token to requests
axiosInstance.interceptors.request.use(async (config) => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const token = await currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return config;
  }
});

// Handle response errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    if (response && response.status === 401) {
      // Handle unauthorized (e.g., redirect to login)
      console.error('Unauthorized request');
    }
    
    return Promise.reject(error);
  }
);

// Client wrapper for axios
export const apiClient = {
  get: async (url: string, params = {}) => {
    const response = await axiosInstance.get(url, { params });
    return response.data;
  },
  
  post: async (url: string, data = {}) => {
    const response = await axiosInstance.post(url, data);
    return response.data;
  },
  
  put: async (url: string, data = {}) => {
    const response = await axiosInstance.put(url, data);
    return response.data;
  },
  
  delete: async (url: string) => {
    const response = await axiosInstance.delete(url);
    return response.data;
  }
};
