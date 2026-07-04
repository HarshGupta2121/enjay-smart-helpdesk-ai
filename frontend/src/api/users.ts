import { api } from './client';

export interface FetchUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

export const fetchUsers = async (params: FetchUsersParams) => {
  const response = await api.get('/users', { params });
  return response.data.data;
};

export const createUser = async (data: any) => {
  const response = await api.post('/users', data);
  return response.data.data;
};

export const updateUser = async ({ id, data }: { id: string; data: any }) => {
  // We'll run them in parallel if they exist
  const promises = [];
  if (data.fullName || data.avatar !== undefined) promises.push(api.patch(`/users/${id}`, { fullName: data.fullName, avatar: data.avatar }));
  if (data.role) promises.push(api.patch(`/users/${id}/role`, { role: data.role }));
  if (data.isActive !== undefined) promises.push(api.patch(`/users/${id}/status`, { isActive: data.isActive }));
  
  await Promise.all(promises);
  return { success: true };
};

export const deleteUser = async (id: string) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};
