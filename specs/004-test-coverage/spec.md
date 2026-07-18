# 004 — Cobertura de testes

**Status:** ✅ Concluída · **Depende de:** 002 (paginação) · **Habilita:** 005 (front sobre base testada)

## Problema

A cobertura atual tem buracos que violam o Artigo IV da
[constituição](../000-constitution.md) ("toda regra de negócio tem teste unitário"):

- **`UsersService` não tem nenhum teste** — apesar de conter regras críticas: unicidade de
  email e nickname, hash de senha, ocultação do hash na resposta, atualização parcial.
- A **paginação** (`findAll` de users/brands/models) não é asserida nos services — só o
  helper puro e o `VehiclesService` cobrem paginação.
- `ModelsService.create` **não testa** o caminho de marca inexistente (**404**) nem a troca
  de marca no update.
- A **validação de DTO** (year fora de faixa, `whitelist`/`forbidNonWhitelisted`) não tem
  teste e2e — só os "required" de model/vehicle.

## Objetivo

Fechar os buracos de cobertura das regras de negócio já existentes, sem alterar
comportamento de produção. Cada regra da camada de service com um teste; as validações de
entrada críticas com um teste e2e passando pela `ValidationPipe` real.

## Escopo

Incluído:

- Suíte unit completa de `UsersService`.
- Complemento de `ModelsService` (create com marca inexistente, update trocando marca,
  paginação).
- Complemento de `BrandsService` (paginação).
- e2e de validação de entrada (year fora de faixa; rejeição de campo não declarado;
  required de user).

Fora de escopo:

- Testes de infra (Redis/RabbitMQ/Mongo reais) — os services já degradam com aviso e são
  mockados; conexões reais ficam para o teste de carga (006).
- Cobertura dos controllers finos (delegam ao service, já exercidos por unit+e2e).
- Meta numérica de % de cobertura — foco em **regras**, não em porcentagem.

## Requisitos funcionais (casos a cobrir)

### `UsersService` (RF1)

- **RF1.1** — `create` faz hash bcrypt da senha e retorna resposta **sem** `passwordHash`.
- **RF1.2** — `create` lança **409** quando email já existe.
- **RF1.3** — `create` lança **409** quando nickname já existe (quando informado).
- **RF1.4** — `create` sem nickname (opcional) funciona e não checa unicidade de nickname.
- **RF1.5** — `findAll` retorna envelope paginado (`data` mapeada sem hash + `meta`).
- **RF1.6** — `findOne` retorna usuário; lança **404** quando não existe.
- **RF1.7** — `update` altera só os campos enviados; re-hash quando senha muda; **404** se
  não existe; **409** se novo email/nickname colide; não checa unicidade quando o valor não
  muda.
- **RF1.8** — `remove` remove; lança **404** quando não existe.

### `ModelsService` (RF2)

- **RF2.1** — `create` lança **404** quando `brandId` não existe.
- **RF2.2** — `update` troca a marca revalidando existência; **404** se a nova marca não
  existe.
- **RF2.3** — `findAll` retorna envelope paginado com a marca (`relations: { brand }`).

### `BrandsService` (RF3)

- **RF3.1** — `findAll` retorna envelope paginado (skip/take corretos, `meta`).

### Validação de entrada e2e (RF4)

- **RF4.1** — `POST /vehicles` com `year` fora de [1900, ano+1] → **400**.
- **RF4.2** — `POST /vehicles` com campo não declarado (ex.: `color`) → **400**
  (`forbidNonWhitelisted`).
- **RF4.3** — `POST /users` sem `name` ou com senha < 8 chars → **400**.

## Requisitos não-funcionais

- **RNF1** — Zero mudança em código de produção (feature só adiciona testes). Se um teste
  revelar um bug, o ajuste vira item explícito e justificado.
- **RNF2** — Testes determinísticos, isolados (repos/deps mockados), rápidos.
- **RNF3** — Rodam com `make test` / `make test-e2e` sem serviços externos reais.

## Critérios de aceite

- [ ] `UsersService` tem spec cobrindo RF1.1–RF1.8.
- [ ] `ModelsService` cobre create-404, update-troca-marca e paginação.
- [ ] `BrandsService` cobre paginação.
- [ ] e2e cobre year fora de faixa, campo não permitido e required de user.
- [ ] `make test` e `make test-e2e` verdes; nenhuma regressão nos testes existentes.

## Cobertura resultante esperada

Todas as regras de negócio dos 4 services de domínio + auth + audit com teste unitário; os
fluxos HTTP críticos (auth, guards, paginação, validação) com e2e.
