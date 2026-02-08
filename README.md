# 🏨 Hotel Management System

A comprehensive hotel management platform built with modern web technologies. Manage rooms, bookings, food orders, billing, and guest services all in one place.

**Live Demo:** https://hotel-management-three-psi.vercel.app

---

## 📋 Quick Links

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Installation](#-installation)
- [Deployment](#-deployment)
- [Environment Setup](#-environment-setup)
- [API Endpoints](#-api-endpoints)

---

## ✨ Features

### 🛏️ Room Management
- Add, edit, and delete rooms
- Track room availability and pricing
- Room type categorization
- Real-time occupancy status

### 📅 Booking System
- Guest reservation management
- Check-in/check-out tracking
- Reservation history
- Booking confirmation emails

### 🍽️ Food & Dining Service
- Digital menu management
- Guest meal ordering system
- Table service management
- Delivery tracking

### 💳 Billing & Payments
- Automated invoice generation
- Multiple payment methods
- Payment history tracking
- Discount and tax management

### 📊 Dashboard & Analytics
- Real-time statistics
- Revenue reports
- Occupancy metrics
- Guest analytics

### 🔐 Security & Access Control
- Role-based access (Admin, Staff, Guest)
- User authentication
- Data encryption
- Secure API endpoints

---

## 🛠 Technology Stack

### Frontend
- React 18+ (JavaScript UI Library)
- Vite (Build tool)
- React Router (Navigation)
- Framer Motion (Animations)
- Tailwind CSS (Styling)

### Backend
- Node.js (Runtime)
- Express.js (Web framework)
- MongoDB (Database)
- Mongoose (ODM)
- JWT (Authentication)

### DevOps
- Vercel (Deployment)
- GitHub (Version Control)
- MongoDB Atlas (Cloud Database)

---

## 📁 Project Structure

```
Hotel-Management/
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page-level components
│   │   ├── config/          # Configuration
│   │   ├── utils/           # Helper functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.local           # Local environment (NOT in git)
│   ├── .env.example         # Template
│   └── package.json
│
├── backend/
│   ├── controllers/         # Route handlers
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API routes
│   ├── scripts/             # DB initialization
│   ├── server.js
│   ├── .env                 # Prod config (NOT in git)
│   ├── .env.example         # Template
│   └── package.json
│
└── README.md                # This file
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js v16+ ([Download](https://nodejs.org/))
- npm or yarn
- MongoDB account ([Create Free](https://www.mongodb.com/cloud/atlas))
- Git

### Step 1: Clone Repository
```bash
git clone https://github.com/curioustushaar/Hotel-Management.git
cd Hotel-Management
```

### Step 2: Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Backend .env configuration:**
```env
MONGODB_URI=mongodb+srv://your_user:your_password@cluster.mongodb.net/hotel-db?appName=Cluster0
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Step 3: Frontend Setup
```bash
cd ..  # Back to root

# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local

# Edit .env.local
nano .env.local
```

**Frontend .env.local configuration:**
```env
VITE_API_URL=http://localhost:5000
```

### Step 4: Run Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## 🌐 Deployment

### Deploy Backend to Vercel
1. Go to [Vercel Dashboard](https://vercel.com)
2. Import `Hotel-Management` repository
3. Set Root Directory: `backend`
4. Add Environment Variables:
   - `MONGODB_URI`
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://hotel-management-three-psi.vercel.app`
5. Deploy

### Deploy Frontend to Vercel
1. Create Frontend Vercel Project
2. Add Environment Variable:
   - `VITE_API_URL=https://your-backend-url.vercel.app`
3. Deploy

### Production URLs
- Frontend: https://hotel-management-three-psi.vercel.app
- Backend: https://hotel-management-vk6w.vercel.app

---

## 🔐 Environment Variables

### Frontend (.env.local or Vercel)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000` or `https://api.example.com` |

### Backend (.env or Vercel)
| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection URI | ✅ Yes |
| `PORT` | Server port | ❌ 5000 (default) |
| `NODE_ENV` | Environment | ✅ development/production |
| `FRONTEND_URL` | Frontend URL (for CORS) | ✅ Yes |
| `JWT_SECRET` | JWT signing key | ❌ Optional |

⚠️ **SECURITY:** Never commit `.env` files. They are in `.gitignore`.

---

## 📚 API Endpoints

### Base URL: `/api`

#### Rooms
- `GET /rooms` - Get all rooms
- `POST /rooms` - Create room
- `GET /rooms/:id` - Get room
- `PUT /rooms/:id` - Update room
- `DELETE /rooms/:id` - Delete room

#### Bookings
- `GET /bookings` - Get all bookings
- `POST /bookings` - Create booking
- `GET /bookings/:id` - Get booking
- `PUT /bookings/:id` - Update booking
- `DELETE /bookings/:id` - Delete booking

#### Menu
- `GET /menu` - Get all items
- `POST /menu` - Add item
- `PUT /menu/:id` - Update item
- `DELETE /menu/:id` - Delete item

#### Guest Meal Orders
- `GET /guest-meals` - Get all orders
- `POST /guest-meals` - Create order
- `PUT /guest-meals/:id` - Update order

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/YourFeature`
3. Commit: `git commit -m 'Add YourFeature'`
4. Push: `git push origin feature/YourFeature`
5. Open Pull Request

---

## 📝 License

MIT License © 2024 Hotel Management

---

## 📧 Support

For issues or questions:
- GitHub Issues: [Create Issue](https://github.com/curioustushaar/Hotel-Management/issues)
- Email: support@example.com

---

**Version:** 1.0.0 | **Updated:** February 8, 2026
│   ├── Integrations.jsx # Integrations grid
│   ├── OutletTypes.jsx # Outlet types
│   ├── Testimonials.jsx # Testimonials slider
│   ├── Ratings.jsx     # Rating cards
│   ├── DemoForm.jsx    # Demo form
│   └── Footer.jsx      # Footer
├── App.jsx             # Main component
└── main.jsx            # Entry point

public/
└── pic section/        # All images
```

## 🎨 Technologies Used

- **React 18** - Frontend library
- **Vite** - Build tool & dev server
- **CSS3** - Styling with animations
- **JavaScript (ES6+)** - Modern JS features

## 📦 Components

### Navbar
- Responsive navigation bar
- Multi-level dropdown menus
- Mobile hamburger menu
- Smooth transitions

### Hero Section
- Eye-catching hero design
- Call-to-action button
- Hero illustration

### Features
- Billing system
- Inventory management
- Reports & Analytics
- Online ordering

### Testimonials
- Auto-playing slider
- Customer reviews
- Animated statistics counter
- 100K+ happy customers

### Demo Form
- Contact form
- Fields: Name, Email, Phone, City, Hotel Name
- Form validation

### Footer
- Multi-column layout
- Social media links
- Contact information

## 🎨 Design Highlights

- **Primary Color**: #e11d48 (Rose Red)
- **Font**: Poppins (Google Fonts)
- **Mobile Breakpoint**: 768px
- **Animations**: Smooth CSS transitions
- **Layout**: Flexbox & CSS Grid

## 🔜 Roadmap

- [ ] Add React Router for navigation
- [ ] Backend API integration
- [ ] Advanced form validation
- [ ] State management (Redux/Context)
- [ ] Unit & Integration tests
- [ ] SEO optimization
- [ ] Image lazy loading

## 📄 Documentation

For detailed structure and component information, see [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)

## 📞 Contact

**Bireena Atithi Food Services Pvt. Ltd.**
- 📍 B-36, Anisabad, Patna, Bihar, India - 800002
- 📧 bireenainfo@gmail.com
- 📱 +91 91351-55931 | +91 93049-42225

## 📝 License

Copyright © 2026 Bireena Atithi Food Services Pvt. Ltd.

---

**Built with ❤️ using React & Vite**
