function getUser(id) {
  return new Promise((resolve, reject) => {
    console.log(`Looking up user ${id}...`);

    setTimeout(() => {
      if (id === 1) {
        resolve("Tom");
      } else {
        reject(new Error("User not found"));
      }
    }, 2000);
  });
}

console.log("Start");

getUser(1)
  .then((user) => {
    console.log(`Found user: ${user}`);
  })
  .catch((error) => {
    console.log(error.message);
  });

console.log("End");