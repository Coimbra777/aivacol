# Desafio Info

Backend technical test for the Aivacol Fleet Management Platform.

## Requirements

- Docker
- Docker Compose
- Make

## Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Main local addresses:

- API: `http://localhost:3000`
- SQL Server: `localhost:1433`
- Redis: `localhost:6379`

## Project Setup

Run the full local setup:

```bash
make setup
```

This command will:

1. start the containers
2. create the `desafio_info` database if needed
3. run migrations
4. run the seed

## Make Commands

```bash
make up
make database
make migrate
make seed
make setup
make logs
make down
make reset
make build
```

What each command does:

- `make up`: starts the containers with Docker Compose
- `make database`: creates the application database if it does not exist
- `make migrate`: runs TypeORM migrations
- `make seed`: runs the initial seed
- `make setup`: runs the full flow (`up`, `database`, `migrate`, `seed`)
- `make logs`: shows API logs
- `make down`: stops the containers
- `make reset`: stops the containers and removes volumes
- `make build`: runs `npm run build` inside the API container

## Login Test

Use the seeded user to test authentication:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"aivacol@example.com","password":"ChangeMe123!"}'
```

Expected response:

```json
{
  "accessToken": "TOKEN_JWT",
  "tokenType": "Bearer"
}
```

## DBeaver Validation

Use these connection settings:

- Host: `localhost`
- Port: `1433`
- Database: `desafio_info`
- User: `sa`
- Password: `YourStrong!Passw0rd`

After connecting, you can validate the seed with:

```sql
SELECT * FROM users;
```

You should see the `aivacol` user.
