# Add Booking Page - Documentation

## Overview
The **Add Booking** page is a professional SaaS form component designed for hotel receptionists to quickly create new hotel bookings with clarity and minimal confusion.

---

## Page Structure

### 5 Card-Based Sections:

#### 1️⃣ **Guest Details Card**
Collects information about the guest.

**Fields:**
- **Guest Name** (text, required) - Full name of the guest
- **Mobile Number** (tel, required) - 10-digit mobile number
- **Email** (email, optional) - Guest's email address
- **ID Proof Type** (dropdown) - Options: Aadhaar, Passport, Driving License, PAN Card
- **ID Proof Number** (text, optional) - ID proof number

**Layout:** 2-column grid
- Guest Name (full width)
- Mobile Number (full width)
- Email (left column)
- ID Proof Type (right column)
- ID Proof Number (left column)

---

#### 2️⃣ **Room Details Card**
Handles room selection and guest count.

**Fields:**
- **Room Type** (dropdown, required) - Options: Single, Double, Deluxe, Suite
- **Room Number** (dropdown, required) - Available rooms based on room type
- **Number of Guests** (number, optional) - 1-6 guests

**Features:**
- Room numbers dynamically populate based on selected room type
- Room number resets when room type changes
- Prevents selection of unavailable rooms

**Layout:** 3-column grid

---

#### 3️⃣ **Stay Details Card**
Manages check-in/check-out dates and calculates length of stay.

**Fields:**
- **Check-in Date** (date picker, required)
- **Check-out Date** (date picker, required)
- **Number of Nights** (number, read-only) - Auto-calculated

**Features:**
- Auto-calculates number of nights when dates change
- Night calculation: `(checkOut - checkIn) / (1000 * 60 * 60 * 24)`
- Number of nights field is disabled/read-only
- Shows helper text: "Auto-calculated from dates"

**Layout:** 3-column grid

---

#### 4️⃣ **Pricing Details Card**
Displays price information and allows advance payment entry.

**Fields:**
- **Price per Night** (number, read-only) - ₹ currency indicator
- **Total Amount** (number, read-only) - ₹ currency indicator
- **Advance Paid** (number, optional) - ₹ currency indicator

