import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Let the browser set Content-Type with boundary for file uploads
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle common errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message =
      error.response?.data?.message || error.message || 'Something went wrong';

    // Clearer message when backend is not running
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      message =
        'Cannot connect to server. Please check your internet connection or try again later.';
    }

    // If token is invalid, clear storage and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
