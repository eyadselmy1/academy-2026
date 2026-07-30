# Exercise 9 — Set Up the Expenses Frontend

In this exercise you'll configure a templating engine, set up the GOV.UK Design System, and create read-only pages that display expense data. The starter project gives you an Express app with an in-memory `ExpenseService` and a complete `ExpenseController` — your job is to install the frontend tooling and create the views.

This exercise focuses on **Nunjucks setup**, **GOV.UK Frontend**, **base layouts**, **partials**, and **read-only page templates** (GET all and GET by ID).

---

## What's Already Provided

The starter project contains:

```
src/
├── services/
│   └── expenseService.ts      ← in-memory CRUD (hardcoded data)
├── controllers/
│   └── expenseController.ts   ← getAll, getById, create, update, delete
└── index.ts                   ← Express configured, listening on port 3000
```

The `ExpenseService` stores expenses in an array — no database needed:

```typescript
// What the provided service looks like (don't modify this)
const expenses = [
  { id: 1, date: "2026-01-15", description: "Lunch with client", user: "Alice", amount: 25.50 },
  { id: 2, date: "2026-01-20", description: "Train ticket to London", user: "Bob", amount: 85.00 },
  { id: 3, date: "2026-02-03", description: "Office supplies", user: "Alice", amount: 42.99 },
];
```

The `ExpenseController` has methods for all CRUD operations. Each method calls the service and then renders a Nunjucks template using `res.render()`. In this exercise you'll only use the `getAll` and `getById` methods — the rest come in Exercise 9.

---

## What You're Building

By the end of this exercise your project structure should look like this:

```
src/
├── services/
│   └── expenseService.ts       ← no changes needed
├── controllers/
│   └── expenseController.ts    ← no changes needed
├── routes/
│   └── expenseRouter.ts        ← NEW — wire GET URLs to controller methods
├── views/
│   ├── layouts/
│   │   └── base.njk            ← NEW — GOV.UK page shell
│   ├── partials/
│   │   ├── header.njk          ← NEW — GOV.UK header
│   │   └── footer.njk          ← NEW — GOV.UK footer
│   └── pages/
│       ├── expenses.njk        ← NEW — list all expenses
│       └── expense-detail.njk  ← NEW — view a single expense
├── index.ts                    ← UPDATE — register Nunjucks, assets & router
└── app.ts                      ← UPDATE — extract Express app for reuse
```

---

## Step 1 — Install Nunjucks and GOV.UK Frontend

Install the packages you need:

```bash
npm install nunjucks govuk-frontend
npm install @types/nunjucks --save-dev
```

---

## Step 2 — Configure Nunjucks in Your App

