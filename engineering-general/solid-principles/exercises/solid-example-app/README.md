# SOLID Principles Exercises

Five hands-on TypeScript exercises — one per SOLID principle.

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (comes with Node.js)

## Setup

```bash
npm install
```

## Running an Exercise

Each exercise file contains broken or poorly designed code.
Your job is to refactor it to apply the relevant SOLID principle.

```bash
# Run exercise 1 — Single Responsibility Principle (SRP)
npm run exercise-1

# Run exercise 2 — Open/Closed Principle (OCP)
npm run exercise-2

# Run exercise 3 — Liskov Substitution Principle (LSP)
npm run exercise-3

# Run exercise 4 — Interface Segregation Principle (ISP)
npm run exercise-4

# Run exercise 5 — Dependency Inversion Principle (DIP)
npm run exercise-5
```

## Exercise Overview

| File | Principle | Scenario |
|---|---|---|
| `src/exercise-1-srp.ts` | **SRP** | `BlogPost` mixes persistence, HTML rendering, and notifications |
| `src/exercise-2-ocp.ts` | **OCP** | `DiscountCalculator` uses hardcoded `if` chains per customer type |
| `src/exercise-3-lsp.ts` | **LSP** | `Square extends Rectangle` produces unexpected area results |
| `src/exercise-4-isp.ts` | **ISP** | Fat `Vehicle` interface forces `Bicycle` to implement `refuel()` |
| `src/exercise-5-dip.ts` | **DIP** | `ReportGenerator` is hard-wired to `PdfExporter` |

## Workflow

1. Read the `// YOUR TASK` comment at the top of the file
2. Run the file and observe the output
3. Refactor the code
