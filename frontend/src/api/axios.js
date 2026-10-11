import axios from 'axios';

export const TOKEN_KEY = 'synccore_token';

// One configured Axios instance used by the whole app.
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

// REQUEST INTERCEPTOR: runs before every request and adds   Authorization: Bearer <token>
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// RESPONSE INTERCEPTOR: if the server says 401 (token expired / invalid) -> log out and go to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginCall = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginCall) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('synccore_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
