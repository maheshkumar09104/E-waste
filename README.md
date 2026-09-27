# EcoCollect — E-Waste Collection & Recycling Platform

A full-stack web application that lets users request doorstep pickup of e-waste, with the request routed through admin verification, nearest-center assignment, staff collection, and final recycling — with status tracking and notifications at every stage.

**Live App:** https://e-waste-1-1qgy.onrender.com
**Repository:** https://github.com/maheshkumar09104/E-waste

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Axios, Tailwind CSS |
| Backend | Python, FastAPI, Uvicorn |
| Database | MongoDB (Motor / Beanie) |
| Auth | JWT-based, role-based access control |
| Hosting | Render (Static Site + Web Service) |

---

## User Roles

| Role | Capabilities |
|---|---|
| **User** | Submit pickup requests, track status, view notifications |
| **Admin** | Verify requests, manage users and recycling centers |
| **Recycling Center** | Receive assigned requests, assign staff, mark as recycled |
| **Collection Staff** | View assigned pickups, mark collected/delivered |

---

## Core Workflow

```
User submits request
   → Admin verifies
      → Auto-assigned to nearest Recycling Center
         → Center assigns Collection Staff
            → Staff collects e-waste
               → Staff delivers to center
                  → Center marks as Recycled
                     → User notified at every step
```

---

## Project Structure

```
E-waste/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── core/          # config, security, database
│   │   ├── models/        # User, PickupRequest, RecyclingCenter, CollectionStaff, Notification
│   │   ├── schemas/       # Pydantic request/response models
│   │   ├── routers/       # auth, requests, centers, staff
│   │   └── services/      # nearest-center assignment, notifications
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── api/            # Axios instance
    │   ├── context/        # Auth context
    │   ├── pages/          # Login, Register, role dashboards
    │   └── components/     # RequestForm, StatusStepper, ProtectedRoute
    └── public/
        └── _redirects       # SPA routing fix for Render
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB Atlas account (or local MongoDB)

### Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create `backend/.env`:
```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ewaste?retryWrites=true&w=majority
JWT_SECRET=your-random-secret-key
```

Run:
```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Backend runs at `http://127.0.0.1:8000`

### Frontend

```powershell
cd frontend
npm install
```

Create `frontend/.env`:
```
VITE_API_URL=http://127.0.0.1:8000
```

Run:
```powershell
npm run dev
```
Frontend runs at `http://localhost:5173`

---

## Deployment (Render)

Both frontend and backend are deployed as separate Render services.

### Backend — Web Service

| Setting | Value |
|---|---|
| Root Directory | `backend` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Environment Variables | `MONGO_URI`, `JWT_SECRET` |

### Frontend — Static Site

| Setting | Value |
|---|---|
| Root Directory | `frontend` |
| Build Command | `npm ci && npm run build` |
| Publish Directory | `dist` |
| Environment Variables | `VITE_API_URL` (backend's Render URL) |

**Note:** `frontend/public/_redirects` must contain `/*   /index.html   200` for client-side routing to work on page refresh.

---

## Demo Accounts

| Role | Email |
|---|---|
| Citizen User | user@ewaste.com |
| System Admin | admin@ewaste.com |
| Recycling Center | center@ewaste.com |
| Collection Staff | staff@ewaste.com |

---

## Request Status Lifecycle

```
Pending → Verified → Assigned → Collected → Delivered → Recycled
              ↓
           Rejected
```

---

## Key Features

- Role-based authentication and dashboards (JWT)
- Automatic nearest-recycling-center assignment by geo-location
- Full request lifecycle tracking with a visual status stepper
- Notification generated at every status change
- Centralized MongoDB records for users, requests, centers, and staff

---

## Future Scope

- Payment/reward system for recycling incentives
- Native mobile apps
- Real-time GPS tracking of collection staff
- IoT-based e-waste weight/volume sensing
