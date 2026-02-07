# 🚀 Quick Deployment Checklist

## ✅ Pre-Deployment Checklist

### Frontend Setup

- [x] API URLs centralized in `/src/config/api.js`
- [x] Environment files created (`.env`, `.env.production`)
- [x] `vercel.json` configured
- [x] All hardcoded `localhost:5000` replaced
- [ ] Test build locally: `npm run build`
- [ ] Push code to GitHub

### Backend Setup

- [ ] MongoDB Atlas account created
- [ ] Database user and password created
- [ ] Network access configured (allow all IPs)
- [ ] Connection string obtained
- [ ] `backend/vercel.json` created (if deploying to Vercel)

---

## 📝 Deployment Steps

### 1. Deploy Backend First

**Method A: Render.com (Recommended for Free Tier)**

- [x] Sign up at https://render.com
- [ ] Create New Web Service
- [ ] Connect GitHub repo
- [ ] Set Root Directory: `backend`
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Add Environment Variable: `MONGODB_URI`
- [ ] Copy deployed backend URL

**Method B: Railway**

- [ ] Sign up at https://railway.app
- [ ] Deploy from GitHub
- [ ] Set Root Directory: `backend`
- [ ] Add `MONGODB_URI` variable
- [ ] Copy deployed URL

### 2. Configure Frontend Environment

- [ ] Update `.env.production` with backend URL
- [ ] Example: `VITE_API_URL=https://your-backend.onrender.com`

### 3. Deploy Frontend to Vercel

- [ ] Sign up at https://vercel.com
- [ ] Import GitHub repository
- [ ] Framework: Vite
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Add Environment Variable: `VITE_API_URL`
- [ ] Deploy!

### 4. Test Deployment

- [ ] Visit backend URL: `https://your-backend/api/rooms/list`
- [ ] Should return JSON data
- [ ] Visit frontend URL: `https://your-app.vercel.app`
- [ ] Check if data loads
- [ ] Test all features (rooms, bookings, food menu)

---

## 🔧 Environment Variables

### Frontend (Vercel)

```
VITE_API_URL=https://your-backend-url.com
```

### Backend (Render/Railway)

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bireena_athithi
PORT=5000
NODE_ENV=production
```

---

## 🐛 Common Issues & Fixes

### "API call failed" or 404 errors

- Check `VITE_API_URL` is set correctly in Vercel
- Verify backend is running
- Check backend URL in browser

### CORS errors

Update backend `server.js`:

```javascript
app.use(
  cors({
    origin: ["https://your-app.vercel.app", "http://localhost:5173"],
    credentials: true,
  }),
);
```

### Environment variables not working

- Must start with `VITE_` for frontend
- Redeploy after adding variables
- Clear cache and rebuild

---

## 📞 Important URLs

**Save these after deployment:**

- Frontend: `_______________________`
- Backend: `_______________________`
- MongoDB: `_______________________`

---

## 🎯 Current Status

Your project is now **READY FOR DEPLOYMENT**! ✅

All API calls have been centralized and configured to use environment variables. Follow the deployment guide to go live.

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
