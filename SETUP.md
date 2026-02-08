# 📋 Setup Guide - Hotel Management System

Complete step-by-step setup instructions for developers.

---

## ✅ Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Node.js** v16+  
  Download: https://nodejs.org/
  
- [ ] **npm** or **yarn**  
  Usually comes with Node.js
  
- [ ] **MongoDB Account**  
  Sign up: https://www.mongodb.com/cloud/atlas (Free tier available)
  
- [ ] **Git** installed  
  Download: https://git-scm.com/
  
- [ ] **Code Editor** (VS Code recommended)  
  Download: https://code.visualstudio.com/

---

## 🔧 Development Environment Setup

### Step 1: Verify Node.js Installation

```bash
# Check Node version
node --version
# Should show v16.0.0 or higher

# Check npm version
npm --version
# Should show 7.0.0 or higher
```

### Step 2: Clone Repository

```bash
# Clone the repository
git clone https://github.com/curioustushaar/Hotel-Management.git

# Navigate to project
cd Hotel-Management
```

### Step 3: MongoDB Setup

#### Create MongoDB Atlas Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free account
3. Create new cluster (Free tier)
4. Create database user:
   - Username: `hotel_admin`
   - Password: Generate strong password
5. Whitelist your IP address (or 0.0.0.0 for development)
6. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/database`

### Step 4: Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env file with your values
# (Use nano, vim, or your editor)
nano .env
```

**Fill in `.env` with:**
```env
MONGODB_URI=mongodb+srv://hotel_admin:YOUR_PASSWORD@cluster0.mfempxz.mongodb.net/hotel-db?appName=Cluster0
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Start backend server:**
```bash
npm start
# Backend runs on http://localhost:5000
```

### Step 5: Frontend Setup

**In new terminal, from root directory:**

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local
nano .env.local
```

**Fill in `.env.local` with:**
```env
VITE_API_URL=http://localhost:5000
```

**Start frontend:**
```bash
npm run dev
# Frontend runs on http://localhost:5173
```

### Step 6: Access Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api

---

## 🚀 First Run Checklist

- [ ] Backend server starts without errors (http://localhost:5000)
- [ ] Frontend loads in browser (http://localhost:5173)
- [ ] No red errors in browser console
- [ ] API calls return data
- [ ] Can login to dashboard
- [ ] Room list displays
- [ ] Menu items load

---

## 🐛 Troubleshooting

### "Cannot find module" errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### MongoDB Connection Error

1. Check MongoDB URI in `.env`
2. Verify username and password
3. Check IP whitelist in MongoDB Atlas (allow 0.0.0.0)
4. Ensure network connection

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Or change port in .env
PORT=5001
```

### CORS Errors

1. Check `FRONTEND_URL` in backend `.env`
2. Should match exact URL: `http://localhost:5173`
3. Restart backend after change

### Blank Page / No Data

1. Open browser console (F12)
2. Check for errors
3. Verify `VITE_API_URL` in frontend `.env.local`
4. Check backend is running

---

## 📦 Building for Production

### Build Frontend

```bash
npm run build
# Creates optimized build in 'dist/' folder
```

### Build & Test Locally

```bash
# Preview production build
npm run preview
```

---

## 🌐 Deployment Preparation

### Before Deploying

1. **Update environment variables:**
   - Backend MongoDB URI (production)
   - Frontend API URL (production backend URL)
   - Set NODE_ENV=production

2. **Test production build locally:**
   ```bash
   npm run build
   npm run preview
   ```

3. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "chore: prepare for production deployment"
   git push origin main
   ```

### Deploy to Vercel

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed steps.

---

## 💡 Development Tips

### VS Code Extensions Recommended

- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- Thunder Client - API testing (alternative to Postman)
- MongoDB for VS Code
- Git Graph

### Useful Commands

```bash
# Format code
npm run format

# Check for linting errors
npm run lint

# Run tests (if available)
npm test

# Clean build
npm run clean
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/YourFeature

# Commit changes
git commit -m "feat: add YourFeature"

# Push to GitHub
git push origin feature/YourFeature

# Create Pull Request on GitHub
```

---

## 📚 Documentation Files

- **README.md** - Project overview
- **SETUP.md** - This file
- **DEPLOYMENT.md** - Production deployment guide
- **API.md** - API documentation

---

## ❓ Need Help?

- Check [GitHub Issues](https://github.com/curioustushaar/Hotel-Management/issues)
- Review code comments
- Check browser console for errors
- Email: support@example.com

---

**Last Updated:** February 8, 2026  
**Version:** 1.0.0
