<<<<<<< HEAD
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
=======
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
>>>>>>> c3c0a9521069e0ffcee1bf5cc78e541e4b472e63
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import { MODULES, ROLES } from './config/rbac'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import TrustedBy from './components/TrustedBy'
import FeaturesList from './components/Features'
import Marketplace from './components/Marketplace'
import Integrations from './components/Integrations'
import OutletTypes from './components/OutletTypes'
import Testimonials from './components/Testimonials'
import Ratings from './components/Ratings'
import DemoForm from './components/DemoForm'
import Footer from './components/Footer'
import Login from './pages/Login/Login'
import AdminDashboard from './pages/Dashboard/AdminDashboard'
import SuperAdminDashboard from './pages/SuperAdmin/SuperAdminDashboard'
import HotelsManagement from './pages/SuperAdmin/HotelsManagement'
import CreateHotel from './pages/SuperAdmin/CreateHotel'
import HotelDetails from './pages/SuperAdmin/HotelDetails'
import SuperAdminLogin from './pages/SuperAdmin/SuperAdminLogin'
import QRScanPage from './pages/QRScan/QRScanPage'
import FoodOrderPage from './components/FoodOrderPage'
import About from './pages/About'
import FeaturesPage from './pages/Features'
import './index.css'

function HomePageContent() {
  return (
    <>
      <Hero />
      <TrustedBy />
      <FeaturesList />
      <Marketplace />
      <Integrations />
      <OutletTypes />
      <Testimonials />
      <Ratings />
      <DemoForm />
    </>
  )
}

const AppRoutes = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/super-admin');

  return (
    <div className="App">
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePageContent />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<HomePageContent />} />
        <Route path="/contact" element={<HomePageContent />} />
        <Route path="/login" element={<Login />} />
        <Route path="/superadmin/login" element={<SuperAdminLogin />} />

        {/* Protected Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute module={MODULES.DASHBOARD}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/rooms" element={
          <ProtectedRoute module={MODULES.ROOMS}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/reservations" element={
          <ProtectedRoute module={MODULES.RESERVATIONS}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/guest-meal-service" element={
          <ProtectedRoute module={MODULES.GUEST_MEAL_SERVICE}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/food-menu" element={
          <ProtectedRoute module={MODULES.FOOD_MENU}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/customers" element={
          <ProtectedRoute module={MODULES.CUSTOMERS}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/staff" element={
          <ProtectedRoute module={MODULES.STAFF}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Superadmin Routes */}
        <Route path="/super-admin/dashboard" element={
          <ProtectedRoute role={ROLES.SUPER_ADMIN}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/super-admin/hotels" element={
          <ProtectedRoute role={ROLES.SUPER_ADMIN}>
            <HotelsManagement />
          </ProtectedRoute>
        } />
        <Route path="/super-admin/hotels/create" element={
          <ProtectedRoute role={ROLES.SUPER_ADMIN}>
            <CreateHotel />
          </ProtectedRoute>
        } />
        <Route path="/super-admin/hotels/:id" element={
          <ProtectedRoute role={ROLES.SUPER_ADMIN}>
            <HotelDetails />
          </ProtectedRoute>
        } />

        {/* Other Routes */}
        <Route path="/qr-scan/:hotelId/:tableId" element={<QRScanPage />} />
        <Route path="/order" element={<FoodOrderPage />} />
      </Routes>
      {!isAdminRoute && <Footer />}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
