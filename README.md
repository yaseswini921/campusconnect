# CampusConnect

CampusConnect is a full-stack campus event management application built with React, Vite, Express, MongoDB, and JWT authentication. Students can discover and register for events; administrators can manage events, registrations, and student accounts.

## What’s included

- Responsive landing page and student/admin dashboards.
- Public event discovery with search and category filters.
- Student registration, login, profile editing, and event sign-ups.
- Admin event, registration, and student management.
- Mongoose models, validation, password hashing, JWT auth, and role-based API access.
- Eight seed events, a private first-admin setup script, and deployment guides.

## Project structure

```text
CampusConnect/
├── backend/
│   ├── config/                 # MongoDB connection
│   ├── controllers/            # API handlers
│   ├── middleware/             # Authentication, authorization, validation, errors
│   ├── models/                 # User, Event, and Registration schemas
│   ├── routes/                 # REST route definitions
│   ├── scripts/                # Sample-event and first-admin utilities
│   ├── utils/                  # Shared helpers and validation rules
│   ├── .env.example
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/         # Shared layout, event cards, and UI
│   │   ├── context/            # Authentication and toast state
│   │   ├── pages/              # Landing, student, and admin screens
│   │   ├── services/           # Axios API client
│   │   ├── App.jsx
│   │   └── index.css
│   ├── .env.example
│   └── vercel.json
└── docs/
    └── API.md
```

## Requirements

- Node.js 20 or newer and npm.
- MongoDB locally, or a MongoDB Atlas connection string.

## Run locally

### 1. Configure the backend

In PowerShell:

```powershell
cd backend
Copy-Item .env.example .env
```

Edit `backend/.env` and set `MONGODB_URI` to your local MongoDB or Atlas URI. Set `MONGODB_DB=campusconnect` to select the application database; this avoids MongoDB's default `test` database when an Atlas URI has no database path. Replace `JWT_SECRET` with a unique random value of at least 32 characters. To generate one with Node.js, run `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` and copy the output into the backend `.env`. Never commit `.env` or put backend secrets in the frontend.

Install dependencies and start the API:

```powershell
npm install
npm run dev
```

Keep this terminal open while using the app. The API listens on `http://localhost:5000`. Check `http://localhost:5000/api/health` to verify it is running.

### 2. Add sample events

In a second terminal:

```powershell
cd backend
npm run seed
```

The backend must be running and connected to the same database before seeding.

The script adds eight upcoming events. It uses `$setOnInsert`, so rerunning it does not overwrite existing events or registrations.

### 3. Create an administrator

Admin registration is intentionally not exposed through the public API. Set the following environment variables in the backend process environment, then run `npm run create-admin` from `backend/`:

```powershell
$env:ADMIN_EMAIL = "admin@your-college.edu"
$env:ADMIN_PASSWORD = "use-a-unique-password-of-at-least-12-characters"
$env:ADMIN_NAME = "Campus Administrator"
npm run create-admin
Remove-Item Env:ADMIN_EMAIL, Env:ADMIN_PASSWORD, Env:ADMIN_NAME
```

The script hashes the password and creates an administrator once. If that email already exists it exits with an error; it never changes an existing account's role.

### 4. Start the frontend

In another terminal:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Keep this terminal open too. Open the Vite URL printed in the terminal (normally `http://localhost:5173`). The frontend reads only `VITE_API_URL`; set it in `frontend/.env` if the API runs somewhere other than `http://localhost:5000/api`. Restart Vite after changing frontend environment variables.

## User roles

- Anyone can browse upcoming events and event details.
- Public account creation always creates a student account.
- Students can register for future events with available seats, view their registrations, cancel active registrations, and edit their profile.
- Administrators are created using the private script. They can create/edit/delete events, review students and registrations, and update registration status.
- The API verifies roles independently of the frontend route guards.

## Deployment

### MongoDB Atlas

Create a database user with only the required database permissions, allow network access from your backend host, and copy the Atlas connection string. Replace its database name if needed. Do not include the Atlas URI in frontend variables.

### Render (backend)

Create a Render Web Service from this repository:

1. Set **Root Directory** to `backend`.
2. Set **Build Command** to `npm install`.
3. Set **Start Command** to `npm start`.
4. Configure `MONGODB_URI`, `JWT_SECRET` (a long random secret), `JWT_EXPIRES_IN` (for example `7d`), `NODE_ENV=production`, and `CLIENT_URL` (the exact Vercel origin, without a trailing slash).
5. After deploy, confirm `/api/health` responds. Seed events and create the administrator from a trusted local terminal configured with the production `MONGODB_URI`; do not add admin credentials as persistent Render environment variables.

### Vercel (frontend)

Import the repository as a Vercel project:

1. Set **Root Directory** to `frontend`.
2. Set `VITE_API_URL` to `https://YOUR-RENDER-SERVICE.onrender.com/api`.
3. Deploy. `frontend/vercel.json` sends app routes to the Vite entry point so React Router routes work on refresh.
4. Set the same deployed frontend origin in Render's `CLIENT_URL`, then redeploy the backend if the value changes.

The browser only receives the public API base URL; database credentials and JWT signing secrets stay on the backend.

## API reference

See [docs/API.md](./docs/API.md) for routes, authorization, request examples, and response behavior.
