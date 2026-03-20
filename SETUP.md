# WalletOS — Windows Setup Guide (PowerShell)

## ⚠️ PowerShell Note
PowerShell does NOT support `&&` between commands. Run each command separately.

---

## Prerequisites
- Node.js 18+ → https://nodejs.org
- MongoDB Community → https://www.mongodb.com/try/download/community
  - After install, start MongoDB: `net start MongoDB` (or via Services)
- Git (optional)

---

## Step 1 — Backend Setup

Open PowerShell in the `finance-app\backend` folder:

```powershell
npm install
```

```powershell
npm run seed
```

```powershell
npm run dev
```

You should see:
```
Server running on port 5000
MongoDB Connected: localhost
✅ Notification cron jobs started
```

---

## Step 2 — Frontend Setup

Open a **new** PowerShell window in `finance-app\frontend`:

```powershell
npm install
```

```powershell
npm start
```

Browser will open at **http://localhost:3000**

---

## Step 3 — Login

```
Email:    demo@walletOS.com
Password: demo1234
```

---

## MongoDB — Quick Start Options

### Option A: Local MongoDB (recommended)
1. Download: https://www.mongodb.com/try/download/community
2. Install with defaults (includes MongoDB as a Windows Service)
3. It starts automatically — no extra steps needed

### Option B: MongoDB Atlas (cloud, free tier)
1. Go to https://cloud.mongodb.com → Create free cluster
2. Get your connection string
3. Edit `backend\.env`:
   ```
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/financeapp
   ```

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `ERESOLVE` dependency error | `npm install --legacy-peer-deps` |
| `ECONNREFUSED` MongoDB | Start MongoDB service: `net start MongoDB` |
| Port 5000 in use | Edit `backend\.env` → change `PORT=5001` |
| Port 3000 in use | React will ask to use 3001 — press `Y` |
| `'nodemon' not found` | `npm install -g nodemon` |

---

## Folder Structure Quick Reference

```
finance-app\
├── backend\          ← Node.js + Express API (port 5000)
│   ├── .env          ← Your config (MongoDB URI, JWT secret)
│   ├── models\       ← 11 MongoDB schemas
│   ├── controllers\  ← Business logic
│   ├── routes\       ← 12 API route files
│   └── server.js     ← Entry point
│
└── frontend\         ← React app (port 3000)
    ├── .env          ← API URL config
    └── src\
        ├── pages\    ← 11 pages
        └── components\
```
