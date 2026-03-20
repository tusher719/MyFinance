# 💰 WalletOS — Full-Stack Finance Management App

A production-ready personal finance manager built with React, Node.js, and MongoDB.

---

## ✨ Features

| Feature | Details |
|---------|---------|
| **Multi-Account** | Cash, Bank, Credit, bKash, Savings, Investment... |
| **3-Level Categories** | Category → Subcategory → Sub-subcategory with color/icon/nature |
| **Smart Transactions** | Income / Expense / Transfer with calculator input & auto-rules |
| **Budget System** | Monthly budgets with visual progress & over-budget alerts |
| **Debt Tracker** | I Lent / I Borrowed with partial payments & due reminders |
| **Reports & Charts** | Cash Flow, Spending breakdown, Balance trend (Recharts) |
| **Notifications** | In-app center with budget alerts, debt reminders, low balance |
| **Tags & Labels** | Color-coded tags with auto-assign rules |
| **Dark Mode** | Full dark/light theme with system preference detection |
| **Mobile First** | Responsive design, works great on phones |
| **JWT Auth** | Secure auth with bcrypt password hashing |
| **Role System** | User + SuperAdmin roles |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+ (local or Atlas)

### 1. Clone & Install

```bash
git clone <your-repo>
cd finance-app

# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your MONGODB_URI and JWT_SECRET

# Frontend
cd ../frontend
npm install
```

### 2. Seed Demo Data

```bash
cd backend
npm run seed
# Creates: demo@walletOS.com / demo1234
```

### 3. Run

```bash
# Terminal 1 — Backend
cd backend
npm run dev   # Runs on :5000

# Terminal 2 — Frontend
cd frontend
npm start     # Runs on :3000
```

Open **http://localhost:3000** → Login with `demo@walletOS.com` / `demo1234`

---

## 🐳 Docker Deployment

```bash
# From project root
docker-compose up -d

# App will be available at:
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000/api
```

---

## 📁 Project Structure

```
finance-app/
├── backend/
│   ├── config/           # DB connection
│   ├── controllers/      # Business logic
│   │   ├── authController.js
│   │   ├── accountController.js
│   │   ├── transactionController.js
│   │   ├── categoryController.js
│   │   ├── budgetController.js
│   │   ├── debtController.js
│   │   └── statsController.js
│   ├── middleware/        # JWT auth, role guard
│   ├── models/            # 11 Mongoose schemas
│   ├── routes/            # 12 Express routers
│   ├── services/          # Cron notification service
│   ├── utils/             # Token, response helpers, seeder
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── contexts/      # Auth, Theme, App (global state)
    │   ├── components/
    │   │   ├── common/    # Modal, Layout, Sidebar, FilterBar, Calculator...
    │   │   ├── dashboard/ # SummaryCard, CashFlowChart, SpendingChart
    │   │   └── transactions/ # TransactionForm, TransactionItem
    │   ├── pages/         # 10 full pages
    │   └── services/      # Axios API client
    └── public/            # manifest.json (PWA ready)
```

---

## 🗄️ Database Schemas

| Model | Purpose |
|-------|---------|
| User | Auth, preferences, notification settings |
| Account | Wallets with balance tracking |
| Category | 3-level tree with icon/color/nature |
| Tag | Labels with auto-assign keywords |
| Transaction | Core record with account balance sync |
| Budget | Monthly limits with alert threshold |
| Debt | Lent/borrowed with payment history |
| Notification | In-app alert center |
| Template | Saved transaction presets |
| AutoRule | Rule-based auto-categorization |
| ActivityLog | Audit trail |

---

## 🔌 API Reference

```
Auth:         POST /api/auth/register|login  GET /api/auth/me
Accounts:     GET/POST /api/accounts         PUT/DELETE /api/accounts/:id
Transactions: GET/POST /api/transactions     PUT/DELETE /api/transactions/:id
Categories:   GET/POST /api/categories       PUT/DELETE /api/categories/:id
Tags:         GET/POST /api/tags             PUT/DELETE /api/tags/:id
Budgets:      GET/POST /api/budgets          PUT/DELETE /api/budgets/:id
Debts:        GET/POST /api/debts            POST /api/debts/:id/payments
Stats:        GET /api/stats/dashboard       GET /api/stats/spending
Notifications:GET /api/notifications         PUT /api/notifications/:id/read
Templates:    GET/POST /api/templates        DELETE /api/templates/:id
Auto Rules:   GET/POST /api/auto-rules       PUT/DELETE /api/auto-rules/:id
```

---

## 🔐 Security

- JWT tokens (7-day expiry)  
- bcrypt password hashing (12 rounds)  
- Helmet.js security headers  
- CORS configuration  
- Rate limiting (200 req/15min)  
- User-scoped data (all queries filtered by user ID)  

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS 3, Recharts, React Router 6 |
| Backend | Node.js, Express 4, Mongoose |
| Database | MongoDB 7 with index optimization |
| Auth | JWT + bcrypt |
| Charts | Recharts |
| Notifications | node-cron (background jobs) |
| Deployment | Docker + Nginx |

