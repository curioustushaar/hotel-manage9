import { Link } from "react-router-dom";
import "./footer.css";
import logo from "../assets/new logo.png"; // Using the same logo as Navbar

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-top">
          {/* Bireena Atithi */}
          <div className="footer-col">
            <h4>Bireena Atithi</h4>
            <ul>
              <li><Link to="/">Billing</Link></li>
              <li><Link to="/">Inventory</Link></li>
              <li><Link to="/">Reporting</Link></li>
              <li><Link to="/">Online Ordering</Link></li>
              <li><Link to="/">CRM</Link></li>
              <li><Link to="/">Menu</Link></li>
            </ul>
            <Link to="/login" className="footer-btn">Take a free demo</Link>
          </div>

          {/* Add-ons */}
          <div className="footer-col">
            <h4>Add-ons</h4>
            <ul>
              <li><Link to="/">Marketplace</Link></li>
              <li><Link to="/">Integrations</Link></li>
            </ul>
          </div>

          {/* Outlet types */}
          <div className="footer-col">
            <h4>Outlet types</h4>
            <ul>
              <li><Link to="/">Fine Dine</Link></li>
              <li><Link to="/">QSR</Link></li>
              <li><Link to="/">Cafe</Link></li>
              <li><Link to="/">Food Court</Link></li>
              <li><Link to="/">Cloud Kitchen</Link></li>
              <li><Link to="/">Ice Cream</Link></li>
              <li><Link to="/">Bakery</Link></li>
              <li><Link to="/">Bar & Brewery</Link></li>
              <li><Link to="/">Pizzeria</Link></li>
              <li><Link to="/">Large Chains</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/features">Features</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
              <li><Link to="/contact">Support</Link></li>
              <li><Link to="/">Careers</Link></li>
              <li><Link to="/">Magazine</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="footer-col footer-company">
            <img src={logo} alt="Bireena Atithi" className="footer-logo-img" style={{ width: '180px', marginBottom: '10px' }} />
            <p>
              B-36, Anisabad,<br />
              Patna, Bihar, India<br />
              800002
            </p>
            <div className="footer-contact-info">
              <p>Email: bireenainfo@gmail.com</p>
              <p>Phone: +91 91351 55931</p>
            </div>
            <div className="social-icons">
              <a href="https://www.facebook.com/profile.php?id=61572904348705" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a>
              <a href="https://www.instagram.com/bireenainfo/" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
              <a href="https://www.linkedin.com/in/bireena-info-tech-a975533a1/" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            COPYRIGHT © 2026 – Bireena Atithi Food Services Pvt. Ltd., India ·
            <Link to="/">Privacy</Link> ·
            <Link to="/">Compliance</Link> ·
            <Link to="/">Terms</Link> ·
            <Link to="/">EULA</Link> ·
            <Link to="/">Cancellation & Refund</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
