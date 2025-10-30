/**
 * Client-related types
 */

import type { BaseEntity } from './common.types';

export interface Client extends BaseEntity {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  company?: string;
  contactPerson?: string;
  notes?: string;
  status: ClientStatus;
  lastServiceDate?: string;
}

export enum ClientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export interface CreateClientDto {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  company?: string;
  contactPerson?: string;
  notes?: string;
  status?: ClientStatus;
}

export interface UpdateClientDto extends Partial<CreateClientDto> {
  id: number;
}

export interface ClientQueryParams {
  search?: string;
  status?: ClientStatus;
  city?: string;
  state?: string;
  page?: number;
  limit?: number;
}

export interface ClientStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  newThisMonth: number;
}
