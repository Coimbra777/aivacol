import { api } from "./api";
import type { Paginated } from "../types/api";

export interface ListParams {
  page: number;
  limit: number;
}

/** CRUD tipado para um recurso REST paginado da API Aivacol. */
export function createResourceApi<T, CreateDto, UpdateDto>(path: string) {
  return {
    async list(params: ListParams): Promise<Paginated<T>> {
      const { data } = await api.get<Paginated<T>>(`/${path}`, { params });
      return data;
    },
    async create(dto: CreateDto): Promise<T> {
      const { data } = await api.post<T>(`/${path}`, dto);
      return data;
    },
    async update(id: number, dto: UpdateDto): Promise<T> {
      const { data } = await api.patch<T>(`/${path}/${id}`, dto);
      return data;
    },
    async remove(id: number): Promise<void> {
      await api.delete(`/${path}/${id}`);
    },
  };
}
