# Exercise: JWT Login + Route Protection (TypeScript + Express)

## Goal
Build a server-rendered login flow that:
1. Authenticates a user against the backend login endpoint.
2. Stores the returned JWT in the session.
3. Protects expense routes.
4. Sends `Authorization: Bearer <token>` to protected backend API calls.
5. Logs the user out safely.

---

## Step 1: Add dependencies
### Command
```bash
npm install express-session
npm install -D @types/express-session
```

### Why
This gives you server-side session support plus TypeScript types.

---

## Step 2: Enable JSON + session middleware in app.ts
### File
`src/app.ts`

### Snippet
```ts
import session from "express-session";
```

```ts
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Persist login state across requests so protected routes can read req.session.jwtToken.
app.use(
	session({
		secret: process.env.SESSION_SECRET ?? "dev-session-secret",
		resave: false,
		saveUninitialized: false,
		cookie: {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 1000 * 60 * 60,
		},
	}),
);

// Expose auth state to all templates for sign in/sign out navigation.
app.use((req, res, next) => {
	res.locals.isAuthenticated = Boolean(req.session.jwtToken);
	next();
});
```

---

## Step 3: Add auth router

`src/routes/authRouter.ts`

```ts
import { Router } from "express";
import { AuthController } from "../controllers/authController.js";

const router = Router();
const authController = new AuthController();

router.get("/login", (req, res) => authController.showLogin(req, res));
router.post("/login", (req, res) => authController.login(req, res));
router.get("/logout", (req, res) => authController.logout(req, res));

export default router;
```

Add to `app.ts`
```ts
import authRouter from "./routes/authRouter";

app.use(authRouter);
```


---

## Step 4: Add auth controller

Create new file `src/controllers/authController.ts`


```ts
import type { Request, Response } from "express";
import * as authApiService from "../services/authApiService.js";

export class AuthController {
	showLogin(req: Request, res: Response): void {
		if (req.session.jwtToken) {
			res.redirect("/expenses");
			return;
		}

		res.render("pages/login.njk", {
			formValues: { username: "" },
		});
	}

	async login(req: Request, res: Response): Promise<void> {
		const username = String(req.body.username ?? "").trim();
		const password = String(req.body.password ?? "").trim();

		if (!username || !password) {
			res.status(400).render("pages/login.njk", {
				errorMessage: "Enter both username and password",
				formValues: { username },
			});
			return;
		}

		try {
			const jwtToken = await authApiService.login(username, password);
			req.session.jwtToken = jwtToken;
			res.redirect("/expenses");
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Unable to sign in";
			res.status(401).render("pages/login.njk", {
				errorMessage: message,
				formValues: { username },
			});
		}
	}

	logout(req: Request, res: Response): void {
		req.session.destroy(() => {
			res.clearCookie("connect.sid");
			res.redirect("/login");
		});
	}
}
```
---

## Step 5: Add auth API service
Create new `src/services/authApiService.ts`

```ts
import axios from "axios";
import apiClient from "../config/apiClient.js";

type LoginResponse = {
	token?: string;
	jwtToken?: string;
	accessToken?: string;
};

function extractToken(data: LoginResponse): string | null {
	return data.token ?? data.jwtToken ?? data.accessToken ?? null;
}

export async function login(username: string, password: string): Promise<string> {
	const loginPath = process.env.AUTH_LOGIN_PATH ?? "/api/login";

	try {
		const response = await apiClient.post<LoginResponse>(loginPath, {
			email: username,
			password,
		});

		const token = extractToken(response.data);
		if (!token) {
			throw new Error("Authentication succeeded but no JWT token was returned");
		}

		return token;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const status = error.response?.status;
			if (status === 400 || status === 401) {
				throw new Error("Invalid username or password");
			}
			if (status === 404) {
				throw new Error("Login endpoint not found");
			}
			if (status === 500) {
				throw new Error("Backend server error during login");
			}
		}

		throw error;
	}
}
```
---

## Step 6: Add route guard middleware
Add new middleware `src/middleware/authMiddleware.ts`

