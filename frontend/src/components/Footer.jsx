import { Link } from "react-router-dom";
import "./footer.css";
import logo from "../assets/new logo.png"; // Using the same logo as Navbar

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="footer-container">

        <div className="footer-grid">

          {/* Brand Column */}
          <div className="footer-brand">
            <Link to="/">
              <img src={logo} alt="Bireena Atithi" className="footer-logo" />
            </Link>
            <p className="footer-description">
              Smart Hotel Management Software with KOT automation,
              billing, reporting and seamless guest experience.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-links quick-links-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/features">Features</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="footer-links">
            <h4>Services</h4>
            <ul>
              <li>Reservation Management</li>
              <li>Billing & Invoicing</li>
              <li>KOT Automation</li>
              <li>Analytics & Reports</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-contact">
            <h4>Contact Us</h4>
            <p>Email: support@bireena.com</p>
            <p>Phone: +91 98765 43210</p>

            <div className="social-icons">
              <a href="https://www.facebook.com/profile.php?id=61572904348705" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a>
              <a href="https://www.instagram.com/bireenainfo/" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
              <a href="https://www.linkedin.com/in/bireena-info-tech-a975533a1/" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin-in"></i></a>
              <a href="https://bireenainfotech.com/" target="_blank" rel="noopener noreferrer"><i className="fas fa-globe"></i></a>
            </div>
          </div>

        </div>

        <div className="footer-bottom">
          © 2026 Bireena Atithi. All rights reserved.
        </div>

      </div>
    </footer>
  );
};

export default Footer;
