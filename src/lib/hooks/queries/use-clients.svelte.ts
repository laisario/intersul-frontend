/**
 * Clients query hooks
 */

import { createQuery, createMutation } from '@tanstack/svelte-query';
import { clientsApi } from '$lib/api/endpoints/clients.js';
import { queryClient } from '$lib/config/query-client.js';
import type { 
  Client, 
  CreateClientDto, 
  UpdateClientDto, 
  ClientQueryParams,
  ClientStats 
} from '$lib/api/types/client.types.js';

/**
 * Get all clients
 */
export const useClients = (params?: ClientQueryParams) => {
  return createQuery(() => ({
    queryKey: ['clients', params],
    queryFn: async (): Promise<Client[]> => {
      return clientsApi.getAll(params);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  }));
};

/**
 * Get client by ID
 */
export const useClient = (id: number) => {
  return createQuery(() => ({
    queryKey: ['clients', id],
    queryFn: async (): Promise<Client> => {
      return clientsApi.getById(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  }));
};

/**
 * Create client mutation
 */
export const useCreateClient = () => {
  // Using centralized queryClient
  
  return createMutation(() => ({
    mutationFn: async (data: CreateClientDto): Promise<Client> => {
      return clientsApi.create(data);
    },
    onSuccess: () => {
      // Invalidate and refetch clients list
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (error) => {
      console.error('Create client failed:', error);
    },
  }));
};

/**
 * Update client mutation
 */
export const useUpdateClient = () => {
  // Using centralized queryClient
  
  return createMutation(() => ({
    mutationFn: async ({ id, data }: { id: number; data: UpdateClientDto }): Promise<Client> => {
      return clientsApi.update(id, data);
    },
    onSuccess: (data) => {
      // Update the specific client in cache
      queryClient.setQueryData(['clients', data.id], data);
      // Invalidate clients list to refetch
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (error) => {
      console.error('Update client failed:', error);
    },
  }));
};

/**
 * Delete client mutation
 */
export const useDeleteClient = () => {
  // Using centralized queryClient
  
  return createMutation(() => ({
    mutationFn: async (id: number): Promise<void> => {
      return clientsApi.delete(id);
    },
    onSuccess: (_, id) => {
      // Remove client from cache
      queryClient.removeQueries({ queryKey: ['clients', id] });
      // Invalidate clients list to refetch
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (error) => {
      console.error('Delete client failed:', error);
    },
  }));
};

/**
 * Get client statistics
 */
export const useClientStats = () => {
  return createQuery(() => ({
    queryKey: ['clients', 'stats'],
    queryFn: async (): Promise<ClientStats> => {
      return clientsApi.getStats();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  }));
};

/**
 * Search clients
 */
export const useSearchClients = (query: string) => {
  return createQuery(() => ({
    queryKey: ['clients', 'search', query],
    queryFn: async (): Promise<Client[]> => {
      return clientsApi.search(query);
    },
    enabled: !!query && query.length >= 2,
    staleTime: 1 * 60 * 1000, // 1 minute
  }));
};
