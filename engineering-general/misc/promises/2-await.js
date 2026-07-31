function getUser(id) {
  return new Promise((resolve, reject) => {
    console.log(`Looking up user ${id}...`);

    setTimeout(() => {
      if (id === 1) {
        resolve("Matthew");
      } else {
        reject(new Error("User not found"));
      }
    }, 2000);
  });
}

async function main() {
  console.log("Start");

  try {
    const user = await getUser(1);
    console.log(`Found user: ${user}`);
  } catch (error) {
    console.log(error.message);
  }

  console.log("End");
}

main();

// chains of .thens() can get a bit hard to maintain
// getUser(1)
//   .then(getOrders)
//   .then(getInvoice)
//   .then(console.log)
//   .catch(console.error);

// awaits a bit cleaner, more sequential
// try {
//   const user = await getUser(1);
//   const orders = await getOrders(user);
//   const invoice = await getInvoice(orders);

//   console.log(invoice);
// } catch (error) {
//   console.error(error);
// }