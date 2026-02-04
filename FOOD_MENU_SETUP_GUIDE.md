# Bareena Atithi - Food Menu Management Module

## Complete Setup Guide

This guide will help you set up the fully functional Food Menu management module with MongoDB backend and React frontend.

---

## 📁 Project Structure

```
bareena-atithi/
├── backend/
│   ├── models/
│   │   └── menuModel.js
│   ├── controllers/
│   │   └── menuController.js
│   ├── routes/
│   │   └── menuRoutes.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── src/
│   ├── pages/
│   │   └── FoodMenu/
│   │       ├── FoodMenu.jsx
│   │       └── FoodMenu.css
│   └── App.jsx
```

---

## 🚀 Installation Steps

### Step 1: Install MongoDB

**Windows:**
1. Download MongoDB Community Edition: https://www.mongodb.com/try/download/community
2. Run the installer
3. Add MongoDB to your PATH
4. Start MongoDB:
   ```powershell
   mongod
   ```

**Check MongoDB is running:**
```powershell
mongo --version
```

### Step 2: Setup Backend

1. Navigate to backend directory:
   ```powershell
   cd "c:\bareena athithi\backend"
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Create `.env` file in backend directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/bareena-atithi
   PORT=5000
   NODE_ENV=development
   ```

4. Start the backend server:
   ```powershell
   npm run dev
   ```

   You should see:
   ```
   Server running on port 5000
   MongoDB Connected: localhost
   ```

### Step 3: Setup Frontend

The frontend is already integrated with your existing React app.

1. Make sure you're in the root directory:
   ```powershell
   cd "c:\bareena athithi"
   ```

2. Start the React development server (if not already running):
   ```powershell
   npm run dev
   ```

---

## 🎯 Features Implemented

### ✅ Frontend Features
- **Add Item Form**: Toggle form view with "+ Add Item" button
- **Items Table**: Display all menu items with full details
- **Search**: Real-time search by item name
- **Filter**: Filter items by category
- **Edit**: Inline edit functionality with modal
- **Delete**: Delete items with confirmation
- **Status Toggle**: Switch between Active/Inactive
- **Pagination**: Navigate through items (7 per page)
- **Responsive Design**: Works on all screen sizes

### ✅ Backend Features
- **MongoDB Database**: Persistent data storage
- **RESTful API**: Complete CRUD operations
- **Validation**: Input validation and error handling
- **Search & Filter**: Server-side search and filtering
- **Status Management**: Active/Inactive status toggle

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/menu/list` | Get all menu items |
| GET | `/api/menu/:id` | Get single item |
| POST | `/api/menu/add` | Add new item |
| PUT | `/api/menu/update/:id` | Update item |
| DELETE | `/api/menu/delete/:id` | Delete item |
| PATCH | `/api/menu/toggle-status/:id` | Toggle status |

---

## 🎨 UI Components

### 1. Main Food Menu Page
- Red and white theme matching the reference image
- Top header with search, notifications, and profile
- Action buttons: "+ Add Item" and "Show Menu"

### 2. Add Item Form
- Item Name (required)
- Category dropdown (required)
- Price (required)
- Description (optional)
- Automatically hidden/shown

### 3. Items Table
- Displays: #, Item Name, Category, Description, Price, Status
- Actions: Edit, Link, Copy, Toggle Status, Delete
- Pagination at bottom

### 4. Edit Modal
- Pop-up modal for editing items
- Same fields as add form
- Save/Cancel buttons

---

## 🧪 Testing the Application

### 1. Start Both Servers

**Terminal 1 - Backend:**
```powershell
cd "c:\bareena athithi\backend"
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd "c:\bareena athithi"
npm run dev
```

### 2. Access the Food Menu Page

Navigate to: `http://localhost:5173/admin/food-menu`

### 3. Test Features

1. **Add Item**:
   - Click "+ Add Item"
   - Fill in the form
   - Click "Add Item"
   - Item should appear in table immediately

