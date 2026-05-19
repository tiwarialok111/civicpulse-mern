import api from './api';

export const getAdminStats = async () => {
  const { data } = await api.get('/admin/dashboard');
  return data;
};

export const getAdminComplaints = async ({
  page = 1,
  limit = 10,
  status = '',
  category = '',
  priority = '',
  search = '',
} = {}) => {
  const { data } = await api.get('/admin/complaints', {
    params: { page, limit, status, category, priority, search },
  });
  return data;
};

export const updateComplaintStatus = async (id, { status, remark }) => {
  const { data } = await api.put(`/admin/complaints/${id}/status`, { status, remark });
  return data;
};

export const updateComplaintPriority = async (id, { priority }) => {
  const { data } = await api.put(`/admin/complaints/${id}/priority`, { priority });
  return data;
};

export const deleteComplaintAdmin = async (id) => {
  const { data } = await api.delete(`/admin/complaints/${id}`);
  return data;
};
