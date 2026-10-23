# 🎒 CampusKhoj — Campus Lost & Found

A full-stack web app where students can post **lost** and **found** items on campus, search them, and get them back to their owners.

## ✨ Features (building)
- 🔐 Auth — signup/login with JWT
- 📝 Post lost/found items with photos
- 🔎 Search & filter feed (type, category, location)
- 🤝 Claim flow — connect finder and owner
- ✅ Status tracking — Open → Claimed → Resolved
- 📋 Personal dashboard for your posts

## 🛠 Tech stack
- **Frontend:** React (Vite) + Tailwind CSS
- **Backend:** Node.js + Express (REST API)
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT + bcrypt

## 📁 Structure
```
campuskhoj/
├── client/   # React frontend (Vite)
└── server/   # Express + MongoDB backend API
```

## 🚀 Run locally

Backend:
```bash
cd server
cp .env.example .env   # fill MONGO_URI and JWT_SECRET
npm install
npm run dev            # http://localhost:5000
```

Frontend (new terminal):
```bash
cd client
npm install
npm run dev            # http://localhost:5173
```

## 📌 Status
Week 3 done — the claim flow is live: anyone logged in can request to claim an open item with proof, the poster reviews requests and accepts one (accepting marks the item claimed and declines the rest), plus a My Posts dashboard with tabs for your posts (status/delete + pending-claim counts) and your claims. Next: UI polish and deploy (Vercel + Render + Atlas).
