# 🍽️ Guest Meal Service - API Documentation

**Base URL:** `http://localhost:5000/api/guest-meal`

---

## 📋 Table Endpoints

### GET /tables
Get all tables with current status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "ObjectId",
      "tableNumber": 1,
      "status": "Available",
      "capacity": 4,
      "runningOrderAmount": 0,
      "orderDuration": 0,
      "formattedDuration": "0s",
      "orderStartTime": null,
      "currentOrderId": null,
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z"
    }
  ],
  "count": 12
}
```

---

### GET /tables/:tableId
Get specific table details

**URL Parameters:**
- `tableId` (string) - MongoDB ObjectId of table

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "tableNumber": 1,
    "status": "Running",
    "capacity": 4,
    "runningOrderAmount": 1050,
    "orderDuration": 300,
    "formattedDuration": "5m 0s",
    "orderStartTime": "2024-01-01T10:10:00Z",
    "currentOrderId": "ObjectId"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Table not found"
}
```

---

### GET /tables/status/:status
Get tables filtered by status

**URL Parameters:**
- `status` (string) - "Available", "Running", or "Billed"

**Response:**
```json
{
  "success": true,
  "data": [
    { /* table objects */ }
  ],
  "count": 5
}
```

---

### POST /tables/initialize
Initialize default tables (one-time setup)

**Request Body:**
```json
{
  "numberOfTables": 12
}
```

**Response:**
```json
{
  "success": true,
  "message": "12 tables initialized successfully",
  "data": [
    { /* table objects */ }
  ]
}
```

**Error Response (if tables already exist):**
```json
{
  "success": false,
  "message": "Tables already initialized"
}
```

---

## 📦 Order Endpoints

### POST /orders/create
Create a new order for a table

**Request Body:**
```json
{
  "tableId": "ObjectId",
  "tableNumber": 1,
  "orderType": "Direct Payment",
  "roomNumber": null,
  "guestName": "John Doe",
  "numberOfGuests": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "_id": "ObjectId",
      "tableId": "ObjectId",
      "tableNumber": 1,
      "orderType": "Direct Payment",
      "items": [],
      "subtotal": 0,
      "tax": 0,
      "totalAmount": 0,
      "status": "Active",
      "paymentMethod": "Pending",
      "paymentStatus": "Pending",
      "createdAt": "2024-01-01T10:00:00Z"
    },
    "table": {
      "_id": "ObjectId",
      "tableNumber": 1,
      "status": "Running",
      "currentOrderId": "ObjectId"
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Table is not available for new orders"
}
```

---

### GET /orders/:orderId
Get order details

