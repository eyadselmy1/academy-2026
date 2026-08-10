---
name: protect-expenses-auth
description: Protect expenses endpoints with JWT bearer auth middleware while keeping login public
---

# Task: Protect Expenses Endpoints with JWT Middleware

You are implementing route protection for a REST API built with:

* Node.js
* TypeScript
* Express
* Prisma ORM
* JSON Web Tokens (JWT)

## Requirements

Implement the following features:

### 1. Middleware

Create JWT authentication middleware to validate bearer tokens.

Rules:

* Read the token from `Authorization: Bearer <token>`.
* Verify token with `JWT_SECRET`.
* If missing/invalid token, return:

```json
{
  "message": "Invalid token"
}
```

with `401 Unauthorized`.

* Keep error responses generic.

---

### 2. Route Protection

Protect all expenses routes with the middleware:

* `GET /api/expenses`
* `GET /api/expenses/:id`
* `POST /api/expenses`
* `PUT /api/expenses/:id`
* `DELETE /api/expenses/:id`

Keep login public at:

* `POST /api/login`

---

### 3. App Wiring

Ensure app routing keeps this shape:

* Auth mounted at `/api/login`
* Expenses mounted at `/api/expenses`

Do not move login behind auth middleware.

---

### 4. Verification Scenarios

Document and validate these outcomes:

1. Login succeeds with valid credentials and returns JWT.
2. Expenses endpoint without token returns `401` + `Invalid token`.
3. Expenses endpoint with valid token succeeds.

---

## Technical Requirements

* Use TypeScript.
* Use async/await where needed.
* Keep middleware separate from route/controller/service logic.
* Use appropriate HTTP status codes.

---

## Deliverables

Implement:

* JWT auth middleware file
* Protected expenses routes
* Public login route remains available
* Clear error handling for unauthorized requests
* Postman/Insomnia request examples for protected route testing
