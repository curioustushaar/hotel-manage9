import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
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
import OutletCurrentStatus from './components/OutletCurrentStatus'
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
  const isAdminRoute = location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/super-admin') ||
    location.pathname.startsWith('/staff') ||
    location.pathname.startsWith('/secure-owner-login') ||
    location.pathname.startsWith('/superadmin/login') ||
    location.pathname.startsWith('/food-order') ||
    location.pathname.startsWith('/order') ||
    location.pathname.startsWith('/qr-scan') ||
    location.pathname.startsWith('/scan-qr') ||
    location.pathname.startsWith('/live-outlet');

  return (
    <div className="App">
      {!isAdminRoute && <Navbar />}
      <Routes>
        {/* Public Landing Pages */}
        <Route path="/" element={<HomePageContent />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<HomePageContent />} />
        <Route path="/contact" element={<HomePageContent />} />
        <Route path="/login" element={<Login />} />
        <Route path="/live-outlet" element={<OutletCurrentStatus />} />

        {/* HIDDEN SUPER ADMIN LOGIN */}
        <Route path="/secure-owner-login" element={<SuperAdminLogin />} />
        <Route path="/superadmin/login" element={<SuperAdminLogin />} />

        {/* Super Admin Routes */}
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

        {/* Protected Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute module={MODULES.DASHBOARD}><AdminDashboard /></ProtectedRoute>} />

        <Route path="/admin/rooms" element={<ProtectedRoute module={MODULES.ROOMS}><AdminDashboard /></ProtectedRoute>} />

        <Route path="/admin/reservations" element={<ProtectedRoute module={MODULES.RESERVATIONS}><AdminDashboard /></ProtectedRoute>} />

        <Route path="/admin/stay-overview" element={<ProtectedRoute module={MODULES.RESERVATIONS}><AdminDashboard /></ProtectedRoute>} />

        <Route path="/admin/reservation-stay-management" element={<ProtectedRoute module={MODULES.RESERVATIONS}><AdminDashboard /></ProtectedRoute>} />

        <Route path="/admin/view-reservation" element={<ProtectedRoute module={MODULES.RESERVATIONS}><AdminDashboard /></ProtectedRoute>} />

        <Route path="/admin/room-service" element={<ProtectedRoute module={MODULES.RESERVATIONS}><AdminDashboard /></ProtectedRoute>} />

        <Route path="/admin/guest-meal-service" element={<ProtectedRoute module={MODULES.GUEST_MEAL_SERVICE}><AdminDashboard /></ProtectedRoute>} />

        <Route path="/admin/food-menu" element={<ProtectedRoute module={MODULES.FOOD_MENU}><AdminDashboard /></ProtectedRoute>} />

        <Route path="/admin/customers" element={<ProtectedRoute module={MODULES.CUSTOMERS}><AdminDashboard /></ProtectedRoute>} />

        <Route path="/admin/settings" element={<ProtectedRoute module={MODULES.STAFF_MANAGEMENT}><AdminDashboard /></ProtectedRoute>} />

        <Route path="/admin/view-order" element={<ProtectedRoute module={MODULES.GUEST_MEAL_SERVICE}><AdminDashboard /></ProtectedRoute>} />

        <Route path="/admin/my-profile" element={<ProtectedRoute module={MODULES.PROFILE}><AdminDashboard /></ProtectedRoute>} />

        <Route path="/admin/cashier-report" element={<ProtectedRoute module={MODULES.CASHIER_LOGS}><AdminDashboard /></ProtectedRoute>} />

        <Route path="/admin/food-payment-report" element={<ProtectedRoute module={MODULES.PAYMENT_LOGS}><AdminDashboard /></ProtectedRoute>} />

        <Route path="/admin/cashier-section" element={<ProtectedRoute module={MODULES.CASHIER_SECTION}><AdminDashboard /></ProtectedRoute>} />

        {/* Property Setup & Config Routes */}
        <Route path="/admin/discount" element={<ProtectedRoute module={MODULES.PROPERTY_SETUP}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/taxes" element={<ProtectedRoute module={MODULES.PROPERTY_SETUP}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/tax-mapping" element={<ProtectedRoute module={MODULES.PROPERTY_SETUP}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/generate-room-qr" element={<ProtectedRoute module={MODULES.PROPERTY_SETUP}><AdminDashboard /></ProtectedRoute>} />

        <Route path="/admin/room-setup" element={<ProtectedRoute module={MODULES.PROPERTY_CONFIG}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/floor-setup" element={<ProtectedRoute module={MODULES.PROPERTY_CONFIG}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/bed-type" element={<ProtectedRoute module={MODULES.PROPERTY_CONFIG}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/room-facilities" element={<ProtectedRoute module={MODULES.PROPERTY_CONFIG}><AdminDashboard /></ProtectedRoute>} />
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



        {/* STAFF Routes - Preserving Specific Permissions */}
        <Route path="/staff/dashboard" element={<ProtectedRoute module={MODULES.DASHBOARD}><AdminDashboard /></ProtectedRoute>} />

        <Route path="/staff/rooms" element={<ProtectedRoute module={MODULES.ROOMS}><AdminDashboard /></ProtectedRoute>} />

        <Route path="/staff/reservations" element={<ProtectedRoute module={[MODULES.RESERVATIONS, 'housekeeping']}><AdminDashboard /></ProtectedRoute>} />

        <Route path="/staff/stay-overview" element={<ProtectedRoute module={MODULES.RESERVATIONS}><AdminDashboard /></ProtectedRoute>} />

        <Route path="/staff/reservation-stay-management" element={<ProtectedRoute module={MODULES.RESERVATIONS}><AdminDashboard /></ProtectedRoute>} />

        <Route path="/staff/view-reservation" element={<ProtectedRoute module={MODULES.RESERVATIONS}><AdminDashboard /></ProtectedRoute>} />

        <Route path="/staff/room-service" element={<ProtectedRoute module={[MODULES.RESERVATIONS, 'room-service']}><AdminDashboard /></ProtectedRoute>} />

        <Route path="/staff/view-order" element={<ProtectedRoute module={[MODULES.GUEST_MEAL_SERVICE, 'view-order']}><AdminDashboard /></ProtectedRoute>} />

        <Route path="/staff/guest-meal-service" element={<ProtectedRoute module={MODULES.GUEST_MEAL_SERVICE}><AdminDashboard /></ProtectedRoute>} />

        <Route path="/staff/food-menu" element={<ProtectedRoute module={MODULES.FOOD_MENU}><AdminDashboard /></ProtectedRoute>} />

        <Route path="/staff/customers" element={<ProtectedRoute module={MODULES.CUSTOMERS}><AdminDashboard /></ProtectedRoute>} />

        <Route path="/staff/settings" element={<ProtectedRoute module={MODULES.STAFF_MANAGEMENT}><AdminDashboard /></ProtectedRoute>} />

        <Route path="/staff/my-profile" element={<ProtectedRoute module={MODULES.PROFILE}><AdminDashboard /></ProtectedRoute>} />

        <Route path="/staff/cashier-report" element={<ProtectedRoute module={MODULES.CASHIER_LOGS}><AdminDashboard /></ProtectedRoute>} />

        <Route path="/staff/food-payment-report" element={<ProtectedRoute module={MODULES.PAYMENT_LOGS}><AdminDashboard /></ProtectedRoute>} />

        <Route path="/staff/cashier-section" element={<ProtectedRoute module={MODULES.CASHIER_SECTION}><AdminDashboard /></ProtectedRoute>} />

        <Route path="/staff/discount" element={<ProtectedRoute module={MODULES.PROPERTY_SETUP}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/staff/taxes" element={<ProtectedRoute module={MODULES.PROPERTY_SETUP}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/staff/tax-mapping" element={<ProtectedRoute module={MODULES.PROPERTY_SETUP}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/staff/generate-room-qr" element={<ProtectedRoute module={MODULES.PROPERTY_SETUP}><AdminDashboard /></ProtectedRoute>} />

        <Route path="/staff/room-setup" element={<ProtectedRoute module={MODULES.PROPERTY_CONFIG}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/staff/floor-setup" element={<ProtectedRoute module={MODULES.PROPERTY_CONFIG}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/staff/bed-type" element={<ProtectedRoute module={MODULES.PROPERTY_CONFIG}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/staff/room-facilities" element={<ProtectedRoute module={MODULES.PROPERTY_CONFIG}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/staff/room-facilities-type" element={<ProtectedRoute module={MODULES.PROPERTY_CONFIG}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/staff/meal-type" element={<ProtectedRoute module={MODULES.PROPERTY_CONFIG}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/staff/reservation-type" element={<ProtectedRoute module={MODULES.PROPERTY_CONFIG}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/staff/extra-charges" element={<ProtectedRoute module={MODULES.PROPERTY_CONFIG}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/staff/complimentary-services" element={<ProtectedRoute module={MODULES.PROPERTY_CONFIG}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/staff/customer-identity" element={<ProtectedRoute module={MODULES.PROPERTY_CONFIG}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/staff/booking-source" element={<ProtectedRoute module={MODULES.PROPERTY_CONFIG}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/staff/business-source" element={<ProtectedRoute module={MODULES.PROPERTY_CONFIG}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/staff/maintenance-block" element={<ProtectedRoute module={MODULES.PROPERTY_CONFIG}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/staff/table-management" element={<ProtectedRoute module={MODULES.PROPERTY_CONFIG}><AdminDashboard /></ProtectedRoute>} />


        {/* Public / Utility Routes */}
        <Route path="/qr-scan/:hotelId/:tableId" element={<QRScanPage />} />
        <Route path="/scan-qr/:roomId" element={<QRScanPage />} />
        <Route path="/food-order" element={<FoodOrderPage />} />
        <Route path="/order" element={<FoodOrderPage />} />

        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
      {!isAdminRoute && <Footer />}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App
