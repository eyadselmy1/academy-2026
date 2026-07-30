# Exercise 5 — Validation with Zod

In this exercise you'll add validation to your expenses API using Zod. You'll define schemas for incoming request bodies and route parameters, create reusable validation middleware, and wire it all into your router.

Refer back to the slides for patterns and examples — the goal is to work out the implementation yourself.

---

## What You're Building

By the end of this exercise your project structure should look like this:

```
src/
├── controllers/
│   └── expenseController.ts   ← no changes needed
├── routes/
│   └── expenseRouter.ts       ← UPDATE (add validation middleware)
├── services/
│   └── expenseService.ts      ← no changes needed
├── models/
│   └── expense.ts             ← no changes needed
├── dtos/
│   └── expenseDto.ts          ← UPDATE (add schemas, update DTO types)
├── middleware/
│   └── validate.ts            ← NEW (validateBody and validateParams)
└── index.ts
```

---

## Step 1 — Install Zod

Install Zod as a runtime dependency:

```bash
npm install zod
```

---

## Step 2 — Add Schemas to `expenseDto.ts`

Open `src/dtos/expenseDto.ts` and add the following:

**`CreateExpenseSchema`** — a Zod object schema with three fields:

| Field | Validation rule |
|---|---|
| `date` | string, minimum 1 character |
| `description` | string, minimum 1 character |
| `user` | string, minimum 1 character |

Use `z.infer<>` to derive the `CreateExpenseRequestDto` type from the schema instead of defining it as a separate interface. This keeps the type and validation rules in sync automatically.

**`IdParamSchema`** — a Zod object schema with one field:

| Field | Validation rule |
|---|---|
| `id` | coerced to a number, must be a positive integer |

> `z.coerce.number()` will convert the string `"1"` from `req.params` into the number `1`, and reject anything that can't be parsed as a valid integer.

---

## Step 3 — Create the Validation Middleware

Create a new file at `src/middleware/validate.ts`.

Implement two exported functions:

**`validateBody(schema)`** — takes a `ZodSchema` and returns an Express `RequestHandler` that:
- Calls `safeParse` on `req.body`
- Returns `400` with a structured errors array if validation fails
- Replaces `req.body` with `result.data` and calls `next()` on success

**`validateParams(schema)`** — the same pattern, but applied to `req.params` instead of `req.body`.

Each error in the response array should have a `field` (from `issue.path.join(".")`) and a `message`.

---

## Step 4 — Update the Router

Open `src/routes/expenseRouter.ts` and add the validation middleware to the appropriate routes.

- Routes that accept a request body (`POST`, `PUT`) should use `validateBody(CreateExpenseSchema)` before the controller handler
- Routes with an `/:id` parameter (`GET /:id`, `PUT /:id`, `DELETE /:id`) should use `validateParams(IdParamSchema)` before the controller handler

Use `.bind(controller)` to preserve the `this` context when passing a controller method directly as a handler argument.

> **Why `.bind()`?** When you pass a controller method as a callback without the arrow function wrapper, JavaScript loses the `this` reference. `.bind(controller)` locks it to the controller instance.

---

## Expected Behaviour

Test each route in **Insomnia or Postman** — all existing routes should still work, with improved error responses for invalid input:

| Request | Expected response |
|---------|------------------|
| `GET /api/expenses` | `200` — array of expenses |
| `GET /api/expenses/1` | `200` — single expense |
| `GET /api/expenses/abc` | `400` — `{ "errors": [{ "field": "id", "message": "..." }] }` |
| `GET /api/expenses/999` | `404` — `{ "error": "Expense not found" }` |
| `POST /api/expenses` with valid body | `201` — new expense |
| `POST /api/expenses` with empty `date` | `400` — `{ "errors": [{ "field": "date", "message": "Date cannot be empty" }] }` |
| `POST /api/expenses` with missing `description` | `400` — errors array with `description` field |
| `PUT /api/expenses/1` with valid body | `200` — updated expense |
| `PUT /api/expenses/abc` | `400` — errors array with `id` field |
| `DELETE /api/expenses/1` | `204` — no body |
| `DELETE /api/expenses/abc` | `400` — errors array with `id` field |

---

## Tips

- Import `ZodSchema` and `z` from `"zod"` in your middleware and DTO files
- The `RequestHandler` type comes from `"express"`
- Middleware functions run in order — place `validateBody` / `validateParams` **before** the controller handler in the route definition
- You can remove the manual `isNaN` checks from the controller once `validateParams` handles that — but confirm validation works first before removing anything
- Run `npm run dev` and test invalid requests to verify the new error shape

---

## Stretch Goals

- Add a `validateQuery(schema)` function to your middleware for validating `req.query` parameters
- Add an optional `minAmount` query parameter to `GET /api/expenses` — validate it is a positive number if present, and filter the results in the service

---

## Resources

- [Validation slides](./validation/validation.md)
- [Zod documentation](https://zod.dev)
