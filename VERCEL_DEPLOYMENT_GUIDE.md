# 🚀 Vercel Deployment Guide for Bireena Athithi

## 📋 Overview

This guide will help you deploy your Bireena Athithi application to production using Vercel.

## 🔧 Prerequisites

- Git repository (GitHub, GitLab, or Bitbucket)
- Vercel account (free): https://vercel.com
- MongoDB Atlas account for production database

---

## 📦 Part 1: Deploy Frontend to Vercel

### Step 1: Prepare Your Repository

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Ready for Vercel deployment"

# Push to GitHub (create a repository on GitHub first)
git remote add origin https://github.com/your-username/bireena-athithi.git
git push -u origin master
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com and sign in
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3: Set Environment Variables

In Vercel project settings, add this environment variable:

- Key: `VITE_API_URL`
- Value: `https://your-backend-url.vercel.app` (or your backend deployment URL)

### Step 4: Deploy

Click "Deploy" and wait for the build to complete!

---

## 🖥️ Part 2: Deploy Backend

### Option A: Deploy Backend to Render (Recommended)

1. Go to https://render.com
2. Create a new "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: bireena-backend
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. Add Environment Variable:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `PORT`: 5000

6. Deploy!

### Option B: Deploy Backend to Railway

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Configure:
   - **Root Directory**: `backend`
5. Add variables:
   - `MONGODB_URI`: Your MongoDB connection string
6. Deploy!

---

## 🗄️ Part 3: Setup MongoDB Atlas (Production Database)

### Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for a free account
3. Create a new cluster (choose free tier)

### Step 2: Configure Database Access

1. Go to "Database Access" → "Add New Database User"
2. Create username and password (save these!)
3. Set permissions to "Read and write to any database"

### Step 3: Configure Network Access

1. Go to "Network Access" → "Add IP Address"
2. Click "Allow Access from Anywhere" (0.0.0.0/0)
3. Confirm

### Step 4: Get Connection String

1. Go to "Database" → "Connect"
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database password
5. Replace `<dbname>` with `bireena_athithi`

Example:

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/bireena_athithi?retryWrites=true&w=majority
```

---

## 🔄 Part 4: Update Environment Variables

### Update Frontend (.env.production)

```env
VITE_API_URL=https://your-backend-url.com
```

### Update in Vercel Dashboard

1. Go to your project in Vercel
2. Settings → Environment Variables
3. Edit `VITE_API_URL` with your backend URL
4. Redeploy

---

## ✅ Part 5: Testing Your Deployment

### 1. Test Backend First

Visit: `https://your-backend-url.com/api/rooms/list`

- Should return JSON response

### 2. Test Frontend

Visit your Vercel URL: `https://your-app.vercel.app`

- Check if data loads correctly
- Test all features

---

## 🐛 Troubleshooting

### Issue: API calls failing (404 errors)

**Solution**:

- Check if `VITE_API_URL` is set correctly in Vercel
- Verify backend is running
- Check browser console for CORS errors

### Issue: CORS errors

**Solution**: Update backend `server.js` to allow your Vercel domain:

```javascript
const cors = require("cors");
app.use(
  cors({
    origin: ["https://your-app.vercel.app", "http://localhost:5173"],
    credentials: true,
  }),
);
```

### Issue: Environment variables not working

**Solution**:

- Must start with `VITE_` for Vite to expose them
- Redeploy after adding/updating variables
- Use `import.meta.env.VITE_API_URL` in code

### Issue: Build fails on Vercel

**Solution**:

- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Try building locally first: `npm run build`

---

## 🔐 Security Best Practices

1. **Never commit .env files**
   - Already in .gitignore
2. **Use environment variables**
   - All sensitive data in environment variables
   - Different values for dev and production

3. **Enable HTTPS**
   - Vercel automatically provides HTTPS

4. **Secure MongoDB**
   - Use strong passwords
   - Restrict IP access when possible

---

## 📝 Local Development vs Production

### Local Development

```bash
# Frontend (root directory)
npm run dev

# Backend (backend directory)
cd backend
npm start
```

API URL: `http://localhost:5000`

### Production

Frontend: Deployed on Vercel
Backend: Deployed on Render/Railway
Database: MongoDB Atlas

API URL: `https://your-backend-url.com`

---

## 🔄 Continuous Deployment

### Auto-Deploy on Git Push

Vercel automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push
```

Vercel will:

1. Detect the push
2. Build your project
3. Deploy automatically
4. Provide preview URL

---

## 📞 Support

If you encounter issues:

1. Check Vercel deployment logs
2. Check backend logs in Render/Railway
3. Verify environment variables
4. Test API endpoints directly

---

## 🎉 You're Done!

Your Bireena Athithi application is now live on Vercel!

**Important URLs to Save:**

- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend-url.com`
- MongoDB: `mongodb+srv://...`

**Next Steps:**

- Share your app URL with users
- Monitor usage and performance
- Set up custom domain (optional)
- Regular backups of MongoDB data
