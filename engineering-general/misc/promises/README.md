# Promises Exercises

## Prerequisite

- Install Node.js (v18+ recommended).

## Run The Files

From this folder, run:

```bash
node 1-promise.js
node 2-await.js
node 3-await-concurrent.js
```

Or run each file individually with the same `node <filename>` pattern.

## What Is A Promise?

A promise is a JavaScript object that represents a value you will get in the future, usually from asynchronous work like API calls, file reads, or timers.

A promise can be in one of three states:

- pending: still running
- fulfilled: finished successfully
- rejected: finished with an error

## Why `await` Is Often Preferred

`await` is often preferred because it makes asynchronous code read more like normal top-to-bottom code.

Benefits:

- Easier to read than long `.then(...).catch(...)` chains
- Easier to debug and maintain
- Cleaner error handling with `try/catch`

Under the hood, `await` still uses promises. It is mostly a cleaner syntax for working with them.
