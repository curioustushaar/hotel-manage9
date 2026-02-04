# Bareena Atithi - Backend API

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/bareena-atithi
PORT=5000
NODE_ENV=development
```

### 3. Install and Start MongoDB
Make sure MongoDB is installed and running on your system.

**Windows:**
```bash
# Install MongoDB Community Edition
# Download from: https://www.mongodb.com/try/download/community

# Start MongoDB
mongod
```

**Linux/Mac:**
```bash
# Install MongoDB
sudo apt-get install mongodb  # Ubuntu/Debian
brew install mongodb-community  # Mac

# Start MongoDB
sudo service mongodb start  # Linux
brew services start mongodb-community  # Mac
```

### 4. Start the Backend Server
```bash
npm run dev
```

The server will start on http://localhost:5000

## API Endpoints

### Get All Menu Items
```
GET /api/menu/list
Query params: ?category=Cake&search=paneer
```

### Get Single Menu Item
```
GET /api/menu/:id
```

### Add New Menu Item
```
POST /api/menu/add
Body: {
  "itemName": "Paneer Butter Masala",
  "category": "chicken",
  "price": 250,
  "description": "Delicious paneer curry",
  "status": "Active"
}
```

### Update Menu Item
```
PUT /api/menu/update/:id
Body: {
  "itemName": "Updated Name",
  "price": 300
}
```

### Delete Menu Item
```
DELETE /api/menu/delete/:id
```

### Toggle Status
```
PATCH /api/menu/toggle-status/:id
```

## Testing the API

You can test the API using:
- Postman
- Thunder Client (VS Code Extension)
- cURL commands
- Or directly from the React frontend

### Example cURL Commands:

**Get all items:**
```bash
curl http://localhost:5000/api/menu/list
```

**Add item:**
```bash
curl -X POST http://localhost:5000/api/menu/add \
  -H "Content-Type: application/json" \
  -d '{
    "itemName": "Paneer Tikka",
    "category": "Starters",
    "price": 180,
    "description": "Grilled paneer cubes"
  }'
```

**Update item:**
```bash
curl -X PUT http://localhost:5000/api/menu/update/ITEM_ID \
  -H "Content-Type: application/json" \
  -d '{"price": 200}'
```

**Delete item:**
```bash
curl -X DELETE http://localhost:5000/api/menu/delete/ITEM_ID
```
