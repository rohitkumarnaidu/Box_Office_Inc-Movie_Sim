# Contribution Guide for CineVerse

Thank you for contributing! This guide provides a deeper dive into our development standards.

## Project Philosophy
CineVerse aims to be the most detailed and accurate movie studio simulation. We prioritize simulation depth, data persistence, and a clean user experience.

## Branching Strategy
- **`main`**: Stable, production-ready code.
- **`elusoc`**: Active development branch for ELUSOC 2026.
- **`feature/*`**: Individual features or bug fixes.

## Pull Request Process
1. Ensure your PR targets `elusoc`.
2. Fill out the PR template completely.
3. Include screenshots for UI changes.
4. If you've modified simulation logic, explain the balance impact in the description.

## Coding Standards
### Backend
- Use JSDoc for complex functions.
- Keep controllers lean; move business logic to services.
- Use `Mongoose .lean()` for read-only queries to improve performance.

### Frontend
- Use functional components and hooks.
- Handle loading and error states for all API calls.
- Use Tailwind CSS for all styling.

## ELUSOC Specifics
- Always reference the issue number in your PR.
- Do not work on unassigned issues.
- Join the community discord/forum for real-time discussion.
