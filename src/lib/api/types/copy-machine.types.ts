import type { BaseEntity } from './common.types';
import type { Client } from './client.types';

export interface CopyMachineCatalog extends BaseEntity {
  model: string;
  manufacturer: string;
  description?: string;
  features: string[];
  price?: number;
  quantity?: number;
  file?: string;
}

export interface ClientCopyMachine extends BaseEntity {
  client: Client;
  catalog: CopyMachineCatalog;
  serialNumber: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  status: ClientCopyMachineStatus;
  location?: string;
  notes?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
}

export enum ClientCopyMachineStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  REPAIR = 'repair',
  RETIRED = 'retired',
}

export interface Franchise extends BaseEntity {
  name: string;
  description?: string;
  price: number;
  duration: number; // in months
  features: string[];
  active: boolean;
  maxCopies?: number;
  colorCopies?: number;
  blackWhiteCopies?: number;
}

export interface CreateCopyMachineCatalogDto {
  model: string;
  manufacturer: string;
  description?: string;
  features?: string[];
  price?: number;
  quantity?: number;
  file?: string;
}

export interface UpdateCopyMachineCatalogDto extends Partial<CreateCopyMachineCatalogDto> {
  id: number;
}

export interface CreateClientCopyMachineDto {
  clientId: number;
  catalogId: number;
  serialNumber: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  location?: string;
  notes?: string;
}

export interface UpdateClientCopyMachineDto extends Partial<CreateClientCopyMachineDto> {
  id: number;
  status?: ClientCopyMachineStatus;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
}

export interface CreateFranchiseDto {
  name: string;
  description?: string;
  price: number;
  duration: number;
  features?: string[];
  maxCopies?: number;
  colorCopies?: number;
  blackWhiteCopies?: number;
}

export interface UpdateFranchiseDto extends Partial<CreateFranchiseDto> {
  id: number;
  active?: boolean;
}

export interface CopyMachineQueryParams {
  clientId?: number;
  status?: ClientCopyMachineStatus;
  brand?: string;
  model?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CopyMachineStats {
  totalMachines: number;
  activeMachines: number;
  maintenanceRequired: number;
  totalClients: number;
  averageMachinesPerClient: number;
}
