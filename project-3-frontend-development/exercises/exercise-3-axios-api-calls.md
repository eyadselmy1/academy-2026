# Exercise 11 — Calling the Backend API with Axios

In this exercise you'll replace the **in-memory `ExpenseService`** in your frontend project with real HTTP calls to your backend API using Axios. When you're done, the frontend will be a true client of the backend — data will flow from the database, through the backend API, over HTTP, and into the rendered HTML pages.

This exercise builds on Exercises 9 and 10. You should already have:
- A working backend API (from Exercises 1–8) running with Prisma and full CRUD routes
- A working frontend (from Exercises 9–10) with Nunjucks, GOV.UK Frontend, and form-based CRUD pages

---

## What You're Building

```
Browser → Frontend Server (:3000) → Axios → Backend API (:4000) → Prisma → Database
```

By the end of this exercise your frontend project structure adds:

```
src/
├── services/
│   ├── expenseService.ts        ← REMOVE (or keep for reference)
│   └── expenseApiService.ts     ← NEW — Axios calls to the backend API
├── config/
│   └── apiClient.ts             ← NEW — shared Axios instance
├── controllers/
│   └── expenseController.ts     ← UPDATE — inject expenseApiService
├── routes/
│   └── expenseRouter.ts         ← no changes needed
└── index.ts                     ← no changes needed
.env                             ← UPDATE — add API_BASE_URL
```

---

## Step 1 — Configure Ports in `.env`

Both services are Node.js Express apps — they **cannot share the same port**. Each needs its own `.env` file.

**In your backend project**, make sure you have:

```ini
PORT=4000
```

**In your frontend project**, update (or create) `.env`:

```ini
PORT=3000
API_BASE_URL=http://localhost:4000
```

> ⚠️ `PORT=3000` and `PORT=4000` must be different — two servers cannot listen on the same port at the same time.
>
> Using `API_BASE_URL` means you only change one line if the backend moves to a different host or port.

Make sure `dotenv` is installed and loaded as the **first** import in your frontend's entry file — before Express and any other imports. Refer to the slides for the correct import order.

```bash
npm install dotenv
```

---

## Step 2 — Start Both Services

Open **two terminals** and keep both running throughout the exercise:

**Terminal 1 — Backend:**

```bash
cd expenses-api
npm run dev
# → Listening on http://localhost:4000
```

**Terminal 2 — Frontend:**

```bash
cd expenses-frontend
npm run dev
# → Listening on http://localhost:3000
```

Confirm the backend is reachable before continuing:

```bash
curl http://localhost:4000/expenses
# Should return a JSON array
```

---

## Step 3 — Install Axios

In your **frontend** project:

```bash
npm install axios
```

---

## Step 4 — Create the Axios API Client

Create `src/config/apiClient.ts`. This is the single place where you configure Axios — base URL, default headers, and timeout.

Your client should:
- Read `baseURL` from `process.env.API_BASE_URL`, with a fallback to `http://localhost:4000`
- Set `Content-Type: application/json` as a default header
- Configure a sensible request timeout

Refer to the slides for the Axios configuration pattern.

> All service functions will import from this one file. If you ever need to change the base URL or add auth headers, you only change it here.

---

## Step 5 — Define Your Types

If your frontend doesn't already have shared types for expenses, create `src/models/expense.ts`.

Define two interfaces:
- `Expense` — the full shape returned by your backend API (includes `id` and all data fields)
- `CreateExpenseDto` — the input shape for create and update operations (same fields, without `id`)

Check your backend's DTO and model files to confirm the exact field names and types.

> These must match the shapes that your backend API returns and accepts exactly.

---

## Step 6 — Create the Expense API Service

Create `src/services/expenseApiService.ts`. Each function corresponds to one backend endpoint. Refer to the slides for the Axios request patterns — the slides use a **blog posts** domain as the example, so you'll need to adapt the function names, types, and API paths to match the **expenses** domain.

Write the following five functions:

### GET all expenses
- Function name: `getAllExpenses`
- Returns: `Promise<Expense[]>`
- Makes a GET request to `/expenses`

