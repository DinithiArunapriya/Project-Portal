# Backend (Project-Portal)

This folder contains the Node.js backend for Project-Portal (Express + MongoDB + Mongoose).

Requirements
- Node.js 24+ (tested with v24)
- MongoDB (local or Atlas)

Quick start
1. Copy `.env.example` to `.env` and update values.

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Seeding demo users

```bash
npm run seed
```

Notes
- The app will fall back to `mongodb://127.0.0.1:27017/project-portal` if `MONGO_URI` is not set. For CI and production, set `MONGO_URI` explicitly.
