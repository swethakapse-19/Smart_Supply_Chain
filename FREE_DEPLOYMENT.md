# 🌐 Free Deployment Guide — No Credit Card Needed!
## SupplySense AI · Google Solution Challenge 2026

> **Since Google Cloud requires billing, here are 3 fully free options to get your project live for submission.**

---

## 🏆 Option 1: Render.com (RECOMMENDED — Easiest)
> **Free tier**: 750 hours/month, auto-sleep after inactivity, no credit card required

### Step 1: Push your project to GitHub
```bash
# In your project root
git init
git add .
git commit -m "SupplySense AI - Google Solution Challenge 2026"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/smart-supply-chain.git
git push -u origin main
```

### Step 2: Deploy Node.js Backend on Render
1. Go to **https://render.com** → Sign up free (no credit card)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo
4. Configure:
   - **Name**: `supply-chain-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free
5. Click **"Create Web Service"**
6. **Copy the URL**: `https://supply-chain-api.onrender.com`

### Step 3: Deploy FastAPI AI Backend on Render
1. Click **"New +"** → **"Web Service"** again
2. Configure:
   - **Name**: `supply-chain-ai`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free
3. Click **"Create Web Service"**
4. **Copy the URL**: `https://supply-chain-ai.onrender.com`

### Step 4: Deploy React Frontend on Vercel
1. Go to **https://vercel.com** → Sign up with GitHub (free)
2. Click **"New Project"** → Import your GitHub repo
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variable**:
   - `VITE_API_URL` = `https://supply-chain-api.onrender.com`
5. Click **"Deploy"**
6. **Your app is live at**: `https://smart-supply-chain.vercel.app` 🎉

---

## 🚀 Option 2: Railway.app (Easiest One-Click)
> **Free**: $5 credit, no auto-sleep, better performance than Render free tier

1. Go to **https://railway.app** → Sign up with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Railway auto-detects Node.js and deploys!
5. For FastAPI: Add a new service, set start command to `uvicorn main:app --host 0.0.0.0 --port $PORT`

---

## ⚡ Option 3: GitHub Pages (Frontend Only — Zero Setup)
> Best if you just need a static demo for submission

### Build & Deploy to GitHub Pages:
```bash
cd frontend

# Install GitHub Pages package
npm install --save-dev gh-pages

# Build the project first (update vite.config.js base if needed)
npm run build

# Deploy to GitHub Pages
npx gh-pages -d dist
```

**Your demo is live at**: `https://YOUR_USERNAME.github.io/smart-supply-chain`

> **Note**: GitHub Pages serves static files only. The frontend will work but API calls will use mock/fallback data — which is still great for a demo!

---

## 📋 Submission Checklist

After deploying, update your submission with:

- [ ] **GitHub repo** is public with all code
- [ ] **README.md** has clear description and screenshots
- [ ] **PROBLEM_STATEMENT.md** is in repo root
- [ ] **Demo video** (2-3 min) showing all 5 pages
- [ ] **Live URL** is working and accessible globally
- [ ] All 5 pages work: Dashboard, Inventory, Orders, Live Tracking, Demand AI

---

## 🎬 Creating Your Demo Video
1. Start the local dev server: `npm run dev` in frontend folder
2. Use Windows + G (Xbox Game Bar) or OBS to record screen
3. Show these features in order:
   - 🎯 Mission Control Dashboard with live disruption alerts
   - 🗺️ Live Tracking — enter source/destination cities, show route
   - 🤖 Use the AI prediction feature (Delay Risk Analyzer)
   - 📦 Inventory page — show low stock alerts
   - 📊 Demand AI — show forecasting charts
4. Upload to YouTube (unlisted is fine) or Google Drive

---

## 🔧 Quick Local Demo (No Deployment Needed)

If you just need to demo for a video submission, run locally:

```powershell
# Terminal 1 — Start Node.js backend
cd C:\Smart_Supply_Chain\backend
npm install
npm start
# Runs at http://localhost:5000

# Terminal 2 — Start React frontend  
cd C:\Smart_Supply_Chain\frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

Or simply open `C:\Smart_Supply_Chain\demo.html` in your browser for an instant standalone demo!
