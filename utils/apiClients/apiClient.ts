import axios, { AxiosInstance } from 'axios';

const baseURL = process.env.API_URL || 'http://localhost:3000/api';

const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;