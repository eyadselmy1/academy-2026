function fakeRequest(name, delay) {
  return new Promise((resolve) => {
    console.log(`Starting ${name}...`);

    setTimeout(() => {
      console.log(`Finished ${name}`);
      resolve(`${name} data`);
    }, delay);
  });
}

async function runSequential() {
  console.log("\n--- Sequential ---");

  console.time("Sequential");

  const user = await fakeRequest("User", 2000);
  const orders = await fakeRequest("Orders", 2000);
  const products = await fakeRequest("Products", 2000);

  console.timeEnd("Sequential");

  console.log({
    user,
    orders,
    products,
  });
}

async function runConcurrent() {
  console.log("\n--- Concurrent ---");

  console.time("Concurrent");

  const [user, orders, products] = await Promise.all([
    fakeRequest("User", 2000),
    fakeRequest("Orders", 2000),
    fakeRequest("Products", 2000),
  ]);

  console.timeEnd("Concurrent");

  console.log({
    user,
    orders,
    products,
  });
}

async function main() {
  await runSequential();
  await runConcurrent();
}

main();

// --- Sequential ---
// Starting User...
// Finished User
// Starting Orders...
// Finished Orders
// Starting Products...
// Finished Products
// Sequential: 6.004s
// { user: 'User data', orders: 'Orders data', products: 'Products data' }

// --- Concurrent ---
// Starting User...
// Starting Orders...
// Starting Products...
// Finished User
// Finished Orders
// Finished Products
// Concurrent: 2.001s
// { user: 'User data', orders: 'Orders data', products: 'Products data' }