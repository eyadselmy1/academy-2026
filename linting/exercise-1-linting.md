# Exercise 1: BiomeJS Setup

This exercise walks you through setting up BiomeJS for formatting and linting in a Node.js/TypeScript project.

## Why Biome?

Biome is an all-in-one tool for:
- Formatting code
- Linting code
- Organizing imports

It can replace separate tools like Prettier + ESLint for many projects.

## 1. Install Biome

Run:

```bash
npm install --save-dev @biomejs/biome
```

## 2. Initialize Biome

Run:

```bash
npx @biomejs/biome init
```

This creates a `biome.json` configuration file.

## 3. Add Basic Configuration

Use this as a starting point in `biome.json`:

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "tab"
  }
}
```

## 4. Run Biome Commands

Format files:

```bash
npx @biomejs/biome format --write .
```

Lint files:

```bash
npx @biomejs/biome lint --write .
```

Run full checks (format + lint + assists):

```bash
npx @biomejs/biome check --write .
```

## 5. Add Scripts to package.json

Add these scripts:

```json
{
  "scripts": {
    "format": "biome format --write .",
    "lint": "biome lint --write .",
    "check": "biome check --write .",
    "ci:check": "biome ci ."
  }
}
```

- Use `format`, `lint`, and `check` during development.
- Use `ci:check` in CI/CD to validate without modifying files.

## 6. VS Code Integration (Recommended)

Install the Biome VS Code extension for fast feedback while coding.

Reference: https://biomejs.dev/reference/vscode/

## Success Criteria

By the end of this exercise, you should be able to:
- Install and initialize Biome
- Configure linting and formatting defaults
- Run Biome from the command line
- Use package scripts for day-to-day workflow
