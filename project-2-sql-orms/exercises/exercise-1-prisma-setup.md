# Exercise 7 — Set Up Prisma in Your Expenses API

In this exercise you'll replace the in-memory array in your expenses API with a real PostgreSQL database accessed through Prisma. You'll install the packages, define a schema, run a migration, create the client singleton, and rewrite `ExpenseService` using Prisma queries.

This exercise builds directly on the API you built in Parts 1–6.

---

## What You're Building

By the end of this exercise your project structure should look like this:

```
src/
├── controllers/
│   └── expenseController.ts   ← no changes needed
├── routes/
│   └── expenseRouter.ts       ← no changes needed
├── services/
│   └── expenseService.ts      ← UPDATE (replace in-memory array with Prisma)
├── models/
│   └── expense.ts             ← no changes needed
├── dtos/
│   └── expenseDto.ts          ← no changes needed
├── middleware/
│   └── validate.ts            ← no changes needed
├── prismaClient.ts            ← NEW (singleton)
└── index.ts

prisma/
├── schema.prisma              ← NEW (your data model)
└── migrations/                ← NEW (created automatically by migrate dev)

.env                           ← NEW (DATABASE_URL — never commit this)
```

---

## Prerequisites

You'll need a running PostgreSQL database. Options:

- **Docker** — `docker run --name expenses-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=expenses -p 5432:5432 -d postgres`
- **Supabase** — [supabase.com](https://supabase.com) — free managed Postgres, connection string provided
- **Neon** — [neon.tech](https://neon.tech) — free serverless Postgres

---

## Step 1 — Install Prisma

```bash
npm install prisma --save-dev
npm install @prisma/client
```

---

## Step 2 — Initialise Prisma

```bash
npx prisma init --datasource-provider postgresql
```

This creates `prisma/schema.prisma` and `.env`.

Update `.env` with your database connection string:

```ini
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/expenses"
```

> Add `.env` to your `.gitignore` now if it isn't already there.

---

## Step 3 — Define Your Schema

Open `prisma/schema.prisma` and add an `Expense` model below the `datasource` block:

| Field | Type | Attribute |
|-------|------|-----------|
| `id` | `Int` | `@id @default(autoincrement())` |
| `date` | `String` | — |
| `description` | `String` | — |
| `user` | `String` | — |
| `createdAt` | `DateTime` | `@default(now())` |
| `updatedAt` | `DateTime` | `@updatedAt` |

> These fields map directly to the `Expense` class you built in Exercise 4. The `createdAt` and `updatedAt` fields are extras — Prisma manages them automatically.

---

## Step 4 — Run Your First Migration

```bash
npx prisma migrate dev --name init
```

This creates the `Expense` table in your database, generates the Prisma Client, and records the migration in `prisma/migrations/`.

---

## Step 5 — Create the Prisma Client Singleton

Create `src/prismaClient.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;
```

> One instance across your whole app — multiple instances create multiple connection pools.

---

## Step 6 — Rewrite ExpenseService

Open `src/services/expenseService.ts` and replace the in-memory array with Prisma queries.

Import the singleton and the generated types:

```typescript
import prisma from "../prismaClient.js";
import type { Expense } from "@prisma/client";
```

Rewrite each method using the table below as a guide:

| Method | In-Memory | Prisma |
|--------|-----------|--------|
| `findAll()` | `this.expenses` | `prisma.expense.findMany()` |
| `findById(id)` | `this.expenses.find(...)` | `prisma.expense.findUnique({ where: { id } })` |
| `create(data)` | `this.expenses.push(...)` | `prisma.expense.create({ data })` |
| `update(id, data)` | `Object.assign(expense, data)` | `prisma.expense.update({ where: { id }, data })` |
| `delete(id)` | `this.expenses.splice(...)` | `prisma.expense.delete({ where: { id } })` |

**Key differences from the in-memory implementation:**

- `findUnique` returns `null` (not `undefined`) when the record doesn't exist — update any `undefined` checks in your controller to handle `null`
- For `update` and `delete`, check for existence first with `findUnique` and return `null`/`false` if the record isn't found (Prisma throws if you try to update a non-existent record)
- Remove the manual `id` increment — Prisma handles this via `@default(autoincrement())`
- All methods are already `async` — no other changes needed

---

## Step 7 — Verify

Start your server and test every route:

```bash
npm run dev
```

| Request | Expected |
|---------|----------|
| `GET /api/expenses` | `200` — empty array (database is empty) |
| `POST /api/expenses` with valid body | `201` — new expense with a real `id` |
| `GET /api/expenses/1` | `200` — the expense you just created |
| `PUT /api/expenses/1` with body | `200` — updated expense |
| `DELETE /api/expenses/1` | `204` |
| `GET /api/expenses/1` | `404` — it's gone |

---

## Tips

- `Expense` from `@prisma/client` is a plain interface — you can use it as a return type instead of your domain class
- Run `npx prisma studio` to inspect your data visually while testing
- If TypeScript shows errors about `null` vs `undefined`, check that your controller null-checks use `=== null` or `== null` rather than `=== undefined`
- Run `npx prisma migrate reset` if you want to start with a clean database

---

## Resources

- [Setting Up Prisma slides](./prisma-setup.md)
- [Prisma docs — CRUD](https://www.prisma.io/docs/orm/prisma-client/queries/crud)
- [Cheatsheet](../../../../cheatsheets/prisma-setup-guide.md)
