// =============================================================
// Exercise 1 – Single Responsibility Principle (SRP)
//
// YOUR TASK:
//   Refactor it so each class has only ONE reason to change.
//   Wire them together so the output at the bottom still works.
//
// Run:  npm run exercise-1
// =============================================================

class BlogPost {
  title: string;
  content: string;
  author: string;

  constructor(title: string, content: string, author: string) {
    this.title = title;
    this.content = content;
    this.author = author;
  }

  // Persistence
  saveToDatabase() {
    console.log(`Saving "${this.title}" to the database...`);
  }

  // Formatting
  renderAsHtml(): string {
    return `<h1>${this.title}</h1><p>By ${this.author}</p><p>${this.content}</p>`;
  }

  // Notification
  notifySubscribers() {
    console.log(`Sending email notification for new post: "${this.title}"`);
  }
}

const post = new BlogPost("SOLID Rocks", "Here is why...", "Alice");
post.saveToDatabase();
console.log(post.renderAsHtml());
post.notifySubscribers();
