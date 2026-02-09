# MongoDB Atlas Setup Fix

## Problem
Backend cannot connect to MongoDB Atlas database.

## Solutions (Try in order)

### Solution 1: Whitelist Your IP Address in MongoDB Atlas

1. Go to https://cloud.mongodb.com
2. Login with credentials
3. Click on "Network Access" (left sidebar)
4. Click "Add IP Address"
5. Click "Allow Access from Anywhere" (0.0.0.0/0)
   - OR add your current IP address
6. Click "Confirm"
7. Wait 2-3 minutes for changes to apply

### Solution 2: Check MongoDB Credentials

1. Go to MongoDB Atlas Dashboard
2. Click "Database Access" (left sidebar)
3. Verify user `arshuarshad1551_db_user` exists
4. If password forgotten:
   - Click "Edit" on the user
   - Click "Edit Password"
   - Generate new password
   - Update `.env` file with new password

### Solution 3: Use Local MongoDB (Temporary)

If MongoDB Atlas is not working, use local MongoDB:

```bash
# Install MongoDB locally (if not installed)
# Download from: https://www.mongodb.com/try/download/community

# Update backend/.env
MONGODB_URI=mongodb://localhost:27017/bareena-atithi
```

### Solution 4: Test Connection

```bash
cd backend
node testConnection.js
```

## Current MongoDB URI (from .env)
```
mongodb+srv://arshuarshad1551_db_user:ovZzCTo1yulCjoNW@cluster0.cppyive.mongodb.net/bareena-atithi?appName=Cluster0
```

## After Fixing

1. Restart backend server:
   ```bash
   cd backend
   npm start
   ```

2. Test API:
   ```bash
   # In browser, open:
   http://localhost:5000/api/rooms/list
   ```

3. Should see:
   ```json
   {
     "success": true,
     "count": 0,
     "data": []
   }
   ```
