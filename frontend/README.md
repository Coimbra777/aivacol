# Aivacol · Fleet Console (frontend)

Painel administrativo SPA (React 18 + Vite + TypeScript) para a API de gestão de frotas
Aivacol. Consome o contrato REST paginado (ver [Swagger](http://localhost:3000/api/swagger)).

## Stack

- React 18 + Vite + TypeScript
- React Router (rotas) · TanStack Query (estado de servidor, paginação, cache)
- Axios (interceptors de JWT e 401)
- Design system próprio (CSS) — sem lib de componentes; fontes self-hosted via `@fontsource`

## Funcionalidades

- Login JWT, rotas protegidas, logout automático em `401`
- Painel com totais por recurso (lidos de `meta.total`)
- CRUD paginado de **usuários, marcas, modelos e veículos**
- Selects encadeados (modelo → marca, veículo → modelo)
- Auditoria read-only (lista + detalhe do payload)
- Tratamento das mensagens de erro da API (400/401/404/409)

## Como rodar

Pré-requisito: a API no ar (`make setup` na raiz do projeto) e CORS liberando `:5173`
(já configurado via `CORS_ORIGIN`).

```bash
cd frontend
cp .env.example .env      # ajuste VITE_API_BASE_URL se necessário
npm install
npm run dev               # http://localhost:5173
```

Login inicial (seed): `aivacol@example.com` / `ChangeMe123!`.

## Scripts

```bash
npm run dev         # servidor de desenvolvimento
npm run build       # type-check (tsc -b) + bundle de produção
npm run preview     # serve o build
npm run typecheck   # apenas type-check
```

## Configuração

| Variável            | Função                        |
| ------------------- | ----------------------------- |
| `VITE_API_BASE_URL` | URL base da API (default `http://localhost:3000`) |
