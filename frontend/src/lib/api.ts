import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Required for stateful session cookies
});

export default api;
