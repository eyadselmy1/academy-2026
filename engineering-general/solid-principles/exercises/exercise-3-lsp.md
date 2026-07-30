# Exercise 3 – Liskov Substitution Principle (LSP)

> **Subclasses must be replaceable for their base classes without breaking the application.**

## The Problem

A `Rectangle` class is used across the codebase. A developer later added a `Square` subclass by overriding `setWidth` and `setHeight`, since a square always has equal sides. However, this breaks code that relies on `Rectangle` behaving predictably.

```typescript
class Rectangle {
  protected width: number = 0;
  protected height: number = 0;

  setWidth(w: number) {
    this.width = w;
  }

  setHeight(h: number) {
    this.height = h;
  }

  area(): number {
    return this.width * this.height;
  }
}

class Square extends Rectangle {
  setWidth(w: number) {
    this.width = w;
    this.height = w; // forces equal sides
  }

  setHeight(h: number) {
    this.width = h;
    this.height = h; // forces equal sides
  }
}

// This function works fine with Rectangle...
function printArea(shape: Rectangle) {
  shape.setWidth(5);
  shape.setHeight(10);
  console.log("Expected area: 50, Got:", shape.area());
}

const rect = new Rectangle();
printArea(rect); // ✅ Expected area: 50, Got: 50

const square = new Square();
printArea(square); // ❌ Expected area: 50, Got: 100
```

## Your Task

Redesign the shape hierarchy so that substituting a `Square` for a `Rectangle` does **not** produce unexpected results.

Think about:
- Is "a Square is a Rectangle" really true in terms of behaviour, not just geometry?
- Should `Square` extend `Rectangle` at all?
- What shared abstraction could both shapes implement without breaking each other's contracts?

## Hints

<details>
<summary>Hint 1</summary>

Consider whether a shared `Shape` interface with just an `area()` method is enough — let each class manage its own dimensions internally.

</details>

<details>
<summary>Hint 2</summary>

Remove the inheritance relationship entirely. `Rectangle` and `Square` can both implement a `Shape` interface independently.

</details>

## Review

Once you're done, reflect on your solution:

- Can `printArea` (or an equivalent) now safely accept either shape?
- Did you need to override any methods in a way that changes the parent's expected behaviour?
- What does this tell you about when to use inheritance vs interfaces?
