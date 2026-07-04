import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsers, FetchUsersParams, createUser, updateUser, deleteUser } from '@/api/users';
import { toast } from 'sonner';

export const useUsers = (params: FetchUsersParams) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => fetchUsers(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Failed to create user';
      toast.error(msg);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Failed to update user';
      toast.error(msg);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Failed to delete user';
      toast.error(msg);
    },
  });
};
