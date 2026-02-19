import { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Link } from 'react-router-dom';
import './Navbar.css';
import Logo from '../assets/new logo.png';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/features', label: 'Features' },
  { to: '/#pricing', label: 'Pricing' },
  { to: '/#contact', label: 'Contact Us' },
];

function Navbar() {
  const [sidebarActive, setSidebarActive] = useState(false);

  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  const closeSidebar = () => {
    setSidebarActive(false);
  };

  useEffect(() => {
    if (sidebarActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [sidebarActive]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900 && sidebarActive) {
        closeSidebar();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.style.overflow = 'auto';
    };
  }, [sidebarActive]);

  return (
    <>
      <header className="navbar landing-navbar">
        <div className="container nav-flex">
          <Link to="/" className="logo-link" onClick={() => { window.scrollTo(0, 0); closeSidebar(); }}>
            <img src={Logo} alt="Bireena Atithi" className="navbar-logo" />
          </Link>

          <button className="hamburger" onClick={toggleSidebar} aria-label="Open menu">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          <nav id="sidebarNav" className={sidebarActive ? 'active' : ''}>
            <ul className="nav-menu">
              {NAV_LINKS.map(({ to, label }) => (
                <li key={to} className="nav-item">
                  <Link to={to} className="nav-link" onClick={closeSidebar}>{label}</Link>
                </li>
              ))}
            </ul>
            <div className="nav-secondary">
              <Link to="/login" className="demo-btn" onClick={closeSidebar}>Book a Free Demo</Link>
            </div>
          </nav>
        </div>
      </header>
      <div className={`menu-overlay ${sidebarActive ? 'active' : ''}`} onClick={closeSidebar} aria-hidden="true" />
    </>
  );
=======
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RoleBadge from './RoleBadge';

function Navbar() {
    const { user } = useAuth();
    const location = useLocation();
    const [sidebarActive, setSidebarActive] = useState(false);

    // Show role badge only on authenticated pages (not on landing/login pages)
    const shouldShowRoleBadge = user && (
        location.pathname.startsWith('/admin') ||
        location.pathname === '/dashboard' ||
        location.pathname.startsWith('/rooms') ||
        location.pathname.startsWith('/reservations') ||
        location.pathname.startsWith('/cashier') ||
        location.pathname.startsWith('/table-view') ||
        location.pathname.startsWith('/food-menu')
    );

    const toggleSidebar = () => {
        setSidebarActive(!sidebarActive);
        if (!sidebarActive) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 900 && sidebarActive) {
                setSidebarActive(false);
                document.body.classList.remove('no-scroll');
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [sidebarActive]);

    return (
        <>
            <header className="navbar">
                <div className="container nav-flex">
                    <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 13.87C4.31 13.12 3.25 11.53 3.5 9.77C3.76 7.91 5.38 6.54 7.26 6.54C7.54 6.54 7.82 6.57 8.08 6.63C8.62 3.96 11.08 2 14 2C17.31 2 20 4.69 20 8C20 8.35 19.96 8.69 19.89 9.03C21.43 9.94 22.34 11.64 22.09 13.43C21.82 15.35 20.15 16.71 18.23 16.71H17V19C17 20.66 15.66 22 14 22H9C7.34 22 6 20.66 6 19V17H5.77C5.83 15.89 5.86 14.86 6 13.87ZM8 17H15V19C15 19.55 14.55 20 14 20H9C8.45 20 8 19.55 8 19V17Z" fill="#374151" />
                        </svg>
                        BIREENA ATITHI
                    </Link>

                    <button
                        className="hamburger"
                        id="openMenu"
                        onClick={toggleSidebar}
                        aria-label="Open menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>

                    <nav
                        id="sidebarNav"
                        className={sidebarActive ? 'active' : ''}
                        aria-hidden={!sidebarActive}
                    >
                        <button
                            className="close-btn"
                            onClick={toggleSidebar}
                            aria-label="Close menu"
                        >
                            ×
                        </button>

                        <div className="nav-secondary">
                            {shouldShowRoleBadge && <RoleBadge />}
                            <Link to="/login" className="demo-btn nav-demo-btn" style={{ textDecoration: 'none', color: 'inherit' }}>Book a free demo</Link>
                        </div>
                    </nav>
                </div>
            </header >

            <div
                className={`menu-overlay ${sidebarActive ? 'active' : ''}`}
                onClick={toggleSidebar}
            ></div>
        </>
    );
>>>>>>> main
}

export default Navbar;
