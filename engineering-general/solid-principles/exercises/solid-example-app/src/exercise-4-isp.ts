// =============================================================
// Exercise 4 – Interface Segregation Principle (ISP)
//
// YOUR TASK:
//   The Vehicle interface covers ALL possible vehicle behaviours.
//   Classes that implement it are forced to throw errors for
//   methods that don't apply to them (e.g. Bicycle.refuel()).
//
//   Split Vehicle into smaller, focused interfaces so each class
//   only implements what it actually supports.
//
// Run:  npm run exercise-4
// =============================================================

interface Vehicle {
  startEngine(): void;
  stopEngine(): void;
  refuel(): void;
  chargeBattery(): void;
  pedal(): void;
}

class PetrolCar implements Vehicle {
  startEngine() {
    console.log("Engine started");
  }
  stopEngine() {
    console.log("Engine stopped");
  }
  refuel() {
    console.log("Refuelling with petrol");
  }
  chargeBattery() {
    throw new Error("Petrol cars don't charge batteries");
  }
  pedal() {
    throw new Error("Cars don't have pedals");
  }
}

class ElectricCar implements Vehicle {
  startEngine() {
    console.log("Motor started");
  }
  stopEngine() {
    console.log("Motor stopped");
  }
  refuel() {
    throw new Error("Electric cars don't use fuel");
  }
  chargeBattery() {
    console.log("Charging battery");
  }
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
  pedal() {
    console.log("Pedalling away!");
  }
}

const petrol = new PetrolCar();
petrol.startEngine();
petrol.refuel();

const electric = new ElectricCar();
electric.startEngine();
electric.chargeBattery();

const bike = new Bicycle();
bike.pedal();
