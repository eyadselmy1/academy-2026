---
name: user-auth
description: Implement login-only JWT auth with Prisma user model and seeded test user
---

<!-- Tip: Use /create-prompt in chat to generate content with agent assistance -->

# Task: Implement JWT Authentication in a Node.js API

You are implementing authentication for a REST API built with:

* Node.js
* TypeScript
* Express
* Prisma ORM
* PostgreSQL
* Argon2 for password hashing
* JSON Web Tokens (JWT)

## Requirements

Implement the following features:

### 1. Database

Use Prisma to define and migrate a `User` model.

Requirements:

* `id` (primary key)
* `email` (unique)
* `passwordHash`
* `createdAt`

Do **not** store plain text passwords.

Use Prisma migrations to create the database schema.

---

### 2. Password Hashing

Use the `argon2` package.

When logging in:

* Retrieve the user by email.
* Verify the supplied password against the stored hash using Argon2.

---

### 3. Login Endpoint (Only Auth Endpoint)

Implement:

```
POST /api/login
```

Do not implement a register endpoint.

Note: auth routes are mounted under `/api`.

The request body should be:

```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

The endpoint should:

1. Validate the request body.
2. Find the user by email using Prisma.
3. Verify the password using Argon2.
4. If authentication fails, return:

```
401 Unauthorized
```

with a generic error message such as:

```json
{
  "message": "Invalid email or password"
}
```

Do not reveal whether the email or password was incorrect.

---

### 4. JWT Generation

If authentication succeeds:

* Generate a JWT using `jsonwebtoken`.
* Sign it using a secret stored in an environment variable.
* Include only the minimum required information in the payload, for example:

```json
{
  "userId": 1,
  "email": "user@example.com"
}
```

Set an expiry time of one hour.

Return:

```json
{
  "token": "<jwt>"
}
```

Manual setup step for the user:

1. Generate a JWT secret with OpenSSL:

```bash
openssl rand -hex 32
```

2. Add it to `.env` as `JWT_SECRET=<generated_value>`.

---

### 5. Seed Data (Example User)

Update the Prisma seed script to include an example user:

* Email: `test1@example.com`
* Password: `password123!`

Requirements:

* Hash the password using Argon2 before storing it.
* Keep seeding idempotent (safe to run multiple times).

---

## Technical Requirements

* Use TypeScript throughout.
* Use async/await.
* Keep authentication logic separate from routing where appropriate.
* Read configuration values from `.env`.
* Use Prisma Client for all database access.
* Use appropriate HTTP status codes.

---

## Deliverables

Implement:

* Prisma schema
* Prisma migration
* `POST /api/login` endpoint
* No register endpoint
* Password verification using Argon2
* JWT generation
* Seed script entry for the example user (`test1@example.com`) with a hashed password
* Appropriate error handling
