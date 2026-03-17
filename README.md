# InterviewSync

InterviewSync is a full-stack interview preparation and evaluation platform with role-based workflows for candidates and recruiters.

## What is currently implemented

### Core product flow
- Candidate and recruiter dashboards with role-based routing
- Live interview room with video calling, coding editor, and recruiter evaluation panel
- Coding practice module with random DSA/coding questions, run, and submit flow
- Candidate history and interview result tracking

### Authentication and security
- Email/password login and Google OAuth login
- Server-side OTP verification flow for registration
- Redis-backed OTP storage with expiry and resend cooldown
- Redis-backed login/OTP rate limiting by IP and email
- JWT with jti-based active session tracking in Redis
- Logout token revocation (JWT blacklist in Redis)

### Redis features
- OTP storage with TTL and anti-spam controls
- Rate limiting for auth endpoints
- Active session and revoked token handling
- Dashboard response caching with cache invalidation on profile/practice/interview updates
- Interview room coding draft persistence with Redis + local fallback behavior

### Candidate coding persistence
- Interview room draft autosave and restore
	- Local restore for fast refresh continuity
	- Redis draft sync for room continuity
- Code practice draft restore on refresh

## Tech stack
- Frontend: React, Vite, Tailwind CSS, Framer Motion
- Backend: Node.js, Express
- Database: MongoDB (Mongoose)
- Realtime: Socket.IO
- Cache/Auth support: Redis
- Email OTP provider: EmailJS

## Project structure

- Frontend app: [src](src)
- Backend app: [backend/src](backend/src)

## Local setup

### 1) Clone and install

```bash
git clone https://github.com/yourusername/interview-sync.git
cd interview-sync
npm install
cd backend
npm install
```

### 2) Configure environment variables

Create/update frontend env in .env at repo root:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Create/update backend env in [backend/.env](backend/.env):

```env
PORT=5000
MONGO_URI=your_mongo_connection
JWT_SECRET=your_jwt_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

EMAILJS_SERVICE_ID=your_emailjs_service_id
EMAILJS_TEMPLATE_ID=your_emailjs_template_id
EMAILJS_PUBLIC_KEY=your_emailjs_public_key

REDIS_URL=redis://default:password@host:port
REDIS_DASHBOARD_CACHE_TTL=300
REDIS_INTERVIEW_DRAFT_TTL=604800
```

### 3) Run backend

```bash
cd backend
npm run dev
```

### 4) Run frontend

```bash
cd ..
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:5000

## API notes (auth + OTP)

- POST /api/auth/send-otp → send registration OTP (server-side EmailJS + Redis storage)
- POST /api/auth/register → verify OTP and create user
- POST /api/auth/login → login with email/password
- POST /api/auth/logout → revoke current token in Redis blacklist

## Deployment

Live URL: https://interviewsync.vercel.app/

## Current status

- Working role-based interview flow
- Redis-integrated authentication/session/caching features
- Draft persistence for candidate coding workflows