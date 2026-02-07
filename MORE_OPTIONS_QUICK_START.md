# 🎯 MORE OPTIONS - QUICK START GUIDE

## 🚀 SYSTEM STATUS

✅ **Backend:** Running on port 5000 (restarted with new endpoints)  
✅ **Frontend:** Running on port 5173  
✅ **Database:** MongoDB connected  
✅ **All Components:** Created and integrated

---

## 📱 HOW TO USE

### Step 1: Access Bookings Page

Navigate to your Bookings page where you see the list of all reservations.

### Step 2: Find the "More Options" Button

On each booking row, you'll see an **⋯** button (three dots) next to the View and Delete buttons.

### Step 3: Click to Open Menu

Click the **⋯** button to open a dropdown menu with 9 actions:

- ✓ Check-In
- 💳 Add Payment
- 📅 Amend Stay
- 🚪 Room Move
- 🔄 Exchange Room
- 👤 Add/Show Visitor
- ❌ No-Show
- 🗑️ Void Reservation
- ⚠️ Cancel Reservation

### Step 4: Select an Action

Click on any action that's enabled (disabled actions are grayed out based on booking status).

### Step 5: Fill the Form

A drawer will slide in from the right side with the form for your selected action.

- All required fields are marked with \*
- Forms have helpful validation messages
- Some fields are pre-filled with current booking data

### Step 6: Submit

Click the colored button at the bottom to submit:

- **Red buttons:** Primary actions, Cancel, Void
- **Green buttons:** Check-in, Add Visitor
- **Blue buttons:** Payments, Room operations

### Step 7: Instant Update

The booking list will automatically refresh with the updated data!

---

## 🎨 UI HIGHLIGHTS

### Dropdown Menu

- Appears **above** the navbar (z-index: 99999)
- Smooth fade-in animation
- Hover effects on menu items
- Disabled items are grayed out

### Drawer

- Slides from **right side**
- Same height as your screen
- Scrollable content area
- Red and white gradient theme
- Close button or click backdrop to dismiss

### Forms

- Clean, professional layout
- Real-time validation
- Helpful error messages
- Before/after summaries where applicable
- Loading states during submission

---

## 🔐 ACTION PERMISSIONS

### Status-Based Restrictions

| Action        | Allowed Status                     |
| ------------- | ---------------------------------- |
| Check-In      | Upcoming                           |
| Add Payment   | Any (except Cancelled/Voided)      |
| Amend Stay    | Upcoming, Checked-in               |
| Room Move     | Checked-in only                    |
| Exchange Room | Checked-in only                    |
| Add Visitor   | Checked-in only                    |
| No-Show       | Upcoming only                      |
| Void          | Any (Admin password required)      |
| Cancel        | Upcoming only (not after check-in) |

---

## 💡 PRO TIPS

1. **Check-In Flow:**
   - Use "Check-In" action when guest arrives
   - Fill ID proof, guest count, vehicle number
   - Optional: Add security deposit
   - Room status automatically becomes "Occupied"

2. **Payments:**
   - Add payment anytime during stay
   - For Card/UPI/Bank, reference ID is mandatory
   - Balance updates instantly

3. **Room Changes:**
   - **Room Move:** Guest moves to different room (only available rooms shown)
   - **Room Exchange:** Swap rooms between two checked-in guests

4. **Visitors:**
   - Track all visitors for security
   - View past visitors list
   - In/Out time tracking

5. **Cancellations:**
   - **Cancel:** Before check-in, with refund options
   - **No-Show:** Guest didn't arrive
   - **Void:** Admin only, permanent deletion

---

## 🐛 TROUBLESHOOTING

### Dropdown not appearing?

✅ **Fixed!** z-index is set to 99999, should appear above everything.

### Form not submitting?

- Check for required fields (marked with \*)
- Ensure valid data (mobile numbers, amounts, etc.)
- Check console for error messages

### Data not updating?

- Backend server must be running (port 5000)
- MongoDB must be connected
- Check network tab in browser DevTools

### Drawer not closing?

- Click the ✕ button in header
- Click outside the drawer (on backdrop)
- Press ESC key (if implemented)

---

## 📊 DATABASE CHANGES

Every action automatically updates:

1. **Booking Status** - Changes based on action
2. **Room Status** - Updates to Available/Occupied/Booked
3. **Transactions** - Payments and charges logged
4. **Audit Trail** - Complete history of all actions
5. **Visitors** - Guest visitor log maintained

---

## 🎊 YOU'RE ALL SET!

The More Options system is fully functional and ready to use. Just click the **⋯** button on any booking to get started!

---

## 📞 NEED HELP?

Check the browser console (F12) for detailed error messages if something doesn't work as expected.
