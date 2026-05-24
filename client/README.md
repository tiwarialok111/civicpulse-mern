# CivicPulse — Frontend

React + Vite + Tailwind CSS frontend for the Civic Issue Reporting System.

## Installation

```bash
cd client
npm install
cp .env.example .env   # macOS/Linux
copy .env.example .env # Windows
npm run dev
```

App runs at: **http://localhost:5173**

Make sure the backend is running on port 5000.

## Folder Structure

```
src/
├── components/     # Navbar, Loader, ProtectedRoute
├── context/        # AuthContext (JWT + user state)
├── layouts/        # MainLayout (Navbar + footer)
├── pages/          # Home, Login, Register, Dashboard
├── routes/         # AppRoutes
├── services/       # api.js (axios), authService.js
├── App.jsx
└── main.jsx
```

## Environment Variables

```
VITE_API_URL=http://localhost:5000/api/v1
```

## Routes

| Path | Access | Page |
|------|--------|------|
| `/` | Public | Home |
| `/login` | Public | Login |
| `/register` | Public | Register |
| `/dashboard` | Protected | Dashboard |
