# Exercise 3 — Controllers & Services

In this exercise you'll refactor your expenses routes to follow the **MVC pattern**. Right now your routes contain inline logic and hardcoded data. You'll move that into dedicated `ExpenseController` and `ExpenseService` classes, keeping routes thin and each class focused on a single responsibility.

---

## What You're Building

By the end of this exercise your project structure should look like this:

```
src/
├── controllers/
│   └── expenseController.ts   ← NEW
├── routes/
│   └── expenseRouter.ts       ← UPDATE (thin routes only)
├── services/
│   └── expenseService.ts      ← NEW
└── index.ts
```

> Typing will be introduced in the next exercise. For now, use `any` where you need a type.

---

## Step 1 — Create the ExpenseService

Create a new file at `src/services/expenseService.ts`.

The service is responsible for **data access** — in this case a mock in-memory array. It should have no knowledge of `req` or `res`.

### Your service should:

- Hold a mock array of at least **two** expense objects (reuse the data from Exercise 2)
- Implement all of the following methods:

| Method signature | Returns | Description |
|-----------------|---------|-------------|
| `findAll()` | `Promise<any[]>` | Return all expenses |
| `findById(id: number)` | `Promise<any>` | Return one expense, or `undefined` |
| `create(expense: any)` | `Promise<any>` | Add a new expense and return it with a generated `id` |
| `update(id: number, expense: any)` | `Promise<any>` | Update an existing expense, return `undefined` if not found |
| `delete(id: number)` | `Promise<boolean>` | Remove an expense, return `true` if removed or `false` if not found |

> **Tip:** For `create`, generate a new `id` by finding the current maximum `id` in the array and adding 1.

---

## Step 2 — Create the ExpenseController

Create a new file at `src/controllers/expenseController.ts`.

The controller is responsible for **handling HTTP** — parsing parameters, calling the service, and returning the correct status codes. It should never touch the data store directly.

### Your controller should:

- Accept an `ExpenseService` instance via the constructor (Dependency Injection)
- Implement the following methods:

| Method | Validates | Success response | Error response |
|--------|-----------|-----------------|----------------|
| `getAll(req, res)` | — | `200` with array | — |
| `getById(req, res)` | `id` is a number | `200` with expense | `400` if NaN, `404` if not found |
| `create(req, res)` | `date`, `description`, `user` present in body | `201` with new expense | `400` if fields missing |
| `update(req, res)` | `id` is a number | `200` with updated expense | `400` if NaN, `404` if not found |
| `delete(req, res)` | `id` is a number | `204` no body | `400` if NaN, `404` if not found |

> **Rule of thumb:** if it references `req` or `res`, it belongs in the controller — not the service.

---

## Step 3 — Update Your Routes

Refactor `src/routes/expenseRouter.ts` so that each route **delegates** to the controller. No logic should remain in the route file.

```typescript
import { Router } from "express";
import { ExpenseController } from "../controllers/expenseController";

const router = Router();
const controller = new ExpenseController();

router.get("/",     (req, res) => controller.getAll(req, res));
router.get("/:id",  (req, res) => controller.getById(req, res));
router.post("/",    (req, res) => controller.create(req, res));
router.put("/:id",  (req, res) => controller.update(req, res));
router.delete("/:id", (req, res) => controller.delete(req, res));

export default router;
```

Your `index.ts` does **not** need to change — it already mounts the router at `/api/expenses`.

---

## Expected Behaviour

Test each route in **Insomnia or Postman**:

```
GET     http://localhost:3000/api/expenses
GET     http://localhost:3000/api/expenses/1
GET     http://localhost:3000/api/expenses/999
POST    http://localhost:3000/api/expenses
PUT     http://localhost:3000/api/expenses/1
DELETE  http://localhost:3000/api/expenses/1
```

| Request | Expected response |
|---------|------------------|
| `GET /api/expenses` | `200` — array of all expenses |
| `GET /api/expenses/1` | `200` — single expense object |
| `GET /api/expenses/999` | `404` — `{ "error": "Expense not found" }` |
| `GET /api/expenses/abc` | `400` — `{ "error": "ID must be a number" }` |
| `POST /api/expenses` with valid body | `201` — new expense with generated `id` |
| `POST /api/expenses` with missing fields | `400` — `{ "error": "..." }` |
| `PUT /api/expenses/1` with body | `200` — updated expense |
| `DELETE /api/expenses/1` | `204` — no body |
| `DELETE /api/expenses/999` | `404` — `{ "error": "Expense not found" }` |

---

## Tips

- Import `Request` and `Response` from `"express"` in your controller
- Mark controller methods as `async` — your service methods return `Promise`
- For `create`, read fields from `req.body` (e.g. `req.body.description`)
- For `update`, spread the existing expense with the incoming body fields to do a **partial update**
- Use `res.status(204).send()` for delete — do **not** call `.json()` on a `204`
- Run `npm run dev` and re-test all five routes after every change

---

## Resources

- [MVC, Controllers & Services slides](./mvc-controllers-services/mvc-controllers-services.md)
- [Express.js Routing Docs](https://expressjs.com/en/guide/routing.html)
