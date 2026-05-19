# CivicPulse 🏙️

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://mongodb.com)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-emerald.svg)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green.svg)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](#license)

**CivicPulse** is an AI-powered civic issue reporting and resolution platform built using the MERN stack. It empowers citizens to report community issues (like road damage, street light outages, drainage, or garbage piles) with photos and location details, while providing municipal administrators with a powerful dark-themed dashboard to triage, track, and manage these complaints in real-time.

---

## 🚀 Live Demo & Screenshots

*Dashboard preview and screenshots coming soon!*

---

## ✨ Features

### 👥 For Citizens
- **Secure Authentication**: JWT-based registration and login with local persistence.
- **Interactive Dashboard**: Track the status of all your submitted complaints at a glance (Pending, In Progress, Resolved, Rejected).
- **Issue Reporting**: File detailed complaints with titles, categories, description, location address, and photo attachments.
- **Image Uploads**: Integrated with Cloudinary for fast, optimized cloud-based media storage.
- **Self-Service**: Edit or delete complaints while they are still in the `Pending` state.

### 🛡️ For Administrators (Dark Theme)
- **Separate Portal**: A dedicated dark-themed admin interface for a professional command-center feel.
- **Live Telemetry & Metrics**: Real-time counter cards showing stats, category-wise distributions, and current resolution rates.
- **Advanced Management Table**: Search, filter by status/category/priority, and update complaint statuses and priority levels dynamically.
- **Timeline Audit Trails**: Every status change is saved in a history log tracking *who* changed the status, *when*, and *why* (with admin remarks).

---

## 🛠️ Tech Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS, Axios, React Router DOM, Context API |
| **Backend** | Node.js, Express, JWT, Multer, Cloudinary SDK |
| **Database** | MongoDB, Mongoose ODM |
| **Tooling & Formatting** | Git, Postman, ESLint, Prettier |

---

## 📁 Folder Structure

```text
CivicPulse/
├── client/                 # React frontend (Vite)
│   ├── public/             # Static public assets
│   ├── src/                # Component & Page source files
│   │   ├── assets/         # Images and SVGs
│   │   ├── components/     # Reusable layout/UI components
│   │   ├── context/        # Auth Context for global state
│   │   ├── layouts/        # Page layouts (Main & Admin Layouts)
│   │   ├── pages/          # Page views (Home, Login, Admin, etc.)
│   │   ├── routes/         # Protected and admin routing
│   │   ├── services/       # API call handlers (Axios)
│   │   └── utils/          # Formatting and helper utilities
│   ├── .env.example        # Frontend environment template
│   ├── .gitignore          # Client-specific Git ignore
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   └── package.json        # Frontend dependencies & scripts
│
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth and validation middlewares
│   │   ├── models/         # Mongoose Schemas (User, Complaint)
│   │   ├── routes/         # Express routing endpoints
│   │   └── utils/          # Error helpers and tokens
│   ├── .env.example        # Backend environment template
│   ├── .gitignore          # Server-specific Git ignore
│   └── package.json        # Backend dependencies & scripts
│
├── .gitignore              # Workspace-wide root Git ignore
└── README.md               # Main project documentation
```

---

## ⚙️ Environment Variables

Before running the application, make sure to set up your environment variables.

### Backend (`server/.env`)
Create a `.env` file in the `server` directory and copy the contents of `server/.env.example`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/civicpulse
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (`client/.env`)
Create a `.env` file in the `client` directory and copy the contents of `client/.env.example`:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

> [!WARNING]
> Never commit your actual `.env` files to Git. They are ignored by the root `.gitignore` to keep your credentials secure.

---

## 🚀 Installation & Setup

Follow these steps to run the application locally on your machine.

### Prerequisites
- Node.js installed (v16+ recommended)
- MongoDB installed locally or a MongoDB Atlas URI
- A Cloudinary account for media upload credentials

### Step 1: Clone and install dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/CivicPulse.git
cd CivicPulse

# Install Server dependencies
cd server
npm install

# Install Client dependencies
cd ../client
npm install
```

### Step 2: Configure Environment Variables
Create your `.env` files in both `client/` and `server/` as detailed in the **Environment Variables** section above.

### Step 3: Run the Application

#### Run the Server (Backend)
```bash
cd server
npm run dev
```
The backend server will start on `http://localhost:5000`.

#### Run the Client (Frontend)
```bash
cd client
npm run dev
```
The frontend application will start on `http://localhost:5173`.

---



---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ✍️ Author

**Alok Tiwari**  
- GitHub: [@your-github-username](https://github.com/tiwarialok111)  
- LinkedIn: [Your Profile](https://www.linkedin.com/in/alok-tiwari-892283300/)  
- Email: abc.11alok@gmail.com
