import { createResourceApi } from "../lib/resource";
import type { Brand, Model, User, Vehicle } from "../types/api";

export interface CreateUserDto {
  nickname?: string;
  name: string;
  email: string;
  password: string;
}
export type UpdateUserDto = Partial<CreateUserDto>;

export interface CreateBrandDto {
  name: string;
}
export type UpdateBrandDto = Partial<CreateBrandDto>;

export interface CreateModelDto {
  name: string;
  brandId: number;
}
export type UpdateModelDto = Partial<CreateModelDto>;

export interface CreateVehicleDto {
  licensePlate: string;
  chassis: string;
  renavam: string;
  year: number;
  modelId: number;
}
export type UpdateVehicleDto = Partial<CreateVehicleDto>;

export const usersApi = createResourceApi<User, CreateUserDto, UpdateUserDto>("users");
export const brandsApi = createResourceApi<Brand, CreateBrandDto, UpdateBrandDto>("brands");
export const modelsApi = createResourceApi<Model, CreateModelDto, UpdateModelDto>("models");
export const vehiclesApi = createResourceApi<Vehicle, CreateVehicleDto, UpdateVehicleDto>(
  "vehicles",
);
