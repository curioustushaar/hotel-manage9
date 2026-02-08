# CRITICAL: Complete Vercel Deployment Guide for KOT- Project

## 🚨 IMPORTANT: Two Separate Deployments Required

This project has TWO parts that need SEPARATE deployments:

1. **Backend API** (in `/backend` folder)
2. **Frontend React App** (root folder)

---

## 📋 Pre-Deployment Checklist

- [ ] MongoDB Atlas connection string is correct
- [ ] Backend `.env` file configured
- [ ] Frontend `.env.production` file configured
- [ ] Vercel account created
- [ ] Vercel CLI installed (`npm i -g vercel`)

---

## 🎯 STEP 1: Deploy Backend First

### 1.1 Navigate to Backend Directory

```powershell
cd backend
```

### 1.2 Deploy to Vercel

```powershell
vercel --prod
```

### 1.3 During Deployment:

- **Project Name**: `bareena-athithi-backend` (or `kot-backend`)
- **Directory**: Keep as `./`
- **Build Command**: Leave empty (press Enter)
- **Output Directory**: Leave empty (press Enter)
- **Development Command**: Leave empty (press Enter)

### 1.4 Set Environment Variables in Vercel Dashboard

Go to: https://vercel.com/your-username/bareena-athithi-backend/settings/environment-variables

Add these variables:

```
MONGODB_URI=mongodb+srv://majar_123:majar_123@cluster0.mfempxz.mongodb.net/bareena-atithi?appName=Cluster0
NODE_ENV=production
FRONTEND_URL=https://bareena-athithi-bf1o.vercel.app
PORT=5000
```

### 1.5 Copy Backend URL

After deployment, copy the backend URL (e.g., `https://bareena-athithi-backend.vercel.app`)

---

## 🎯 STEP 2: Deploy Frontend

### 2.1 Return to Root Directory

```powershell
cd ..
```

### 2.2 Update Frontend Production Environment

Edit `.env.production` file:

```env
VITE_API_URL=https://bareena-athithi-backend.vercel.app
```

**Replace with your actual backend URL from Step 1.5**

### 2.3 Deploy Frontend

```powershell
vercel --prod
```

### 2.4 During Deployment:

- **Project Name**: `bareena-athithi` or `kot-frontend`
- **Directory**: Keep as `./`
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)
- **Development Command**: `npm run dev` (auto-detected)

### 2.5 Set Environment Variable in Vercel Dashboard

Go to: https://vercel.com/your-username/bareena-athithi/settings/environment-variables

Add this variable:

```
VITE_API_URL=https://bareena-athithi-backend.vercel.app
```

**Use your actual backend URL**

### 2.6 Redeploy After Adding Environment Variables

```powershell
vercel --prod
```

---

## 🎯 STEP 3: Update Backend CORS

### 3.1 Get Your Frontend URL

After frontend deployment, you'll get a URL like: `https://bareena-athithi-xyz.vercel.app`

### 3.2 Update Backend Environment Variable

In Vercel Dashboard → Backend Project → Settings → Environment Variables:

Update `FRONTEND_URL`:

```
FRONTEND_URL=https://bareena-athithi-xyz.vercel.app
```

### 3.3 Redeploy Backend

```powershell
cd backend
vercel --prod
```

---

## ✅ STEP 4: Verify Deployment

### 4.1 Test Backend

Visit: `https://your-backend.vercel.app/api/menu`

Should return JSON response, not 404.

### 4.2 Test Frontend

Visit: `https://your-frontend.vercel.app`

App should load and connect to backend without errors.

### 4.3 Check Browser Console

- Open DevTools (F12)
- Check for CORS errors
- Check API calls are going to correct backend URL

---

## 🔧 ALTERNATIVE: Deploy Using Vercel Dashboard

### Backend:

1. Go to https://vercel.com/new
2. Import repository: `https://github.com/Himanshuyadav6764/KOT-.git`
3. **Root Directory**: `backend`
4. Framework Preset: Other
5. Add environment variables
6. Deploy

### Frontend:

1. Go to https://vercel.com/new
2. Import repository: `https://github.com/Himanshuyadav6764/KOT-.git`
3. **Root Directory**: `./` (keep root)
4. Framework Preset: Vite
5. Add environment variables
6. Deploy

---

## 🐛 Troubleshooting Common Issues

### Issue: 404 NOT_FOUND on Backend

**Solution**:

- Verify `backend/vercel.json` exists
- Check MongoDB connection string is correct
- Check backend logs in Vercel dashboard

### Issue: CORS Error

**Solution**:

- Update `FRONTEND_URL` in backend environment variables
- Redeploy backend after updating

### Issue: API Calls Failing

**Solution**:

- Verify `VITE_API_URL` in frontend environment variables
- Check it matches actual backend URL
- Redeploy frontend after updating

### Issue: Environment Variables Not Working

**Solution**:

- Always redeploy after changing environment variables
- Use `vercel --prod` to force production deployment

---

## 📝 Quick Command Reference

```powershell
# Deploy backend to production
cd backend
vercel --prod

# Deploy frontend to production
cd ..
vercel --prod

# View deployment logs
vercel logs

# List deployments
vercel ls

# Remove a deployment
vercel rm <deployment-url>
```

---

## 🔐 Security Notes

1. **Never commit `.env` files to Git**
2. **Always use environment variables in Vercel Dashboard**
3. **Update MongoDB password after deployment**
4. **Enable MongoDB IP whitelist for production**

---

## 📞 Support

If deployment fails:

1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0) or add Vercel IPs

---

## ✨ Post-Deployment

After successful deployment:

- [ ] Test all API endpoints
- [ ] Test frontend functionality
- [ ] Update README with production URLs
- [ ] Set up custom domain (optional)
- [ ] Enable Vercel Analytics (optional)
- [ ] Set up monitoring/alerts

---

**Last Updated**: February 2026
**Status**: Ready for Production Deployment
