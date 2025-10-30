/**
 * Categories API endpoints
 */

import { axios } from '../client';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '../types/service.types';

export const categoriesEndpoints = {
  getAll: () => axios.get<Category[]>('/categories'),
  getById: (id: number) => axios.get<Category>(`/categories/${id}`),
  create: (data: CreateCategoryDto) => axios.post<Category>('/categories', data),
  update: (id: number, data: UpdateCategoryDto) => axios.patch<Category>(`/categories/${id}`, data),
  remove: (id: number) => axios.delete(`/categories/${id}`),
};
