import api from './api';

/**
 * Create a new complaint with images (multipart/form-data).
 */
export const createComplaint = async (formData) => {
  const { data } = await api.post('/api/v1/complaints', formData);
  return data;
};

/**
 * Get logged-in user's complaints with pagination.
 */
export const getMyComplaints = async ({ page = 1, limit = 10, status = '', category = '' } = {}) => {
  const { data } = await api.get('/api/v1/complaints/my', {
    params: { page, limit, status, category },
  });
  return data;
};

/**
 * Get a single complaint by ID.
 */
export const getComplaintById = async (id) => {
  const { data } = await api.get(`/api/v1/complaints/${id}`);
  return data;
};

/**
 * Update complaint (only allowed if status is pending).
 */
export const updateComplaint = async (id, formData) => {
  const { data } = await api.put(`/api/v1/complaints/${id}`, formData);
  return data;
};

/**
 * Delete complaint (only allowed if status is pending).
 */
export const deleteComplaint = async (id) => {
  const { data } = await api.delete(`/api/v1/complaints/${id}`);
  return data;
};
