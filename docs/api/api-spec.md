# CineVerse REST API Specification

This specification documents the REST API endpoints available in the CineVerse backend.

All endpoints are prefixed with `/api` and require a JSON request body unless specified otherwise. Private endpoints require the `Authorization: Bearer <JWT_ACCESS_TOKEN>` header.

---

## 1. Authentication (`/api/auth`)

### Register User
* **URL:** `POST /api/auth/register`
* **Access:** Public
* **Request Body:**
  ```json
  {
    "username": "studio_boss",
    "email": "boss@cineverse.com",
    "password": "StrongPassword123"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "user": {
      "id": "60d0fe4f5311236168a109a1",
      "username": "studio_boss",
      "email": "boss@cineverse.com"
    },
    "token": "eyJhbGciOi..."
  }
  ```

### Login User
* **URL:** `POST /api/auth/login`
* **Access:** Public
* **Request Body:**
  ```json
  {
    "email": "boss@cineverse.com",
    "password": "StrongPassword123"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi..."
  }
  ```

### Get Profile
* **URL:** `GET /api/auth/me`
* **Access:** Private

---

## 2. Movie Management (`/api/movies`)

### Create/Greenlight Movie
* **URL:** `POST /api/movies`
* **Access:** Private
* **Request Body:**
  ```json
  {
    "title": "Neon Horizon",
    "scriptId": "script_uuid_1234",
    "directorId": "director_uuid_5678",
    "leadActorId": "actor_uuid_9012",
    "supportingActorIds": ["actor_uuid_3456"],
    "crewTeamId": "crew_uuid_7890",
    "marketingCampaignIds": ["trailer", "social"]
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "movie": {
      "_id": "60d0fe4f5311236168a109b3",
      "title": "Neon Horizon",
      "quality": 78,
      "hype": 45,
      "status": "PRE_PRODUCTION"
    }
  }
  ```

### Get Active Movies
* **URL:** `GET /api/movies/active`
* **Access:** Private

### Release Movie (Theatrical)
* **URL:** `POST /api/movies/:id/release`
* **Access:** Private
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "movie": {
      "_id": "60d0fe4f5311236168a109b3",
      "status": "RELEASED",
      "boxOffice": 42500000,
      "verdict": "Hit"
    }
  }
  ```

---

## 3. Script Marketplace (`/api/scripts`)

### Get Market Scripts
* **URL:** `GET /api/scripts`
* **Access:** Private

### Buy Script
* **URL:** `POST /api/scripts/buy/:index`
* **Access:** Private

### Sell Script
* **URL:** `POST /api/scripts/sell/:index`
* **Access:** Private

---

## 4. Simulation Control (`/api/simulation`)

### Simulate Week
* **URL:** `POST /api/simulation/simulate`
* **Access:** Private
* **Request Body:**
  ```json
  {
    "weeks": 1
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "currentWeek": 12,
    "studioBalance": 9850000
  }
  ```
