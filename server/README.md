# CivicPulse — Backend API

Beginner-friendly Express + MongoDB backend with JWT authentication.

## Folder Structure

```
server/
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── models/
│   │   └── User.js               # User schema + password hashing
│   ├── routes/
│   │   ├── index.js              # Main router
│   │   └── auth.routes.js        # Auth routes
│   ├── controllers/
│   │   └── auth.controller.js    # Register, login, getMe
│   ├── middleware/
│   │   ├── auth.middleware.js    # JWT protect + role authorize
│   │   └── error.middleware.js   # Centralized errors
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── catchAsync.js
│   │   └── generateToken.js
│   ├── app.js                    # Express app setup
│   └── server.js                 # Entry point
├── .env.example
├── package.json
└── README.md
```

## Installation

```bash
cd server
npm install
```

Copy environment file and update values:

```bash
copy .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

Edit `.env` — set `MONGODB_URI` and `JWT_SECRET`.

## Run the Server

```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

Server runs at: `http://localhost:5000`

---

## API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/health` | Public | Health check |
| POST | `/api/v1/auth/register` | Public | Register new user |
| POST | `/api/v1/auth/login` | Public | Login |
| GET | `/api/v1/auth/me` | Private | Get logged-in user (protected) |

---

## API Testing Examples

### 1. Health Check

**Request:**
```
GET http://localhost:5000/api/v1/health
```

**Response:**
```json
{
  "success": true,
  "message": "CivicPulse API is running."
}
```

---

### 2. Register

**Request:**
```
POST http://localhost:5000/api/v1/auth/register
Content-Type: application/json

{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "password123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration successful.",
  "data": {
    "user": {
      "_id": "...",
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "role": "citizen",
      "createdAt": "...",
      "updatedAt": "..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. Login

**Request:**
```
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "rahul@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 4. Protected Route — Get Current User

**Request:**
```
GET http://localhost:5000/api/v1/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "role": "citizen"
    }
  }
}
```

**Without token (401):**
```json
{
  "success": false,
  "message": "Not authorized. Please log in."
}
```

---

## Test with cURL (Windows PowerShell)

```powershell
# Health check
curl http://localhost:5000/api/v1/health

# Register
curl -Method POST http://localhost:5000/api/v1/auth/register `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body '{"name":"Rahul Sharma","email":"rahul@example.com","password":"password123"}'

# Login
curl -Method POST http://localhost:5000/api/v1/auth/login `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body '{"email":"rahul@example.com","password":"password123"}'

# Protected route (replace TOKEN)
curl http://localhost:5000/api/v1/auth/me `
  -Headers @{ "Authorization" = "Bearer TOKEN" }
```

## Test with Thunder Client / Postman

1. Create a new request collection named `CivicPulse`.
2. Add environment variable `baseUrl` = `http://localhost:5000/api/v1`.
3. After login, copy `data.token` into variable `token`.
4. For protected routes, set header: `Authorization: Bearer {{token}}`.

---

## Required npm Packages

| Package | Purpose |
|---------|---------|
| express | Web framework |
| mongoose | MongoDB ODM |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT auth |
| dotenv | Environment variables |
| cors | Allow frontend requests |
| nodemon | Auto-restart (dev only) |

---

## Next Steps

- Add Complaint model and CRUD routes
- Add role-based admin routes (`authorize('admin')`)
- Add image upload with Multer + Cloudinary
- Add Socket.IO for real-time notifications
