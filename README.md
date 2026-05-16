# Smart Leads Dashboard (MERN Stack)

A production-ready, full-stack Lead Management system built with a strict TypeScript architecture, advanced server-side lookup streams, and role-based access control.

## 🐳 Running via Docker Orchestration
To install dependencies, bundle assets, and boot the entire multi-container architecture in an isolated local environment automatically:
```bash
docker-compose up --build
---

## 💻 Manual Local Development Setup

If running components natively on your host machine instead of Docker container configurations:

### 1. Backend Server Setup
```bash
cd backend
npm install
npm run dev
###2. Frontend Client Setup
cd ../frontend
npm install
npm run dev
---

##  Core REST API Endpoints Documentation

### Authentication Router
- `POST /api/auth/register` - Creates a new profile record with hashed bcrypt password parameters.
- `POST /api/auth/login` - Authenticates user credentials and returns a secure JWT token session.

###  Leads Engine Data Management (Protected Paths)
- `GET /api/leads` - Returns paginated rows (10 per page) with combined filtering by status, pipeline source channel, and debounced text search queries.
- `POST /api/leads` - Saves a new client lead entry to the database collection layer.
- `PUT /api/leads/:id` - Updates specific entity profile metadata properties.
- `DELETE /api/leads/:id` - Deletes record tracking metrics (Admin privilege clearance restriction required).

---

## Environment Configuration Template (`.env.example`)

Create a `.env` file inside your `/backend` folder and match these variables:
```text
PORT=5000
MONGO_URI=mongodb://localhost:27017/leads_dashboard
JWT_SECRET=your_super_secret_jwt_encryption_key_here