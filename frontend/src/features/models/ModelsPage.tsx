import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CrudPage } from "../../components/CrudPage";
import type { CrudConfig } from "../../components/CrudPage";
import { formatDate, Tag } from "../../components/ui";
import type { Model } from "../../types/api";
import {
  brandsApi,
  modelsApi,
  type CreateModelDto,
  type UpdateModelDto,
} from "../resources";

export function ModelsPage() {
  const brands = useQuery({
    queryKey: ["brands", "options"],
    queryFn: () => brandsApi.list({ page: 1, limit: 100 }),
  });

  const brandOptions = useMemo(
    () => (brands.data?.data ?? []).map((brand) => ({ value: brand.id, label: brand.name })),
    [brands.data],
  );

  const config = useMemo<CrudConfig<Model, CreateModelDto, UpdateModelDto>>(
    () => ({
      resourceKey: "models",
      singular: "Modelo",
      api: modelsApi,
      rowId: (row) => row.id,
      emptyHint: "Modelos pertencem a uma marca. Cadastre uma marca primeiro.",
      columns: [
        { header: "ID", render: (row) => <span className="cell-id">#{row.id}</span> },
        { header: "Modelo", render: (row) => row.name },
        {
          header: "Marca",
          render: (row) => <Tag tone="teal">{row.brand?.name ?? `#${row.brandId}`}</Tag>,
        },
        { header: "Criado em", render: (row) => formatDate(row.createdAt) },
      ],
      fields: () => [
        { name: "name", label: "Nome do modelo", required: true, full: true },
        {
          name: "brandId",
          label: "Marca",
          type: "select",
          required: true,
          full: true,
          options: brandOptions,
        },
      ],
      toValues: (row) => ({
        name: row?.name ?? "",
        brandId: row ? String(row.brandId) : "",
      }),
      toCreateDto: (v) => ({ name: v.name.trim(), brandId: Number(v.brandId) }),
      toUpdateDto: (v) => ({ name: v.name.trim(), brandId: Number(v.brandId) }),
    }),
    [brandOptions],
  );

  return (
    <CrudPage
      eyebrow="Catálogo"
      title="Modelos"
      description="Modelos vinculados a uma marca. Modelos com veículos não podem ser excluídos."
      config={config}
    />
  );
}
