# Deployment Guide

CineVerse is designed for separate frontend and backend deployments.

## Backend (Vercel)
1. Point Vercel to the `backend/` directory.
2. Set Environment Variables:
   - `MONGO_URI`
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
   - `CLIENT_URL` (The URL of your frontend)
   - `NODE_ENV=production`

## Frontend (Vercel)
1. Point Vercel to the `frontend/` directory.
2. Set Environment Variable:
   - `VITE_BACKEND_API_URL` (The URL of your backend + `/api`)

## MongoDB Atlas
- Ensure IP Whitelist is set to `0.0.0.0/0` for Vercel dynamic IPs.
- Use a M0 (Free Tier) or higher cluster.
