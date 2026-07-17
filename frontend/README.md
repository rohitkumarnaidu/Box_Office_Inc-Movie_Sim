# CineVerse Frontend

React-based frontend for the Box Office Inc - Movie Studio Simulator. Built with React 19, Vite, TailwindCSS 4, Redux Toolkit, and Recharts.

## Tech Stack

| Dependency | Version | Purpose |
|---|---|---|
| React | ^19.2.6 | UI framework |
| Vite | ^8.0.12 | Build tool |
| Redux Toolkit | ^2.12.0 | State management |
| React Router DOM | ^7.16.0 | Client-side routing |
| TailwindCSS | ^4.3.0 | Utility-first CSS |
| Axios | ^1.16.1 | HTTP client |
| Recharts | ^3.9.1 | Charts and analytics |
| Lucide React | ^1.17.0 | Icon library |

## Prerequisites

- Node.js 18+
- Backend server running on port 5000 (or configured `VITE_BACKEND_API_URL`)

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Start development server (default: http://localhost:5173)
npm run dev

# Create a production build
npm run build

# Preview the production build
npm run preview
```

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_BACKEND_API_URL` | Yes | `http://localhost:5000/api` | Backend API base URL |

Copy `.env.example` to `.env` and update the values.

## Project Structure

```
src/
├── api/            # Axios instance with auth interceptors
├── app/            # Redux store configuration
├── components/     # Reusable UI components
│   ├── common/     # Shared components (Sidebar, Toast, etc.)
│   ├── ui/         # Primitive UI components (Skeleton, etc.)
│   └── ...         # Feature-specific components
├── features/       # Redux slices (auth, movie, studio, etc.)
├── layouts/        # Page layouts (DashboardLayout, AuthLayout)
├── pages/          # Route page components
├── routes/         # Route configuration and guards
└── utils/          # Utility modules
```

## Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Architecture

- **State Management**: Redux Toolkit with slices for auth, movie, studio, simulation, notification, talent, awards, and UI toast state
- **Routing**: React Router v7 with `ProtectedRoute` guard for authenticated pages
- **API Layer**: Axios instance with automatic token refresh, retry logic, and error normalization
- **Styling**: TailwindCSS v4 with CSS variables for theme support (dark/light mode via `ThemeContext`)