```ts
import type { NextFunction, Request, Response } from "express";

export function requireAuth(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	if (!req.session.jwtToken) {
		res.redirect("/login");
		return;
	}
	next();
}
```
---

## Step 7: Protect expense routes with one line
Update `src/routes/expenseRouter.ts`

```ts
import { Router } from "express";
import { ExpenseController } from "../controllers/expenseController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();
const controller = new ExpenseController();

router.get("/", (_req, res) => {
	res.render("pages/index.njk");
});

router.use(requireAuth);

router.get("/expenses", (req, res) => controller.getAll(req, res));
// other routes ...
```

---

## Step 8: Add bearer token to expense API calls
Update `src/services/expenseApiService.ts`

```ts
function authHeaders(token: string): { Authorization: string } {
	return { Authorization: `Bearer ${token}` };
}
```

```ts
export async function getAllExpenses(token: string): Promise<Expense[]> {
	const response = await apiClient.get<Expense[]>("/expenses", {
		headers: authHeaders(token),
	});
	return response.data;
}
```

```ts
export async function deleteExpense(id: number, token: string): Promise<void> {
	await apiClient.delete(`/expenses/${id}`, {
		headers: authHeaders(token),
	});
}
```

---

## Step 9: Pass token from expense controller
Update `src/controllers/expenseController.ts`

### Core snippets
```ts
private getJwtToken(req: Request): string {
	return req.session.jwtToken ?? "";
}
```

```ts
const expenses = await expenseApiService.getAllExpenses(
	this.getJwtToken(req),
);
```

```ts
private handleUnauthorized(
	req: Request,
	res: Response,
	error: unknown,
): boolean {
	if (error instanceof Error && error.message === "Unauthorized") {
		req.session.jwtToken = undefined;
		res.redirect("/login");
		return true;
	}

	return false;
}
```

---

## Step 10: Add TypeScript session augmentation
Create new `src/types/express-session.d.ts`.  

This makes `req.session.jwtToken` type-safe.

```ts
import "express-session";

declare module "express-session" {
	interface SessionData {
		jwtToken?: string;
	}
}
```



---

## Step 11: Add login page
Create new file `src/views/pages/login.njk`

```njk
{% extends "layouts/base.njk" %}

{% from "govuk/components/error-summary/macro.njk" import govukErrorSummary %}
{% from "govuk/components/input/macro.njk" import govukInput %}
{% from "govuk/components/password-input/macro.njk" import govukPasswordInput %}
{% from "govuk/components/button/macro.njk" import govukButton %}

{% block title %}Sign in{% endblock %}

{% block content %}
  <div class="govuk-grid-row">
    <div class="govuk-grid-column-two-thirds">
      <h1 class="govuk-heading-xl">Sign in</h1>

      {% if errorMessage %}
        {{ govukErrorSummary({
          titleText: "There is a problem",
          errorList: [
            {
              text: errorMessage,
              href: "#username"
            }
          ]
        }) }}
      {% endif %}

      <form method="post" action="/login" novalidate>
        {{ govukInput({
          label: {
            text: "Username or email",
            classes: "govuk-label--m"
          },
          id: "username",
          name: "username",
          value: formValues.username,
          autocomplete: "username"
        }) }}

        {{ govukPasswordInput({
          label: {
            text: "Password",
            classes: "govuk-label--m"
          },
          id: "password",
          name: "password",
          autocomplete: "current-password"
        }) }}

        {{ govukButton({
          text: "Sign in"
        }) }}
      </form>
    </div>
  </div>
{% endblock %}
```

---

---

## Environment Variables
```env
SESSION_SECRET=replace-with-a-long-random-secret
API_BASE_URL=http://localhost:4000
AUTH_LOGIN_PATH=/api/login
NODE_ENV=development
```

---

## Verify Everything
```bash
npm run build
npm run dev
```

Manual checks:
1. Open `/login`.
2. Login with valid credentials.
3. Confirm redirect to `/expenses`.
4. Visit `/logout`.
5. Confirm `/expenses` now redirects to `/login`.

---