# Exercise 4 – Interface Segregation Principle (ISP)

> **Clients should not be forced to depend on interfaces they don't use.**

## The Problem

A `Vehicle` interface has been defined to cover all possible vehicle behaviour. Classes that implement it are forced to provide methods that make no sense for them.

```typescript
interface Vehicle {
  startEngine(): void;
  stopEngine(): void;
  refuel(): void;
  chargeBattery(): void;
  pedal(): void;
}

class PetrolCar implements Vehicle {
  startEngine() { console.log("Engine started"); }
  stopEngine() { console.log("Engine stopped"); }
  refuel() { console.log("Refuelling with petrol"); }
  chargeBattery() {
    throw new Error("Petrol cars don't charge batteries");
  }
  pedal() {
    throw new Error("Cars don't have pedals");
  }
}

class ElectricCar implements Vehicle {
  startEngine() { console.log("Motor started"); }
  stopEngine() { console.log("Motor stopped"); }
  refuel() {
    throw new Error("Electric cars don't use fuel");
  }
  chargeBattery() { console.log("Charging battery"); }
  pedal() {
    throw new Error("Cars don't have pedals");
  }
}

class Bicycle implements Vehicle {
  startEngine() {
    throw new Error("Bicycles have no engine");
  }
  stopEngine() {
    throw new Error("Bicycles have no engine");
  }
  refuel() {
    throw new Error("Bicycles don't refuel");
  }
  chargeBattery() {
    throw new Error("Bicycles don't charge batteries");
  }
  pedal() { console.log("Pedalling away!"); }
}
```

## Your Task

Break the `Vehicle` interface into smaller, more focused interfaces so that each class only implements what is relevant to it.

Think about:
- What groups of behaviour naturally belong together?
- Which methods apply to which vehicle types?
- How could TypeScript's ability to implement multiple interfaces help here?

## Hints

<details>
<summary>Hint 1</summary>

Consider splitting into: `EngineOperable`, `Refuelable`, `Chargeable`, and `Pedalable` (or similar names).

</details>

<details>
<summary>Hint 2</summary>

A `PetrolCar` might implement `EngineOperable` and `Refuelable`.
An `ElectricCar` might implement `EngineOperable` and `Chargeable`.
A `Bicycle` might implement only `Pedalable`.

</details>

## Review

Once you're done, reflect on your solution:

- Are there any `throw new Error(...)` stubs left?
- If you add a `HybridCar`, which interfaces would it implement?
- How does this make the code safer to consume — especially for callers who only care about one capability?