<<<<<<< HEAD
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<HomePage />} />
          <Route path="/features" element={<HomePage />} />
          <Route path="/pricing" element={<HomePage />} />
          <Route path="/contact" element={<HomePage />} />
          <Route path="/login" element={<Login />} />

          {/* HIDDEN SUPER ADMIN LOGIN */}
          <Route path="/secure-owner-login" element={<SuperAdminLogin />} />

          {/* Super Admin Route */}
          <Route path="/super-admin/dashboard" element={
            <ProtectedRoute module={MODULES.SUPER_ADMIN_DASHBOARD}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          } />

          {/* Protected Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute module={MODULES.DASHBOARD}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/rooms" element={
            <ProtectedRoute module={MODULES.ROOMS}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/reservations" element={
            <ProtectedRoute module={MODULES.RESERVATIONS}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/guest-meal-service" element={
            <ProtectedRoute module={MODULES.GUEST_MEAL_SERVICE}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/food-menu" element={
            <ProtectedRoute module={MODULES.FOOD_MENU}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/customers" element={
            <ProtectedRoute module={MODULES.CUSTOMERS}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute module={MODULES.STAFF_MANAGEMENT}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/stay-overview" element={
            <ProtectedRoute module={MODULES.RESERVATIONS}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/reservation-stay-management" element={
            <ProtectedRoute module={MODULES.RESERVATIONS}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/view-reservation" element={
            <ProtectedRoute module={MODULES.RESERVATIONS}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/room-service" element={
            <ProtectedRoute module={MODULES.RESERVATIONS}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/view-order" element={
            <ProtectedRoute module={MODULES.GUEST_MEAL_SERVICE}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/my-profile" element={
            <ProtectedRoute module={MODULES.PROFILE}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/cashier-report" element={
            <ProtectedRoute module={MODULES.CASHIER_LOGS}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/food-payment-report" element={
            <ProtectedRoute module={MODULES.PAYMENT_LOGS}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/cashier-section" element={
            <ProtectedRoute module={MODULES.CASHIER_SECTION}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Property Setup Routes */}
          <Route path="/admin/discount" element={<ProtectedRoute module={MODULES.PROPERTY_SETUP}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/taxes" element={<ProtectedRoute module={MODULES.PROPERTY_SETUP}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/tax-mapping" element={<ProtectedRoute module={MODULES.PROPERTY_SETUP}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/generate-room-qr" element={<ProtectedRoute module={MODULES.PROPERTY_SETUP}><AdminDashboard /></ProtectedRoute>} />

          {/* Property Configuration Routes */}
          <Route path="/admin/room-setup" element={<ProtectedRoute module={MODULES.PROPERTY_CONFIG}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/floor-setup" element={<ProtectedRoute module={MODULES.PROPERTY_CONFIG}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/bed-type" element={<ProtectedRoute module={MODULES.PROPERTY_CONFIG}><AdminDashboard /></ProtectedRoute>} />

          <Route path="/admin/room-facilities-type" element={<ProtectedRoute module={MODULES.PROPERTY_CONFIG}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/meal-type" element={<ProtectedRoute module={MODULES.PROPERTY_CONFIG}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/reservation-type" element={<ProtectedRoute module={MODULES.PROPERTY_CONFIG}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/extra-charges" element={<ProtectedRoute module={MODULES.PROPERTY_CONFIG}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/complimentary-services" element={<ProtectedRoute module={MODULES.PROPERTY_CONFIG}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/customer-identity" element={<ProtectedRoute module={MODULES.PROPERTY_CONFIG}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/booking-source" element={<ProtectedRoute module={MODULES.PROPERTY_CONFIG}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/business-source" element={<ProtectedRoute module={MODULES.PROPERTY_CONFIG}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/maintenance-block" element={<ProtectedRoute module={MODULES.PROPERTY_CONFIG}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/table-management" element={<ProtectedRoute module={MODULES.PROPERTY_CONFIG}><AdminDashboard /></ProtectedRoute>} />

          {/* Public Routes */}
          <Route path="/scan-qr/:roomId" element={<QRScanPage />} />
          <Route path="/food-order" element={<FoodOrderPage />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
=======
        <AppRoutes />
>>>>>>> c3c0a9521069e0ffcee1bf5cc78e541e4b472e63
      </Router>
    </AuthProvider>
  )
}

export default App
