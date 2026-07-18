# 004 — Plano técnico (Cobertura de testes)

Referência: [spec.md](spec.md) · [constituição](../000-constitution.md)

## Abordagem

Seguir o padrão de teste já usado no projeto: services instanciados **diretamente** com
repositórios/deps mockados via `jest.fn()` (sem `Test.createTestingModule` para unit),
espelhando `brands.service.spec.ts`. e2e estende o módulo mockado de `auth.e2e-spec.ts`.

## Arquivos

### Novo: `src/modules/users/users.service.spec.ts`

Mockar `Repository<User>` com `Pick<..., "create" | "findAndCount" | "findOne" | "save" | "remove">`.
Casos RF1.1–RF1.8. Pontos de atenção:

- **RF1.1**: espiar que o objeto salvo tem `passwordHash` != senha crua (bcrypt) e que a
  resposta **não** contém `passwordHash`. Usar `bcrypt.compare` para confirmar o hash.
- **RF1.5**: `findAndCount` retorna `[users, total]`; assertar `data` sem `passwordHash` e
  `meta` correta (reusar expectativa do envelope).
- **RF1.7**: casos separados — muda só nome; muda email para um livre; muda email para um
  ocupado (409); muda senha (re-hash); email igual ao atual (não checa unicidade).

### Editar: `src/modules/models/models.service.spec.ts`

Adicionar:

- **RF2.1**: `create` com `brandsRepository.findOne` → `null` ⇒ `NotFoundException`.
- **RF2.2**: `update` com novo `brandId`; `brandsRepository.findOne` → marca ⇒ troca;
  → `null` ⇒ `NotFoundException`.
- **RF2.3**: `findAll(page, limit)` com `modelsRepository.findAndCount` ⇒ envelope; assertar
  `skip/take/relations/order`. Ajustar o mock de repositório para incluir `findAndCount`.

### Editar: `src/modules/brands/brands.service.spec.ts`

- **RF3.1**: `findAll(page, limit)` com `findAndCount` ⇒ envelope; assertar `skip/take`.
  Incluir `findAndCount` no mock do repositório.

### Editar: `test/auth.e2e-spec.ts` (ou novo `test/validation.e2e-spec.ts`)

Estender o módulo e2e existente (já tem `VehiclesController` e `ValidationPipe`):

- **RF4.1**: `POST /vehicles` `year: 1800` ⇒ 400.
- **RF4.2**: `POST /vehicles` com `color: "red"` ⇒ 400.
- **RF4.3**: adicionar `UsersController` + `UsersService` mock ao módulo e testar
  `POST /users` sem `name` ⇒ 400 e senha curta ⇒ 400.

> Preferência: manter no `auth.e2e-spec.ts` para reusar o setup (token/login helpers),
> evitando duplicar bootstrap. Adicionar `UsersController`/`UsersService` mock ao módulo.

## Verificação de bugs (RNF1)

Se `UsersService` (ou outro) revelar um bug real durante a escrita dos testes:

1. Parar e registrar o achado.
2. Corrigir como item explícito (mini-entrada no tasks.md), com o teste provando o fix.
3. Não silenciar o teste para "passar".

## Riscos e mitigações

| Risco                                                | Mitigação                                        |
| ---------------------------------------------------- | ------------------------------------------------ |
| Mock de `bcrypt` divergir do real                    | Não mockar bcrypt; usar o real (rápido, cost 10) |
| Alterar mock de repо quebrar casos existentes        | Só **adicionar** métodos ao `Pick`, não remover  |
| e2e de users exigir muitos mocks                     | Mock mínimo de `UsersService` (só o usado)       |

## Verificação

1. `make test` → todos os unit verdes, incluindo o novo `users.service.spec.ts`.
2. `make test-e2e` → e2e verdes com os novos casos de validação.
3. `tsc --noEmit` limpo.

## Definição de pronto

Critérios de aceite marcados + `make test-all` verde + status 004 no `specs/README.md` +
nota de fechamento nas tasks.