2. **Search**:
   - Type in the search box
   - Table filters in real-time

3. **Filter by Category**:
   - Select a category from dropdown
   - Table shows only items from that category

4. **Edit Item**:
   - Click the edit (pencil) icon
   - Modify details in modal
   - Click "Save Changes"

5. **Toggle Status**:
   - Click the toggle (refresh) icon
   - Status switches between Active/Inactive

6. **Delete Item**:
   - Click the delete (trash) icon
   - Confirm deletion
   - Item removed from table

---

## 📊 Sample Data

You can test with these sample items:

```json
{
  "itemName": "Paneer Butter Masala",
  "category": "chicken",
  "price": 250,
  "description": "Creamy paneer curry",
  "status": "Active"
}
```

```json
{
  "itemName": "Chocolate Cake",
  "category": "Cake",
  "price": 120,
  "description": "Rich chocolate dessert",
  "status": "Active"
}
```

To import sample data automatically:
```powershell
cd "c:\bareena athithi\backend"
npm run import
```

---

## 🔧 Troubleshooting

### Problem: Cannot connect to MongoDB
**Solution:**
```powershell
# Start MongoDB service
mongod

# Or if using Windows Service:
net start MongoDB
```

### Problem: Port 5000 already in use
**Solution:**
Change the PORT in `.env` file:
```env
PORT=5001
```

Then update the API URL in `FoodMenu.jsx`:
```javascript
const response = await fetch('http://localhost:5001/api/menu/list');
```

### Problem: CORS errors
**Solution:**
Backend already has CORS enabled. If issues persist, restart both servers.

### Problem: Items not appearing after adding
**Solution:**
1. Check browser console for errors
2. Verify backend is running on port 5000
3. Check MongoDB connection

---

## 🎉 Success Indicators

You'll know everything is working when:

1. ✅ Backend logs show "MongoDB Connected"
2. ✅ Frontend loads without errors
3. ✅ Can navigate to `/admin/food-menu`
4. ✅ Can add items and see them immediately
5. ✅ All CRUD operations work
6. ✅ Search and filter function properly
7. ✅ UI matches the reference image

---

## 📝 Categories Available

- Cake
- chicken
- nithai
- milk
- veg
- Beverages
- Desserts
- Starters

You can modify these in:
- Backend: `backend/models/menuModel.js`
- Frontend: `src/pages/FoodMenu/FoodMenu.jsx`

---

## 🔐 Database Information

- **Database Name**: bareena-atithi
- **Collection Name**: menuitems
- **Connection String**: mongodb://localhost:27017/bareena-atithi

---

## 📱 Navigation

Access the Food Menu from:
- Direct URL: `http://localhost:5173/admin/food-menu`
- Or from Admin Dashboard sidebar

---

## 🎨 Styling

The module uses custom CSS that matches your reference image:
- Red (#ef4444) primary color
- White backgrounds
- Soft shadows and rounded corners
- Responsive grid layout
- Professional table design

---

## 🚦 Next Steps

1. **Start MongoDB** (if not running)
2. **Start Backend Server** (`cd backend && npm run dev`)
3. **Start Frontend** (`npm run dev`)
4. **Navigate to** `/admin/food-menu`
5. **Start adding menu items!**

---

## 📞 Support

If you encounter any issues:
1. Check that MongoDB is running
2. Verify both servers are running
3. Check browser console for errors
4. Check backend terminal for errors
5. Ensure all dependencies are installed

---

## ✨ Features at a Glance

- ✅ Real-time updates
- ✅ Full CRUD operations
- ✅ Search functionality
- ✅ Category filtering
- ✅ Status management
- ✅ Pagination
- ✅ Responsive design
- ✅ Professional UI/UX
- ✅ MongoDB integration
- ✅ RESTful API
- ✅ Error handling
- ✅ Form validation

**🎊 Your Food Menu Management System is ready to use!**
