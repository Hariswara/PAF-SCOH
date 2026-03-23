import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  // Tell Axios to look for the XSRF-TOKEN cookie and send it in the X-XSRF-TOKEN header
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

export default api;
