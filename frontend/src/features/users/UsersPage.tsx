import { CrudPage } from "../../components/CrudPage";
import type { CrudConfig } from "../../components/CrudPage";
import { formatDate } from "../../components/ui";
import type { User } from "../../types/api";
import {
  usersApi,
  type CreateUserDto,
  type UpdateUserDto,
} from "../resources";

const config: CrudConfig<User, CreateUserDto, UpdateUserDto> = {
  resourceKey: "users",
  singular: "Usuário",
  api: usersApi,
  rowId: (row) => row.id,
  columns: [
    { header: "ID", render: (row) => <span className="cell-id">#{row.id}</span> },
    { header: "Nome", render: (row) => row.name },
    { header: "Email", render: (row) => <span className="mono">{row.email}</span> },
    {
      header: "Nickname",
      render: (row) => (row.nickname ? row.nickname : <span style={{ color: "var(--muted-soft)" }}>—</span>),
    },
    { header: "Criado em", render: (row) => formatDate(row.createdAt) },
  ],
  fields: (mode) => [
    { name: "name", label: "Nome", required: true, full: true },
    { name: "email", label: "Email", required: true, full: true, mono: true },
    { name: "nickname", label: "Nickname (opcional)" },
    {
      name: "password",
      label: mode === "create" ? "Senha" : "Nova senha (opcional)",
      type: "password",
      required: mode === "create",
      minLength: 8,
      hint: "Mínimo de 8 caracteres.",
    },
  ],
  toValues: (row) => ({
    name: row?.name ?? "",
    email: row?.email ?? "",
    nickname: row?.nickname ?? "",
    password: "",
  }),
  toCreateDto: (v) => ({
    name: v.name.trim(),
    email: v.email.trim(),
    nickname: v.nickname.trim() || undefined,
    password: v.password,
  }),
  toUpdateDto: (v) => {
    const dto: UpdateUserDto = {
      name: v.name.trim(),
      email: v.email.trim(),
      nickname: v.nickname.trim() || undefined,
    };
    if (v.password) dto.password = v.password;
    return dto;
  },
};

export function UsersPage() {
  return (
    <CrudPage
      eyebrow="Acesso"
      title="Usuários"
      description="Contas com acesso ao console. Email e nickname são únicos."
      config={config}
    />
  );
}
