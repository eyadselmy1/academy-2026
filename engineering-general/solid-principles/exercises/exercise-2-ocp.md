# Exercise 2 – Open/Closed Principle (OCP)

> **Software should be open for extension but closed for modification.**

## The Problem

The following `DiscountCalculator` uses a chain of `if` statements to handle different customer types. Every time a new customer type is introduced, this class must be edited.

```typescript
class DiscountCalculator {
  calculate(customerType: string, price: number): number {
    if (customerType === "student") {
      return price * 0.8; // 20% discount
    }

    if (customerType === "employee") {
      return price * 0.7; // 30% discount
    }

    if (customerType === "vip") {
      return price * 0.5; // 50% discount
    }

    return price; // no discount
  }
}

// Usage
const calc = new DiscountCalculator();
console.log(calc.calculate("student", 100));   // 80
console.log(calc.calculate("vip", 100));        // 50
console.log(calc.calculate("standard", 100));   // 100
```

## Your Task

Refactor this so that adding a new customer type (e.g. `"pensioner"` with 40% off) requires **no changes** to existing classes.

Think about:
- What abstraction could represent any discount strategy?
- How should `DiscountCalculator` (or a replacement) receive that strategy?
- How would a caller wire up the correct strategy at runtime?

## Hints

<details>
<summary>Hint 1</summary>

Define an interface (e.g. `DiscountStrategy`) with a single method like `apply(price: number): number`.

</details>

<details>
<summary>Hint 2</summary>

Create a concrete class for each customer type (e.g. `StudentDiscount`, `VipDiscount`) that implements the interface.
Inject the strategy into a `PriceCalculator` class via its constructor.

</details>

## Review

Once you're done, reflect on your solution:

- To add `PensionerDiscount`, did you need to touch any existing class?
- Is the old `if/else` chain gone entirely?
- What would happen if you needed to combine two discounts?
