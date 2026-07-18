# 004 — Tasks (Cobertura de testes)

Cada task referencia o requisito da [spec.md](spec.md). Marcar ao concluir.

## UsersService (novo spec — 11 casos)

- [x] **T1** — `users.service.spec.ts`: `create` faz hash e oculta `passwordHash`. _(RF1.1)_
- [x] **T2** — `create` 409 email / 409 nickname / sem nickname ok. _(RF1.2, RF1.3, RF1.4)_
- [x] **T3** — `findAll` envelope paginado sem hash. _(RF1.5)_
- [x] **T4** — `findOne` ok / 404. _(RF1.6)_
- [x] **T5** — `update`: parcial, re-hash de senha, 404, 409, sem checagem quando não muda. _(RF1.7)_
- [x] **T6** — `remove` ok / 404. _(RF1.8)_

## ModelsService (complemento — 4 casos)

- [x] **T7** — `create` 404 quando `brandId` inexistente. _(RF2.1)_
- [x] **T8** — `update` troca marca (ok e 404). _(RF2.2)_
- [x] **T9** — `findAll` envelope paginado com `brand`. _(RF2.3)_

## BrandsService (complemento — 1 caso)

- [x] **T10** — `findAll` envelope paginado (skip/take). _(RF3.1)_

## Validação e2e (4 casos)

- [x] **T11** — `POST /vehicles` year fora de faixa → 400. _(RF4.1)_
- [x] **T12** — `POST /vehicles` campo não declarado → 400. _(RF4.2)_
- [x] **T13** — `POST /users` sem name / senha curta → 400 (`UsersController` no módulo e2e). _(RF4.3)_

## Fechamento

- [x] **T14** — `tsc --noEmit` limpo + **82 testes verdes (60 unit + 22 e2e)**.
- [x] **T15** — Status 004 ✅ em `specs/README.md`.

Nenhum bug de produção foi revelado pelos novos testes (RNF1 respeitado — zero mudança em
código de produção).
