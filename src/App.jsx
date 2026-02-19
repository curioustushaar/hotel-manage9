import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import { MODULES } from './config/rbac'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import FloatingDashboard from './components/FloatingDashboard'
import ThreeColumnFeatures from './components/ThreeColumnFeatures'
import WhyChooseUs from './components/WhyChooseUs'
import ServicesSection from './components/ServicesSection'
import FAQSection from './components/FAQSection'
import TestimonialSection from './components/TestimonialSection'
import Footer from './components/Footer'




import Login from './pages/Login/Login'
import AdminDashboard from './pages/Dashboard/AdminDashboard'
import QRScanPage from './pages/QRScan/QRScanPage'
import FoodOrderPage from './components/FoodOrderPage'
import FadeInSection from './components/FadeInSection'
import About from './pages/About'
import Features from './pages/Features'
import './index.css'

// Home Page Component - Reference layout: Hero, Trusted By, Features, Screenshots, CTA, Footer
// Home Page Content Component - Reference layout: Hero, Trusted By, Features, Screenshots, CTA, Footer
function HomePageContent() {
  return (
    <>
      <FadeInSection>
        <Hero />
      </FadeInSection>

      <FadeInSection delay={0.1}>
        <FloatingDashboard />
      </FadeInSection>

      <FadeInSection delay={0.1}>
        <ThreeColumnFeatures />
      </FadeInSection>

      <FadeInSection delay={0.1}>
        <WhyChooseUs />
      </FadeInSection>

      <ServicesSection />

      <FAQSection />

      <TestimonialSection />
    </>
  )
}

import useGlobalClickSound from './hooks/useGlobalClickSound';
import useTypingSound from './hooks/useTypingSound';

// Helper component to handle conditional navbar and routes
const AppRoutes = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="App">
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePageContent />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<HomePageContent />} />
        <Route path="/contact" element={<HomePageContent />} />
        <Route path="/login" element={<Login />} />

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

        {/* Public Routes */}
        <Route path="/scan-qr/:roomId" element={<QRScanPage />} />
        <Route path="/food-order" element={<FoodOrderPage />} />
      </Routes>
      {!isAdminRoute && <Footer />}
    </div>
  );
};

function App() {
  useGlobalClickSound();
  useTypingSound();

  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App
