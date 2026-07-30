# Exercise 2 — Add Routes to Your Expenses API

In this exercise you'll add the first set of HTTP routes to your Express app. You'll create a dedicated router file for the `expenses` resource and return **static JSON responses** for now — no database or business logic yet.

---

## The Expense Object

Every route that returns expense data should use this structure:

```json
{
  "id": 1,
  "date": "20-10-2026",
  "description": "Lunch with a client",
  "user": "Joe Bloggs"
}
```

---

## Your Task

### 1. Create a router file

Create a new file at `src/routes/expenseRouter.ts`.

This file should define all the routes for the expenses resource. Refer back to the slides for the basic router structure.

### 2. Add the following routes

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| `GET` | `/expenses` | Get all expenses | Array with at least two expense objects |
| `GET` | `/expenses/:id` | Get a single expense | A single expense object |
| `POST` | `/expenses` | Create a new expense | The static expense object with a success status |
| `PUT` | `/expenses/:id` | Update an expense | The updated static expense object |
| `DELETE` | `/expenses/:id` | Delete an expense | Successful no response body |

> All responses should use hardcoded static data for now — you don't need to read from `req.body` or a database yet.

### 3. Register your router in `index.ts`

Mount your expense router under `/api` so routes are available at `/api/expenses`.

Refer to the **Registering Your Router** slide for the exact code.

---

## Expected Behaviour

Once complete, test each route in **Insomnia or Postman**:

```
GET     http://localhost:3000/api/expenses
GET     http://localhost:3000/api/expenses/1
POST    http://localhost:3000/api/expenses
PUT     http://localhost:3000/api/expenses/1
DELETE  http://localhost:3000/api/expenses/1
```

- `GET /api/expenses` should return a JSON array
- `GET /api/expenses/1` should return a single JSON object
- `POST /api/expenses` should return `201 Created` with the expense object
- `PUT /api/expenses/1` should return `200 OK` with the expense object
- `DELETE /api/expenses/1` should return `204 No Content` with no body

---

## Tips

- Create the `src/routes/` folder if it doesn't already exist
- Make sure `express.json()` middleware is applied in `index.ts` before your router
- Use `res.status(201).json(...)` to set both the status code and body together
- For `DELETE`, use `res.status(204).send()` — no `.json()` call needed
- Test **every** route before moving on to the next exercise
