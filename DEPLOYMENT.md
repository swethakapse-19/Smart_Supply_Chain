# 🚀 Smart Supply Chain — Google Cloud Deployment Guide

## Architecture
```
Firebase Hosting (Frontend)  ──→  Cloud Run (Backend API)
https://smart-supply-xxxx.web.app   https://supply-chain-api-xxxx.a.run.app
```

---

## Prerequisites Checklist

| Item | How to Get It |
|------|---------------|
| Google Cloud Account | https://console.cloud.google.com |
| Billing Enabled | Console → Billing → Link Account |
| gcloud CLI | https://cloud.google.com/sdk/docs/install |
| Firebase CLI | `npm install -g firebase-tools` |
| Docker Desktop | https://www.docker.com/products/docker-desktop |

---

## Step-by-Step Deployment

### 1️⃣  Initial Setup (one time)

```powershell
# Login to Google Cloud
gcloud auth login

# Set your project (replace with your actual Project ID)
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com

# Login to Firebase
firebase login
```

---

### 2️⃣  Deploy Backend to Cloud Run

```powershell
cd C:\Smart_Supply_Chain\backend

# Build & push Docker image using Cloud Build (no local Docker needed!)
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/supply-chain-api

# Deploy to Cloud Run (Asia region = fastest for India)
gcloud run deploy supply-chain-api `
  --image gcr.io/YOUR_PROJECT_ID/supply-chain-api `
  --platform managed `
  --region asia-south1 `
  --allow-unauthenticated `
  --port 8080 `
  --memory 512Mi `
  --min-instances 0 `
  --max-instances 10
```

**After deployment, copy the Service URL displayed:**
```
Service URL: https://supply-chain-api-XXXXXXXX-el.a.run.app
```

---

### 3️⃣  Update Frontend Environment

Edit `frontend/.env.production` — replace with your actual Cloud Run URL:
```
VITE_API_URL=https://supply-chain-api-XXXXXXXX-el.a.run.app
```

---

### 4️⃣  Deploy Frontend to Firebase Hosting

```powershell
cd C:\Smart_Supply_Chain\frontend

# Build production bundle (uses .env.production automatically)
npm run build

# Initialize Firebase (first time only)
firebase init hosting
# → Select: Use an existing project → YOUR_PROJECT_ID
# → Public directory: dist
# → Single-page app: Yes
# → Overwrite index.html: No

# Deploy!
firebase deploy --only hosting
```

**Your app will be live at:**
```
https://YOUR_PROJECT_ID.web.app
```

---

## Verify Deployment

### Test Backend
```bash
curl https://supply-chain-api-XXXX.a.run.app/
# Expected: {"message":"🚀 Smart Supply Chain API running","db":"Mock"}

curl https://supply-chain-api-XXXX.a.run.app/api/dashboard
# Expected: {"kpis":{...},"salesTrend":[...]}
```

### Test Frontend
Open `https://YOUR_PROJECT_ID.web.app` in browser:
- ✅ Mission Control dashboard loads
- ✅ All 5 pages navigate correctly  
- ✅ Live alert feed auto-generates events
- ✅ Inventory and Orders pages show data from Cloud Run API
- ✅ Live Tracking map renders

---

## Sharing Your Demo

After deployment, you can share:
- **Live App**: `https://YOUR_PROJECT_ID.web.app`
- **API Health**: `https://supply-chain-api-XXXX.a.run.app/`

---

## Cost Estimate (Free Tier)

| Service | Free Tier | Your Usage |
|---------|-----------|------------|
| Firebase Hosting | 10 GB storage, 360 MB/day transfer | Well within free |
| Cloud Run | 2M requests/month, 360,000 GB-seconds | Well within free |
| Total | 💰 **₹0 / month** for demo traffic |

---

## Troubleshooting

**CORS error on frontend?**
Check your Firebase Hosting domain is a `*.web.app` or `*.firebaseapp.com` URL — these are already in the backend's CORS allowlist.

**Cloud Run keeps cold-starting?**
Add `--min-instances 1` to keep one instance warm (costs ~$5/month).

**Build fails on Cloud Build?**
Make sure billing is enabled and Cloud Build API is enabled:
```bash
gcloud services enable cloudbuild.googleapis.com
```
