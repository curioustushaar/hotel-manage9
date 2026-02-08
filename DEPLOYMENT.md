# 🚀 Deployment Guide - Hotel Management System

Complete guide for deploying the Hotel Management System to production using Vercel.

---

## 📋 Deployment Overview

This application is deployed on **Vercel** (recommended for both frontend & backend):

- **Frontend:** https://hotel-management-three-psi.vercel.app
- **Backend:** https://hotel-management-vk6w.vercel.app

---

## ✅ Pre-Deployment Checklist

- [ ] All code is committed to GitHub
- [ ] No uncommitted changes (`git status` shows clean)
- [ ] All environment variables are configured
- [ ] MongoDB setup is production-ready
- [ ] Local testing passed
- [ ] `.env` files are in `.gitignore` (NOT committed)
- [ ] `.env.example` files are in repository

---

## 🔐 Security Checklist

- [ ] No `.env` files committed to GitHub
- [ ] `.gitignore` includes `.env` and `.env.local`
- [ ] JWT_SECRET is generated (strong random string)
- [ ] MongoDB credentials are secure
- [ ] CORS is properly configured
- [ ] FRONTEND_URL matches exact production URL
- [ ] No hardcoded API keys in code

---

## 📝 Step-by-Step Deployment

### Phase 1: Prepare Code

#### 1.1 Verify .gitignore

```bash
# Check .gitignore contains sensitive files
cat .gitignore

# Should include:
# .env
# .env.local
# .env.production
# backend/.env
# node_modules
```

#### 1.2 Commit All Changes

```bash
# Stage all changes
git add .

# Commit with message
git commit -m "chore: prepare for production deployment"

# Push to GitHub
git push origin main
```

#### 1.3 Verify GitHub Repository

1. Go to https://github.com/curioustushaar/Hotel-Management
2. Confirm latest commit is visible
3. Check no `.env` files are visible
4. Verify `.env.example` files exist

---

### Phase 2: Deploy Backend to Vercel

#### 2.1 Create Backend Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Select **"Import Git Repository"**
4. Find and select `Hotel-Management` repository
5. Click **"Import"**

#### 2.2 Configure Backend Settings

1. **Root Directory:**
   - Set to: `backend` (scroll down to find this option)

2. **Environment Variables:**
   - Add these variables:
   
   | Key | Value |
   |-----|-------|
   | `MONGODB_URI` | Your MongoDB Atlas connection string |
   | `NODE_ENV` | `production` |
   | `FRONTEND_URL` | `https://hotel-management-three-psi.vercel.app` |
   | `PORT` | `5000` |

3. **Build & Output:**
   - Build Command: `npm install` (default)
   - Output Directory: (leave default)

#### 2.3 Deploy

1. Review all settings
2. Click **"Deploy"** button
3. Wait for deployment (2-5 minutes)
4. Note your Backend URL (e.g., `https://hotel-management-vk6w.vercel.app`)

#### 2.4 Verify Backend Deployment

```bash
# Test health endpoint
curl https://hotel-management-vk6w.vercel.app/api/health

# Should return JSON response
```

**Save your Backend URL!** You'll need it for frontend.

---

### Phase 3: Deploy Frontend to Vercel

#### 3.1 Create Frontend Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Select **"Import Git Repository"**
4. Find and select `Hotel-Management` repository
5. Click **"Import"**

#### 3.2 Configure Frontend Settings

1. **Root Directory:**
   - Set to: (leave as root, or select if monorepo mode)

2. **Build Command:**
   - Change to: `npm run build`

3. **Output Directory:**
   - Change to: `dist`

4. **Environment Variables:**
   - Add these variables:
   
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://hotel-management-vk6w.vercel.app` |
   | `VITE_ENV` | `production` |

5. **Framework Preset:**
   - Select: **Vite** (auto-detected usually)

#### 3.3 Deploy

1. Review all settings
2. Click **"Deploy"** button
3. Wait for deployment (3-8 minutes)
4. Note your Frontend URL (e.g., `https://hotel-management-three-psi.vercel.app`)

