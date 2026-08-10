# Exercise 2: Backend - Protect Expenses Endpoints with JWT Middleware

> Apply this exercise to your backend expenses api app.

Goal - Require a valid JWT for all expenses endpoints:
- Keep `/api/login` and `health` public.
- Protect `/api/expenses` routes with `Authorization: Bearer <token>`.
- Return `401` with `{ "message": "Invalid token" }` when token is missing/invalid.

## Step 1: Add JWT auth middleware

Create `src/middleware/requireAuth.ts`:

```ts
import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

const TOKEN_ERROR = "Invalid token";

interface AuthTokenPayload {
	userId: number;
	email: string;
}

export const requireAuth: RequestHandler = (req, res, next) => {
	// Read the Authorization header in the form: Bearer <token>
	const authHeader = req.header("authorization");

	// Return a generic 401 so we do not leak token parsing details.
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ message: TOKEN_ERROR });
	}

	// Strip the Bearer prefix and validate token presence.
	const token = authHeader.slice("Bearer ".length).trim();

	if (!token) {
		return res.status(401).json({ message: TOKEN_ERROR });
	}

	// JWT secret must exist at runtime; this is a server config problem.
	const secret = process.env.JWT_SECRET;

	if (!secret) {
		return res.status(500).json({ error: "Internal server error" });
	}

	try {
		// Verify signature and expiration.
		const decoded = jwt.verify(token, secret);

		// We only accept object payloads, not string payloads.
		if (typeof decoded === "string") {
			return res.status(401).json({ message: TOKEN_ERROR });
		}

		const payload = decoded as Partial<AuthTokenPayload>;

		// Enforce required claim types before trusting payload values.
		if (
			typeof payload.userId !== "number" ||
			typeof payload.email !== "string"
		) {
			return res.status(401).json({ message: TOKEN_ERROR });
		}

		// Expose authenticated user context to downstream handlers.
		res.locals.authUser = {
			userId: payload.userId,
			email: payload.email,
		};

		// Continue request pipeline.
		next();
	} catch {
		// Includes invalid signature, malformed token, and expired token.
		return res.status(401).json({ message: TOKEN_ERROR });
	}
};
```

## Step 2: Protect all expenses routes

Update `src/routes/expenseRouter.ts` to:

```ts
import { Router } from "express";

import { ExpenseController } from "../controllers/expenseController.js";
import { CreateExpenseSchema, IdParamSchema } from "../dtos/expenseDto.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import { ExpenseService } from "../services/expenseService.js";

const router = Router();
const controller = new ExpenseController(new ExpenseService());

router.use(requireAuth);

router.get("/", controller.getAll.bind(controller));
router.get(
	"/:id",
	validateParams(IdParamSchema),
	controller.getById.bind(controller),
);
router.post(
	"/",
	validateBody(CreateExpenseSchema),
	controller.create.bind(controller),
);
router.put(
	"/:id",
	validateParams(IdParamSchema),
	validateBody(CreateExpenseSchema),
	controller.update.bind(controller),
);
router.delete(
	"/:id",
	validateParams(IdParamSchema),
	controller.delete.bind(controller),
);

export default router;
```

## Step 3: Keep route wiring unchanged

Your `src/app.ts` should keep:

```ts
app.use("/api/login", authRouter);
app.use("/api/expenses", expenseRouter);
```

This means:
- Login is public.
- Expenses are protected via middleware in the expenses router.

## Step 4: Test changes

### A) Login to get token

- Method: POST
- URL: http://localhost:4000/api/login
- Body:

```json
{
  "email": "test1@example.com",
  "password": "password123!"
}
```

Expected:
- Status: `200`
- Body:

```json
{
  "token": "<jwt>"
}
```

### B) Access protected endpoint without token

- Method: GET
- URL: http://localhost:4000/api/expenses
- Header: none

Expected:
- Status: `401`
- Body:

```json
{
  "message": "Invalid token"
}
```

### C) Access protected endpoint with token

- Method: GET
- URL: http://localhost:4000/api/expenses
- Header:

```text
Authorization: Bearer <jwt>
```

Expected:
- Status: `200`
- Body: expense array

### D) Create expense with token

- Method: POST
- URL: http://localhost:4000/api/expenses
- Header:

```text
Authorization: Bearer <jwt>
Content-Type: application/json
```

- Body:

```json
{
  "date": "2026-11-01",
  "description": "Client dinner",
  "user": "Alex",
  "amount": "31.50"
}
```

Expected:
- Status: `201`

## Step 6: Reset and repeat

```bash
npx prisma migrate reset --force --skip-seed
npx prisma db seed
npm run dev
```
