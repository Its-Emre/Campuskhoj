# 🎒 CampusKhoj — Campus Lost & Found

A full-stack web app where students can post **lost** and **found** items on campus, search the feed, and claim items back from the finder — with proof, not just trust.

## 🔗 Live demo

- **App:** https://campuskhoj.vercel.app
- **API health check:** https://campuskhoj-xfhv.onrender.com/api/health

> Note: the backend runs on Render's free tier and sleeps after ~15 minutes of inactivity — the first request after a break can take 30–50 seconds to wake it up.

## ✨ Features

- 🔐 **Auth** — signup/login with JWT and bcrypt-hashed passwords
- 📝 **Post items** — lost/found posts with a photo (Cloudinary storage), category, location and date
- 🔎 **Search & filter** — keyword search plus type, category and location filters
- 🤝 **Claim flow** — a logged-in user claims an open item with a proof message; the poster reviews requests and accepts one. Accepting marks the item *claimed* and auto-declines the other pending claims
- 📋 **My Posts dashboard** — your posts with pending-claim counts, status controls and delete, plus a tab tracking the claims you have made
- ✅ **Status tracking** — Open → Claimed → Resolved

## 🛠 Tech stack

- **Frontend:** React (Vite) + Tailwind CSS, React Router
- **Backend:** Node.js + Express (REST API)
- **Database:** MongoDB Atlas (Mongoose)
- **Auth:** JWT + bcryptjs
- **Image storage:** Cloudinary (multer, 2 MB image limit), with a local-disk fallback for development
- **Deployment:** Vercel (frontend) + Render (backend)

## 📁 Project structure

```
campuskhoj/
├── client/            # React frontend (Vite)
│   └── src/
│       ├── pages/     # Home feed, Post Item, Item Detail, My Posts, Login, Register
│       ├── components/# Navbar
│       ├── context/   # AuthContext (session + token)
│       └── lib/       # API client
└── server/            # Express backend
    └── src/
        ├── config/    # Database + Cloudinary setup
        ├── controllers/
        ├── middleware/# JWT auth, image upload
        ├── models/    # User, Item, Claim
        └── routes/    # /api/auth, /api/items, /api/me
```

## 🔌 API overview

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in, returns a JWT |
| GET | `/api/items` | List items (`?search=&type=&category=&location=`) |
| POST | `/api/items` | Post an item with an optional photo (auth) |
| PATCH | `/api/items/:id/status` | Update status (owner only) |
| DELETE | `/api/items/:id` | Delete a post (owner only) |
| POST | `/api/items/:id/claims` | Claim an item with a proof message (auth) |
| GET | `/api/items/:id/claims` | View claim requests (poster only) |
| PATCH | `/api/items/:id/claims/:claimId` | Accept / decline a claim (poster only) |
| GET | `/api/me/items` | Your posts, with pending-claim counts |
| GET | `/api/me/claims` | Claims you have made |

## 🚀 Run locally

Backend:

```bash
cd server
cp .env.example .env   # fill in the values below
npm install
npm run dev            # http://localhost:5000
```

Frontend (new terminal):

```bash
cd client
npm install
npm run dev            # http://localhost:5173
```

### Environment variables (server/.env)

| Variable | Purpose |
| --- | --- |
| `PORT` | Backend port (default 5000) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret used to sign login tokens |
| `CLIENT_URL` | Frontend origin, allowed by CORS |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Photo storage. Optional locally — without them, uploads fall back to `server/uploads/` |

For the production frontend, set `VITE_API_URL` to the deployed backend's `/api` URL (see `client/.env.example`). Locally it can stay unset — Vite proxies `/api` to the backend.

## 📌 Status

Complete and deployed (October 2026). All four build weeks are done and verified live: auth, posting with photos, search & filters, the full claim flow, the personal dashboard, Cloudinary image storage, and production deployment (Vercel + Render + MongoDB Atlas).
