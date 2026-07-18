# Task API

A simple CRUD API built with Node.js and Express.

This project was developed as part of the Backend AI Engineering Week 2 assignment. It provides a REST API to create, read, update and delete tasks using an in-memory array.

## Installation

Clone the repository:

```bash
git clone https://github.com/asmaebihkak24/week2-crud-api.git
```

Go to the project folder:

```bash
cd week2-crud-api
```

Install dependencies:

```bash
npm install
```

## Run the server

Start the server:

```bash
node server.js
```

The server runs on:

```
http://localhost:3000
```

Swagger UI:

```
http://localhost:3000/docs
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information |
| GET | `/health` | Health check |
| GET | `/tasks` | Get all tasks |
| GET | `/tasks/{id}` | Get one task |
| POST | `/tasks` | Create a new task |
| PUT | `/tasks/{id}` | Update a task |
| DELETE | `/tasks/{id}` | Delete a task |

## Example curl

Request:

```bash
curl -i http://localhost:3000/tasks
```

Response:

```json
[
  {
    "id": 1,
    "title": "Learn Express",
    "done": false
  }
]
```

## Swagger UI

The API documentation is available through Swagger UI:

```
http://localhost:3000/docs
```

Screenshot:

![Swagger UI](swagger.png)
## Stage 7: AI vs me

**1. What did the AI do better ?**
* **Deployment anticipation:** The AI used `const PORT = process.env.PORT || 3000;` to configure the port. This is an excellent practice that prepares the API to be hosted on a cloud server.
* **DRY (Don't Repeat Yourself) principle:** It created a utility function `findTaskIndex(id)` to avoid repeating the search logic in the GET, PUT, and DELETE routes.
* **Strict type validation:** The AI added type checks (e.g., `typeof done === 'boolean'`) to ensure that the received data matches what is expected.

**2. What did the AI miss or ignore from my prompt?**
* **Swagger implementation:** Instead of using a clean external file (`openapi.json`), the AI overloaded the `server.js` file with long blocks of comments, making the code less readable.

**3. What did I forget to specify in my prompt?**
* **Error message format:** I did not specify the exact JSON structure to return in case of an error. The AI therefore chose to return a `{ message: "..." }` object, whereas I used `{ error: "..." }`.
* **Strict key naming:** I didn't explicitly forbid the AI from translating the object's properties, which led to the `title`/`titre` inconsistency.
