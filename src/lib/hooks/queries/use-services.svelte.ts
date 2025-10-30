import { createQuery, createMutation } from '@tanstack/svelte-query';
import { servicesApi } from '$lib/api/endpoints/services.js';
import { queryClient } from '$lib/config/query-client.js';
import type { 
  Service, 
  CreateServiceDto, 
  UpdateServiceDto, 
  ServiceQueryParams,
  ServiceStats,
  ServiceCategory,
  ServiceStep
} from '$lib/api/types/service.types.js';


export const useServices = (params?: ServiceQueryParams) => {
  return createQuery(() => ({
    queryKey: ['services', params],
    queryFn: async (): Promise<Service[]> => {
      return servicesApi.getAll(params);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  }));
};

/**
 * Get service by ID
 */
export const useService = (id: number) => {
  return createQuery(() => ({
    queryKey: ['services', id],
    queryFn: async (): Promise<Service> => {
      return servicesApi.getById(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  }));
};

/**
 * Create service mutation
 */
export const useCreateService = () => {
  // Using centralized queryClient
  
  return createMutation(() => ({
    mutationFn: async (data: CreateServiceDto): Promise<Service> => {
      return servicesApi.create(data);
    },
    onSuccess: () => {
      // Invalidate and refetch services list
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (error) => {
      console.error('Create service failed:', error);
    },
  }));
};

/**
 * Update service mutation
 */
export const useUpdateService = () => {
  // Using centralized queryClient
  
  return createMutation(() => ({
    mutationFn: async ({ id, data }: { id: number; data: UpdateServiceDto }): Promise<Service> => {
      return servicesApi.update(id, data);
    },
    onSuccess: (data) => {
      // Update the specific service in cache
      queryClient.setQueryData(['services', data.id], data);
      // Invalidate services list to refetch
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (error) => {
      console.error('Update service failed:', error);
    },
  }));
};

/**
 * Delete service mutation
 */
export const useDeleteService = () => {
  // Using centralized queryClient
  
  return createMutation(() => ({
    mutationFn: async (id: number): Promise<void> => {
      return servicesApi.delete(id);
    },
    onSuccess: (_, id) => {
      // Remove service from cache
      queryClient.removeQueries({ queryKey: ['services', id] });
      // Invalidate services list to refetch
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (error) => {
      console.error('Delete service failed:', error);
    },
  }));
};

/**
 * Get service statistics
 */
export const useServiceStats = () => {
  return createQuery(() => ({
    queryKey: ['services', 'stats'],
    queryFn: async (): Promise<ServiceStats> => {
      return servicesApi.getStats();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  }));
};

/**
 * Get service categories
 */
export const useServiceCategories = () => {
  return createQuery(() => ({
    queryKey: ['services', 'categories'],
    queryFn: async (): Promise<ServiceCategory[]> => {
      return servicesApi.getCategories();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  }));
};

/**
 * Create service category mutation
 */
export const useCreateServiceCategory = () => {
  // Using centralized queryClient
  
  return createMutation(() => ({
    mutationFn: async (data: { name: string; description?: string; color?: string }): Promise<ServiceCategory> => {
      return servicesApi.createCategory(data);
    },
    onSuccess: () => {
      // Invalidate categories
      queryClient.invalidateQueries({ queryKey: ['services', 'categories'] });
    },
    onError: (error) => {
      console.error('Create service category failed:', error);
    },
  }));
};

/**
 * Update service step mutation
 */
export const useUpdateServiceStep = () => {
  // Using centralized queryClient
  
  return createMutation(() => ({
    mutationFn: async ({ 
      serviceId, 
      stepId, 
      data 
    }: { 
      serviceId: number; 
      stepId: number; 
      data: Partial<ServiceStep> 
    }): Promise<ServiceStep> => {
      return servicesApi.updateStep(serviceId, stepId, data);
    },
    onSuccess: (data, { serviceId }) => {
      // Invalidate the specific service to refetch with updated steps
      queryClient.invalidateQueries({ queryKey: ['services', serviceId] });
      // Also invalidate services list
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (error) => {
      console.error('Update service step failed:', error);
    },
  }));
};
