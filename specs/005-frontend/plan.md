# 005 — Plano técnico (Frontend)

Referência: [spec.md](spec.md) · [constituição](../000-constitution.md)

## Stack e dependências

Diretório `frontend/` (Vite React-TS). Dependências:

- runtime: `react`, `react-dom`, `react-router-dom`, `@tanstack/react-query`, `axios`.
- dev: `vite`, `@vitejs/plugin-react`, `typescript`, `@types/*`.

Sem lib de componentes; CSS próprio com variáveis (design system enxuto).

## Estrutura de pastas

```
frontend/
  index.html
  vite.config.ts
  tsconfig.json
  .env.example                 # VITE_API_BASE_URL
  src/
    main.tsx                   # providers: QueryClient, Router, Auth
    App.tsx                    # rotas
    styles/                    # theme.css (variáveis), base
    lib/
      api.ts                   # axios instance + interceptors (JWT, 401)
      queryClient.ts
    types/
      api.ts                   # User, Brand, Model, Vehicle, AuditLog, Paginated<T>
    auth/
      AuthContext.tsx          # token, login, logout
      ProtectedRoute.tsx
    components/
      Layout.tsx  Sidebar.tsx  Topbar.tsx
      DataTable.tsx  Pagination.tsx  Modal.tsx  ConfirmDialog.tsx
      Field.tsx  Button.tsx  Spinner.tsx  EmptyState.tsx  ErrorBanner.tsx
    hooks/
      usePaginatedQuery.ts     # helper de listagem paginada
    features/
      auth/LoginPage.tsx
      dashboard/DashboardPage.tsx
      users/…  brands/…  models/…  vehicles/…  audit/…
        (cada um: api.ts com as chamadas, hooks de query/mutation, Page + Form)
```

## Camada de API (RNF1, RNF3)

- `api.ts`: `axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL })`.
  - request interceptor: injeta `Authorization` do token salvo.
  - response interceptor: em `401`, limpa token e redireciona a `/login`.
- `types/api.ts`: `Paginated<T> = { data: T[]; meta: {...} }` + entidades espelhando o
  backend (sem `passwordHash`).
- Por recurso: `list(params)`, `getOne(id)`, `create(dto)`, `update(id, dto)`, `remove(id)`.

## Estado de servidor (TanStack Query)

- `usePaginatedQuery(key, fetcher, {page, limit})` → dados + meta + loading/error.
- Mutations (create/update/remove) invalidam a query-key da lista → RF5.
- Dashboard: 4 queries `limit=1` lendo `meta.total` → RF9.

## Autenticação (RF1–RF3)

- `AuthContext`: guarda token em `localStorage` (`aivacol_token`), expõe `login/logout` e
  `isAuthenticated`.
- `LoginPage`: form → `POST /auth/login` → salva token → navega `/`.
- `ProtectedRoute`: sem token → `<Navigate to="/login" />`.
- 401 no interceptor → `logout()` + redireciona.

## Roteamento

```
/login                → LoginPage (público)
/ (Layout protegido)  → Dashboard
  /users              → UsersPage
  /brands             → BrandsPage
  /models             → ModelsPage
  /vehicles           → VehiclesPage
  /audit              → AuditPage
```

## Componentes de UI

- `DataTable` genérico (colunas + linhas + ações), `Pagination` (prev/next, página, total),
  `Modal` + `ConfirmDialog` para formulários e exclusão, `Field` (label+input+erro),
  `ErrorBanner` (mensagem da API). Design: sidebar escura, conteúdo claro, densidade de
  tabela confortável. Detalhes de estética via skill `frontend-design` na implementação.

## Formulários e regras (regras de negócio)

- Validação client-side espelhando o backend (required, min/max de `year`, senha ≥ 8).
- Uppercase de placa/chassi no submit.
- Erros do backend (400/409/404) exibidos no `ErrorBanner` do form/página.

## Dockerização (opcional, tarefa própria)

- `frontend/Dockerfile` (build Vite → nginx) e serviço `web` no `docker-compose.yml`.
- Se o tempo apertar, entregar o app rodável via `npm run dev` (primário) e deixar o
  container como incremento.

## Riscos e mitigações

| Risco                                             | Mitigação                                        |
| ------------------------------------------------- | ------------------------------------------------ |
| CORS entre Vite (5173) e API (3000)               | Habilitar CORS na API (ajuste mínimo no main.ts) ou proxy do Vite |
| Escopo grande demais numa tacada                  | Entregar por camadas: infra→auth→layout→recursos→audit |
| Divergência de tipos com o backend                | `types/api.ts` central; conferir contra `/api/swagger-json` |

> **Ajuste no backend previsto:** habilitar CORS no `main.ts` (origem do front) — mudança
> pequena e necessária para o SPA consumir a API do browser. Será registrada como task.

## Verificação

1. `npm run build` no `frontend/` (type-check + bundle) sem erros.
2. Subir API (`make up` + migrate + seed) e `npm run dev`; validar os critérios de aceite
   manualmente (login, paginação 50k, CRUD, 409, audit) com screenshots.

## Definição de pronto

Critérios de aceite marcados + build limpo + validação manual contra a API real + CORS
habilitado + `.env.example` do front + docs/README apontando o frontend + status 005 no
`specs/README.md`.
