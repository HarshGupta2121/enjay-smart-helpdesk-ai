import { api } from './client';

export const fetchProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data.data;
};

export const updateProfile = async (data: { fullName?: string; avatar?: string; phone?: string }) => {
  const response = await api.patch('/auth/profile', data);
  return response.data;
};

export const changePassword = async (data: { currentPassword?: string; newPassword?: string }) => {
  const response = await api.patch('/auth/password', data);
  return response.data;
};
