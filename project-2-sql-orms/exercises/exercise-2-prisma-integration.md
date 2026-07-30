# Exercise 8 — Integrate Prisma into Your Full API

In this exercise you'll complete the Prisma integration by wiring your new `ExpenseService` through the full stack, seeding initial data, and updating your unit tests to mock Prisma.

This exercise builds directly on Exercise 7.

---

## What You're Confirming

The key insight from the slides: because your controller and routes use **Dependency Injection** (the `ExpenseService` is passed in via the constructor), they need **zero changes** when you swap from an in-memory service to a Prisma-backed one.

Before you do anything else, start your server and run your full test suite:

```bash
npm run dev
npm test
```

If your controller and routes tests fail after Exercise 7, it's likely because they mock the service — they should still pass. If service tests fail, that's expected — you'll fix those in Step 3.

---

## Step 1 — Confirm the Controller and Routes Need No Changes

Check `src/controllers/expenseController.ts` and `src/routes/expenseRouter.ts`.

Neither file should have changed from Exercise 6. The controller only cares about the `ExpenseService` interface — not its implementation. The router just wires URLs to controller methods.

> This is the **Dependency Inversion Principle** (the D in SOLID) in action. The controller depends on an abstraction, not on the concrete in-memory implementation.

---

## Step 2 — Seed the Database

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.expense.createMany({
    data: [
      { date: "2026-01-15", description: "Lunch with client", user: "Alice" },
      { date: "2026-01-20", description: "Train ticket to London", user: "Bob" },
      { date: "2026-02-03", description: "Office supplies", user: "Alice" },
    ],
    skipDuplicates: true,
  });
}

main().finally(() => prisma.$disconnect());
```

Add the seed config to `package.json`:

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

Run the seed:

```bash
npx prisma db seed
```

---

## Step 3 — Update Unit Tests to Mock Prisma

Your service tests (`tests/services/expenseService.test.ts`) were calling methods directly on the in-memory `ExpenseService`. Now that the service uses Prisma, those tests need to mock `prismaClient`.

### Mock the Prisma singleton

At the top of your service test file, mock the module:

```typescript
import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("../../src/prismaClient.js", () => ({
  default: {
    expense: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import prisma from "../../src/prismaClient.js";
import { ExpenseService } from "../../src/services/expenseService.js";
```

### Reset mocks between tests

```typescript
beforeEach(() => {
  vi.resetAllMocks();
});
```

### Update each test to configure mock return values

For each test, use `vi.mocked(prisma.expense.findMany).mockResolvedValue(...)` (or the appropriate method) to set what Prisma returns, then call the service method and assert the result.

| Test Scenario | Mock setup |
|---------------|------------|
| `findAll` returns array | `mockResolvedValue([expense1, expense2])` |
| `findById` found | `findUnique.mockResolvedValue(expense1)` |
| `findById` not found | `findUnique.mockResolvedValue(null)` |
| `create` returns new expense | `create.mockResolvedValue(newExpense)` |
| `update` found | `findUnique.mockResolvedValue(expense1)`, `update.mockResolvedValue(updated)` |
| `update` not found | `findUnique.mockResolvedValue(null)` |
| `delete` found | `findUnique.mockResolvedValue(expense1)`, `delete.mockResolvedValue(expense1)` |
| `delete` not found | `findUnique.mockResolvedValue(null)` |

> Controller tests and route tests don't need to change — they already mock the service.

---

## Step 4 — Explore with Prisma Studio

```bash
npx prisma studio
```

Open **http://localhost:5555** and:

1. Browse the `Expense` table — you should see the three seeded rows
2. Add a new expense manually through the UI
3. Confirm it appears when you `GET /api/expenses`
4. Delete one via Studio and confirm it's gone from the API too

---

## Step 5 — Run the Full Test Suite

```bash
npm test
```

All tests should pass. If any fail:

- **Service tests** — check that your mock return values match the exact shape your service expects (including `null` vs `undefined`)
- **Controller tests** — these mock the service directly, so Prisma changes shouldn't affect them
- **Route tests** — same as controller tests; if they fail, check for import path issues with the Prisma mock

Run with coverage to see what's covered:

```bash
npm run test:coverage
```

---

## Expected Behaviour

| Request | Expected |
|---------|----------|
| `GET /api/expenses` | `200` — three seeded expenses |
| `GET /api/expenses/1` | `200` — first expense |
| `GET /api/expenses/999` | `404` — `{ "error": "Expense not found" }` |
| `GET /api/expenses/abc` | `400` — Zod validation error |
| `POST /api/expenses` with valid body | `201` — new expense with database-generated `id` |
| `PUT /api/expenses/1` | `200` — updated expense persisted to DB |
| `DELETE /api/expenses/1` | `204` — removed from DB |

---

## Tips

- `vi.mocked()` gives you the typed mock — use it instead of casting with `as`
- `mockResolvedValue` is for async functions; `mockReturnValue` is for sync
- If `prisma.$connect` or `prisma.$disconnect` appear in errors, add them to the mock object
- Run `npx prisma migrate reset` then `npx prisma db seed` to reset your local data to a known state
- The `createdAt` and `updatedAt` fields will appear in API responses — that's fine, or you can exclude them in your `ExpenseResponseDto` if you prefer

---

## Stretch Goals

- Add a `GET /api/expenses?user=Alice` query parameter — validate it with Zod and pass it to `findMany({ where: { user } })` in the service
- Add a `GET /api/expenses/stats` endpoint that returns the total count per user using `prisma.expense.groupBy`
- Add a `createdAt` field to `ExpenseResponseDto` and include it in responses

---

## Resources

- [Integrating Prisma slides](./prisma-config.md)
- [Prisma docs — CRUD](https://www.prisma.io/docs/orm/prisma-client/queries/crud)
- [Vitest mocking docs](https://vitest.dev/guide/mocking)
