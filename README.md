# Team Task Manager

A full-stack web app for team project and task management with role-based access control.

## Features
- **Auth**: Signup/Login with JWT
- **Roles**: Admin (full access) / Member (own tasks)
- **Projects**: Create, view, assign members (Admin only)
- **Tasks**: Create, assign, update status, due dates
- **Dashboard**: Stats, overdue alerts, recent activity
- **Admin Panel**: User management, role changes, system stats

## Local Development

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Backend
```bash
cd backend
npm install
# Edit .env with your MongoDB URI
npm run dev   # runs on port 5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev   # runs on port 5173
```

The `vite.config.js` proxies `/api` requests to `localhost:5000` in dev.

## Deployment on Railway

1. Push to GitHub
2. Create new Railway project → Deploy from GitHub
3. Set environment variables in Railway dashboard:
   - `MONGO_URI` — your MongoDB Atlas connection string
   - `JWT_SECRET` — a strong random secret
   - `NODE_ENV` — `production`
4. Railway auto-detects `railway.toml` and builds both frontend + backend

The Express server serves the React build from `frontend/dist`.

## Create First Admin

Register normally, then in MongoDB Atlas manually set `role: "admin"` on your user document. Or use the Admin Panel once you have one admin.

## Tech Stack
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs
- **Frontend**: React, Vite, React Router, Axios
