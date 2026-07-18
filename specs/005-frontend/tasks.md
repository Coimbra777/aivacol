# 005 — Tasks (Frontend)

Cada task referencia o requisito da [spec.md](spec.md). Marcar ao concluir.

## Scaffold & infra

- [x] **T1** — Scaffold `frontend/` (Vite React-TS) + deps (router, react-query, axios). _(RNF2)_
- [x] **T2** — `.env.example` (`VITE_API_BASE_URL`) + `vite.config.ts`. _(RNF3)_
- [x] **T3** — Design system base: `styles/theme.css` (console de frota: navy + âmbar + mono). _(RNF4)_
- [x] **T4** — `types/api.ts` (entidades + `Paginated<T>`). _(RNF1)_
- [x] **T5** — `lib/api.ts` axios + interceptors (JWT, 401→logout). _(RF3)_
- [x] **T6** — CORS no backend `main.ts` (`CORS_ORIGIN`) + `.env`.

## Auth & layout

- [x] **T7** — `AuthContext` + `ProtectedRoute` (token em localStorage, decode do JWT). _(RF1, RF2)_
- [x] **T8** — `LoginPage` (split navy/form → login → redirect; erro 401). _(RF1)_
- [x] **T9** — `Layout` + trilha de navegação + topbar (logout). _(RF2)_

## Componentes reutilizáveis

- [x] **T10** — `Modal`, `Pagination`, `ui` (Spinner, Empty, Error, Plate, Tag) e o motor
      genérico `CrudPage` (form + delete + erros). _(RF4, RF5, RF6, RF10)_
- [x] **T11** — Paginação via TanStack Query (`keepPreviousData`) no `CrudPage`/audit. _(RF4)_

## Recursos

- [x] **T12** — Dashboard (totais via `meta.total`, `useQueries`). _(RF9)_
- [x] **T13** — Users: lista paginada + criar/editar/excluir + validação. _(RF4, RF5, RF6)_
- [x] **T14** — Brands: idem + 409 de integridade tratado no banner. _(RF4, RF5, RF6)_
- [x] **T15** — Models: idem + select de brand (query de opções). _(RF4–RF7)_
- [x] **T16** — Vehicles: idem + select de model + regras (year, uppercase). _(RF4–RF7)_
- [x] **T17** — Audit: lista paginada read-only + detalhe (payload). _(RF8)_

## Fechamento

- [x] **T18** — `npm run build` limpo (tsc -b + vite build; fontes self-hosted, sem CDN). _(RNF2, RNF5)_
- [x] **T19** — Verificação manual contra a API real via Chrome headless (puppeteer):
      login, painel 50k, tabela 50k, formulário, auditoria — screenshots conferidos.
- [x] **T20** — `frontend/README.md` + nota no `docs/DOCUMENTACAO.md`; status 005 ✅ no
      `specs/README.md`.
- [ ] **T21** — (Opcional/adiado) `frontend/Dockerfile` + serviço `web` no compose. App já
      roda via `npm run dev`; container fica como incremento futuro.
