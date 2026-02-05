# Add Booking Component - Testing Guide

## 🧪 Manual Testing Procedures

### Prerequisites
- Application running (frontend on http://localhost:5174)
- Admin dashboard accessible
- Sidebar navigation visible

---

## ✅ Test Case 1: Form Rendering

**Objective:** Verify the form displays correctly with all sections

**Steps:**
1. Navigate to Admin Dashboard
2. Click "Add Booking" (➕) in sidebar
3. Observe page loads

**Expected Results:**
- [ ] Page title "Add Booking" visible
- [ ] Subtitle "Create a new hotel booking reservation" visible
- [ ] 4 form cards visible (Guest Details, Room Details, Stay Details, Pricing Details)
- [ ] All form fields present and interactive
- [ ] Bottom action buttons visible (Cancel, Save & Check-in, Save Booking)
- [ ] Form has professional appearance
- [ ] No layout issues or overlaps

**Notes:**
- Check browser console for errors
- Verify no CSS issues (colors, fonts, spacing)

---

## ✅ Test Case 2: Required Field Indicators

**Objective:** Verify required fields are clearly marked

**Steps:**
1. Observe the form
2. Look for RED asterisks (*)

**Expected Results:**
- [ ] Guest Name has RED *
- [ ] Mobile Number has RED *
- [ ] Room Type has RED *
- [ ] Room Number has RED *
- [ ] Check-in Date has RED *
- [ ] Check-out Date has RED *
- [ ] Optional fields (Email, ID Proof) do NOT have asterisk
- [ ] Asterisks are RED color (#dc2626)

---

## ✅ Test Case 3: Guest Details Section

**Objective:** Verify guest detail fields accept input correctly

**Steps:**
1. Fill "Guest Name" with: "John Smith"
2. Fill "Mobile Number" with: "9876543210"
3. Fill "Email" with: "john@example.com"
4. Select "ID Proof Type": Choose "Passport"
5. Fill "ID Proof Number" with: "A12345678"

**Expected Results:**
- [ ] All fields accept text input
- [ ] Mobile number accepts 10 digits
- [ ] Email field accepts email format
- [ ] ID Proof Type dropdown opens and shows options:
  - Aadhaar
  - Passport
  - Driving License
  - PAN Card
- [ ] All values display correctly as typed
- [ ] No validation errors on optional fields

---

## ✅ Test Case 4: Room Type Selection

**Objective:** Verify room type dropdown works and affects room numbers

**Steps:**
1. Default: Room Type shows "Single"
2. Observe Room Number dropdown options (101-105)
3. Change Room Type to "Double"
4. Check Room Number options change to (201-204)
5. Change to "Deluxe"
6. Check Room Number options change to (301-303)
7. Change to "Suite"
8. Check Room Number options change to (401-402)

**Expected Results:**
- [ ] Room Type dropdown opens with 4 options
- [ ] Room numbers update correctly when type changes:
  - Single → 101, 102, 103, 104, 105
  - Double → 201, 202, 203, 204
  - Deluxe → 301, 302, 303
  - Suite → 401, 402
- [ ] Room Number field resets when room type changes
- [ ] Room Number shows placeholder "-- Select Room --"
- [ ] Room Number dropdown can be opened and items selected
- [ ] Selected room displays in the field

---

## ✅ Test Case 5: Number of Guests Input

**Objective:** Verify number of guests field accepts valid values

**Steps:**
1. Click "Number of Guests" field
2. Clear default value (1)
3. Enter: 2
4. Enter: 4
5. Try entering: 0 (should allow but is illogical)
6. Try entering: 6
7. Try entering: 7 (should allow on frontend)

**Expected Results:**
- [ ] Field accepts numeric input
- [ ] Values display correctly
- [ ] Field allows values 0-9+
- [ ] Default value is "1"
- [ ] Up/down arrow controls work (if browser supports)

---

## ✅ Test Case 6: Date Selection

**Objective:** Verify date pickers work and calculate nights correctly

**Steps:**
1. Click "Check-in Date" field
2. Select: 2026-02-15
3. Click "Check-out Date" field
4. Select: 2026-02-20
5. Observe "Number of Nights" field

**Expected Results:**
- [ ] Date picker opens when clicked
- [ ] Can select dates from calendar
- [ ] Check-in date displays: "2026-02-15"
- [ ] Check-out date displays: "2026-02-20"
- [ ] Number of Nights auto-calculates: 5
- [ ] If dates not entered, Number of Nights shows: 0
- [ ] Number of Nights field is disabled/read-only

**Date Calculation Test:**
1. Set Check-in: 2026-02-01
2. Set Check-out: 2026-02-08
3. Verify Number of Nights: 7

---

## ✅ Test Case 7: Price Calculations

**Objective:** Verify price updates based on room type and nights

**Test Data:**
```
Single Room: ₹1,500/night
Double Room: ₹2,500/night
Deluxe Room: ₹4,000/night
Suite Room: ₹6,000/night
```

**Steps:**
1. Select Room Type: "Single"
2. Check "Price per Night" shows: 1500
3. Set Check-in: 2026-02-15
4. Set Check-out: 2026-02-20 (5 nights)
5. Check "Total Amount" shows: 7500 (1500 × 5)
6. Change Room Type to "Double"
7. Check "Price per Night" updates: 2500
8. Check "Total Amount" updates: 12500 (2500 × 5)
9. Change Check-out to 2026-02-22 (7 nights)
10. Check "Total Amount" updates: 17500 (2500 × 7)

**Expected Results:**
- [ ] Price per Night updates when room type changes
- [ ] Price values are correct for each room type
- [ ] Total Amount calculates: pricePerNight × numberOfNights
- [ ] Total Amount updates immediately when dates change
- [ ] All price fields show ₹ currency symbol
- [ ] Price and Total Amount fields are read-only (disabled)
- [ ] Price fields have muted text color

---

## ✅ Test Case 8: Advance Payment Input

**Objective:** Verify advance payment field accepts optional input

**Steps:**
1. Scroll to "Pricing Details" section
2. Click "Advance Paid" field
3. Leave empty (test optional)
4. Enter: 5000
5. Enter: 0
6. Enter: 12500 (full amount)

**Expected Results:**
- [ ] Field accepts numeric input
- [ ] Field is optional (can be left empty)
- [ ] Values display correctly
- [ ] No validation errors for this field
- [ ] Field shows ₹ currency symbol

---

## ✅ Test Case 9: Validation on Save

**Objective:** Verify form validation prevents invalid submissions

**Test 1: Missing Required Fields**
1. Clear Guest Name field
2. Keep Mobile Number empty
3. Click "Save Booking"

**Expected Results:**
- [ ] Alert appears: "Please fill in all required fields"
- [ ] Form does not submit
- [ ] Data not logged to console
- [ ] User can see validation error

**Test 2: All Required Fields Filled**
1. Fill all required fields:
   - Guest Name: "John Smith"
   - Mobile Number: "9876543210"
   - Room Type: "Double"
   - Room Number: "202"
   - Check-in Date: "2026-02-15"
   - Check-out Date: "2026-02-20"
2. Click "Save Booking"

**Expected Results:**
- [ ] No validation alert
- [ ] Booking data logged to console
- [ ] Alert shows: "Booking saved successfully!"
- [ ] Console shows complete booking object:
  ```javascript
  {
    guestName: "John Smith",
    mobileNumber: "9876543210",
    // ... all fields included
    status: "Upcoming"
  }
  ```

---

## ✅ Test Case 10: Save & Check-in Button

**Objective:** Verify "Save & Check-in" creates booking with "Checked-in" status

**Steps:**
1. Fill all required fields
2. Click "Save & Check-in" button

**Expected Results:**
- [ ] Alert shows: "Booking saved and guest checked in!"
- [ ] Console shows booking object with:
  - status: "Checked-in" (NOT "Upcoming")
- [ ] All other data matches the form inputs
- [ ] Form does not reset (user can review/edit if needed)

---

## ✅ Test Case 11: Cancel Button

**Objective:** Verify cancel button resets form with confirmation

**Steps:**
1. Fill form with test data
2. Click "Cancel" button

**Expected Results:**
- [ ] Confirmation dialog appears: "Are you sure you want to cancel? All data will be lost."
3. Click "OK" on confirmation

**Expected Results (After OK):**
- [ ] All form fields reset to empty/default:
  - Guest Name: ""
  - Mobile Number: ""
  - Email: ""
  - ID Proof Type: "Aadhaar" (default)
  - ID Proof Number: ""
  - Room Type: "Single" (default)
  - Room Number: ""
  - Number of Guests: "1" (default)
  - Check-in Date: ""
  - Check-out Date: ""
  - Number of Nights: 0
  - Advance Paid: "0"

**Cancel Test - Click "Cancel" dialog:**
1. Click "Cancel" button
2. Click "Cancel" on confirmation dialog

**Expected Results:**
- [ ] Dialog closes
- [ ] Form data remains unchanged
- [ ] No fields are reset

---

## ✅ Test Case 12: Responsive Design - Mobile

**Objective:** Verify form layout works on mobile devices

**Setup:** Use browser DevTools to test (F12 → Toggle Device Toolbar)

**Test Width: 375px (iPhone SE)**

**Steps:**
1. Open form on mobile view
2. Scroll down and observe layout
3. Check button arrangement

**Expected Results:**
- [ ] Form displays in single column (not 2 columns)
- [ ] All fields are full width
- [ ] Text is readable (not cut off)
- [ ] Buttons stack vertically
- [ ] All form sections visible without horizontal scroll
- [ ] Padding/margins appropriate for mobile
- [ ] Buttons are touch-friendly size (40px+ height)
- [ ] Labels are visible above inputs
- [ ] No overlap or layout issues

**Test Width: 768px (Tablet)**
- [ ] Form displays correctly
- [ ] May show 2 columns (if space allows)
- [ ] All fields readable
- [ ] Buttons accessible

---

## ✅ Test Case 13: Keyboard Navigation

**Objective:** Verify form is fully keyboard accessible

**Steps:**
1. Press Tab key repeatedly
2. Observe focus moving through form elements

**Expected Results:**
- [ ] Focus ring visible on all interactive elements
- [ ] Focus moves in logical order: top to bottom
- [ ] All inputs and buttons are focusable
- [ ] Focus ring is visible (outline style)
- [ ] Can submit form by pressing Enter on focused button

**Specific Navigation Test:**
1. Tab through form in order:
   - Guest Name
   - Mobile Number
   - Email
   - ID Proof Type (select)
   - ID Proof Number
   - Room Type (select)
   - Room Number (select)
   - Number of Guests
   - Check-in Date
   - Check-out Date
   - Number of Nights (can't focus - disabled)
   - Price per Night (can't focus - disabled)
   - Total Amount (can't focus - disabled)
   - Advance Paid
   - Cancel Button
   - Save & Check-in Button
   - Save Booking Button

---

## ✅ Test Case 14: Browser Console

**Objective:** Verify no errors in browser console

**Steps:**
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Perform all form operations
4. Check for errors

**Expected Results:**
- [ ] No RED error messages
- [ ] No warnings about React
- [ ] When "Save Booking" clicked, booking object logged:
  ```javascript
  Booking Data: {guestName: "...", mobileNumber: "...", ...}
  ```
- [ ] Clean console output

---

## ✅ Test Case 15: Button Styling & Interactions

**Objective:** Verify buttons have correct styles and states

**Test 1: Cancel Button**
- [ ] Gray/white background
- [ ] Border visible
- [ ] Hover: Background changes to light gray
- [ ] Click: Slight animation/feedback
- [ ] Text: "Cancel"

**Test 2: Save & Check-in Button**
- [ ] White background with outline
- [ ] Border visible
- [ ] Hover: Slight background change
- [ ] Text: "Save & Check-in"

**Test 3: Save Booking Button (Primary RED)**
- [ ] RED background (#dc2626)
- [ ] White text
- [ ] Hover: Darker RED (#b91c1c)
- [ ] Click: Even darker RED (#991b1b)
- [ ] Text: "Save Booking"
- [ ] Most prominent button

---

## ✅ Test Case 16: Placeholder Text

**Objective:** Verify helper text and placeholders are correct

**Check These Fields:**
- [ ] Guest Name: "Enter guest's full name"
- [ ] Mobile Number: "10-digit mobile number"
- [ ] Email: "guest@example.com"
- [ ] ID Proof Number: "Enter ID proof number"
- [ ] Number of Guests: Default value 1

**Check Helper Text (Muted, below fields):**
- [ ] Number of Nights: "Auto-calculated from dates"
- [ ] Price per Night: "Based on room type"
- [ ] Total Amount: "Auto-calculated total"
- [ ] Advance Paid: "Optional advance payment"

---

## ✅ Test Case 17: Form Sections (Cards)

**Objective:** Verify card styling and visual hierarchy

**Check Each Card:**
1. **Guest Details Card**
   - [ ] Light gray header background
   - [ ] Title: "👤 Guest Details"
   - [ ] White body background
   - [ ] Clear separation from other cards

2. **Room Details Card**
   - [ ] Light gray header background
   - [ ] Title: "🛏️ Room Details"
   - [ ] White body background

3. **Stay Details Card**
   - [ ] Light gray header background
   - [ ] Title: "📅 Stay Details"
   - [ ] White body background

4. **Pricing Details Card**
   - [ ] Light gray header background
   - [ ] Title: "💰 Pricing Details"
   - [ ] White body background

**All Cards Should Have:**
- [ ] Light border around edges
- [ ] Shadow effect (subtle)
- [ ] Consistent spacing
- [ ] Emoji in header titles
- [ ] Clean typography

---

## ✅ Test Case 18: Read-only Fields

**Objective:** Verify read-only fields prevent editing

**Fields to Test:**
1. Number of Nights
2. Price per Night
3. Total Amount

**Steps:**
1. Click on each field
2. Try to type or edit

**Expected Results:**
- [ ] Cannot type in these fields
- [ ] Cursor shows "not-allowed" style
- [ ] Background color is light gray (#f5f5f5)
- [ ] Text color is muted (#999)
- [ ] Field appears disabled but displays values

---

## ✅ Test Case 19: Dropdown Functionality

**Objective:** Verify all select/dropdown fields work correctly

**Dropdowns to Test:**
1. **ID Proof Type** - 4 options
   - [ ] Opens when clicked
   - [ ] Shows: Aadhaar, Passport, Driving License, PAN Card
   - [ ] Selection works
   - [ ] Selected value displays in field

2. **Room Type** - 4 options
   - [ ] Opens when clicked
   - [ ] Shows: Single, Double, Deluxe, Suite
   - [ ] Selection works
   - [ ] Room Number options update based on selection

3. **Room Number** - Dynamic options
   - [ ] Opens when clicked
   - [ ] Shows "-- Select Room --" placeholder
   - [ ] Shows room numbers matching selected room type
   - [ ] Selection works

---

## ✅ Test Case 20: Complete User Journey

**Objective:** Verify complete form flow from start to finish

**Scenario: Receptionist books room for guest**

**Steps:**
1. Open Add Booking page
2. Enter Guest Details:
   - Name: "Sarah Johnson"
   - Mobile: "8765432109"
   - Email: "sarah@email.com"
   - ID Type: "Passport"
   - ID Number: "N1234567"
3. Select Room:
   - Type: "Deluxe"
   - Number: "302"
   - Guests: "2"
4. Set Dates:
   - Check-in: "2026-02-20"
   - Check-out: "2026-02-27" (7 nights)
5. Review Pricing:
   - Price per Night: Should show 4000
   - Total Amount: Should show 28000 (4000 × 7)
   - Advance Paid: "10000"
6. Click "Save Booking"

**Expected Results:**
- [ ] All validations pass
- [ ] Alert: "Booking saved successfully!"
- [ ] Console shows complete booking:
  ```javascript
  {
    guestName: "Sarah Johnson",
    mobileNumber: "8765432109",
    email: "sarah@email.com",
    idProofType: "Passport",
    idProofNumber: "N1234567",
    roomType: "Deluxe",
    roomNumber: "302",
    numberOfGuests: "2",
    checkInDate: "2026-02-20",
    checkOutDate: "2026-02-27",
    numberOfNights: 7,
    pricePerNight: 4000,
    totalAmount: 28000,
    advancePaid: "10000",
    status: "Upcoming"
  }
  ```

---

## 🐛 Bug Reporting

If you find issues, document:

**Template:**
```
Test Case: [Number & Name]
Steps to Reproduce:
1. ...
2. ...

Expected Result:
- Should ...

Actual Result:
- Actually ...

Browser: Chrome/Firefox/Safari/Edge
OS: Windows/Mac/Linux
Resolution: 1920x1080 / 375x667 (mobile)
```

---

## ✨ Success Criteria

All test cases passed ✅ = **PRODUCTION READY**

If any test fails, investigate and fix before deployment.

---

**Testing Date:** ________________
**Tester Name:** ________________
**Status:** ☐ PASS ☐ FAIL

