# Exercise 4 — Models & DTOs

In this exercise you'll replace all uses of `any` in your expenses API with proper types. You'll create a domain model class with constructor validation, define DTOs to control what enters and leaves your API, and update the service and controller to use them.

Refer back to the slides for patterns and examples — the goal is to work out the implementation yourself.

---

## What You're Building

By the end of this exercise your project structure should look like this:

```
src/
├── controllers/
│   └── expenseController.ts   ← UPDATE (build DTOs before responding)
├── routes/
│   └── expenseRouter.ts       ← no changes needed
├── services/
│   └── expenseService.ts      ← UPDATE (store and return Expense instances)
├── models/
│   └── expense.ts             ← NEW (domain model class)
├── dtos/
│   └── expenseDto.ts          ← NEW (request and response DTOs)
└── index.ts
```

---

## Step 1 — Create the Expense Interface, then Class

### 1a — Start with an interface

Create `src/models/expense.ts` and define an `Expense` interface with these fields:

| Field | Type |
|---|---|
| `id` | `number` |
| `date` | `string` |
| `description` | `string` |
| `user` | `string` |

Update `ExpenseService` to replace `any[]` with `Expense[]`. Run the app and confirm TypeScript is happy before continuing.

---

### 1b — Upgrade to a class with validation

Replace the interface with a **class** using `public readonly` constructor parameters. Add validation in the constructor body for each field:

- `id` must be greater than 0
- `date`, `description`, and `user` must not be empty strings

> **Why a class?** `readonly` prevents accidental mutation after creation, and the constructor guarantees invalid `Expense` objects can never be constructed — validation is in one place, not scattered across the codebase.

---

## Step 2 — Create DTOs

Create `src/dtos/expenseDto.ts` with **two interfaces**:

**`ExpenseResponseDto`** — what the client receives. Fields: `id`, `date`, `description`, `user`.

**`CreateExpenseRequestDto`** — what the client sends when creating an expense. Fields: `date`, `description`, `user`.

> Notice `id` is absent from the request DTO — clients never supply an `id`, the server generates it.

**Why two separate types?** If you later add sensitive internal fields to `Expense`, they won't accidentally appear in responses. Each type has one clear job.

---

## Step 3 — Update the ExpenseService

Replace `any` with the proper types throughout the service:

| Method | Parameter types | Return type |
|--------|----------------|-------------|
| `findAll` | — | `Promise<Expense[]>` |
| `findById` | `id: number` | `Promise<Expense \| undefined>` |
| `create` | `data: CreateExpenseRequestDto` | `Promise<Expense>` |
| `update` | `id: number`, `data: CreateExpenseRequestDto` | `Promise<Expense \| undefined>` |
| `delete` | `id: number` | `Promise<boolean>` |

Update the mock data array to store `Expense` class instances (using `new Expense(...)`).

In `create`, generate a new `id` from the current maximum in the array, construct a `new Expense`, push it, and return it.

> The `Expense` constructor will throw if any field is empty — invalid data never reaches the array.

---

## Step 4 — Update the ExpenseController

The controller should **build an `ExpenseResponseDto`** before sending any response, instead of returning `Expense` instances directly.

For each method that returns expense data (`getAll`, `getById`, `create`, `update`):

1. Get the `Expense` instance(s) from the service
2. Map the fields into an `ExpenseResponseDto` object (or array)
3. Send the DTO in the response — not the `Expense` instance

> Only the fields declared on `ExpenseResponseDto` should appear in the JSON response.

---

## Step 5 — Type the Request Body in `create`

In the controller's `create` method, type `req.body` as `CreateExpenseRequestDto`. Validate that all required fields are present before passing it to the service.

The controller checks fields are present; the `Expense` constructor acts as a second line of defence against invalid data.

---

## Expected Behaviour

Test each route in **Insomnia or Postman** — the responses should look identical to Exercise 3, but the code is now fully typed:

| Request | Expected response |
|---------|------------------|
| `GET /api/expenses` | `200` — array of `ExpenseResponseDto` objects |
| `GET /api/expenses/1` | `200` — single `ExpenseResponseDto` |
| `GET /api/expenses/999` | `404` — `{ "error": "Expense not found" }` |
| `GET /api/expenses/abc` | `400` — `{ "error": "ID must be a number" }` |
| `POST /api/expenses` with valid body | `201` — new `ExpenseResponseDto` with generated `id` |
| `POST /api/expenses` with missing fields | `400` — `{ "error": "date, description and user are required" }` |
| `PUT /api/expenses/1` with body | `200` — updated `ExpenseResponseDto` |
| `DELETE /api/expenses/1` | `204` — no body |
| `DELETE /api/expenses/999` | `404` — `{ "error": "Expense not found" }` |

---

## Stretch Goals

- Try adding an `amount: number` field to `Expense` — trace all the places TypeScript forces you to update
- Add validation to `amount` in the constructor (e.g. must be greater than 0)
- Add an `AmountExpenseResponseDto` that also includes `amount` and return it from a new `GET /api/expenses/:id/details` route
