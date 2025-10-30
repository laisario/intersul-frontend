/**
 * Users query hooks (Admin only)
 */

import { createQuery, createMutation } from '@tanstack/svelte-query';
import { usersApi } from '$lib/api/endpoints/users.js';
import { queryClient } from '$lib/config/query-client.js';
import type { 
  User, 
  RegisterPayload, 
  UpdateUserDto,
  UserQueryParams,
  UserStats
} from '$lib/api/types/auth.types.js';

/**
 * Get all users (admin only)
 */
export const useUsers = (params?: UserQueryParams) => {
  return createQuery(() => ({
    queryKey: ['users', params],
    queryFn: async (): Promise<User[]> => {
      return usersApi.getAll(params);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  }));
};

/**
 * Get user by ID
 */
export const useUser = (id: number) => {
  return createQuery(() => ({
    queryKey: ['users', id],
    queryFn: async (): Promise<User> => {
      return usersApi.getById(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  }));
};

/**
 * Create user mutation (admin only)
 */
export const useCreateUser = () => {
  // Using centralized queryClient
  
  return createMutation(() => ({
    mutationFn: async (data: RegisterPayload): Promise<User> => {
      return usersApi.create(data);
    },
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('Create user failed:', error);
    },
  }));
};

/**
 * Update user mutation
 */
export const useUpdateUser = () => {
  // Using centralized queryClient
  
  return createMutation(() => ({
    mutationFn: async ({ id, data }: { id: number; data: UpdateUserDto }): Promise<User> => {
      return usersApi.update(id, data);
    },
    onSuccess: (data) => {
      // Update the specific user in cache
      queryClient.setQueryData(['users', data.id], data);
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('Update user failed:', error);
    },
  }));
};

/**
 * Delete user mutation (admin only)
 */
export const useDeleteUser = () => {
  // Using centralized queryClient
  
  return createMutation(() => ({
    mutationFn: async (id: number): Promise<void> => {
      return usersApi.delete(id);
    },
    onSuccess: (_, id) => {
      // Remove user from cache
      queryClient.removeQueries({ queryKey: ['users', id] });
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('Delete user failed:', error);
    },
  }));
};

/**
 * Toggle user active status mutation
 */
export const useToggleUserActive = () => {
  // Using centralized queryClient
  
  return createMutation(() => ({
    mutationFn: async (id: number): Promise<User> => {
      return usersApi.toggleActive(id);
    },
    onSuccess: (data) => {
      // Update the specific user in cache
      queryClient.setQueryData(['users', data.id], data);
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('Toggle user active failed:', error);
    },
  }));
};

/**
 * Get user statistics
 */
export const useUserStats = () => {
  return createQuery(() => ({
    queryKey: ['users', 'stats'],
    queryFn: async (): Promise<UserStats> => {
      return usersApi.getStats();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  }));
};
