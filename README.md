# Task API

A RESTful CRUD API built with **Node.js, Express and PostgreSQL**, containerized with **Docker Compose**.

This project was developed as part of the Backend AI Engineering Week 3 assignment. It provides endpoints to create, read, update and delete tasks stored in a PostgreSQL database.

## Technologies

* Node.js
* Express
* PostgreSQL
* Docker
* Docker Compose
* Swagger / OpenAPI

## Prerequisites

Before running the project, make sure you have:

* Docker Desktop installed
* Git installed

No local PostgreSQL installation or manual database setup is required.

## One-Command Setup

Clone the repository:

```bash
git clone https://github.com/asmaebihkak24/week2-crud-api.git
cd week2-crud-api
```

Create the environment file from the example:

### PowerShell

```powershell
Copy-Item .env.example .env
```

### Linux / macOS

```bash
cp .env.example .env
```

Then start the complete stack:

```bash
docker compose up
```

Docker Compose automatically starts:

* the PostgreSQL database;
* the Node.js API;
* the required network;
* the database initialization.

No manual database creation or SQL setup is required.

The API will be available at:

```text
http://localhost:3000
```

Swagger UI:

```text
http://localhost:3000/docs
```

## Environment Variables

The project uses a `.env` file for configuration.

The `.env.example` file contains the required variable:

```env
DATABASE_URL=postgres://postgres:dev@localhost:5432/tasks
```

Copy `.env.example` to `.env` before starting the application.

The `.env` file is intentionally excluded from Git through `.gitignore`.

## Database

The application uses **PostgreSQL** running inside Docker.

The database is configured by Docker Compose with:

* Database: `tasks`
* User: `postgres`
* Password: `dev`
* Port: `5432`

The database data is persisted through a Docker volume.

### Check the database

After starting the stack, open a PostgreSQL shell inside the database container:

```bash
docker compose exec db psql -U postgres -d tasks
```

List the tables:

```sql
\dt
```

Expected result includes:

```text
tasks
```

Display the stored tasks:

```sql
SELECT * FROM tasks;
```

Example result:

```text
 id |              title              | done
----+---------------------------------+------
  1 | Learn Express                   | f
  2 | Study SQLite                    | f
  3 | Build CRUD API                  | f
  4 | Docker Compose Persistence Test | f
```

The database contains the seeded tasks and the API reads them directly from PostgreSQL.

Exit PostgreSQL with:

```sql
\q
```

## API Endpoints

| Method | Endpoint     | Description             | Success          |
| ------ | ------------ | ----------------------- | ---------------- |
| GET    | `/`          | API information         | `200 OK`         |
| GET    | `/health`    | Health check            | `200 OK`         |
| GET    | `/tasks`     | Get all tasks           | `200 OK`         |
| GET    | `/tasks/:id` | Get one task            | `200 OK`         |
| POST   | `/tasks`     | Create a new task       | `201 Created`    |
| PUT    | `/tasks/:id` | Update an existing task | `200 OK`         |
| DELETE | `/tasks/:id` | Delete a task           | `204 No Content` |

### Error responses

* `400 Bad Request` — invalid or missing task data
* `404 Not Found` — task does not exist

## Example Requests

### Get all tasks

```bash
curl -i http://localhost:3000/tasks
```

Example response:

```text
HTTP/1.1 200 OK
```

```json
[
  {
    "id": 1,
    "title": "Learn Express",
    "done": false
  },
  {
    "id": 2,
    "title": "Study SQLite",
    "done": false
  },
  {
    "id": 3,
    "title": "Build CRUD API",
    "done": false
  },
  {
    "id": 4,
    "title": "Docker Compose Persistence Test",
    "done": false
  }
]
```

### Create a task

```bash
curl -i -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"New Task\"}"
```

### Get one task

```bash
curl -i http://localhost:3000/tasks/1
```

### Update a task

```bash
curl -i -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Updated Task\",\"done\":true}"
```

### Delete a task

```bash
curl -i -X DELETE http://localhost:3000/tasks/1
```

## Swagger UI

Interactive API documentation is available at:

```text
http://localhost:3000/docs
```

The OpenAPI specification is stored in `openapi.json`.

## Round-Trip Verification

The complete application can be tested from a clean clone without manually creating the database.

### Step 1 — Clone

```bash
git clone https://github.com/asmaebihkak24/week2-crud-api.git
cd week2-crud-api
```

### Step 2 — Create `.env`

PowerShell:

```powershell
Copy-Item .env.example .env
```

Linux / macOS:

```bash
cp .env.example .env
```

### Step 3 — Start everything

```bash
docker compose up
```

### Step 4 — Verify the API

In another terminal:

```bash
curl -i http://localhost:3000/tasks
```

Expected:

```text
HTTP/1.1 200 OK
```

followed by the seeded tasks.

### Step 5 — Verify PostgreSQL

```bash
docker compose exec db psql -U postgres -d tasks
```

Then:

```sql
\dt
```

and:

```sql
SELECT * FROM tasks;
```

This confirms the complete round-trip:

```text
GitHub repository
       ↓
.env.example
       ↓
.env
       ↓
docker compose up
       ↓
PostgreSQL + API
       ↓
GET /tasks
       ↓
Seeded tasks returned
```

No manual database setup is required.

## Stage 7: AI vs Me

### 1. What did the AI do better?

* **Deployment anticipation:** The AI used `const PORT = process.env.PORT || 3000;` to configure the port. This prepares the API to be hosted on a cloud server.
* **DRY (Don't Repeat Yourself) principle:** It created a utility function `findTaskIndex(id)` to avoid repeating the search logic in the GET, PUT, and DELETE routes.
* **Strict type validation:** The AI added type checks such as `typeof done === 'boolean'` to ensure that received data matches the expected format.

### 2. What did the AI miss or ignore from my prompt?

* **Swagger implementation:** Instead of using a clean external file (`openapi.json`), the AI initially overloaded `server.js` with long blocks of comments, making the code less readable.

### 3. What did I forget to specify in my prompt?

* **Error message format:** I did not specify the exact JSON structure to return in case of an error. The AI therefore chose to return a `{ message: "..." }` object, whereas I used `{ error: "..." }`.
* **Strict key naming:** I did not explicitly forbid the AI from translating the object's properties, which led to the `title`/`titre` inconsistency.