#### 3.4 Verify Frontend Deployment

1. Open https://hotel-management-three-psi.vercel.app
2. Check page loads
3. Open browser console (F12)
4. Look for any errors
5. Test API calls (should return data)

---

## 🔄 Update Deployment

### When You Make Code Changes

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin main
   ```

2. **Vercel automatically redeploys:**
   - Frontend automatically redeploys
   - Backend automatically redeploys
   - Takes 2-5 minutes

3. **Monitor deployment:**
   - Go to Vercel Dashboard
   - Check Deployments tab
   - Verify build succeeded

### Manual Redeploy (if needed)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select project
3. Go to **Deployments** tab
4. Find recent deployment
5. Click **three dots (...)** 
6. Select **"Redeploy"**

---

## 📊 Production Monitoring

### View Deployment Logs

1. Vercel Dashboard → Project
2. Click **"Deployments"** tab
3. Select deployment
4. View "Build Logs" and "Runtime Logs"

### Monitor Application

1. **Frontend Monitoring:**
   - Dashboard → Project → Analytics
   - Check response times and errors

2. **Backend Monitoring:**
   - Dashboard → Backend Project → Logs
   - Check for errors and warnings

3. **Database Monitoring:**
   - MongoDB Atlas Dashboard
   - Check connection metrics
   - Monitor storage usage

---

## 🆘 Troubleshooting Production

### Backend not responding

```bash
# Check backend logs in Vercel
# Dashboard → Backend Project → Logs

# Common causes:
# 1. MONGODB_URI incorrect
# 2. FRONTEND_URL not set
# 3. NODE_ENV not set to 'production'
```

### Frontend shows errors

1. Open browser developer console (F12)
2. Check error messages
3. Common issues:
   - `VITE_API_URL` not set
   - Backend URL incorrect
   - CORS blocked

### API calls failing

1. Check backend is deployed and running
2. Verify `VITE_API_URL` matches backend URL
3. Check MongoDB connection in backend logs
4. Verify FRONTEND_URL in backend matches frontend URL

### Database connection issues

1. Verify MongoDB URI in backend environment variables
2. Check IP whitelist in MongoDB Atlas (should include Vercel IPs)
3. Test connection locally first
4. Check database has required collections

---

## 🔐 Production Security

### Environment Variables

✅ **DO:**
- Store in Vercel Environment Variables
- Use strong passwords
- Rotate secrets regularly
- Keep MongoDB credentials private

❌ **DON'T:**
- Commit `.env` files
- Share credentials via email
- Expose secrets in logs
- Use same secrets for dev & production

### CORS Configuration

Ensure backend `.env` has correct `FRONTEND_URL`:

```env
# ✅ Correct (production)
FRONTEND_URL=https://hotel-management-three-psi.vercel.app

# ❌ Incorrect (won't work)
FRONTEND_URL=https://hotel-management-three-psi.vercel.app/
# (note trailing slash - causes CORS issues)
```

### Monitoring & Updates

1. **Check for security updates monthly**
   ```bash
   npm audit
   ```

2. **Keep dependencies updated**
   ```bash
   npm update
   npm upgrade
   ```

3. **Monitor error logs**
   - Check Vercel dashboard weekly
   - Review backend logs for issues

---

## 📈 Production URLs

| Resource | URL |
|----------|-----|
| **Frontend** | https://hotel-management-three-psi.vercel.app |
| **Backend API** | https://hotel-management-vk6w.vercel.app |
| **GitHub Repo** | https://github.com/curioustushaar/Hotel-Management |
| **Vercel Dashboard** | https://vercel.com/dashboard |
| **MongoDB Atlas** | https://cloud.mongodb.com |

---

## 📞 Deployment Support

### Common Resources

- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://docs.mongodb.com/atlas/
- React Docs: https://react.dev
- Express Docs: https://expressjs.com

### Get Help

- GitHub Issues: https://github.com/curioustushaar/Hotel-Management/issues
- Email: support@example.com

---

**Last Updated:** February 8, 2026  
**Version:** 1.0.0
