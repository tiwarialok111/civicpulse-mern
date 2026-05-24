import api from './api';

/**
 * Create a new complaint with images (multipart/form-data).
 */
export const createComplaint = async (formData) => {
  const { data } = await api.post('/complaints', formData);
  return data;
};

/**
 * Get logged-in user's complaints with pagination.
 */
export const getMyComplaints = async ({ page = 1, limit = 10, status = '', category = '' } = {}) => {
  const { data } = await api.get('/complaints/my', {
    params: { page, limit, status, category },
  });
  return data;
};

/**
 * Get a single complaint by ID.
 */
export const getComplaintById = async (id) => {
  const { data } = await api.get(`/complaints/${id}`);
  return data;
};

/**
 * Update complaint (only allowed if status is pending).
 */
export const updateComplaint = async (id, formData) => {
  const { data } = await api.put(`/complaints/${id}`, formData);
  return data;
};

/**
 * Delete complaint (only allowed if status is pending).
 */
export const deleteComplaint = async (id) => {
  const { data } = await api.delete(`/complaints/${id}`);
  return data;
};
