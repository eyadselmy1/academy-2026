// =============================================================
// Exercise 2 – Open/Closed Principle (OCP)
//
// YOUR TASK:
//   DiscountCalculator uses if/else chains that grow every time
//   a new customer type is added — requiring edits to existing code.
//
//   Refactor it so adding a new discount type (e.g. "pensioner"
//   at 40% off) requires NO changes to existing classes.
//
// Run:  npm run exercise-2
// =============================================================

// ---- PROBLEM CODE (do not delete — understand it first) -----

class DiscountCalculator {
  calculate(customerType: string, price: number): number {
    if (customerType === "student") {
      return price * 0.8; // 20% off
    }

    if (customerType === "employee") {
      return price * 0.7; // 30% off
    }

    if (customerType === "vip") {
      return price * 0.5; // 50% off
    }

    return price; // no discount
  }
}

const calc = new DiscountCalculator();
console.log("Student price:  ", calc.calculate("student", 100)); // 80
console.log("VIP price:      ", calc.calculate("vip", 100)); // 50
console.log("Standard price: ", calc.calculate("standard", 100)); // 100
