# ✅ Production Deployment Checklist

## Pre-Deployment

### Code Fixes Applied ✅

- [x] Fixed server.js to work with Vercel serverless functions
- [x] Added MongoDB connection caching for serverless
- [x] Updated CORS configuration to allow Vercel domains
- [x] Conditional app.listen() for local vs production

### Files Ready for Deployment

- [x] `backend/server.js` - Updated for serverless
- [x] `backend/vercel.json` - Configured properly
- [x] `vercel.json` (frontend) - Configured properly
- [x] `.env` files - Present (not committed to git)
- [x] `.gitignore` - Configured to exclude .env files

## Deployment Steps

### 1. Backend Deployment

- [ ] Create new Vercel project
- [ ] Select `backend` folder as root directory
- [ ] Add environment variables:
  - [ ] `MONGODB_URI`
  - [ ] `NODE_ENV=production`
  - [ ] `FRONTEND_URL` (placeholder for now)
- [ ] Deploy backend
- [ ] Copy backend URL (e.g., `https://xxx.vercel.app`)
- [ ] Test backend: Visit `https://xxx.vercel.app/` - should show API info

### 2. Frontend Deployment

- [ ] Update `.env.production` with backend URL
- [ ] Commit changes to git (excluding .env files)
- [ ] Create new Vercel project for frontend
- [ ] Select root directory (not backend folder)
- [ ] Add environment variable:
  - [ ] `VITE_API_URL=<your-backend-url>`
- [ ] Deploy frontend
- [ ] Copy frontend URL (e.g., `https://yyy.vercel.app`)

### 3. Update Backend CORS

- [ ] Go to backend project in Vercel
- [ ] Update `FRONTEND_URL` environment variable with actual frontend URL
- [ ] Redeploy backend (Vercel will auto-redeploy, or manually trigger)

### 4. Verification

- [ ] Visit frontend URL
- [ ] Check browser console - no CORS errors
- [ ] Test menu display
- [ ] Test booking creation
- [ ] Test room management
- [ ] Test QR code functionality

## Post-Deployment

### Monitor

- [ ] Check Vercel logs for any errors
- [ ] Monitor MongoDB Atlas for connections
- [ ] Test all features in production

### Optional Optimizations

- [ ] Set up custom domain (if available)
- [ ] Configure caching in Vercel
- [ ] Set up monitoring alerts
- [ ] Configure Vercel Analytics

## Troubleshooting

### If Backend Crashes

1. Check Vercel logs for errors
2. Verify MongoDB URI is correct
3. Ensure all required environment variables are set
4. Check if MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

### If Frontend Shows CORS Error

1. Verify `FRONTEND_URL` in backend environment variables
2. Make sure it matches exact frontend URL
3. Redeploy backend after changes

### If API Calls Fail

1. Check `VITE_API_URL` in frontend environment variables
2. Ensure backend URL is correct and includes `https://`
3. Verify backend is deployed and accessible
4. Test backend endpoints directly in browser

## Environment Variables Summary

### Backend Environment Variables (Vercel)

```env
MONGODB_URI=mongodb+srv://majar_123:majar_123@cluster0.mfempxz.mongodb.net/bareena-atithi?appName=Cluster0
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### Frontend Environment Variables (Vercel)

```env
VITE_API_URL=https://your-backend-url.vercel.app
```

## 🎉 Success Criteria

Your deployment is successful when:

- ✅ Frontend loads without errors
- ✅ No CORS errors in browser console
- ✅ Menu items display correctly
- ✅ Bookings can be created and viewed
- ✅ Room management works
- ✅ Backend API responds correctly

---

**Last Updated**: After fixing serverless function crashes
**Status**: Ready for Deployment 🚀
