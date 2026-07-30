# Exercise 5 – Dependency Inversion Principle (DIP)

> **High-level modules should not depend on low-level modules. Both should depend on abstractions.**

## The Problem

A `ReportGenerator` is responsible for compiling a report and exporting it. It directly instantiates a `PdfExporter` — tying the high-level report logic to a specific low-level export format.

```typescript
class PdfExporter {
  export(content: string): void {
    console.log(`Exporting to PDF:\n${content}`);
  }
}

class ReportGenerator {
  private exporter = new PdfExporter(); // ❌ hard dependency on concrete class

  generate(data: string[]): void {
    const content = data.join("\n");
    console.log("Generating report...");
    this.exporter.export(content);
  }
}

// Usage
const generator = new ReportGenerator();
generator.generate(["Sales: £10,000", "Costs: £4,000", "Profit: £6,000"]);
```

## Your Task

Refactor this so that `ReportGenerator` depends on an **abstraction**, not a concrete exporter. Then make it easy to swap in a `CsvExporter` or `JsonExporter` without touching `ReportGenerator`.

Think about:
- What interface should the exporter implement?
- How should `ReportGenerator` receive its exporter dependency?
- How does this change make unit testing possible?

## Hints

<details>
<summary>Hint 1</summary>

Define an `Exporter` interface with a single method: `export(content: string): void`.
Have `PdfExporter` implement it.

</details>

<details>
<summary>Hint 2</summary>

Inject the `Exporter` into `ReportGenerator` via its **constructor** rather than instantiating it internally.
Create `CsvExporter` and `JsonExporter` classes to demonstrate the flexibility.

</details>

## Review

Once you're done, reflect on your solution:

- Can you now pass a `CsvExporter` to `ReportGenerator` without any changes to it?
- How would you write a unit test for `ReportGenerator` using a mock exporter?
- Where in the codebase does the decision of *which* exporter to use now live?
- How does this relate to the Open/Closed Principle from Exercise 2?
