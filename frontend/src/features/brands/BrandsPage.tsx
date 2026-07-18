import { CrudPage } from "../../components/CrudPage";
import type { CrudConfig } from "../../components/CrudPage";
import { formatDate } from "../../components/ui";
import type { Brand } from "../../types/api";
import {
  brandsApi,
  type CreateBrandDto,
  type UpdateBrandDto,
} from "../resources";

const config: CrudConfig<Brand, CreateBrandDto, UpdateBrandDto> = {
  resourceKey: "brands",
  singular: "Marca",
  api: brandsApi,
  rowId: (row) => row.id,
  emptyHint: "Cadastre a primeira marca para começar a cadeia marca → modelo → veículo.",
  columns: [
    { header: "ID", render: (row) => <span className="cell-id">#{row.id}</span> },
    { header: "Nome", render: (row) => row.name },
    { header: "Criada em", render: (row) => formatDate(row.createdAt) },
  ],
  fields: () => [
    { name: "name", label: "Nome da marca", required: true, full: true },
  ],
  toValues: (row) => ({ name: row?.name ?? "" }),
  toCreateDto: (v) => ({ name: v.name.trim() }),
  toUpdateDto: (v) => ({ name: v.name.trim() }),
};

export function BrandsPage() {
  return (
    <CrudPage
      eyebrow="Catálogo"
      title="Marcas"
      description="Fabricantes da frota. Não é possível excluir uma marca com modelos vinculados."
      config={config}
    />
  );
}
