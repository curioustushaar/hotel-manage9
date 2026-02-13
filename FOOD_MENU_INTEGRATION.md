# Food Menu Integration - Room Service POS

## Overview
Yeh integration ensure karta hai ki jab aap **Food Menu Management** (Image 2) mein koi item add karte hain, woh automatically **Room Service POS** (Image 1) mein category ke according show hota hai.

## How It Works

### 1. Food Menu Management (Image 2)
**Location:** `src/pages/FoodMenu/FoodMenu.jsx`

Jab aap yahan se item add karte hain:
- Item Name: e.g., "Paneer Tikka"
- Category: e.g., "Starters" (dropdown se select karo)
- Price: e.g., ₹500
- Description: Optional

Yeh data **MongoDB database** mein save hota hai via API endpoint:
```
POST /api/menu/add
```

### 2. Database Storage
**Model:** `backend/models/menuModel.js`

Categories available:
- Starters
- Main Course
- Breakfast
- Rice
- Desserts
- Beverages
- Chinese
- Continental

### 3. Room Service POS (Image 1)
**Location:** `src/components/FoodOrderPage.jsx`

Jab aap Room Service POS open karte hain:

1. **Automatic Fetch:** Component automatically database se menu items fetch karta hai
   ```javascript
   GET /api/menu/list
   ```

2. **Category Filtering:** Left sidebar mein categories hain. Jab aap kisi category ko click karte hain (e.g., "Starters"), sirf wahi items show hote hain jo us category ke hain.

3. **Real-time Updates:** Agar aap Food Menu mein koi naya item add karte hain, toh bas Room Service POS ko refresh karo (ya close karke dobara open karo), naya item automatically show hoga.

## Step-by-Step Example

### Adding a New Item

1. **Food Menu Management** mein jao
2. "Add Item" button click karo
3. Fill the form:
   - Item Name: "Butter Chicken"
   - Category: "Main Course" (dropdown se select)
   - Price: 420
   - Description: "Creamy tomato-based chicken curry"
4. "Add Item" button click karo

### Viewing in Room Service POS

1. Room Service section mein jao
2. Kisi room ke liye "Add Service" button click karo
3. Left sidebar mein "Main Course" category select karo
4. Aapka naya item "Butter Chicken" wahan dikhai dega with price ₹420

## Important Notes

### Active/Inactive Status
- Sirf **Active** status wale items Room Service POS mein show hote hain
- Agar aap kisi item ko Inactive kar dete hain, woh POS se hide ho jayega

### Category Matching
- Food Menu aur Room Service POS dono mein **exact same categories** hain
- Category name exactly match hona chahiye (case-sensitive)
- Available categories:
  - Starters
  - Main Course
  - Breakfast
  - Rice
  - Desserts
  - Beverages
  - Chinese
  - Continental

### Price Display
- Prices automatically ₹ symbol ke saath show hote hain
- Price ko number format mein enter karo (e.g., 500, not "500")

## API Endpoints Used

### Get All Menu Items
```
GET /api/menu/list
Response: { success: true, data: [...items] }
```

### Add Menu Item
```
POST /api/menu/add
Body: { itemName, category, price, description, status }
Response: { success: true, data: {...newItem} }
```

### Update Menu Item
```
PUT /api/menu/update/:id
Body: { itemName, category, price, description, status }
Response: { success: true, data: {...updatedItem} }
```

### Delete Menu Item
```
DELETE /api/menu/delete/:id
Response: { success: true, message: "Item deleted" }
```

## Troubleshooting

### Item not showing in POS?
1. Check if item status is "Active"
2. Verify category name matches exactly
3. Refresh the Room Service POS page
4. Check browser console for any errors

### Category not matching?
- Make sure you're selecting the exact category from dropdown
- Category names are case-sensitive
- Use only the predefined categories

### Price not displaying correctly?
- Enter price as a number (e.g., 500)
- Don't include currency symbols in the input
- System automatically adds ₹ symbol

## Future Enhancements

Possible improvements:
1. Add "Quantity Available" field in Food Menu database
2. Real-time updates without page refresh (using WebSockets)
3. Image upload for food items
4. Custom categories management
5. Bulk import/export of menu items

## Files Modified

1. `src/components/FoodOrderPage.jsx` - Added API integration
2. `backend/controllers/menuController.js` - Already existed
3. `backend/routes/menuRoutes.js` - Already existed
4. `backend/models/menuModel.js` - Already existed

## Testing

To test the integration:

1. Start backend server:
   ```bash
   cd backend
   node server.js
   ```

2. Start frontend:
   ```bash
   npm run dev
   ```

3. Go to Food Menu Management
4. Add a test item in "Starters" category
5. Go to Room Service POS
6. Select "Starters" from left sidebar
7. Your item should appear!

---

**Created:** 2026-02-12
**Last Updated:** 2026-02-12
