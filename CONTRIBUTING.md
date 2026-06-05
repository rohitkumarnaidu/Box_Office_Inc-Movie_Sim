# Contributing to CineVerse

First off, thank you for considering contributing to CineVerse! It's people like you that make CineVerse such a great tool.

This project is participating in **ELUSOC 2026**. Please follow these guidelines to ensure a smooth contribution process.

## ELUSOC 2026 Participation

- **Target Branch:** All contributions must be made against the `elusoc` branch.
- **Main Branch Protection:** The `main` branch is protected and stable. Do not target PRs to `main`.
- **Assignment Required:** Do not start work on an issue unless it has been explicitly assigned to you.

## Contribution Workflow

We follow a strict workflow to maintain project quality:

1. **Find an Issue:** Browse the issue tracker for open issues.
2. **Request Assignment:** Comment on the issue to request assignment. Wait for a project admin to assign it to you.
3. **Branching:** Create a feature branch from the `elusoc` branch.
   ```bash
   git checkout elusoc
   git pull origin elusoc
   git checkout -b feature/your-feature-name
   ```
4. **Development:** Implement your changes. Ensure you follow our coding standards.
5. **Testing:** Verify your changes locally (see setup instructions).
6. **Commit:** Use descriptive commit messages.
7. **Pull Request:** Submit a PR targeting the `elusoc` branch.
8. **Review:** Address any feedback provided during the review process.
9. **Merge:** Once approved, an admin will merge your PR.

## Coding Standards

- **JavaScript:** Use ES6+ syntax. Follow the project's Prettier/ESLint configuration.
- **Naming:** Use camelCase for variables and functions, PascalCase for React components.
- **Comments:** Provide meaningful comments for complex logic.
- **Commit Messages:** Follow conventional commits (e.g., `feat: add new movie genre`, `fix: resolve login bug`).

## Duplicate Issue Prevention

Before creating a new issue, please search existing issues (both open and closed) to see if it has already been reported or suggested. Duplicate issues will be closed.

## Merge Conflict Resolution

If your branch has conflicts with the `elusoc` branch:
1. Rebase or merge `elusoc` into your feature branch.
2. Resolve conflicts locally.
3. Test again to ensure everything still works.
4. Push the updated branch.

## Getting Started

Refer to the [README.md](../README.md) for project setup instructions.

## Need Help?

If you have questions, feel free to open a discussion or reach out to the project admins.

Happy coding!
