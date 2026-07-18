import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CrudPage } from "../../components/CrudPage";
import type { CrudConfig } from "../../components/CrudPage";
import { formatDate, Plate, Tag } from "../../components/ui";
import type { Vehicle } from "../../types/api";
import {
  modelsApi,
  vehiclesApi,
  type CreateVehicleDto,
  type UpdateVehicleDto,
} from "../resources";

const MAX_YEAR = new Date().getFullYear() + 1;

export function VehiclesPage() {
  const models = useQuery({
    queryKey: ["models", "options"],
    queryFn: () => modelsApi.list({ page: 1, limit: 100 }),
  });

  const modelOptions = useMemo(
    () =>
      (models.data?.data ?? []).map((model) => ({
        value: model.id,
        label: model.brand ? `${model.brand.name} · ${model.name}` : model.name,
      })),
    [models.data],
  );

  const config = useMemo<CrudConfig<Vehicle, CreateVehicleDto, UpdateVehicleDto>>(
    () => ({
      resourceKey: "vehicles",
      singular: "Veículo",
      api: vehiclesApi,
      rowId: (row) => row.id,
      emptyHint: "Veículos pertencem a um modelo. Cadastre um modelo primeiro.",
      columns: [
        { header: "ID", render: (row) => <span className="cell-id">#{row.id}</span> },
        { header: "Placa", render: (row) => <Plate>{row.licensePlate}</Plate> },
        { header: "Chassi", render: (row) => <span className="mono">{row.chassis}</span> },
        { header: "Renavam", render: (row) => <span className="mono">{row.renavam}</span> },
        { header: "Ano", render: (row) => <Tag tone="amber">{row.year}</Tag> },
        {
          header: "Modelo",
          render: (row) => row.model?.name ?? `#${row.modelId}`,
        },
        { header: "Criado em", render: (row) => formatDate(row.createdAt) },
      ],
      fields: () => [
        {
          name: "licensePlate",
          label: "Placa",
          required: true,
          mono: true,
          uppercase: true,
          placeholder: "ABC1D23",
        },
        {
          name: "year",
          label: "Ano",
          type: "number",
          required: true,
          min: 1900,
          max: MAX_YEAR,
          hint: `Entre 1900 e ${MAX_YEAR}.`,
        },
        {
          name: "chassis",
          label: "Chassi",
          required: true,
          mono: true,
          uppercase: true,
          full: true,
          placeholder: "9BWZZZ377VT004251",
        },
        { name: "renavam", label: "Renavam", required: true, mono: true, full: true },
        {
          name: "modelId",
          label: "Modelo",
          type: "select",
          required: true,
          full: true,
          options: modelOptions,
        },
      ],
      toValues: (row) => ({
        licensePlate: row?.licensePlate ?? "",
        chassis: row?.chassis ?? "",
        renavam: row?.renavam ?? "",
        year: row ? String(row.year) : String(MAX_YEAR - 1),
        modelId: row ? String(row.modelId) : "",
      }),
      toCreateDto: (v) => ({
        licensePlate: v.licensePlate.trim().toUpperCase(),
        chassis: v.chassis.trim().toUpperCase(),
        renavam: v.renavam.trim(),
        year: Number(v.year),
        modelId: Number(v.modelId),
      }),
      toUpdateDto: (v) => ({
        licensePlate: v.licensePlate.trim().toUpperCase(),
        chassis: v.chassis.trim().toUpperCase(),
        renavam: v.renavam.trim(),
        year: Number(v.year),
        modelId: Number(v.modelId),
      }),
    }),
    [modelOptions],
  );

  return (
    <CrudPage
      eyebrow="Frota"
      title="Veículos"
      description="Placa, chassi e renavam são únicos. A listagem é paginada e cacheada."
      config={config}
    />
  );
}
