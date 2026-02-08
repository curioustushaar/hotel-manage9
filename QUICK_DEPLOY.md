# 🚀 QUICK DEPLOYMENT GUIDE - KOT PROJECT

## ⚡ Fast Track (5 Minutes)

### Step 1: Install Vercel CLI (First Time Only)

```powershell
npm i -g vercel
```

### Step 2: Deploy Backend (Do This First!)

```powershell
cd backend
vercel --prod
```

**📝 Copy the backend URL!** (e.g., `https://kot-backend-xyz.vercel.app`)

### Step 3: Update Frontend Config

Edit `.env.production`:

```env
VITE_API_URL=https://your-backend-url.vercel.app
```

### Step 4: Deploy Frontend

```powershell
cd ..
vercel --prod
```

---

## 🎯 Using Deployment Scripts

### For Backend:

```powershell
.\deploy-backend.ps1
```

### For Frontend:

```powershell
.\deploy-frontend.ps1
```

---

## 🔧 Vercel Dashboard Setup

### Backend Environment Variables:

```
MONGODB_URI=mongodb+srv://majar_123:majar_123@cluster0.mfempxz.mongodb.net/bareena-atithi
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
PORT=5000
```

### Frontend Environment Variable:

```
VITE_API_URL=https://your-backend-url.vercel.app
```

---

## ✅ Deployment Checklist

- [ ] Backend deployed first
- [ ] Backend URL copied
- [ ] `.env.production` updated with backend URL
- [ ] Frontend deployed
- [ ] Backend `FRONTEND_URL` updated
- [ ] Backend redeployed with new FRONTEND_URL
- [ ] Tested: `https://backend-url/api/menu`
- [ ] Tested: Frontend loads and connects to API

---

## 🐛 Common Issues & Fixes

### 404 Error

```powershell
cd backend
vercel --prod
```

Ensure `backend/vercel.json` exists.

### CORS Error

Update backend's `FRONTEND_URL` in Vercel Dashboard → Redeploy

### API Not Connecting

Update frontend's `VITE_API_URL` in Vercel Dashboard → Redeploy

---

## 📞 Need Help?

See full guide: [VERCEL_DEPLOYMENT_COMPLETE_GUIDE.md](./VERCEL_DEPLOYMENT_COMPLETE_GUIDE.md)

---

**Production URLs:**

- Frontend: `https://bareena-athithi-bf1o.vercel.app`
- Backend: `Update after deployment`
