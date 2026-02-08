# Backend Environment Variables Setup

## 🔧 Vercel Dashboard mein Backend ke liye Environment Variables

### Backend Project: https://bareena-athithi-veeb.vercel.app/

**Steps:**

1. Vercel Dashboard → Backend Project (`bareena-athithi-veeb`)
2. Settings → Environment Variables
3. Add these variables:

---

### Required Environment Variables:

```
MONGODB_URI
mongodb+srv://majar_123:majar_123@cluster0.mfempxz.mongodb.net/bareena-atithi?appName=Cluster0

NODE_ENV
production

FRONTEND_URL
https://bareena-athithi-bf1o.vercel.app

PORT
5000
```

---

## ✅ How to Add:

For each variable:

1. **Key:** [Variable name from above]
2. **Value:** [Corresponding value]
3. **Environments:** Select **Production** ✅
4. Click **Save**

---

## 🔄 After Adding All Variables:

1. Go to **Deployments** tab
2. Find latest deployment
3. Click **⋯** (three dots)
4. Click **Redeploy**
5. Wait for deployment to complete

---

## ✅ Verification:

Visit: https://bareena-athithi-veeb.vercel.app/

Should show:

```json
{
  "message": "Bareena Atithi API - Food Menu Management",
  "version": "1.0.0"
}
```

---

## 📝 Summary:

- ✅ Backend URL: `https://bareena-athithi-veeb.vercel.app`
- ✅ Frontend URL: `https://bareena-athithi-bf1o.vercel.app`
- ✅ MongoDB: Connected
- ✅ CORS: Configured for frontend

All set! 🚀
