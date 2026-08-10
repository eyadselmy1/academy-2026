# Exercise 1: Backend - Login-Only User Auth (JWT + Prisma)

> Apply this exercise to your **backend** expenses api app.

Goal - Add login-only authentication to this API:
- Add a `User` model in Prisma.
- Seed an example user with Argon2 password hash.
- Add a `POST /api/login` endpoint.
- Return a JWT token when credentials are valid.

## Prerequisites

Install auth dependencies:

```bash
npm install argon2 jsonwebtoken
npm install -D @types/jsonwebtoken
```

## Step 1: Set environment variables

Create or update `.env`:

```env
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/<db_name>?schema=public
JWT_SECRET=<generate_a_random_value>
```

Generate a strong JWT secret on your terminal and past this in:

```bash
openssl rand -hex 32
```

e.g `52590a3a9210e6817cc696138e0c3355fe30436ce65148d5150effa29bbaa7a4`

## Step 2: Update Prisma schema

Update `prisma/schema.prisma` with:

```prisma
model User {
  id           Int      @id @default(autoincrement())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
}
```

## Step 3: Create and apply migration, then generate client

```bash
npx prisma migrate dev --name add_user_auth
npx prisma generate
```

## Step 4: Seed example login user

Update `prisma/seed.ts` with:

```ts

async function main() {

    // expenses seed data...

    // create an example user for test data
    // hash password and store in db
    // username: test1@example.com
    // password: password123!
	const passwordHash = await argon2.hash("password123!");

	await prisma.user.upsert({
		where: { email: "test1@example.com" },
		update: { passwordHash },
		create: {
			email: "test1@example.com",
			passwordHash,
		},
	});
}
```

Run seed:

```bash
npx prisma db seed
```

## Step 5: Create auth DTO

Create `src/dtos/authDto.ts`:

```ts
import { z } from "zod";

export const LoginSchema = z.object({
	// schema validation for email and password fields
});

export type LoginRequestDto = z.infer<typeof LoginSchema>;

export interface LoginResponseDto {
	token: string;
}
```

## Step 6: Create auth service

Create `src/services/authService.ts`:

```ts
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import type { LoginRequestDto } from "../dtos/authDto.js";
import prisma from "../prismaClient.js";

const LOGIN_ERROR = "Invalid email or password";

export class AuthError extends Error {
	public constructor(
		public readonly statusCode: number,
		message: string,
	) {
		super(message);
	}
}

export class AuthService {
	public async login(input: LoginRequestDto): Promise<string> {
		const user = await prisma.user.findUnique({
			where: { email: input.email },
		});

		if (!user) {
			throw new AuthError(401, LOGIN_ERROR);
		}

		const validPassword = await argon2.verify(user.passwordHash, input.password);

		if (!validPassword) {
			throw new AuthError(401, LOGIN_ERROR);
		}

		const secret = process.env.JWT_SECRET;

		if (!secret) {
			throw new Error("JWT_SECRET is not configured");
		}

		return jwt.sign({ userId: user.id, email: user.email }, secret, {
			expiresIn: "1h",
		});
	}
}
```

## Step 7: Create auth controller

Create `src/controllers/authController.ts`:

```ts
import type { Request, Response } from "express";
import type {
	LoginRequestDto,
	LoginResponseDto,
} from "../dtos/authDto.js";
import { AuthError, type AuthService } from "../services/authService.js";

export class AuthController {
	public constructor(private readonly authService: AuthService) {}

	public async login(req: Request, res: Response): Promise<Response> {
		try {
			const token = await this.authService.login(req.body as LoginRequestDto);

			return res.status(200).json({ token } satisfies LoginResponseDto);
		} catch (error) {
			return this.handleError(error, res);
		}
	}

	private handleError(error: unknown, res: Response): Response {
		if (error instanceof AuthError) {
			return res.status(error.statusCode).json({ message: error.message });
		}

		return res.status(500).json({ error: "Internal server error" });
	}
}
```

## Step 8: Create auth router

Create `src/routes/authRouter.ts`:

```ts
import { Router } from "express";
import { AuthController } from "../controllers/authController.js";
import { LoginSchema } from "../dtos/authDto.js";
import { validateBody } from "../middleware/validate.js";
import { AuthService } from "../services/authService.js";

const router = Router();
const controller = new AuthController(new AuthService());

router.post("/", validateBody(LoginSchema), controller.login.bind(controller));

export default router;
```

## Step 9: Wire auth into app

Update `src/app.ts` to expose new login endpoint:

```ts
app.use("/api/login", authRouter);
```

## Step 10: Verify

Run:

```bash
npm run build
npm test
npm run dev
```

## Step 11: Test in Postman or Insomnia

Endpoint:
- Method: POST
- URL: http://localhost:4000/api/login
- Body:

```json
{
  "email": "test1@example.com",
  "password": "password123!"
}
```

Expected success:
- Status: 200
- Response body:

```json
{
  "token": "<jwt>"
}
```

Invalid credentials example:
- Method: POST
- URL: http://localhost:4000/api/login
- Body:

```json
{
  "email": "test1@example.com",
  "password": "wrong-password"
}
```

Expected failure:
- Status: 401
- Response body:

```json
{
  "message": "Invalid email or password"
}
```

## Reset and repeat

To reset and run the exercise again:

```bash
npx prisma migrate reset --force --skip-seed
npx prisma db seed
npm run dev
```
