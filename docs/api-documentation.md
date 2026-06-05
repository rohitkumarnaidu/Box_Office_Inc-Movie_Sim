# API Documentation

The CineVerse API follows RESTful principles.

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://your-backend.vercel.app/api`

## Authentication
Most endpoints require a Bearer token in the `Authorization` header.
```text
Authorization: Bearer <your_jwt_token>
```

## Key Modules

### Auth
- `POST /auth/register`: Register a new account and studio.
- `POST /auth/login`: Login and receive access token.
- `POST /auth/refresh`: Rotate refresh tokens.

### Simulation
- `POST /simulation/tick`: Advance the game by 1-52 weeks.
- `GET /simulation/history`: Retrieve financial logs.

### Movies
- `GET /movies`: List studio movies.
- `POST /movies`: Create a new movie project.
- `POST /movies/:id/release`: Release a completed movie to the box office.

### Talent
- `GET /actors`, `GET /writers`, `GET /directors`: Browse the talent market.
- `POST /talent/hire`: Hire a professional.

For a full list of endpoints, see `backend/src/routes/`.