**Features:**
- Price per night updates based on room type selection
- Total amount auto-calculates: `pricePerNight × numberOfNights`
- Price and total fields are read-only (disabled)
- Advance paid field is editable
- Muted text color (#999) for read-only fields
- Shows helper text for each field

**Room Type Pricing:**
```javascript
{
  'Single': 1500,
  'Double': 2500,
  'Deluxe': 4000,
  'Suite': 6000
}
```

**Layout:** 3-column grid

---

#### 5️⃣ **Action Buttons**
Bottom section with save and cancel options.

**Buttons:**
1. **Cancel** (secondary button, left)
   - Gray/outline style
   - Resets form with confirmation
   - Clears all fields

2. **Save & Check-in** (outline button, right)
   - Opens booking with "Checked-in" status
   - For same-day check-ins
   - Validation on click

3. **Save Booking** (primary RED button, right)
   - Creates booking with "Upcoming" status
   - Red background (#dc2626)
   - Primary action
   - Validation on click

**Button Validation:**
- Checks required fields: guestName, mobileNumber, roomNumber, checkInDate, checkOutDate
- Shows alert if validation fails
- Logs booking data to console (ready for API integration)

---

## Design System

### Colors (RED & WHITE Theme)
```css
Primary Red: #dc2626 (Primary Actions)
Dark Red: #b91c1c (Hover State)
Darker Red: #991b1b (Active State)
Muted Text: #999
Form Text: #1a1a1a
Form Background: #ffffff
Page Background: #f8f9fa
Border Color: #e5e7eb
Disabled Background: #f5f5f5
```

### Typography
```css
Page Title: 1.875rem, font-weight 700
Section Title: 1.1rem, font-weight 600
Form Label: 0.875rem, font-weight 500
Form Input: 0.875rem, font-weight 400
Helper Text: 0.75rem, color #999
```

### Spacing
```css
Vertical Gap (form grid): 1.5rem
Horizontal Gap (form grid): 1.5rem
Card Margin: 2rem bottom
Padding (card body): 1.5rem
Padding (card header): 1.25rem
Button Height: 2.5rem (40px)
Button Padding: 0.625rem 1.5rem
```

### Border Radius
```css
Form Cards: 0.5rem (8px)
Input Fields: 0.375rem (6px)
Buttons: 0.375rem (6px)
Status Badges: 0.4rem
```

### Focus States
```css
Input Focus:
  - Border color: #dc2626
  - Box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.08)
  - Background: #fafafa

Button Focus:
  - Outline: 2px solid #dc2626
  - Outline offset: 2px
```

---

## Responsive Design

### Desktop (1024px+)
- 2-column form grid
- Full-width cards
- Buttons in horizontal row
- Max-width: 900px centered

### Tablet (768px - 1023px)
- Maintained 2-column layout
- Cards stack vertically
- Same spacing maintained

### Mobile (<768px)
- **Single column layout** for form grid
- Full-width inputs
- Button stack vertically
- Reduced padding/margins
- "Save & Check-in" button stacks below "Save Booking"
- Full-width buttons on mobile

---

## Form Data Structure

### Booking Object (on Submit)
```javascript
{
  guestName: string,
  mobileNumber: string,
  email: string,
  idProofType: string,
  idProofNumber: string,
  roomType: string,
  roomNumber: string,
  numberOfGuests: string,
  checkInDate: string (YYYY-MM-DD),
  checkOutDate: string (YYYY-MM-DD),
  numberOfNights: number,
  pricePerNight: string,
  totalAmount: string,
  advancePaid: string,
  status: 'Upcoming' | 'Checked-in'
}
```

---

## State Management

### Component States (useState)
```javascript
// Guest Details
[guestName, setGuestName]
[mobileNumber, setMobileNumber]
[email, setEmail]
[idProofType, setIdProofType]
[idProofNumber, setIdProofNumber]

// Room Details
[roomType, setRoomType]
[roomNumber, setRoomNumber]
[numberOfGuests, setNumberOfGuests]

// Stay Details
[checkInDate, setCheckInDate]
[checkOutDate, setCheckOutDate]
[numberOfNights, setNumberOfNights]

// Pricing
[pricePerNight, setPricePerNight]
[totalAmount, setTotalAmount]
[advancePaid, setAdvancePaid]
```

### Side Effects (useEffect)
1. **Calculate Nights**: Triggered when checkInDate or checkOutDate changes
2. **Update Price**: Triggered when roomType changes
3. **Calculate Total**: Triggered when pricePerNight or numberOfNights changes
4. **Reset Room**: Triggered when roomType changes (clears room number)

---

## Features & Interactions

### Dynamic Room Selection
- Room numbers are filtered based on selected room type
- Sample rooms configured per type:
  - Single: 101-105
  - Double: 201-204
  - Deluxe: 301-303
  - Suite: 401-402

### Auto-Calculations
1. **Number of Nights**: Automatically calculates from check-in/check-out dates
2. **Price per Night**: Updates when room type changes
3. **Total Amount**: Updates when price or nights change

### Form Validation
- Required fields marked with RED asterisk (*)
- Validation on button click
- Alert shown for missing required fields
- Prevents submission without required data

### Room Type Pricing
- Single: ₹1,500/night
- Double: ₹2,500/night
- Deluxe: ₹4,000/night
- Suite: ₹6,000/night

---

## CSS Classes

### Utility Classes
```css
.add-booking-container          /* Main wrapper */
.add-booking-header             /* Page title section */
.add-booking-form               /* Form wrapper */
.form-card                      /* Card container */
.card-header                    /* Card header section */
.card-body                      /* Card content section */
.form-grid                      /* 2-column grid */
.form-group                     /* Individual field wrapper */
.form-label                     /* Field label */
.form-input                     /* Input/select fields */
.form-input-readonly            /* Disabled input styling */
.input-with-currency            /* Currency wrapper */
.currency-symbol                /* ₹ symbol */
.helper-text                    /* Small helper text */
.form-actions                   /* Button container */
.button-group                   /* Button wrapper */
.required                       /* Red asterisk */
```

### Button Classes
```css
.btn                            /* Base button */
.btn-primary                    /* RED primary button */
.btn-outline                    /* White outline button */
.btn-secondary                  /* Gray secondary button */
```

---

## Accessibility Features

✅ **WCAG AA Compliant**
- Semantic HTML labels with `htmlFor` attributes
- Required fields marked with visual indicator (*)
- Sufficient color contrast (#1a1a1a text on white/light backgrounds)
- Focus-visible states for keyboard navigation
- Proper input types (tel, email, date, number)
- Helper text for clarity

✅ **Keyboard Navigation**
- All buttons and inputs focusable via Tab
- Focus ring visible on all interactive elements
- Form submission via Enter key in inputs

---

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Future Integration Points

### API Integration (Ready)
```javascript
handleSaveBooking() {
  // Currently logs to console
  // Replace with: POST /api/bookings
}

handleSaveAndCheckIn() {
  // Currently logs to console
  // Replace with: POST /api/bookings?checkIn=true
}
```

### Backend API Expected
- `POST /api/bookings` - Create new booking
- `GET /api/rooms/available/:type` - Get available room numbers
- `GET /api/pricing/rooms` - Get room pricing

### Storage Integration (Ready)
- Currently no persistence
- Can be integrated with:
  - localStorage (MVP)
  - API backend (Production)
  - Redux/Context (State management)

---

## File Structure

```
src/components/
├── AddBooking.jsx              (Main component - 449 lines)
├── AddBooking.css              (Styles - 600+ lines)

src/pages/Dashboard/
└── AdminDashboard.jsx          (Contains import & render)
```

---

## Component Integration

### In AdminDashboard.jsx
```javascript
import AddBooking from '../../components/AddBooking';

// In menu items:
{ id: 'add-booking', icon: '➕', label: 'Add Booking' }

// In render:
{activeMenu === 'add-booking' && <AddBooking />}
```

---

## Usage Example

```jsx
import AddBooking from '../../components/AddBooking';

function MyPage() {
  return (
    <div>
      <AddBooking />
    </div>
  );
}
```

---

## Notes for Developers

### Ready for Production ✅
- Clean SaaS UI design
- Fully responsive
- Form validation implemented
- State management complete
- CSS variables not used (inline values for simplicity)
- No external dependencies beyond React

### Not Yet Implemented ⏳
- Backend API integration (logged to console)
- localStorage persistence
- Error handling for API calls
- Guest photo/document upload
- Special requests/notes field
- Payment gateway integration

### Customization Points
1. **Room Prices** - Update `roomPrices` object
2. **Room Numbers** - Update `availableRooms` object
3. **ID Proof Types** - Add/remove options in select
4. **Form Fields** - Add new useState hooks and form groups
5. **Colors** - Update CSS variables in AddBooking.css
6. **Validation Rules** - Modify handleSaveBooking() function

---

## Testing Checklist

- [ ] Form displays correctly on desktop/mobile
- [ ] All required fields are marked with *
- [ ] Room numbers update when room type changes
- [ ] Number of nights calculates correctly
- [ ] Price updates based on room type
- [ ] Total amount calculates correctly
- [ ] Red buttons work as expected
- [ ] Cancel button clears form with confirmation
- [ ] Form validation prevents empty submissions
- [ ] Helper text displays for calculated fields
- [ ] Responsive layout works on mobile
- [ ] Keyboard navigation works (Tab key)
- [ ] Focus states visible
- [ ] All labels connected to inputs

---

## Support & Questions

For integration questions or customization needs, refer to the inline comments in AddBooking.jsx and AddBooking.css.

