# Exercise 10 — Forms, Create, Update & Delete

In this exercise you'll extend your expenses frontend with forms that **send data** to the server. You'll add routes for creating, editing, and deleting expenses, build Nunjucks form templates, and learn the Post/Redirect/Get pattern.

This exercise builds directly on Exercise 9. You should already have Nunjucks and GOV.UK Frontend configured, a base layout with header/footer partials, and working list and detail pages.

> 🎥 Refer to the **Frontend Forms slides** for all code patterns — the slides use a blog posts domain as worked examples, so you'll need to adapt them to expenses.

---

## What's New in This Exercise

In Exercise 8 your pages only **read** data — the browser sent GET requests and the server rendered HTML. Now you need to handle **user input**:

- **HTML forms** submit data via POST requests
- The controller reads form data from `req.body`
- After processing, the controller **redirects** (not renders) to avoid duplicate submissions

This is the **Post/Redirect/Get (PRG)** pattern:

```
User submits form → POST /expenses → Controller creates expense → redirect to GET /expenses
```

> Without PRG, refreshing the page after a form submission would re-submit the data.

---

## What You're Building

By the end of this exercise your project structure adds these files:

```
src/
├── routes/
│   └── expenseRouter.ts        ← UPDATE — add POST routes
├── views/
│   └── pages/
│       ├── expenses.njk        ← UPDATE — add "Add new expense" button and Edit links
│       ├── expense-detail.njk  ← UPDATE — add Edit link and Delete button
│       ├── expense-form.njk    ← NEW — create / edit form
│       └── expense-delete.njk  ← NEW (stretch) — confirm deletion
├── index.ts                    ← UPDATE — add urlencoded middleware
```

---

## Step 1 — Enable Form Body Parsing

HTML forms send data as URL-encoded key-value pairs. Express doesn't parse this by default — you need to add middleware.

In `index.ts` (or `app.ts`), add `express.urlencoded({ extended: true })` **before** your routes are registered.

> Without this, `req.body` will be `undefined` when a form is submitted. Refer to the slides for the exact middleware call.

---

## Step 2 — Add New Routes to the Router

Open `src/routes/expenseRouter.ts` and add the routes for forms and write operations.

Your router should now handle:

| Method | Path | Controller method | Purpose |
|--------|------|-------------------|---------|
| `GET` | `/expenses` | `getAll` | List all expenses |
| `GET` | `/expenses/new` | `showCreateForm` | Show the "create" form |
| `GET` | `/expenses/:id` | `getById` | View a single expense |
| `GET` | `/expenses/:id/edit` | `showEditForm` | Show the "edit" form |
| `POST` | `/expenses` | `create` | Handle form submission (create) |
| `POST` | `/expenses/:id/edit` | `update` | Handle form submission (update) |
| `POST` | `/expenses/:id/delete` | `delete` | Handle deletion |

> **Important:** Place `/expenses/new` **before** `/expenses/:id` — otherwise Express treats `"new"` as an `:id` parameter.

Refer to the slides for the route ordering rules and the TypeScript router syntax. Make sure the full route order is:

1. `GET /expenses`
2. `GET /expenses/new`
3. `GET /expenses/:id`
4. `GET /expenses/:id/edit`
5. `POST /expenses`
6. `POST /expenses/:id/edit`
7. `POST /expenses/:id/delete`

---

## Step 3 — Create the Expense Form Template

Create `src/views/pages/expense-form.njk`.

This single template handles **both** creating and editing. The controller passes an `expense` object when editing, and nothing when creating. Use Nunjucks `{% if expense %}` conditionals to change the page title, form `action`, and button text accordingly. Refer to the slides for the shared template pattern.

Your form needs the following fields. For each field, use the appropriate GOV.UK component:

