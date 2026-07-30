# Exercise 1 — Setup Your Backend with Node.js + TypeScript

In this exercise, you'll create a modern Node.js backend using TypeScript and Express.

## Setup Instructions

Follow the [Node.js + TypeScript Guide](../../cheatssheets/nodejs-typescript-guide.md) to initialize your project with all the necessary configuration.

**Quick recap:**
1. `npm init -y`
2. `npm install express` + install dev dependencies
3. Create `tsconfig.json` and update `package.json` (see cheatsheet)
4. Create `src/` folder and `src/index.ts`
5. Run `npm run dev`

---

## Your First Express Server

Replace the contents of `src/index.ts` with this code to create your first API:

```typescript
import express from "express";

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Root endpoint
app.get("/", (req, res) => {
  res.json({ message: "Welcome to your API!" });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Try: http://localhost:${PORT}/health`);
});
```

### Test Your Server

```bash
npm run dev
```

Then in another terminal:

```bash
curl http://localhost:3000/health
```

---

## Run a build

- **Build for production** — run `npm run build` and check the `dist/` folder

---

## Useful Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript in `dist/` |
| `npm start` | Run the compiled JavaScript |

---

## Resources

- [Node.js + TypeScript Guide](../../cheatsheets/nodejs-typescript-guide.md) — Full setup reference
- [Express.js Official Docs](https://expressjs.com/en/guide/routing.html) — Routing and middleware
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) — Language reference
