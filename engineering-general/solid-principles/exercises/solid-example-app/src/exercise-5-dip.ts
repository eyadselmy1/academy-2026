// =============================================================
// Exercise 5 – Dependency Inversion Principle (DIP)
//
// YOUR TASK:
//   ReportGenerator directly instantiates PdfExporter inside the
//   class — hard-wiring it to one export format. Swapping to CSV
//   or JSON requires editing ReportGenerator itself.
//
//   Refactor it so ReportGenerator depends on an abstraction.
//   Then demonstrate swapping in a CsvExporter with zero changes
//   to the generator.
//
// Run:  npm run exercise-5
// =============================================================

class PdfExporter {
  export(content: string): void {
    console.log(`Exporting to PDF:\n${content}`);
  }
}

class ReportGenerator {
  private exporter = new PdfExporter(); // ❌ hard dependency

  generate(data: string[]): void {
    const content = data.join("\n");
    console.log("Generating report...");
    this.exporter.export(content);
  }
}

const generator = new ReportGenerator();
generator.generate(["Sales: £10,000", "Costs: £4,000", "Profit: £6,000"]);
