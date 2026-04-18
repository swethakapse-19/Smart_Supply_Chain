# 🚀 SupplySense AI — Smart Supply Chain Platform

<div align="center">

![Google Solution Challenge 2026](https://img.shields.io/badge/Google%20Solution%20Challenge-2026-4285F4?style=for-the-badge&logo=google)
![Track](https://img.shields.io/badge/Track-Smart%20Supply%20Chains-34A853?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=for-the-badge&logo=fastapi)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)

**AI-Powered Supply Chain Disruption Prevention Platform**

*Detects and prevents logistics disruptions before they cascade — in real time*

[Live Demo](#) · [Problem Statement](PROBLEM_STATEMENT.md) · [Deployment Guide](FREE_DEPLOYMENT.md)

</div>

---

## 🎯 What We Solve

India's logistics sector loses **₹2 lakh crore annually** from supply chain disruptions. Traditional systems react *after* events cascade. SupplySense AI acts *before* — using machine learning to predict delay risks and reroute shipments proactively.

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI Risk Prediction** | Random Forest model predicts delay risk (0–100%) from weather + traffic + speed |
| 🗺️ **Dynamic Route Optimizer** | Enter any source/destination city — instant route alternatives via OpenStreetMap |
| 📊 **Mission Control Dashboard** | Live monitoring of 8 active shipments with auto-updating risk scores |
| 🚨 **Disruption Intelligence Feed** | Real-time AI alert stream — cascade events detected & prevented |
| 📦 **Inventory Management** | Product CRUD with low-stock alerts and category tracking |
| 📋 **Order Management** | Full order lifecycle: Pending → Shipped → Delivered |
| 📈 **Demand Forecasting AI** | Predicts future demand per SKU — 3-month forward projections |

## 🛠️ Tech Stack

```
Frontend: React 18 + Vite + Recharts + Lucide
AI Backend: Python FastAPI + scikit-learn (Random Forest)
Data Backend: Node.js + Express + MongoDB
Maps: OpenStreetMap / Nominatim API (free)
Deployment: Docker + Google Cloud Run / Render.com
Hosting: Firebase Hosting / Vercel
```

## 🚀 Quick Start

### Option A: Instant Demo (No Setup)
```bash
# Just open this file in your browser:
Smart_Supply_Chain/demo.html
```

### Option B: Full Local Development
```bash
# Terminal 1 — Node.js Data Backend (Port 5000)
cd backend && npm install && npm start

# Terminal 2 — Python AI Backend (Port 8000)
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 3 — React Frontend (Port 5173)
cd frontend && npm install && npm run dev
```

Open `http://localhost:5173` — full dashboard with live API data!

## 📁 Project Structure

```
Smart_Supply_Chain/
├── backend/
│   ├── main.py              # FastAPI: ML prediction + route optimization
│   ├── server.js            # Express: Inventory, Orders, Dashboard APIs
│   ├── model.pkl            # Trained Random Forest classifier (434 KB)
│   ├── model_builder.py     # ML training script
│   ├── requirements.txt     # Python dependencies
│   └── Dockerfile           # Container for Cloud Run / Render
├── frontend/
│   ├── src/pages/
│   │   ├── Dashboard.jsx    # Mission Control — live fleet + alerts
│   │   ├── LiveTracking.jsx # Interactive map + AI route optimizer
│   │   ├── Inventory.jsx    # Product management
│   │   ├── Orders.jsx       # Order tracking
│   │   └── DemandAI.jsx     # Demand forecasting charts
│   ├── vercel.json          # Vercel SPA routing
│   └── firebase.json        # Firebase Hosting config
├── demo.html                # Standalone zero-dependency demo
├── PROBLEM_STATEMENT.md     # Detailed problem + solution writeup
└── FREE_DEPLOYMENT.md       # Free deployment guide (Render + Vercel)
```

## 🌐 Free Deployment

**No Google Cloud billing required!** See [FREE_DEPLOYMENT.md](FREE_DEPLOYMENT.md) for step-by-step guides:
- **Backend** → [Render.com](https://render.com) (free, no credit card)
- **Frontend** → [Vercel](https://vercel.com) (free, GitHub integration)

## 🎯 SDGs Addressed

- **SDG 9** — Industry, Innovation & Infrastructure
- **SDG 11** — Sustainable Cities & Communities  
- **SDG 12** — Responsible Consumption & Production
- **SDG 13** — Climate Action

## 📄 Documentation

- 📋 [Problem Statement](PROBLEM_STATEMENT.md) — Full challenge description & solution design
- 🚀 [Free Deployment Guide](FREE_DEPLOYMENT.md) — Deploy without cloud billing
- ☁️ [GCP Deployment Guide](DEPLOYMENT.md) — Original Google Cloud deployment

---

<div align="center">
<strong>Google Solution Challenge 2026 · Track: Smart Supply Chains</strong>
</div>
