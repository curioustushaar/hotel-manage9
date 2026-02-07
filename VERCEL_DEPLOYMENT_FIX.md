# Vercel Deployment Guide - Bareena Atithi

## 🚀 Quick Fix Deployment Steps

### Step 1: Deploy Backend First

1. **Navigate to Vercel Dashboard**: https://vercel.com/dashboard
2. **Import Backend Project**:
   - Click "Add New" → "Project"
   - Import from Git repository
   - Select the `bareena_athithi/backend` directory as root

3. **Configure Backend**:
   - **Root Directory**: `backend`
   - **Build Command**: Leave empty (or `npm install`)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

4. **Add Environment Variables** in Vercel Dashboard:

   ```
   MONGODB_URI=mongodb+srv://majar_123:majar_123@cluster0.mfempxz.mongodb.net/bareena-atithi?appName=Cluster0
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-app.vercel.app
   ```

5. **Deploy Backend** and note the URL (e.g., `https://bareena-athithi-backend.vercel.app`)

### Step 2: Deploy Frontend

1. **Update Frontend Environment Variable**:
   - Edit `.env.production` file:
     ```
     VITE_API_URL=https://bareena-athithi-backend.vercel.app
     ```

2. **Import Frontend Project** in Vercel:
   - Click "Add New" → "Project"
   - Import from Git repository
   - Select the `bareena_athithi` directory as root

3. **Configure Frontend**:
   - **Root Directory**: `.` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variables** in Vercel Dashboard:

   ```
   VITE_API_URL=https://bareena-athithi-backend.vercel.app
   ```

   _(Replace with your actual backend URL from Step 1)_

5. **Deploy Frontend** and note the URL

### Step 3: Update Backend CORS

1. **Go back to Backend Project** in Vercel Dashboard
2. **Update Environment Variable**:
   - Update `FRONTEND_URL` with your actual frontend URL:
     ```
     FRONTEND_URL=https://your-frontend-app.vercel.app
     ```

3. **Redeploy Backend** to apply changes

## ✅ Verification

1. Visit your frontend URL: `https://your-frontend-app.vercel.app`
2. Check the browser console for any CORS or API errors
3. Test the menu functionality
4. Test the booking functionality

## 🔧 Common Issues & Fixes

### Issue: "Serverless Function has crashed"

**Fix**: Make sure:

- MongoDB URI is correct in backend environment variables
- server.js exports the app correctly (`module.exports = app`)
- No `app.listen()` is called in production (already fixed in code)

### Issue: CORS Error

**Fix**:

- Update `FRONTEND_URL` environment variable in backend
- Redeploy backend after updating

### Issue: "Cannot connect to API"

**Fix**:

- Update `VITE_API_URL` in frontend `.env.production`
- Make sure backend is deployed first
- Redeploy frontend after updating

## 📝 Alternative: Single Vercel Project (Monorepo)

If you want to deploy both frontend and backend as a single project:

1. **Create `vercel.json` in root**:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/server.js"
    },
    {
      "src": "/assets/(.*)",
      "dest": "/assets/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

2. **Deploy as single project** on Vercel
3. **Set environment variables**:
   - Backend variables: `MONGODB_URI`, `NODE_ENV=production`
   - Frontend variables: `VITE_API_URL=/api` (relative path)

## 🎉 Done!

Your application should now be live and working on Vercel!

---

**Note**: Always deploy backend first, then frontend, to get the correct URLs for configuration.
