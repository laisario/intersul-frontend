/**
 * Service-related types
 */

import type { BaseEntity } from './common.types';
import type { Client } from './client.types';

export interface ServiceCategory extends BaseEntity {
  name: string;
  description?: string;
  color?: string;
  active: boolean;
}

export interface Service extends BaseEntity {
  title: string;
  description?: string;
  status: ServiceStatus;
  priority: ServicePriority;
  category: ServiceCategory;
  client: Client;
  assignedTo?: User;
  clientCopyMachineId?: number;
  scheduledDate?: string;
  completedDate?: string;
  estimatedDuration?: number; // in minutes
  actualDuration?: number; // in minutes
  notes?: string;
  steps: ServiceStep[];
}

export enum ServiceStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold',
}

export enum ServicePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface ServiceStep extends BaseEntity {
  title: string;
  description?: string;
  status: ServiceStepStatus;
  order: number;
  estimatedDuration?: number;
  actualDuration?: number;
  responsable?: User;
  completedAt?: string;
  notes?: string;
}

export interface StepTemplate extends BaseEntity {
  title: string;
  description?: string;
  suggestedRole?: string;
  categoryId: number;
  order: number;
}

export interface Category extends BaseEntity {
  name: string;
  description?: string;
  color?: string;
  active: boolean;
  stepTemplates?: StepTemplate[];
}

export enum ServiceStepStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
}

export interface CreateServiceDto {
  title: string;
  description?: string;
  categoryId: number;
  clientId: number;
  assignedToId?: number;
  clientCopyMachineId?: number;
  scheduledDate?: string;
  estimatedDuration?: number;
  notes?: string;
  priority?: ServicePriority;
  steps?: { title: string; description?: string; assignedUserId?: number }[];
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  color?: string;
  stepTemplates?: { title: string; description?: string; suggestedRole?: string }[];
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  color?: string;
  active?: boolean;
  stepTemplates?: { title: string; description?: string; suggestedRole?: string }[];
}

export interface UpdateServiceDto extends Partial<CreateServiceDto> {
  id: number;
  status?: ServiceStatus;
  actualDuration?: number;
  completedDate?: string;
}

export interface ServiceQueryParams {
  categoryId?: number;
  clientId?: number;
  clientCopyMachineId?: number;
  status?: ServiceStatus;
  priority?: ServicePriority;
  assignedToId?: number;
  scheduledDateFrom?: string;
  scheduledDateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ServiceStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  overdue: number;
  thisWeek: number;
  thisMonth: number;
}

// Import User type from auth
import type { User } from './auth.types';
