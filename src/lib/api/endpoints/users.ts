/**
 * Users API endpoints (Admin only)
 */

import { axios } from '../client.js';
import type { 
  User, 
  RegisterPayload, 
  UpdateUserDto,
  UserQueryParams,
  UserStats
} from '../types/auth.types.js';

export const usersApi = {
  /**
   * Get all users (admin only)
   */
  getAll: (params?: UserQueryParams): Promise<User[]> =>
    axios.get('/users', { params }).then(res => res.data),

  /**
   * Get user by ID
   */
  getById: (id: number): Promise<User> =>
    axios.get(`/users/${id}`).then(res => res.data),

  /**
   * Create new user (admin only)
   */
  create: (data: RegisterPayload): Promise<User> =>
    axios.post('/users', data).then(res => res.data),

  /**
   * Update user
   */
  update: (id: number, data: UpdateUserDto): Promise<User> =>
    axios.patch(`/users/${id}`, data).then(res => res.data),

  /**
   * Delete user (admin only)
   */
  delete: (id: number): Promise<void> =>
    axios.delete(`/users/${id}`).then(() => undefined),

  /**
   * Toggle user active status
   */
  toggleActive: (id: number): Promise<User> =>
    axios.patch(`/users/${id}/toggle-active`).then(res => res.data),

  /**
   * Get user statistics
   */
  getStats: (): Promise<UserStats> =>
    axios.get('/users/stats').then(res => res.data),
};

// Additional types for user management
export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: string;
  phone?: string;
  position?: string;
  active?: boolean;
}

export interface UserQueryParams {
  search?: string;
  role?: string;
  active?: boolean;
  page?: number;
  limit?: number;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<string, number>;
  newThisMonth: number;
}
