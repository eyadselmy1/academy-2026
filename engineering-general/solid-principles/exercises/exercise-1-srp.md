# Exercise 1 – Single Responsibility Principle (SRP)

> **A class should have only one reason to change.**

## The Problem

The following `BlogPost` class does too much. Read through it and identify all the different responsibilities it has.

```typescript
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
    // imagine DB logic here
  }

  // Formatting
  renderAsHtml(): string {
    return `<h1>${this.title}</h1><p>By ${this.author}</p><p>${this.content}</p>`;
  }

  // Notification
  notifySubscribers() {
    console.log(`Sending email notification for new post: "${this.title}"`);
    // imagine email sending logic here
  }
}

// Usage
const post = new BlogPost("SOLID Rocks", "Here is why...", "Alice");
post.saveToDatabase();
console.log(post.renderAsHtml());
post.notifySubscribers();
```

## Your Task

Refactor this code so that each class has **only one responsibility**.

Think about:
- What distinct concerns exist in this class?
- How would you name each new class to make its purpose obvious?
- How would you wire them together so the functionality still works?

## Hints

<details>
<summary>Hint 1</summary>

Count the comments — each comment block hints at a separate responsibility.

</details>

<details>
<summary>Hint 2</summary>

Consider creating: `BlogPostRepository`, `BlogPostRenderer`, and `BlogPostNotifier`.
A separate coordinator (or the caller) can tie them together.

</details>

## Review

Once you're done, reflect on your solution:

- Could you now test each class in isolation?
- If the email provider changed, which class would you touch?
- If the HTML template changed, which class would you touch?
- Does a single change in one area risk breaking another?
