import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import { MODULES, ROLES } from './config/rbac'
import Navbar from './components/Navbar'
import TopBar from './components/TopBar'
import Hero from './components/Hero'
import FadeInSection from './components/FadeInSection'
import FloatingDashboard from './components/FloatingDashboard'
import ThreeColumnFeatures from './components/ThreeColumnFeatures'
import WhyChooseUs from './components/WhyChooseUs'
import ServicesSection from './components/ServicesSection'
import FAQSection from './components/FAQSection'
import TestimonialSection from './components/TestimonialSection'

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
import Pricing from './pages/Pricing'
import Contact from './pages/Contact'
import './index.css'

import ScrollToTop from './components/ScrollToTop'



import Reveal from './components/Reveal'

function HomePageContent() {
  return (
    <>
      <Reveal width="100%">
        <Hero />
      </Reveal>



      <Reveal width="100%">
        <WhyChooseUs />
      </Reveal>

      <Reveal width="100%">
        <ServicesSection />
      </Reveal>

      <Reveal width="100%">
        <FAQSection />
      </Reveal>

      <Reveal width="100%">
        <TestimonialSection />
      </Reveal>
    </>
  )
}

const AppRoutes = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/super-admin') ||
    location.pathname.startsWith('/secure-owner-login');

  // Manage body class for scrolling behavior
  useEffect(() => {
    if (isAdminRoute) {
      document.body.classList.remove('public-page');
    } else {
      document.body.classList.add('public-page');
    }

    return () => {
      document.body.classList.remove('public-page');
    };
  }, [isAdminRoute]);

  return (
    <div className="App">
      <ScrollToTop />
      {!isAdminRoute && (
        <>
          <TopBar />
          <Navbar />
        </>
      )}
      <div key={location.pathname} className="page-fade-in">
        <Routes location={location}>
          {/* Public Routes */}
          <Route path="/" element={<HomePageContent />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />

          {/* Super Admin Login Routes - Supporting both paths */}
          <Route path="/superadmin/login" element={<SuperAdminLogin />} />
          <Route path="/secure-owner-login" element={<SuperAdminLogin />} />

          {/* Super Admin Routes */}
          <Route path="/super-admin/dashboard" element={
            <ProtectedRoute module={MODULES.SUPER_ADMIN_DASHBOARD}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/super-admin/hotels" element={
            <ProtectedRoute module={MODULES.SUPER_ADMIN_DASHBOARD}>
              <HotelsManagement />
            </ProtectedRoute>
          } />
          <Route path="/super-admin/hotels/create" element={
            <ProtectedRoute module={MODULES.SUPER_ADMIN_DASHBOARD}>
              <CreateHotel />
            </ProtectedRoute>
          } />
          <Route path="/super-admin/hotels/:id" element={
            <ProtectedRoute module={MODULES.SUPER_ADMIN_DASHBOARD}>
              <HotelDetails />
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
          <Route path="/admin/staff" element={
            <ProtectedRoute module={MODULES.STAFF}>
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
          <Route path="/admin/food-order" element={
            <ProtectedRoute module={MODULES.FOOD_ORDER}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* New Report Routes */}
          <Route path="/admin/reports-sales" element={<ProtectedRoute module={MODULES.REPORTS_SALES}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/reports-payments" element={<ProtectedRoute module={MODULES.REPORTS_PAYMENTS}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/reports-rooms" element={<ProtectedRoute module={MODULES.REPORTS_ROOMS}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/reports-kitchen" element={<ProtectedRoute module={MODULES.REPORTS_KITCHEN}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/reports-gst" element={<ProtectedRoute module={MODULES.REPORTS_GST}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/reports-staff" element={<ProtectedRoute module={MODULES.REPORTS_STAFF}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/reports-billing" element={<ProtectedRoute module={MODULES.REPORTS_BILLING}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/reports-reservations" element={<ProtectedRoute module={MODULES.REPORTS_RESERVATIONS}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/reports-analytics" element={<ProtectedRoute module={MODULES.REPORTS_ANALYTICS}><AdminDashboard /></ProtectedRoute>} />

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
          <Route path="/admin/company-settings" element={<ProtectedRoute module={MODULES.PROPERTY_CONFIG}><AdminDashboard /></ProtectedRoute>} />

          {/* Other Routes */}
          <Route path="/scan-qr/:roomId" element={<QRScanPage />} />
          <Route path="/qr-scan/:hotelId/:tableId" element={<QRScanPage />} />
          <Route path="/food-order" element={<FoodOrderPage />} />
          <Route path="/order" element={<FoodOrderPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
        {!isAdminRoute && <Footer />}
      </div>
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
