# ♻️ E-Waste Collection and Recycling Platform

A full-stack, enterprise-ready web application designed for sustainable Electronic Waste (E-Waste) collection, tracking, and recycling management. The platform features Role-Based Access Control (RBAC) across four user roles: **Citizen User**, **System Administrator**, **Recycling Center Manager**, and **Collection Staff Agent**.

---

## 🌟 Features & Core Workflow

1. **Role-Based Access Control (JWT Authentication)**
   - **Citizen User**: Submit e-waste pickup requests with interactive map coordinates, track request status with a **6-stage Stepper Timeline**, receive live notifications, and monitor carbon reduction impact.
   - **System Administrator**: Verify incoming requests, auto-assign nearest recycling centers using **Haversine Geo-distance**, manage recycling plant capacities, and control user roles.
   - **Recycling Center**: Manage plant collection drivers, assign drivers to pickup tasks, inspect incoming delivered e-waste, and mark items as **Recycled** (with interactive celebration).
   - **Collection Staff**: Access assigned collection routes, view customer contact & location pins, and transition request statuses (`Collected` → `Delivered`).

2. **Interactive 6-Stage Pickup Stepper**
   `Pending` → `Verified` → `Assigned` → `Collected` → `Delivered` → `Recycled`

3. **Geospatial Nearest Center Assignment**
   - Automatically computes Haversine distance in kilometers between citizen pickup coordinates and active recycling centers.

4. **Real-Time Notification Engine**
   - Dispatches in-app notifications to users at every lifecycle status transition.

---

## 🏗️ Technology Stack

- **Backend**: Python 3.10+ with **FastAPI**, **Uvicorn**, **PyJWT**, **Bcrypt**, **Pydantic v2**.
- **Database**: **MongoDB** using **Motor** async driver. Includes an automatic Async In-Memory database fallback engine if local MongoDB is offline.
- **Frontend**: **React 18** (Vite), **Tailwind CSS**, **Lucide Icons**, **Leaflet Maps**, **Axios**, **React Router v6**, **Canvas Confetti**.

---

## 📁 Repository Structure

```
E-collection management system/
├── backend/
│   ├── app/
│   │   ├── core/           # Config, database connection, JWT security & RBAC dependencies
│   │   ├── models/         # MongoDB collection models
│   │   ├── schemas/        # Pydantic validation models
│   │   ├── services/       # Geo distance calculation & notification engine
│   │   ├── routers/        # Auth, Pickups, Centers, Staff, Users, Notifications endpoints
│   │   └── main.py         # FastAPI app initialization, CORS & lifespan seeding
│   ├── seed.py             # Pre-populates demo accounts & sample pickup requests
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment settings sample
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios HTTP client with Bearer Token interceptor
│   │   ├── components/     # Navbar, StatusStepper, MapPicker, NotificationPopover, ProtectedRoute
│   │   ├── context/        # AuthContext for global JWT session state
│   │   ├── pages/          # Login, Register, UserDashboard, AdminDashboard, CenterDashboard, StaffDashboard
│   │   ├── App.jsx         # React Router setup
│   │   └── index.css       # Tailwind CSS & glassmorphism utilities
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

---

## 🚀 Quick Setup & Execution

### 1. Backend Setup (FastAPI)

Navigate to the `backend` directory:
```bash
cd backend
```

Create a virtual environment and install requirements:
```bash
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

Set up Environment Variables (Optional):
Create a `.env` file in the `backend/` directory:
```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=ewaste_db
JWT_SECRET=super_secret_ewaste_jwt_key_12345
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

Run the API Server:
```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Documentation: Open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) in your browser.

---

### 2. Frontend Setup (React + Vite)

Open a new terminal window and navigate to the `frontend` directory:
```bash
cd frontend
npm install
```

Start the Vite Development Server:
```bash
npm run dev
```
- Web Application: Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 1-Click Demo Credentials

For rapid testing and evaluation, the backend automatically seeds 4 pre-configured demo accounts. You can sign in using the **1-Click Demo Buttons** on the Login screen:

| Role | Email | Password | Primary Functions |
|---|---|---|---|
| **Citizen User** | `user@ewaste.com` | `user123` | Submit pickup requests, track stepper timeline, view CO₂ saved |
| **System Admin** | `admin@ewaste.com` | `admin123` | Verify requests, auto-assign nearest center, manage plant capacities |
| **Recycling Center** | `center@ewaste.com` | `center123` | Assign drivers, inspect delivered batches, mark recycled |
| **Collection Staff** | `staff@ewaste.com` | `staff123` | View assigned route, mark collected, mark delivered to plant |

---

## 📊 Database Collections (MongoDB)

- `users`: User profile, hashed password, role (`User`, `Admin`, `Recycling Center`, `Collection Staff`), contact info.
- `pickup_requests`: Item type, quantity, user_id, address, geo coordinates (`lat`, `lng`), status, assigned center & staff IDs.
- `recycling_centers`: Plant name, location, geo coordinates, contact phone, maximum capacity (kg), current occupancy.
- `collection_staff`: Staff name, center_id, phone, email, availability status.
- `notifications`: User_id, status update message, read/unread state, timestamp.
