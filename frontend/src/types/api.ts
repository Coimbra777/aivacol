export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: "Bearer";
}

export interface User {
  id: number;
  nickname: string | null;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: number;
  name: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface Model {
  id: number;
  name: string;
  brandId: number;
  brand?: Brand;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: number;
  licensePlate: string;
  chassis: string;
  renavam: string;
  year: number;
  modelId: number;
  model?: Model;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export type AuditEventName =
  | "vehicle.created"
  | "vehicle.updated"
  | "vehicle.deleted";

export interface AuditLog {
  id: string;
  event: AuditEventName;
  entity: "vehicle";
  entityId: number;
  userId: number | null;
  payload: Record<string, unknown>;
  createdAt: string;
}
