import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import { MODULES } from './config/rbac'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import TrustedBy from './components/TrustedBy'
import Features from './components/Features'
import Marketplace from './components/Marketplace'
import Integrations from './components/Integrations'
import OutletTypes from './components/OutletTypes'
import Testimonials from './components/Testimonials'
import Ratings from './components/Ratings'
import DemoForm from './components/DemoForm'
import Footer from './components/Footer'
import Login from './pages/Login/Login'
import AdminDashboard from './pages/Dashboard/AdminDashboard'
import QRScanPage from './pages/QRScan/QRScanPage'
import FoodOrderPage from './components/FoodOrderPage'
import './index.css'

// Home Page Component
function HomePage() {
  return (
    <div className="App">
      <Navbar />
      <Hero />
      <TrustedBy />
      <Features />
      <Marketplace />
      <Integrations />
      <OutletTypes />
      <Testimonials />
      <Ratings />
      <DemoForm />
      <Footer />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
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
      </Router>
    </AuthProvider>
  )
}

export default App
