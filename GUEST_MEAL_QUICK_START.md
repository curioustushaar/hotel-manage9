# 🍽️ Guest Meal Service - Quick Start Guide

## 🎯 What Is This?

A complete table-based food ordering system for hotel dining areas and standalone restaurant tables. Guests order from tables, staff manages billing with multiple payment options.

---

## ⚡ Quick Start (5 Minutes)

### 1. Initialize Tables (Run Once)
```bash
cd backend
node scripts/initializeTables.js
```

### 2. Start Backend
```bash
cd backend
node server.js
# Runs on http://localhost:5000
```

### 3. Start Frontend
```bash
npm run dev
# Opens at http://localhost:5173
```

### 4. Access Feature
- Login to dashboard
- Click **"🛑 Guest Meal Service"** in sidebar
- See all 12 tables!

---

## 🎨 How It Works

### For Staff:

1. **View Tables** → See all tables with status, running total, and order duration
2. **Create Order** → Pick available table → enter guest info → add items from menu
3. **Add Items** → Browse 8 food categories → click "Add" → adjust quantities
4. **View Totals** → See subtotal + 5% tax = final amount
5. **Process Payment** → Select payment method → confirm → table resets

### For Customers:

- They sit at table with just a table number
- Staff enters order type (Direct Payment / Post to Room)
- Staff manages ordering through admin dashboard
- They pay when done

---

## 📊 Dashboard Features

**🔢 Statistics **
- Total Tables: Count all tables
- Available: Ready for orders
- Running: Orders in progress
- Billed: Pending payment confirmation

**🔍 Search & Filter**
- Search by table number
- Filter by Available/Running/Billed
- Auto-refresh every 3 seconds

**🎯 Table Status Colors**
- 🟢 Green = Available
- 🔵 Blue = Running (has active order)
- ⚪ Grey = Billed (awaiting payment)

---

## 💳 Payment Options

When billing an order, staff chooses:

- **💵 Cash Payment** - Customer pays with cash
- **💳 Card Payment** - Customer pays with card/UPI
- **📱 Online Payment** - Digital payment
- **🏨 Post to Room** - For hotel guests (added to room bill)

---

## 🔄 Order Flow

```
[Available Table]
      ↓ Click
[Enter Order Details Modal]
      ↓ Submit
[Food Menu Page]
      ↓ Add Items + Click Bill
[Payment Selection Modal]
      ↓ Confirm Payment
[Order Closes] → [Table Resets to Available]
```

---

## 📱 Access Points

| Page | URL | Purpose |
|------|-----|---------|
| Table Dashboard | `/admin/guests-meal-service` | View all tables, create orders |
| Order Management | `/admin/guest-meal/food-menu` | Add items, process payment |

---

## 🔧 Configuration

### Change Table Count
Edit `backend/scripts/initializeTables.js`:
```javascript
const numberOfTables = 12; // Change to desired number
```

### Change Tax Rate
Edit `src/pages/GuestMealService/GuestMealOrderPage.jsx`:
```javascript
const tax = subtotal * 0.05; // Change 0.05 to your rate
```

### Change Refresh Rate
Edit `src/pages/GuestMealService/GuestMealService.jsx`:
```javascript
const interval = setInterval(() => fetchTables(), 3000); // 3000ms
```

---

## 📊 Data Models

### Table
```
{
  tableNumber: 1-12,
  status: "Available|Running|Billed",
  capacity: 4,
  currentOrderId: ObjectId,
  runningOrderAmount: 0,
  orderStatus: "Active|Billed|Closed"
}
```

### GuestMealOrder
```
{
  tableId: ObjectId,
  tableNumber: 1,
  orderType: "Direct Payment|Post to Room",
  roomNumber: "101", // optional
  items: [{name, price, quantity}],
  subtotal: 1000,
  tax: 50,
  totalAmount: 1050,
  status: "Active|Billed|Closed",
  paymentMethod: "Cash|Card|Online|Room Billing"
}
```

---

## 🎬 Demo Scenario

### Scenario: A customer sits at Table 5

**Staff Actions:**
1. Dashboard shows Table 5 as Available (🟢)
2. Staff clicks Table 5
3. Modal appears - enters:
   - Order Type: "Direct Payment"
   - Guest Name: "John Doe" (optional)
   - Number of Guests: 2
4. Clicks "Create Order & Go to Menu"
5. Food menu page loads
6. Staff adds items:
   - Paneer Tikka (1) = ₹280
   - Butter Naan (2) = ₹120
   - Lassi (2) = ₹180
   - **Subtotal: ₹580**
   - **Tax (5%): ₹29**
   - **Total: ₹609**
7. Staff clicks "Process Billing"
8. Selects "Cash Payment"
9. Confirms payment
10. Customer pays ₹609
11. Order closes, Table 5 resets to Available (🟢)

**Time to complete: ~2 minutes**

---

## 🚀 API Quick Reference

```bash
# Get all tables
curl http://localhost:5000/api/guest-meal/tables

# Get table stats
curl http://localhost:5000/api/guest-meal/analytics/dashboard

# Create order
curl -X POST http://localhost:5000/api/guest-meal/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "tableId": "64a...",
    "tableNumber": 1,
    "orderType": "Direct Payment",
    "numberOfGuests": 2
  }'

# Bill order
curl -X POST http://localhost:5000/api/guest-meal/orders/64a.../bill \
  -H "Content-Type: application/json" \
  -d '{ "paymentMethod": "Cash" }'

# Get revenue report
curl "http://localhost:5000/api/guest-meal/analytics/revenue?startDate=2024-01-01&endDate=2024-01-31"
```

---

## ✅ Checklist

- [ ] Run `node backend/scripts/initializeTables.js`
- [ ] Start backend server
- [ ] Start frontend server
- [ ] Login to dashboard
- [ ] See "Guest Meal Service" menu item
- [ ] Click it to see 12 tables
- [ ] Click an available table
- [ ] Create an order
- [ ] Add a few items
- [ ] Process payment
- [ ] See table reset to available

---

## 🎓 Key Features

✨ **Real-time Updates** - Tables refresh every 3 seconds
✨ **Multiple Payment Methods** - Cash, Card, Online, Room Billing
✨ **Live Totals** - Automatic calculation with tax
✨ **Order History** - All orders stored in database
✨ **Revenue Analytics** - Track income by payment method
✨ **Responsive Design** - Works on desktop, tablet, mobile
✨ **No App Required** - Works through web browser

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| Tables not showing | Run initialization script |
| Orders not saving | Check MongoDB connection |
| Payment fails | Ensure all items have prices |
| Table not resetting | Refresh page manually |
| API errors | Check backend console for details |

---

## 📞 Need Help?

See **GUEST_MEAL_SERVICE_GUIDE.md** for detailed documentation.

---

**Ready to serve! 🍽️**
