# 005 — Frontend React + Vite

**Status:** ✅ Concluída · **Depende de:** 001 (contrato), 002 (paginação) · **Habilita:** —

## Problema

A plataforma só tem backend. Não há interface para operar a frota: hoje só via `curl`,
Postman ou Swagger. Falta um painel administrativo que exponha a cadeia
Brand→Model→Vehicle, autenticação, listas paginadas em escala e a auditoria — consumindo o
contrato já estável e documentado.

## Objetivo

Um painel administrativo SPA (React 18 + Vite + TypeScript) que consome a API REST,
cobrindo login JWT, CRUD dos 4 recursos, listagens paginadas e leitura de auditoria, com
UX clara e estados de carregamento/erro tratados.

## Decisões de stack (travadas)

- **React 18 + Vite + TypeScript**, SPA desacoplada (diretório `frontend/`).
- **React Router** para rotas; **TanStack Query** para estado de servidor (cache,
  paginação, invalidação); **Axios** com interceptors para JWT.
- **Sem biblioteca de componentes pesada** — design system enxuto próprio (CSS com
  variáveis, componentes reutilizáveis), para uma identidade intencional e bundle leve.
- Autenticação: token JWT em `localStorage`, `AuthContext`, rotas protegidas; interceptor
  desloga em `401`.
- Base URL da API por env do Vite (`VITE_API_BASE_URL`, default `http://localhost:3000`).

## Escopo

Incluído:

- **Login** (`/login`) — email/senha → `POST /auth/login`; guarda token; redireciona.
- **Layout autenticado** — sidebar de navegação + header com usuário e logout.
- **Dashboard** (`/`) — cartões-resumo (totais de cada recurso via `meta.total`).
- **Users** — listar (paginado), criar, editar, excluir.
- **Brands** — listar (paginado), criar, editar, excluir (tratar 409 de integridade).
- **Models** — listar (paginado, com marca), criar (select de marca), editar, excluir.
- **Vehicles** — listar (paginado, com modelo), criar (select de modelo), editar, excluir.
- **Audit** — listar (paginado, read-only) + ver detalhe (payload/evento).
- **Paginação** reutilizável consumindo `{ data, meta }`.
- **Tratamento de erros da API** — mensagens de 400/401/404/409 exibidas ao usuário.
- **Validação de formulário** espelhando as regras do backend (obrigatórios, min/max).

Fora de escopo:

- SSR (é SPA).
- Gestão de permissões/perfis (backend não tem RBAC).
- Testes E2E de browser (Cypress/Playwright) — validação manual + build; testes de UI ficam
  para evolução futura.
- i18n (interface em pt-BR direto).

## Requisitos funcionais

- **RF1** — Login válido guarda o `accessToken` e navega para o dashboard; inválido mostra
  "Credenciais inválidas".
- **RF2** — Rotas de recurso são protegidas: sem token → redireciona para `/login`.
- **RF3** — Toda requisição autenticada envia `Authorization: Bearer <token>`; resposta
  `401` limpa a sessão e volta ao login.
- **RF4** — Cada recurso lista em tabela paginada (controles de página, itens por página,
  total), consumindo `?page/?limit` e o envelope `{ data, meta }`.
- **RF5** — Criar/editar via formulário em modal ou página; sucesso atualiza a lista
  (invalidação de cache do TanStack Query).
- **RF6** — Excluir pede confirmação; erros de integridade (409) e não-encontrado (404) são
  exibidos sem quebrar a UI.
- **RF7** — Models e Vehicles têm selects populados por brands/models (cadeia coerente).
- **RF8** — Audit é read-only: lista + detalhe com evento, entidade, payload e data.
- **RF9** — Dashboard mostra os totais de users/brands/models/vehicles (via `meta.total`
  com `limit=1`).
- **RF10** — Estados de carregamento (spinners/skeletons) e vazio ("nenhum registro")
  tratados em todas as listas.

## Requisitos não-funcionais

- **RNF1** — Tipos TypeScript espelhando o contrato (entidades e envelope paginado).
- **RNF2** — `npm run build` do frontend sem erros de type-check.
- **RNF3** — Base URL configurável por env (sem hardcode de host).
- **RNF4** — Design responsivo (desktop-first, utilizável em telas menores), com uma
  identidade visual coerente (não template genérico).
- **RNF5** — Sem chamadas a hosts externos em runtime além da API (sem CDNs de fonte/JS).

## Regras de negócio refletidas na UI

- Placa/chassi normalizados para maiúsculas (como o backend faz) — refletir no input.
- `year` entre 1900 e ano+1 (validação no form).
- Campos únicos: exibir a mensagem 409 do backend ("Email already exists" etc.).
- Excluir brand com models / model com vehicles: exibir o 409 de integridade.

## Critérios de aceite

- [ ] Login com o usuário do seed entra no painel; logout volta ao login.
- [ ] Sem token, acessar `/vehicles` redireciona para `/login`.
- [ ] Listas paginam de verdade sobre os ~50k veículos (troca de página muda os dados).
- [ ] Criar/editar/excluir cada recurso reflete na lista sem reload manual.
- [ ] Criar model exige selecionar brand; criar vehicle exige selecionar model.
- [ ] Excluir uma brand com models mostra a mensagem de conflito (409).
- [ ] Audit lista e abre o detalhe de um log.
- [ ] `npm run build` passa (type-check + bundle).

## Verificação

- Build de produção do Vite sem erros.
- App rodando contra a API real: login, navegar, paginar 50k, CRUD, 409 de integridade,
  auditoria — validado manualmente (screenshots/registro).
