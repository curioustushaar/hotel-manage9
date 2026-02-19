import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
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
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/superadmin');

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
        <Route path="/superadmin/dashboard" element={
          <ProtectedRoute role={ROLES.SUPER_ADMIN}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/superadmin/hotels" element={
          <ProtectedRoute role={ROLES.SUPER_ADMIN}>
            <HotelsManagement />
          </ProtectedRoute>
        } />
        <Route path="/superadmin/hotels/create" element={
          <ProtectedRoute role={ROLES.SUPER_ADMIN}>
            <CreateHotel />
          </ProtectedRoute>
        } />
        <Route path="/superadmin/hotels/:id" element={
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
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App
