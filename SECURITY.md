# Security Policy

## Supported Versions

We currently support security updates for the latest stable release.

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Box Office Inc seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please Do NOT

- Open a public GitHub issue for the vulnerability.
- Share the vulnerability with others before it has been addressed.

### How to Report

Send a detailed report to the repository maintainers via:

1. **GitHub Security Advisory**: Navigate to the repository's "Security" tab and use the "Report a vulnerability" feature.
2. **Email**: Contact the project maintainers directly through the repository's contact information.

Please include the following in your report:

- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes (if known)

### Response Timeline

- **Acknowledgment**: We will acknowledge your report within 48 hours.
- **Verification**: We will verify the vulnerability within 5 business days.
- **Fix Timeline**: A fix will be developed and released based on the severity:
  - Critical: 48 hours
  - High: 1 week
  - Medium: 2 weeks
  - Low: Next release cycle

## Security Best Practices for Contributors

### Authentication & Tokens

- Never commit `.env` files or any files containing real secrets.
- Use the provided `backend/.env.example` and `frontend/.env.example` as templates.
- JWT secrets must be at least 64 characters of random entropy in production.
- Refresh tokens are stored as SHA-256 hashes; never log or expose raw tokens.

### Database

- MongoDB connection strings should use strong passwords and IP allowlists.
- Use separate databases for development, testing, and production.
- The application uses Mongoose 9 with schema validation - do not disable it.

### API Security

- All API endpoints except auth routes require JWT authentication via the `protect` middleware.
- Input validation is enforced via Zod schemas - do not bypass it.
- CORS is configured to allow only trusted origins.

### Frontend

- Environment variables prefixed with `VITE_` are exposed to the client bundle.
- Do not store sensitive secrets or API keys in frontend environment variables.
- The frontend uses Axios interceptors for consistent error handling.

## Dependency Management

- Dependencies are audited during CI builds.
- Please keep dependencies up to date using `npm audit` before submitting PRs.
- Report any vulnerable dependencies through the channels above.
