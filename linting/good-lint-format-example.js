let total = 0;

function addItems(items) {
  for (let i = 0; i < items.length; i += 1) {
    total += items[i];
  }
}

const numbers = [1, 2, 3];
addItems(numbers);

if (total === 6) {
  console.log("Total is", total);
}