**URL Parameters:**
- `orderId` (string) - MongoDB ObjectId of order

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "tableId": "ObjectId",
    "tableNumber": 1,
    "orderType": "Direct Payment",
    "items": [
      {
        "id": 101,
        "name": "Paneer Tikka",
        "price": 280,
        "quantity": 1,
        "subtotal": 280
      }
    ],
    "subtotal": 280,
    "tax": 14,
    "totalAmount": 294,
    "finalAmount": 294,
    "status": "Active",
    "paymentMethod": "Pending",
    "paymentStatus": "Pending"
  }
}
```

---

### GET /orders/table/:tableId
Get active order for a table

**URL Parameters:**
- `tableId` (string) - MongoDB ObjectId of table

**Response:**
```json
{
  "success": true,
  "data": { /* order object */ }
}
```

**Error Response (if no active order):**
```json
{
  "success": false,
  "message": "No active order found for this table"
}
```

---

### PUT /orders/:orderId/items
Update order items (add/remove items)

**URL Parameters:**
- `orderId` (string) - MongoDB ObjectId of order

**Request Body:**
```json
{
  "items": [
    {
      "id": 101,
      "name": "Paneer Tikka",
      "price": 280,
      "quantity": 2,
      "category": 1,
      "image": "🧀",
      "subtotal": 560
    },
    {
      "id": 301,
      "name": "Butter Naan",
      "price": 60,
      "quantity": 1,
      "category": 3,
      "image": "🫓",
      "subtotal": 60
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order items updated successfully",
  "data": {
    "_id": "ObjectId",
    "items": [ /* updated items */ ],
    "subtotal": 620,
    "tax": 31,
    "totalAmount": 651,
    "finalAmount": 651
  }
}
```

---

### PUT /orders/:orderId/discount
Apply discount to order

**URL Parameters:**
- `orderId` (string) - MongoDB ObjectId of order

**Request Body:**
```json
{
  "discountAmount": 50
}
```

**Response:**
```json
{
  "success": true,
  "message": "Discount applied successfully",
  "data": {
    "_id": "ObjectId",
    "subtotal": 620,
    "tax": 31,
    "totalAmount": 651,
    "discountAmount": 50,
    "finalAmount": 601
  }
}
```

---

### POST /orders/:orderId/bill
Bill the order and process payment

**URL Parameters:**
- `orderId` (string) - MongoDB ObjectId of order

**Request Body:**
```json
{
  "paymentMethod": "Cash"
}
```

**Supported Payment Methods:**
- `Cash`
- `Card`
- `Online`
- `Room Billing`

**Response:**
```json
{
  "success": true,
  "message": "Order billed successfully",
  "data": {
    "_id": "ObjectId",
    "status": "Billed",
    "paymentMethod": "Cash",
    "paymentStatus": "Completed",
    "finalAmount": 601,
    "revenue": 601,
    "billedAt": "2024-01-01T10:15:00Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Order is not in active status"
}
```

---

### POST /orders/:orderId/close
Close order and reset table

**URL Parameters:**
- `orderId` (string) - MongoDB ObjectId of order

**Response:**
```json
{
  "success": true,
  "message": "Order closed and table reset successfully",
  "data": {
    "order": {
      "_id": "ObjectId",
      "status": "Closed",
      "closedAt": "2024-01-01T10:15:30Z"
    },
    "table": {
      "_id": "ObjectId",
      "tableNumber": 1,
      "status": "Available",
      "runningOrderAmount": 0,
      "orderStartTime": null
    }
  }
}
```

---

## 📊 Analytics Endpoints

### GET /analytics/dashboard
Get dashboard statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "tables": {
      "total": 12,
      "available": 8,
      "running": 2,
      "billed": 2
    },
    "revenue": {
      "total": 3500,
      "orders": 5,
      "average": 700
    }
  }
}
```

---

### GET /analytics/revenue
Get revenue report with optional date range

**Query Parameters:**
- `startDate` (string, optional) - YYYY-MM-DD format
- `endDate` (string, optional) - YYYY-MM-DD format

**Default:** Last 30 days

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 8950,
    "totalOrders": 12,
    "averageOrderValue": 745.83,
    "byPaymentMethod": {
      "Cash": {
        "count": 5,
        "amount": 3500
      },
      "Card": {
        "count": 4,
        "amount": 3200
      },
      "Online": {
        "count": 2,
        "amount": 1600
      },
      "Room Billing": {
        "count": 1,
        "amount": 650
      }
    },
    "orders": [
      { /* order objects */ }
    ]
  }
}
```

---

## 🔄 Response Codes

```
200 - Success
201 - Created
400 - Bad Request
404 - Not Found
409 - Conflict (e.g., table not available)
500 - Server Error
```

---

## 📝 Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

---

## 🔐 Authentication

Currently, no authentication is implemented. Add authentication middleware for production:

```javascript
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid token' });
    req.user = user;
    next();
  });
};

router.get('/tables', authenticateToken, guestMealController.getAllTables);
```

---

## 📤 Request/Response Examples

### Example: Complete Order Flow

**1. Create Order**
```bash
curl -X POST http://localhost:5000/api/guest-meal/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "tableId": "65a1b2c3d4e5f6g7h8i9j0",
    "tableNumber": 1,
    "orderType": "Direct Payment",
    "guestName": "John",
    "numberOfGuests": 2
  }'
```

**2. Update Items**
```bash
curl -X PUT http://localhost:5000/api/guest-meal/orders/65a1b2c3d4e5f6g7h8i9j1/items \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "id": 101, "name": "Paneer Tikka", "price": 280, "quantity": 1, "subtotal": 280 },
      { "id": 301, "name": "Butter Naan", "price": 60, "quantity": 2, "subtotal": 120 }
    ]
  }'
```

**3. Process Billing**
```bash
curl -X POST http://localhost:5000/api/guest-meal/orders/65a1b2c3d4e5f6g7h8i9j1/bill \
  -H "Content-Type: application/json" \
  -d '{ "paymentMethod": "Cash" }'
```

**4. Close Order**
```bash
curl -X POST http://localhost:5000/api/guest-meal/orders/65a1b2c3d4e5f6g7h8i9j1/close
```

---

## 🧪 Testing with Postman

1. Import this collection into Postman
2. Set variable `baseUrl` = `http://localhost:5000/api/guest-meal`
3. Run requests in order

**Environment Setup:**
```json
{
  "baseUrl": "http://localhost:5000/api/guest-meal",
  "tableId": "your_table_id_here",
  "orderId": "your_order_id_here"
}
```

---

## 📞 Support

For issues or questions, refer to the main documentation or check logs:

```bash
# Backend logs
npm run dev  # Shows server logs

# Browser console
F12 or Ctrl+Shift+I  # Frontend errors
```

---

**API Version:** 1.0.0
**Last Updated:** January 2024
