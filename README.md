# TimeSheet - Full Technical Documentation

This repository contains a complete full-stack TimeSheet and productivity tracking system.
It is built with a React frontend and a Node.js + Express backend, using Prisma ORM with SQLite.

This document explains:
- What technology is used
- How the system is structured
- How authentication and session tracking works
- How data is modeled in Prisma
- How frontend and backend communicate
- How to run, seed, and troubleshoot the project

---

## 1) High-Level Architecture

The application has 2 main apps:

1. **Frontend** (`frontend/`)
	- React + Vite single-page app
	- Handles login, timesheet actions, history view
	- Uses Axios for API calls

2. **Backend** (`backend/`)
	- Express REST API
	- JWT authentication
	- Business rules for shift and work session management
	- Prisma data layer against SQLite

At the root, startup scripts (`start.js`, `start.ps1`, `start.bat`) run both apps together.

---

## 2) Technology Stack

### Frontend
- **React 19** for UI rendering
- **React Router DOM 7** for routing and protected pages
- **Vite 7** for dev server and builds
- **Tailwind CSS 4** for styling
- **Axios** for HTTP client with interceptors

### Backend
- **Node.js (ES Modules)** runtime
- **Express 5** web framework
- **Prisma 6** ORM/client
- **SQLite** database (local file)
- **jsonwebtoken** for JWT auth
- **bcryptjs** for password hashing
- **dotenv** for environment variables
- **nodemon** for backend development reload

### Tooling and Scripts
- Root npm scripts orchestrate frontend + backend
- PowerShell and Batch startup scripts support Windows users

---

## 3) Folder and File Purpose

```text
TimeSheet/
├── package.json               # Root orchestrator scripts
├── start.js                   # Cross-platform Node launcher for both services
├── start.ps1                  # Windows PowerShell launcher
├── start.bat                  # Windows cmd launcher
│
├── backend/
│   ├── package.json           # Backend deps and prisma scripts
│   ├── prisma/
│   │   ├── schema.prisma      # All DB models + enums + relations
│   │   ├── seed.js            # Seed master data + demo user + sample tasks
│   │   └── migrations/        # Prisma migration history
│   └── src/
│       ├── server.js          # Loads env, connects DB, starts Express
│       ├── app.js             # Middleware and route registration
│       ├── config/prisma.js   # Prisma client instance
│       ├── routes/            # API endpoint path definitions
│       ├── controllers/       # HTTP layer: req/res handling
│       ├── services/          # Business logic layer
│       └── middlewares/       # Auth validation + error handlers
│
└── frontend/
	 ├── package.json           # Frontend deps and Vite scripts
	 ├── index.html             # Vite app shell
	 └── src/
		  ├── main.jsx           # React root + providers
		  ├── App.jsx            # Router + route protection
		  ├── api/               # Axios client + endpoint wrappers
		  ├── context/           # Auth context and persistence
		  ├── hooks/             # Timer state hook
		  ├── components/        # Reusable UI pieces
		  ├── layouts/           # Shared page shell/layout
		  └── pages/             # Login, timesheet, history pages
```

---

## 4) Backend Design (How It Works)

### 4.1 Startup Flow
1. `backend/src/server.js` loads env via `dotenv/config`.
2. Prisma connection is opened.
3. Express app from `backend/src/app.js` starts on `PORT` (default `4000`).

### 4.2 Middleware Pipeline
Registered in `backend/src/app.js`:
- `cors()`
- `express.json()`
- route handlers under `/api`
- `notFoundHandler`
- `globalErrorHandler` (returns `{ message }`)

### 4.3 Auth and Security
- Login endpoint validates email/password format.
- Password check uses `bcrypt.compare`.
- JWT is issued with claims: `sub`, `role`, `email`.
- Protected routes use `verifyToken` middleware.
- If token missing/invalid/expired, API returns `401`.

### 4.4 Shift Session Rule
When a user logs in, backend ensures there is an active 8-hour shift session:
- `ensureActiveShiftSession(userId)`
- If active shift exists, reuse it
- Else create new shift (`shiftStart = now`, `shiftEnd = +8h`)

### 4.5 Work Session Rule
Starting a work session requires:
- `activityId`, `processId`, `subProcessId`, `jobTypeId`
- no existing active session for that user
- all master references valid

On start:
- creates a `Task` with status `IN_PROGRESS`
- creates a `WorkSession` with `startTime`

On complete:
- closes active `WorkSession` with `endTime`, `duration`, optional `comment`
- marks related `Task` as `COMPLETED`
- computes productivity as:

$$
	ext{productivity} = \frac{\text{expectedDuration}}{\text{actualDuration}} \times 100
$$

### 4.6 History and Pagination
`GET /api/work-sessions/history` supports:
- `page` and `limit` (limit capped to 100)
- optional `startDate` and `endDate`
- descending order by `startTime`

---

## 5) Frontend Design (How It Works)

### 5.1 App Boot
`frontend/src/main.jsx` wraps the app with:
- `ErrorBoundary`
- `AuthProvider`

### 5.2 Routing
`frontend/src/App.jsx` routes:
- public: `/login`
- protected: `/timesheet`, `/history`
- root and wildcard redirects based on auth state

