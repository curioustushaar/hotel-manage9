// Bireena Atithi – Advika AI Chatbot Knowledge Base
// This is injected into every Gemini prompt as context.

const KNOWLEDGE_BASE = `
=== BIREENA ATITHI – COMPLETE KNOWLEDGE BASE ===

## ABOUT THE COMPANY
- Name: Bireena Atithi (by Bireena Info Tech)
- Tagline: Empowering Modern Hotels With Smart Digital Intelligence
- Website: https://bireenaatithi.com
- Email: support@bireenaatithi.com
- Phone: +91 98765 43210
- Address: B36, Mitra Mandal Colony, Vashist Colony, Anisabad, Patna, Bihar 800002
- Social: Facebook (facebook.com/share/1HbxGeBDN7), Instagram (@bireena_atithi), LinkedIn (bireena-infotech)

## WHAT WE DO
Bireena Atithi is a complete hotel management platform. Key capabilities:
- Smart room reservation and front-desk operations
- KOT (Kitchen Order Ticket) automation for food ordering
- Real-time billing, invoicing, and payment processing
- Housekeeping management
- Inventory and stock tracking
- Analytics and financial reports
- Multi-hotel management (Enterprise plan)
- QR-code based in-room food ordering

## OUR STORY
1. Idea Born – Vision to digitize hotel operations
2. Pain Points Identified – Booking delays, billing errors, operational bottlenecks
3. Built Smart Systems – Reservation + KOT automation
4. Now Powering Growing Hotels – Scaling hotel operations

## TEAM
- Dipika Singh – Founder and Director
- Himanshu Yadav – Full Stack Developer
- Ankit Kumar Gupta – Project Manager
- Tushar Kumar – Backend Developer
- Md Arshad Raza – Frontend Developer
- Shekhar Kumar – Backend Developer

---

## MAKE RESERVATION

### How Guests Can Book
- Call: +91 98765 43210
- Email: support@bireenaatithi.com
- Walk-in at hotel counter
- Hotel staff creates booking from admin dashboard

### Admin Reservation Steps
1. Login → Reservations → New Reservation
2. Fill guest info: Name, Mobile, Email, ID Proof (Aadhaar/Passport/Voter ID/DL)
3. Select: Room Type, Room Number, Check-in Date, Check-out Date
4. Choose: Meal Plan (EP/CP/MAP/AP), Number of Adults/Children
5. Select Booking Source (Walk-in, Online, OTA, Corporate, Phone)
6. Add Extra Charges or Complimentary Services if any
7. Enter Payment Mode: Cash / Card / UPI / Bank Transfer
8. Save → System generates Booking ID, Room status becomes "Booked"

### Booking Statuses
- Upcoming – Confirmed, guest not yet arrived
- Checked-in – Guest arrived and checked in
- Checked-out – Guest has departed
- Cancelled – Booking was cancelled
- No-show – Guest didn't arrive

---

## ORDER FOOD

### How Food Ordering Works
Two methods:
1. QR Code Scan – Guest scans QR code on room door → Orders food → KOT auto-sent to kitchen
2. Waiter Entry – Waiter enters order in Table View → KOT generated

### QR Flow
1. Hotel generates Room QR (Property Setup → Generate Room QR)
2. Guest scans QR with phone (no login needed)
3. Guest selects food from the menu
4. Order placed → KOT sent to kitchen
5. Kitchen prepares and delivers to room

### KOT (Kitchen Order Ticket)
- Auto-generated when food is ordered
- Shows: Item name, quantity, room/table number, time
- Kitchen marks: Pending → In Progress → Served
- Multiple rounds of orders supported per table/room

---

## PRICING PLANS

### BASIC – ₹19,999/month
Best for small hotels, guesthouses, B&Bs
- Single hotel
- Basic reservation system
- KOT (limited)
- Standard billing
- Email support
- Up to 20 rooms, 5 staff
- QR generation ✓, Basic reports ✓
- Advanced reports ✗, Activity logs ✗, Multi-hotel ✗

### PROFESSIONAL – ₹14,999/month (Most Popular ⭐)
Best for mid-size hotels
- Up to 3 hotels
- Advanced reservation intelligence
- Full KOT automation
- Inventory management
- 24/7 priority support
- Up to 100 rooms, 20 staff
- All Pro features: Advanced reports ✓, Analytics ✓, Activity logs ✓

### ENTERPRISE – Custom Pricing
Best for hotel chains
- Unlimited hotels and rooms
- Full customization
- Advanced analytics
- Dedicated account manager
- Custom API integration
- Multi-hotel ✓, All features ✓

To get pricing: Email support@bireenaatithi.com or call +91 98765 43210

---

## TABLE BOOKING

### How It Works
1. Guest requests table (phone/walk-in)
2. Waiter/Receptionist goes to Table View in admin panel
3. Selects table → Assigns to guest
4. Takes food order → KOT generated
5. After dining → Bill from Cashier Section

### Table Statuses
- Available – Free to seat guests
- Occupied – Currently has guests
- Reserved – Pre-booked for a future time

### Waiter Workflow
1. Login with Waiter credentials
2. Navigate to Table View
3. Select table → Mark Occupied
4. Enter order → KOT sent to kitchen
5. After meal → Generate bill → Cashier processes payment

---

## USER ROLES & ACCESS

Roles (Highest to Lowest Access):
1. Super Admin – System-wide control, all hotels, subscriptions
2. Admin – Full hotel-level control, staff management
3. Manager – Operations, reservations, reports
4. Receptionist – Front desk, check-in/out, basic billing
5. Accountant – Billing, payments, financial reports
6. Waiter – Food orders, KOT, table management
7. Staff – Custom limited permissions set by Admin

Staff role: Admin selects exactly which modules Staff can access.

---

## ADMIN DASHBOARD

Sections:
- Room Statistics: Total, Occupied, Booked, Available rooms (real-time, refreshes every 60s)
- Booking Statistics: Current Guests, Today's Check-ins, Today's Check-outs, Upcoming Bookings
- Charts: Occupancy Rate (circular chart), Room Status Distribution (bar chart)
- Donut Stats: Arrival, Departure, Guest In House, Room Status
- Occupancy Gauges: Today %, Tomorrow %, This Month %
- Upcoming Reservations: Today, Tomorrow, Next 7 Days
- Revenue Analytics: Total Revenue, Revenue Breakup (Rooms/Restaurant), ADR (hidden from Staff)

---

## SIDEBAR MODULES

1. Dashboard – Stats, charts, revenue overview
2. Rooms – View all rooms, statuses, occupancy
3. Reservations (with sub-menu):
   - Dashboard – All bookings list
   - New Reservation – Create booking
   - Housekeeping View – Room cleaning management
   - Room Service – In-room food orders
   - Food Order – Manage food orders
4. Cashier Section – Payment processing, bills, invoices
5. Table View – Restaurant table management, KOT
6. Food Menu – Manage food items and categories
7. Property Setup (sub-menu):
   - Discount – Create discount rules
   - Taxes – GST / service tax configuration
   - Tax Mapping – Map taxes to room types
   - Generate Room QR – Print QR codes for rooms
8. Property Configuration (sub-menu):
   - Room Setup, Floor Setup, Bed Type
   - Room Facilities, Meal Type, Reservation Type
   - Extra Charges, Complimentary Services
   - Customer Identity, Booking Source, Business Source
   - Hotel Customer, Housekeeping Config, Maintenance Block
9. Customer List – Guest database and history
10. Add Staff – Create staff accounts with custom permissions
11. Cashier Logs – Daily cash transaction audit trail
12. Payment Logs – Food & beverage payment records

---

## SUPER ADMIN

- Manages ALL hotels on the platform
- Can create new hotels with owner credentials
- Controls subscription plans per hotel
- Views system-wide analytics and revenue
- URL: /secure-owner-login

Features:
- Hotel list with status and subscription
- Upgrade/downgrade hotel plans
- View each hotel's staff and statistics
- Enable/disable hotel access

---

## BILLING & CASHIER

- Add room charges, food charges, extra charges
- Apply discounts and taxes
- Collect payment: Cash, Card, UPI, Bank Transfer
- Generate and print/email invoice
- Route folio to company/corporate account
- Split bill between guests
- Refund processing

---

## HOUSEKEEPING

Room States: Clean → Dirty (after checkout) → In Progress → Inspected → Available
Workflow:
1. Guest checks out → Room = Dirty
2. Supervisor assigns cleaner
3. Cleaner starts → In Progress
4. Finished → Inspected
5. Verified → Clean → Available for new bookings

---

## QR CODE SYSTEM
- Admin generates QR per room from Property Setup
- Guest scans QR code on room door (no app/login needed)
- Opens food menu on guest's mobile browser
- Guest orders → KOT auto-generated to kitchen
- Charges added to guest folio automatically

---

## DEMO & CONTACT

To book a free demo:
- Website: https://bireenaatithi.com (click "Book a Free Demo")
- Email: support@bireenaatithi.com
- Phone: +91 98765 43210

For demo scheduling, collect: Name, Email, Phone Number, Hotel Name, Number of Rooms

---

## FAQ

Q: How to reset password?
A: Contact your Admin or email support@bireenaatithi.com

Q: Can guest order food from room?
A: Yes – scan QR code on room door.

Q: Can I manage multiple hotels?
A: Yes – Enterprise plan supports unlimited hotels via Super Admin.

Q: Is there a mobile app?
A: Platform is mobile-responsive; dedicated app coming soon.

Q: What is KOT?
A: Kitchen Order Ticket – auto-generated when food is ordered, sent directly to kitchen.

Q: How to upgrade plan?
A: Contact support@bireenaatithi.com or your Super Admin.

Q: Can I integrate with OTAs?
A: Enterprise plan supports custom API integration (MakeMyTrip, Booking.com, etc.)

Q: What ID proofs are accepted?
A: Aadhaar Card, Passport, Voter ID, Driving License, PAN Card.

Q: What payment modes are supported?
A: Cash, Credit/Debit Card (Swipe), UPI, Bank Transfer / NEFT / RTGS.

Q: How does check-out work?
A: Go to reservation → View Folio → Verify charges → Collect payment → Click Check-out → Invoice generated → Room becomes Available.
`;

module.exports = KNOWLEDGE_BASE;
