# 🚀 Food Menu Module - Quick Reference

## ⚡ Quick Start (3 Steps)

### 1️⃣ Start MongoDB
```powershell
mongod
```

### 2️⃣ Start Backend (New Terminal)
```powershell
cd "c:\bareena athithi\backend"
npm install
npm run dev
```

### 3️⃣ Start Frontend (New Terminal)
```powershell
cd "c:\bareena athithi"
npm run dev
```

**→ Open:** http://localhost:5173/admin/food-menu

---

## 📁 Files Created

| File | Location | Purpose |
|------|----------|---------|
| FoodMenu.jsx | `src/pages/FoodMenu/` | Main component |
| FoodMenu.css | `src/pages/FoodMenu/` | Styling |
| menuModel.js | `backend/models/` | MongoDB schema |
| menuController.js | `backend/controllers/` | Business logic |
| menuRoutes.js | `backend/routes/` | API routes |
| server.js | `backend/` | Express server |
| package.json | `backend/` | Dependencies |

---

## 🔗 API Endpoints Cheat Sheet

| Action | Method | Endpoint |
|--------|--------|----------|
| List all | `GET` | `/api/menu/list` |
| Get one | `GET` | `/api/menu/:id` |
| Add new | `POST` | `/api/menu/add` |
| Update | `PUT` | `/api/menu/update/:id` |
| Delete | `DELETE` | `/api/menu/delete/:id` |
| Toggle | `PATCH` | `/api/menu/toggle-status/:id` |

---

## 🎨 Key Features

✅ Add items with form  
✅ View items in table  
✅ Search by name  
✅ Filter by category  
✅ Edit items (modal)  
✅ Delete items  
✅ Toggle Active/Inactive  
✅ Pagination (7/page)  
✅ Real-time updates  
✅ Responsive design  

---

## 🎯 Categories

- Cake
- chicken
- nithai
- milk
- veg
- Beverages
- Desserts
- Starters

---

## 💾 Sample Data Import

```powershell
cd "c:\bareena athithi\backend"
npm run import
```

This adds 15 sample menu items for testing.

---

## 🎨 Color Codes

| Element | Color |
|---------|-------|
| Primary | `#ef4444` (Red) |
| Hover | `#dc2626` (Dark Red) |
| Background | `#fef2f2` (Light Red) |
| Active Status | `#d1fae5` (Green) |
| Inactive Status | `#fee2e2` (Light Red) |

---

## 🔍 Search & Filter

**Search**: Type in top-right search box → filters by item name  
**Filter**: Use "Filter by Category" dropdown → shows only that category  
**Reset**: Clear search or select "All Categories"

---

## ⚙️ Configuration

### Change Port
**Backend** → Edit `backend/.env`:
```env
PORT=5001
```

**Frontend API** → Edit `FoodMenu.jsx` line 19:
```javascript
fetch('http://localhost:5001/api/menu/list')
```

### Change Items Per Page
**Edit** `FoodMenu.jsx` line 10:
```javascript
const itemsPerPage = 10; // Change from 7 to 10
```

### Add Categories
**Edit** `menuModel.js` line 12 and `FoodMenu.jsx` line 14:
```javascript
['Cake', 'chicken', 'YourNewCategory']
```

---

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| MongoDB not connecting | Run `mongod` in terminal |
| Port 5000 in use | Change PORT in `.env` |
| Items not appearing | Check MongoDB running, check console errors |
| CORS errors | Restart both servers |
| Form not submitting | Check required fields filled |

---

## 📊 Testing Checklist

- [ ] Can add item
- [ ] Item appears in table
- [ ] Can search items
- [ ] Can filter by category
- [ ] Can edit item
- [ ] Can delete item
- [ ] Can toggle status
- [ ] Pagination works
- [ ] Mobile responsive

---

## 🎯 User Actions

| Action | Steps |
|--------|-------|
| **Add** | Click "+ Add Item" → Fill form → Submit |
| **Edit** | Click ✏️ → Modify in modal → Save |
| **Delete** | Click 🗑️ → Confirm |
| **Toggle Status** | Click 🔄 → Status changes |
| **Search** | Type in search box → Auto filters |
| **Filter** | Select category dropdown → Shows filtered |

---

## 📞 Quick Help

**Can't connect to MongoDB?**
```powershell
# Install MongoDB: https://www.mongodb.com/try/download/community
# Start MongoDB:
mongod
```

**Backend won't start?**
```powershell
cd backend
npm install
npm run dev
```

**Frontend won't start?**
```powershell
cd "c:\bareena athithi"
npm install
npm run dev
```

**Need sample data?**
```powershell
cd backend
npm run import
```

---

## 🎊 Success Indicators

When everything works:
- ✅ Backend shows "MongoDB Connected"
- ✅ Frontend loads without errors
- ✅ Can access `/admin/food-menu`
- ✅ Can add/edit/delete items
- ✅ Search works
- ✅ Filter works
- ✅ No console errors

---

## 📚 Documentation

- Full Guide: `FOOD_MENU_SETUP_GUIDE.md`
- Summary: `FOOD_MENU_SUMMARY.md`
- Visual Guide: `FOOD_MENU_VISUAL_GUIDE.md`
- Backend: `backend/README.md`

---

## 🎉 You're Ready!

1. Start MongoDB
2. Start Backend
3. Start Frontend
4. Navigate to `/admin/food-menu`
5. Start managing your menu!

**Need help?** Check the full guides in the project root.

---

*Bareena Atithi - Food Menu Management v1.0*