### 5.3 Auth State
`AuthContext`:
- stores `user` and token in `localStorage`
- restores user on refresh
- exposes `login()` and `logout()` helpers

### 5.4 Axios Client Behavior
`frontend/src/api/axios.js`:
- base URL from `VITE_API_URL` (fallback `http://localhost:4000/api`)
- request interceptor adds `Authorization: Bearer <token>`
- response interceptor on `401` clears storage and redirects to `/login`

### 5.5 Timer Behavior
`useTimer` hook:
- computes elapsed seconds from backend `startTime`
- auto-increments every second while running
- exposes formatted `HH:mm:ss` text

---

## 6) Database Model (Prisma)

Defined in `backend/prisma/schema.prisma`.

### Enums
- `UserRole`: `EMPLOYEE | MANAGER | ADMIN`
- `TaskStatus`: `ASSIGNED | IN_PROGRESS | COMPLETED`

### Main Models
- `User` - employee identity, auth role, active status
- `ShiftSession` - 8-hour shift windows per user
- `Task` - work item linked to user + optional master references
- `WorkSession` - actual tracked time slices for a task
- `Activity`, `Process`, `SubProcess`, `JobType` - master taxonomy tables

### Relation Overview
- One `User` has many `Task`, `WorkSession`, `ShiftSession`
- One `Task` belongs to one user, may map to one activity/process/subprocess/jobtype
- One `Task` has many `WorkSession`
- One `Process` has many `SubProcess`

---

## 7) API Reference

Base URL: `http://localhost:4000/api`

### Health
- `GET /health`

### Authentication
- `POST /auth/login`
- `GET /me` (requires Bearer token)

### Tasks
- `GET /tasks/my` (requires Bearer token)

### Work Sessions
- `POST /work-sessions/start` (requires Bearer token)
- `POST /work-sessions/complete` (requires Bearer token)
- `GET /work-sessions/active` (requires Bearer token)
- `GET /work-sessions/history?page=1&limit=20&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

### Master Data
- `GET /master/activities` (requires Bearer token)
- `GET /master/processes` (requires Bearer token)
- `GET /master/subprocesses` (requires Bearer token)
- `GET /master/jobtypes` (requires Bearer token)

### Shift
- `GET /shift/active` (requires Bearer token)

---

## 8) Seed Data and Demo User

`backend/prisma/seed.js` seeds:
- master activities
- processes and subprocesses
- job types
- one demo employee
- sample tasks for that employee

Demo login:
- Email: `employee@productivitytracker.com`
- Password: `Employee@123`

---

## 9) Environment Variables

### Backend (`backend/.env`)
```env
PORT=4000
DATABASE_URL="file:./dev.db"
JWT_SECRET="change-this-to-a-strong-secret"
JWT_EXPIRES_IN="1d"
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL="http://localhost:4000/api"
```

---

## 10) Run and Build Instructions

### Install dependencies
```bash
# root
npm install

# backend
npm --prefix backend install

# frontend
npm --prefix frontend install
```

### Prepare database
```bash
npm --prefix backend run prisma:generate
npm --prefix backend run prisma:seed
```

### Run (all services)
```bash
npm start
```

Alternative (Windows):
```powershell
.\start.ps1
```

or
```bat
start.bat
```

### Run separately
```bash
# terminal 1
npm run backend

# terminal 2
npm run frontend
```

### Build
```bash
npm run build
```

---

## 11) Request Flow Example (End-to-End)

1. User opens frontend and logs in.
2. Frontend calls `POST /api/auth/login`.
3. Backend verifies credentials and returns JWT + user payload.
4. Frontend stores token and sends it on all next API calls.
5. User starts session -> frontend posts master IDs to `/work-sessions/start`.
6. Backend validates references, creates task + work session.
7. Timer runs on frontend based on backend start time.
8. User completes session -> frontend posts comment to `/work-sessions/complete`.
9. Backend stores duration, updates task actual duration and productivity.
10. History page fetches paginated completed sessions.

---

## 12) Current Feature Set

- JWT-based authentication with protected routes
- Shift timer with automatic active-shift creation
- Work session start/stop lifecycle
- Master-data driven activity selection
- Session history with pagination and date filters
- Task tracking with productivity calculation
- Global API error handling and frontend error boundary

---

## 13) Troubleshooting

### Backend fails to start
- Ensure `backend/.env` contains a valid `JWT_SECRET`.
- Ensure Prisma client is generated: `npm --prefix backend run prisma:generate`.

### Login fails for demo user
- Reseed DB: `npm --prefix backend run prisma:seed`.

### Frontend cannot reach API
- Confirm backend running on `4000`.
- Confirm `VITE_API_URL` in `frontend/.env` points to `/api` base.

### Token errors (401)
- Clear browser local storage and login again.

---

## 14) Notes for Future Enhancements

- Add refresh token strategy for longer sessions
- Add role-based permissions for manager/admin flows
- Add unit/integration test suite (backend and frontend)
- Add API documentation generator (OpenAPI/Swagger)
- Move from SQLite to PostgreSQL for production scale

---

## License

MIT
