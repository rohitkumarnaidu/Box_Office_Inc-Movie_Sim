# CineVerse Architecture

CineVerse follows a decoupled MERN stack architecture designed for scalability and maintainability.

## System Overview

### Backend (Node.js/Express)
The backend is organized into several layers:
- **Controllers:** Handle HTTP requests and responses.
- **Routes:** Define the API surface.
- **Models:** Mongoose schemas for data persistence.
- **Services:** Core business logic, including the simulation engines.
- **Middleware:** Authentication (JWT), validation, and error handling.

### Frontend (React/Vite)
The frontend uses a modern feature-based structure:
- **Redux Toolkit:** Centralized state management using slices.
- **Pages/Components:** UI layout and reusable elements.
- **API (Axios):** Centralized HTTP client with interceptors for token management.

## Simulation Engine
The heart of CineVerse is the `runWeeklySimulation.js` service. It executes a pipeline of 'engines' that process the world state:
1. `tickEngine`: Increments time.
2. `payrollEngine`: Processes weekly expenses.
3. `productionEngine`: Advances movie production.
4. `boxOfficeEngine`: Calculates earnings for released movies.
5. ...and many more.

## Data Persistence
Data is stored in MongoDB Atlas. Key models include:
- `User`: Auth and profile data.
- `Studio`: Financials and ownership.
- `GameState`: The "World" state, containing market talent and simulation counters.
- `Movie`: Detailed production data and history.
