import api from './api';

export const registerUser = async (userData) => {
  const { data } = await api.post('/api/v1/auth/register', userData);
  return data;
};

export const loginUser = async (credentials) => {
  const { data } = await api.post('/api/v1/auth/login', credentials);
  return data;
};

export const getMe = async () => {
  const { data } = await api.get('/api/v1/auth/me');
  return data;
};