| Field | Input type | GOV.UK component |
|-------|-----------|------------------|
| `date` | `date` | [Date Input](https://design-system.service.gov.uk/components/date-input/) |
| `description` | `text` | [Text Input](https://design-system.service.gov.uk/components/text-input/) |
| `user` | `text` | [Text Input](https://design-system.service.gov.uk/components/text-input/) |
| `amount` | `number` | [Text Input](https://design-system.service.gov.uk/components/text-input/) |

Each field must:
- Have a `name` attribute matching the field name above — this is the key used in `req.body`
- Pre-fill the `value` when editing (use a Nunjucks conditional: `{{ expense.fieldName if expense else '' }}`)
- Be wrapped in a `govuk-form-group` div with a `govuk-label`

For the submit button, use the [GOV.UK Button component](https://design-system.service.gov.uk/components/button/). Change the button text between "Add expense" (create) and "Update expense" (edit) using a Nunjucks conditional.

Don't forget a back link and a cancel link pointing to `/expenses`.

---

## Step 4 — Update the List Page

Open `src/views/pages/expenses.njk` and make two additions:

1. Add an "Add new expense" link styled as a primary button above the table. Use the [GOV.UK Button component](https://design-system.service.gov.uk/components/button/) — it should link to `/expenses/new`.

2. Add an **Actions** column to your table with an "Edit" link for each row pointing to `/expenses/{{ expense.id }}/edit`. Use the `govuk-link` class.

---

## Step 5 — Update the Detail Page

Open `src/views/pages/expense-detail.njk` and add two actions:

1. An **Edit** link styled as a secondary button pointing to `/expenses/{{ expense.id }}/edit`. Use the [GOV.UK Button — Secondary variant](https://design-system.service.gov.uk/components/button/#secondary-buttons).

2. A **Delete** button. Because HTML forms don't support DELETE requests, this must be a `<form>` with `method="POST"` and `action="/expenses/{{ expense.id }}/delete"` containing a submit button. Use the [GOV.UK Button — Warning variant](https://design-system.service.gov.uk/components/button/#warning-buttons) (`govuk-button--warning`) for the destructive red style.

The controller should respond to the delete POST by deleting the expense and redirecting to `/expenses` — the Post/Redirect/Get pattern. Refer to the slides for the delete form pattern.

---

## Step 6 — Test the Full Flow

Start the server and walk through every operation:

```bash
npm run dev
```

| Action | URL/Method | Expected result |
|--------|-----------|-----------------|
| View all expenses | `GET /expenses` | Table with 3 expenses, "Add new" button, Edit links |
| Click "Add new expense" | `GET /expenses/new` | Empty form |
| Submit the create form | `POST /expenses` | Redirects to `/expenses`, new expense in the table |
| Click a description link | `GET /expenses/1` | Detail page with Edit link and Delete button |
| Click "Edit" | `GET /expenses/1/edit` | Pre-filled form |
| Submit the edit form | `POST /expenses/1/edit` | Redirects to detail page, updated data shown |
| Click "Delete" | `POST /expenses/1/delete` | Redirects to `/expenses`, expense removed from table |
| Visit a non-existent expense | `GET /expenses/999` | 404 error |

---

## Step 7 — Create the Delete Confirmation Page (Stretch Goal)

Create `src/views/pages/expense-delete.njk`.

Instead of deleting immediately from the detail page, route through a confirmation page:

- Show the expense details (description, amount, date)
- Ask "Are you sure you want to delete this expense?"
- Provide a [GOV.UK Warning Button](https://design-system.service.gov.uk/components/button/#warning-buttons) form that POSTs to `/expenses/{{ expense.id }}/delete`
- Provide a "Cancel" link back to `/expenses/{{ expense.id }}`

This requires adding a `GET /expenses/:id/delete` route that renders the confirmation page, and updating the detail page's delete action to link here first rather than POSTing directly.

---

## Tips

- The controller reads form data from `req.body` — each `name` attribute on your `<input>` elements becomes a key (e.g. `<input name="description">` → `req.body.description`)
- After create/update/delete the controller should call `res.redirect()`, not `res.render()` — this is the PRG pattern
- The `amount` field comes from the form as a **string** — parse it with `parseFloat()` before storing
- Use the browser's DevTools **Network** tab to inspect form submissions and redirects
- If the form submits but data is missing, check that `express.urlencoded()` middleware is registered **before** the routes
- Test edge cases: submit with empty fields, edit a non-existent expense, delete the same expense twice

---

## Stretch Goals

If you finish early:

1. **Validation errors** — Show field-level errors on the form when fields are missing. The controller can pass an `errors` array — use [GOV.UK Error Summary](https://design-system.service.gov.uk/components/error-summary/) and [Error Message](https://design-system.service.gov.uk/components/error-message/) components
2. **Flash messages** — Show a green success banner ("Expense created") after each operation using session-based flash messages
3. **Confirm before delete** — Implement the delete confirmation page from Step 7
4. **Responsive form layout** — Wrap the form in `govuk-grid-row` and `govuk-grid-column-two-thirds` to match GOV.UK form page patterns

---

## Resources

- [Exercise 8 — Set Up the Expenses Frontend](./exercise-8-frontend.md)
- [Frontend Development slides](./frontend-dev/frontend-dev.md)
- [GOV.UK Text Input](https://design-system.service.gov.uk/components/text-input/)
- [GOV.UK Button](https://design-system.service.gov.uk/components/button/)
- [GOV.UK Error Summary](https://design-system.service.gov.uk/components/error-summary/)
- [Nunjucks Documentation](https://mozilla.github.io/nunjucks/)
- [Express.js `req.body`](https://expressjs.com/en/api.html#req.body)
- [Post/Redirect/Get pattern](https://en.wikipedia.org/wiki/Post/Redirect/Get)