In `index.ts` (or `app.ts` if you've extracted it), configure Nunjucks as the view engine.

You need to tell Nunjucks where to find templates — both your own views **and** the GOV.UK Frontend templates:

```typescript
import nunjucks from "nunjucks";
import path from "path";

nunjucks.configure(
  [
    path.join(__dirname, "views"),
    path.join(__dirname, "..", "node_modules", "govuk-frontend", "dist"),
  ],
  {
    autoescape: true,
    express: app,
  }
);
```

> `autoescape: true` protects against XSS by escaping HTML in variables by default.

---

## Step 3 — Serve GOV.UK Static Assets

GOV.UK Frontend ships with CSS, JavaScript, and font files. You need to serve them as static assets:

```typescript
app.use(
  "/assets",
  express.static(
    path.join(__dirname, "..", "node_modules", "govuk-frontend", "dist", "govuk", "assets")
  )
);

app.use(
  "/govuk-frontend.min.css",
  express.static(
    path.join(__dirname, "..", "node_modules", "govuk-frontend", "dist", "govuk", "govuk-frontend.min.css")
  )
);

app.use(
  "/govuk-frontend.min.js",
  express.static(
    path.join(__dirname, "..", "node_modules", "govuk-frontend", "dist", "govuk", "govuk-frontend.min.js")
  )
);
```

> These paths may vary depending on the version of `govuk-frontend` you install. Check the `node_modules/govuk-frontend/dist/govuk/` directory to confirm.

---

## Step 4 — Create the Base Layout

Create `src/views/layouts/base.njk`. This is the page shell that every page will extend:

```html
<!DOCTYPE html>
<html lang="en" class="govuk-template">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{% block title %}Expenses{% endblock %} — Expense Tracker</title>
  <link rel="stylesheet" href="/govuk-frontend.min.css" />
</head>
<body class="govuk-template__body">
  <script>document.body.className += ' js-enabled';</script>

  {% include "partials/header.njk" %}

  <div class="govuk-width-container">
    <main class="govuk-main-wrapper" id="main-content" role="main">
      {% block content %}{% endblock %}
    </main>
  </div>

  {% include "partials/footer.njk" %}

  <script src="/govuk-frontend.min.js"></script>
</body>
</html>
```

**Key concepts:**
- `{% block title %}` / `{% block content %}` — child templates override these
- `{% include %}` — pulls in reusable partial templates
- GOV.UK CSS classes provide all styling automatically

---

## Step 5 — Create Header and Footer Partials

Create `src/views/partials/header.njk`:

```html
<header class="govuk-header" role="banner" data-module="govuk-header">
  <div class="govuk-header__container govuk-width-container">
    <div class="govuk-header__content">
      <a href="/" class="govuk-header__link govuk-header__service-name">
        Expense Tracker
      </a>
    </div>
  </div>
</header>
```

Create `src/views/partials/footer.njk`:

```html
<footer class="govuk-footer" role="contentinfo">
  <div class="govuk-width-container">
    <div class="govuk-footer__meta">
      <div class="govuk-footer__meta-item govuk-footer__meta-item--grow">
        <span class="govuk-footer__licence-description">
          Built as a learning exercise
        </span>
      </div>
    </div>
  </div>
</footer>
```

---

## Step 6 — Create the Expense Router

Create `src/routes/expenseRouter.ts`. For now you only need the two GET routes:

| Method | Path | Controller method | Purpose |
|--------|------|-------------------|---------|
| `GET` | `/expenses` | `getAll` | List all expenses |
| `GET` | `/expenses/:id` | `getById` | View a single expense |

```typescript
import { Router } from "express";
import { ExpenseController } from "../controllers/expenseController";
import { ExpenseService } from "../services/expenseService";

const router = Router();
const service = new ExpenseService();
const controller = new ExpenseController(service);

router.get("/expenses",      (req, res) => controller.getAll(req, res));
router.get("/expenses/:id",  (req, res) => controller.getById(req, res));

export default router;
```

---

## Step 7 — Register the Router

In `index.ts`, import and mount the router:

```typescript
import expenseRouter from "./routes/expenseRouter";

app.use(expenseRouter);
```

---

## Step 8 — Create the List Page

Create `src/views/pages/expenses.njk`:

```html
{% extends "layouts/base.njk" %}

{% block title %}All Expenses{% endblock %}

{% block content %}
  <h1 class="govuk-heading-l">All Expenses</h1>

  {% if expenses.length > 0 %}
    <table class="govuk-table">
      <thead class="govuk-table__header">
        <tr>
          <th class="govuk-table__header">Date</th>
          <th class="govuk-table__header">Description</th>
          <th class="govuk-table__header">User</th>
          <th class="govuk-table__header">Amount</th>
        </tr>
      </thead>
      <tbody class="govuk-table__body">
        {% for expense in expenses %}
          <tr class="govuk-table__row">
            <td class="govuk-table__cell">{{ expense.date }}</td>
            <td class="govuk-table__cell">
              <a href="/expenses/{{ expense.id }}" class="govuk-link">
                {{ expense.description }}
              </a>
            </td>
            <td class="govuk-table__cell">{{ expense.user }}</td>
            <td class="govuk-table__cell">£{{ expense.amount }}</td>
          </tr>
        {% endfor %}
      </tbody>
    </table>
  {% else %}
    <p class="govuk-body">No expenses found.</p>
  {% endif %}
{% endblock %}
```

**Test it:** Start the server and visit `http://localhost:3000/expenses`. You should see a table with the three hardcoded expenses.

---

## Step 9 — Create the Detail Page

Create `src/views/pages/expense-detail.njk`:

This page should:

- Extend the base layout
- Display all fields for a single expense (date, description, user, amount)
- Include a "Back to all expenses" link

Use these GOV.UK classes:
- `govuk-summary-list` for displaying key-value pairs
- `govuk-back-link` for navigation

> Check the [GOV.UK Summary List component](https://design-system.service.gov.uk/components/summary-list/) for the HTML structure.

**Test it:** Click on any expense description in the list page — you should see the detail view for that expense.

---

## Expected Behaviour

Start the server and test:

```bash
npm run dev
```

| Action | URL | Expected result |
|--------|-----|-----------------|
| View all expenses | `GET /expenses` | Table showing 3 hardcoded expenses |
| Click an expense description | `GET /expenses/1` | Detail page for that expense |
| View expense 2 | `GET /expenses/2` | Detail page for Bob's train ticket |
| Visit a non-existent expense | `GET /expenses/999` | 404 page or error message |
| Visit an invalid ID | `GET /expenses/abc` | 400 error |

---

## Tips

- Check the provided `ExpenseController` to see what template names and variables each method passes to `res.render()` — your template filenames must match
- Nunjucks `autoescape` is on — you don't need to manually escape user input in templates
- If styles aren't loading, check the static asset paths in the browser console
- The GOV.UK Design System website has copy-paste HTML for every component — use it
- If you see a blank page, check the terminal for Nunjucks errors — usually a typo in a template path

---

## Stretch Goals

If you finish early:

1. **Add a home page** — Create a simple `index.njk` that links to `/expenses`, and add a `GET /` route
2. **Navigation** — Add nav links to the header partial
3. **Responsive layout** — Wrap the detail page content in `govuk-grid-row` and `govuk-grid-column-two-thirds`
4. **Date formatting** — Create a Nunjucks filter to format dates nicely (e.g. "15 January 2026")

---

## Resources

- [Frontend Development slides](./frontend-dev/frontend-dev.md)
- [Nunjucks Documentation](https://mozilla.github.io/nunjucks/)
- [GOV.UK Design System](https://design-system.service.gov.uk/)
- [GOV.UK Design System Components](https://design-system.service.gov.uk/components/)
- [Express.js `res.render()`](https://expressjs.com/en/api.html#res.render)