### GET one expense
- Function name: `getExpenseById`
- Accepts: a numeric `id`
- Returns: `Promise<Expense>`
- Makes a GET request to `/expenses/:id`

### POST — create
- Function name: `createExpense`
- Accepts: a `CreateExpenseDto`
- Returns: `Promise<Expense>`
- Makes a POST request to `/expenses` with the DTO as the request body

### PUT — update
- Function name: `updateExpense`
- Accepts: a numeric `id` and a `CreateExpenseDto`
- Returns: `Promise<Expense>`
- Makes a PUT request to `/expenses/:id`

### DELETE
- Function name: `deleteExpense`
- Accepts: a numeric `id`
- Returns: `Promise<void>`
- Makes a DELETE request to `/expenses/:id`

> `response.data` is already parsed JSON — Axios handles `Content-Type: application/json` automatically.

---

## Step 7 — Add Error Handling

Wrap each function in a `try/catch`. Use `axios.isAxiosError()` to check whether the error came from an HTTP response, then inspect `error.response?.status` to handle specific status codes — throw a descriptive `Error` for 404 (not found) and 500 (server error), and re-throw anything unexpected.

Refer to the slides for the full error handling pattern — they show this applied to the blog posts example. Adapt it for each of your **expenses** service functions.

Apply this to **all five** functions.

> Axios throws for any non-2xx response. Without a `try/catch` an unhandled error will crash your Express request handler.

---

## Step 8 — Update the Controller

Open `src/controllers/expenseController.ts` and replace every call to the old in-memory service with the corresponding function from `expenseApiService.ts`.

You'll need to:
1. Remove the `ExpenseService` import and constructor injection
2. Import your new `expenseApiService` module using a namespace import
3. Update each controller method to call the matching service function:
   - `getAll` → calls `getAllExpenses()`, renders the list template
   - `getById` → calls `getExpenseById(id)`, renders the detail template
   - `create` → calls `createExpense(req.body)`, then redirects to `/expenses`
   - `update` → calls `updateExpense(id, req.body)`, then redirects to `/expenses/:id`
   - `delete` → calls `deleteExpense(id)`, then redirects to `/expenses`

Refer to the slides for how the controller wires into the service layer (using the blog posts example as a reference). Update any instantiation of `ExpenseController` in `index.ts` to remove the injected service.

---

## Step 9 — Test the Full Flow

With both services running, test each operation in your browser:

| Action | What to check |
|--------|---------------|
| Visit `http://localhost:3000/expenses` | Should list expenses from the database |
| Click an expense | Should show the detail page |
| Click "Add new expense" and submit the form | Should create a record in the database |
| Click "Edit" on an expense and submit | Should update the record |
| Click "Delete" on an expense | Should remove the record |

Verify changes persist by stopping and restarting the backend — if Prisma is set up correctly the data will still be there.

---

## Checklist

- [ ] Backend `.env` has `PORT=4000`
- [ ] Frontend `.env` has `PORT=3000` and `API_BASE_URL=http://localhost:4000`
- [ ] `dotenv/config` is the first import in the frontend entry file
- [ ] Axios is installed in the frontend project
- [ ] `src/config/apiClient.ts` reads `baseURL` from `process.env.API_BASE_URL`
- [ ] `expenseApiService.ts` has functions for all five CRUD operations
- [ ] All functions have `try/catch` with `axios.isAxiosError()` checks
- [ ] `ExpenseController` uses `expenseApiService` instead of the in-memory service
- [ ] All five operations work end-to-end in the browser
- [ ] Data persists after restarting the backend

---

## Stretch Goals

1. **Loading states** — show a "Loading…" message while the Axios call is in flight (you'll need client-side JavaScript for this)
2. **Error pages** — if the backend returns a 404 or 500, render a friendly Nunjucks error page instead of crashing
3. **Environment-specific config** — add a `.env.production` with a real API URL and swap it using `NODE_ENV`
4. **Axios interceptors** — add a request interceptor that logs every outgoing API call to the console, and a response interceptor that logs status codes
