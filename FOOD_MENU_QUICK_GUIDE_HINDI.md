# Food Menu Integration - Quick Guide (Hindi)

## Kya Naya Hai?

Ab aap **Food Code** bhi add kar sakte hain aur POS mein search kar sakte hain!

### Solution

1. **Food Code:** Har item ka ek unique code (e.g., 101, A1, B2) set karein.
2. **Category:** Pehle jaisa hi category select karein.
3. **Food Search:** POS mein Name ya Code se search karein.

## Kaise Use Karein?

### Step 1: Item Add/Edit Karo (Food Menu Management)

1. Food Menu page par jao
2. "Add Item" click karo
3. Form fill karo:
   - **Item Name:** "Butter Chicken"
   - **Food Code:** "101" (Naya field!)
   - **Category:** "Main Course"
   - **Price:** 420
4. "Add Item" click karo

### Step 2: Item Dekho (Room Service POS)

1. Room Service POS open karo
2. Item card ke top-left corner mein code dikhega: **#101**

### Step 3: Search Kaise Karein?

POS mein upar 2 search boxes hain:

1. **Name Search:**
   - Left wala box: "Search items by name or code"
   - Isme "Butt" likho -> Butter Chicken aayega

2. **Code Search:**
   - Right wala box: "Short Code (F2) / Category"
   - Isme "101" likho -> Butter Chicken aayega

## Important Points

✅ **Food Code:** Har item ka code unique hona chahiye
✅ **Search:** Search box mein type karte hi items filter ho jayenge (category selection ignore hoga agar search used hai)
✅ **Active Status:** Sirf Active items hi show honge

## Example

### Food Menu mein add karo:
```
Item Name: Veg Burger
Food Code: V01
Category: Starters
Price: 150
```

### Room Service POS mein search karo:
- Right box mein "V01" likho -> Veg Burger dikhai dega
- Left box mein "Burger" likho -> Veg Burger dikhai dega

---

**Files Changed (Backend & Frontend):**
- `backend/models/menuModel.js` (Added foodCode)
- `backend/controllers/menuController.js` (Updated logic)
- `src/pages/FoodMenu/FoodMenu.jsx` (Added Code input)
- `src/components/FoodOrderPage.jsx` (Added Code display & Search)
