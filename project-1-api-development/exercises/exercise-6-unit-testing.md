# Exercise 6 — Unit Testing with Vitest

In this exercise you'll add a full suite of unit tests to your expenses API. You'll test the service in isolation, test the controller by mocking the service and HTTP objects, and test routes end-to-end using Supertest — without ever starting a real server.

Refer back to the slides for patterns and examples — the goal is to work out the implementation yourself.

---

## What You're Building

By the end of this exercise your project structure should look like this:

```
src/
├── app.ts                     ← NEW (extract app setup from index.ts)
├── controllers/
│   └── expenseController.ts   ← UPDATE (accept service via constructor)
├── routes/
│   └── expenseRouter.ts       ← no changes needed
├── services/
│   └── expenseService.ts      ← no changes needed
├── models/
│   └── expense.ts             ← no changes needed
├── dtos/
│   └── expenseDto.ts          ← no changes needed
├── middleware/
│   └── validate.ts            ← no changes needed
└── index.ts                   ← UPDATE (import app, call listen here only)

tests/
├── services/
│   └── expenseService.test.ts ← NEW
├── controllers/
│   └── expenseController.test.ts ← NEW
└── routes/
    └── expenseRouter.test.ts  ← NEW
```

---

## Step 1 — Install Dependencies

Install Vitest, coverage support, Supertest, and its types as dev dependencies:

```bash
npm install --save-dev vitest @vitest/coverage-v8 supertest @types/supertest
```

---

## Step 2 — Configure Vitest

Add test scripts and Vitest configuration to `package.json`:

| Script | Command |
|--------|---------|
| `test` | `vitest run` |
| `test:watch` | `vitest` |
| `test:coverage` | `vitest run --coverage` |

Also add a `vitest` configuration block with `"environment": "node"`.

---

## Step 3 — Extract `app.ts`

Supertest needs access to the Express `app` without it calling `listen()`. Separate the two:

- Create `src/app.ts` — set up Express, register middleware and the router, and **export `app`**
- Update `src/index.ts` — import `app` from `./app` and call `app.listen(...)` there only

> This pattern — separating app setup from server startup — is a standard practice that makes testing straightforward.

---

## Step 4 — Make the Controller Accept a Injected Service

Update `ExpenseController` so that the `ExpenseService` is **passed in via the constructor** rather than created internally. Update your router to pass a `new ExpenseService()` when constructing the controller.

> This is the Dependency Injection pattern from the slides — it's what allows you to swap in a mock service during tests.

---

## Step 5 — Test the Service

Create `tests/services/expenseService.test.ts`.

Test the service's methods directly — no mocks needed here, the service has no external dependencies.

Write a test for each of the following scenarios:

| Method | Scenario |
|--------|----------|
| `findAll` | Returns an array |
| `findAll` | Returns all seeded expenses |
| `findById` | Returns the correct expense when found |
| `findById` | Returns `undefined` when the ID does not exist |
| `create` | Returns a new expense with a generated `id` |
| `create` | The new expense appears in subsequent `findAll` results |
| `update` | Returns the updated expense |
| `update` | Returns `undefined` when the ID does not exist |
| `delete` | Returns `true` when the expense is removed |
| `delete` | Returns `false` when the ID does not exist |

> Use `beforeEach` to create a fresh `ExpenseService` instance before each test so tests don't affect each other.

---

## Step 6 — Test the Controller

Create `tests/controllers/expenseController.test.ts`.

The controller depends on the service and on Express `req`/`res` — mock both.

**Mock `req`** — an object with `params` and `body` properties.

**Mock `res`** — an object with `status` and `json` methods. Use `vi.fn()` for both. Make `status` return the mock `res` itself so the chain `res.status(...).json(...)` works.

**Mock the service** — an object with all service methods replaced by `vi.fn()`. Cast it to `ExpenseService` and inject it into the controller constructor.

Write a test for each of the following scenarios:

| Method | Scenario | Expected |
|--------|----------|----------|
| `getAll` | Service returns expenses | `200` with the expense array |
| `getAll` | Service throws | `500` with error message |
| `getById` | Valid ID, expense found | `200` with the expense |
| `getById` | Valid ID, expense not found | `404` with error message |
| `getById` | Invalid (non-numeric) ID | `400` with error message |
| `getById` | Service throws | `500` with error message |
| `create` | Valid body | `201` with the new expense |
| `create` | Service throws | `500` with error message |
| `update` | Valid ID and body, expense found | `200` with updated expense |
| `update` | Valid ID, expense not found | `404` with error message |
| `delete` | Valid ID, expense found | `204` |
| `delete` | Valid ID, expense not found | `404` with error message |

> Reset mocks between tests using `beforeEach` with `vi.resetAllMocks()`.

---

## Step 7 — Test the Routes with Supertest

Create `tests/routes/expenseRouter.test.ts`.

Use `vi.mock` to mock the service module so route tests never touch real data. Import `app` from `src/app.ts` and use `request(app)` to make HTTP requests.

Write a test for each of the following scenarios:

| Request | Mocked service response | Expected |
|---------|------------------------|----------|
| `GET /api/expenses` | Returns expense array | `200` with array |
| `GET /api/expenses/:id` | Returns expense | `200` with expense |
| `GET /api/expenses/:id` | Returns `undefined` | `404` |
| `GET /api/expenses/abc` | — | `400` (Zod param validation) |
| `POST /api/expenses` | Returns new expense | `201` |
| `POST /api/expenses` with invalid body | — | `400` (Zod body validation) |
| `PUT /api/expenses/:id` | Returns updated expense | `200` |
| `DELETE /api/expenses/:id` | Returns `true` | `204` |

> Route tests exercise the full request/response cycle including your Zod validation middleware.

---

## Running Your Tests

```bash
npm test              # run all tests once
npm run test:watch    # re-run on file changes
npm run test:coverage # run with coverage report
```

All tests should pass before you consider the exercise complete.

---

## Tips

- Use `describe` blocks to group tests by method — one `describe` per controller or service method keeps things readable
- Each `it` description should read as a sentence: `"should return 404 when expense not found"`
- If a test is failing unexpectedly, check that `beforeEach` is resetting any shared state
- The `as unknown as ExpenseService` cast is needed because a plain object literal doesn't satisfy the full class type — this is expected and fine in tests
