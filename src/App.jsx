import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/rooms" element={<AdminDashboard />} />
        <Route path="/admin/reservations" element={<AdminDashboard />} />
        <Route path="/admin/guest-meal-service" element={<AdminDashboard />} />
        <Route path="/admin/food-menu" element={<AdminDashboard />} />
        <Route path="/admin/customers" element={<AdminDashboard />} />
        <Route path="/admin/settings" element={<AdminDashboard />} />
        <Route path="/admin/stay-overview" element={<AdminDashboard />} />
        <Route path="/admin/reservation-stay-management" element={<AdminDashboard />} />
        <Route path="/admin/view-reservation" element={<AdminDashboard />} />
        <Route path="/admin/room-service" element={<AdminDashboard />} />
        <Route path="/admin/view-order" element={<AdminDashboard />} />
        <Route path="/admin/my-profile" element={<AdminDashboard />} />
        <Route path="/admin/cashier-report" element={<AdminDashboard />} />
        <Route path="/admin/food-payment-report" element={<AdminDashboard />} />
        <Route path="/scan-qr/:roomId" element={<QRScanPage />} />
        <Route path="/food-order" element={<FoodOrderPage />} />
      </Routes>
    </Router>
  )
}

export default App
