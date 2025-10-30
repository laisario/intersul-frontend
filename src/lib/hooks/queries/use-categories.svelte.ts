import { createMutation, createQuery } from '@tanstack/svelte-query';
import { categoriesEndpoints } from '$lib/api/endpoints/categories';
import { queryClient } from '$lib/config/query-client';
import type { CreateCategoryDto, UpdateCategoryDto } from '$lib/api/types/service.types';

export const useCategories = () => {
  return createQuery(() => ({
    queryKey: ['categories'],
    queryFn: () => categoriesEndpoints.getAll(),
    staleTime: 5 * 60 * 1000,
  }));
};

export const useCategory = (id: number) => {
  return createQuery(() => ({
    queryKey: ['category', id],
    queryFn: () => categoriesEndpoints.getById(id),
    enabled: !!id,
  }));
};

export const useCreateCategory = () => {
  return createMutation(() => ({
    mutationFn: (data: CreateCategoryDto) => categoriesEndpoints.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  }));
};

export const useUpdateCategory = () => {
  return createMutation(() => ({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoryDto }) =>
      categoriesEndpoints.update(id, data),
    onSuccess: (_: any, variables: { id: number; data: UpdateCategoryDto }) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category', variables.id] });
    },
  }));
};

export const useDeleteCategory = () => {
  return createMutation(() => ({
    mutationFn: (id: number) => categoriesEndpoints.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  }));
};
