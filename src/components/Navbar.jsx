import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RoleBadge from './RoleBadge';
import './Navbar.css';

function Navbar() {
    const { user } = useAuth();
    const location = useLocation();
    const [sidebarActive, setSidebarActive] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);

    const toggleSidebar = () => {
        setSidebarActive(!sidebarActive);
        if (!sidebarActive) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
    };

    const toggleDropdown = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };

    const handleMouseEnter = (id) => {
        if (window.innerWidth > 900) {
            setOpenDropdown(id);
        }
    };

    const handleMouseLeave = () => {
        if (window.innerWidth > 900) {
            setOpenDropdown(null);
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
                    <Link
                        to="/"
                        className="logo"
                        onClick={() => window.scrollTo(0, 0)}
                    >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 13.87C4.31 13.12 3.25 11.53 3.5 9.77C3.76 7.91 5.38 6.54 7.26 6.54C7.54 6.54 7.82 6.57 8.08 6.63C8.62 3.96 11.08 2 14 2C17.31 2 20 4.69 20 8C20 8.35 19.96 8.69 19.89 9.03C21.43 9.94 22.34 11.64 22.09 13.43C21.82 15.35 20.15 16.71 18.23 16.71H17V19C17 20.66 15.66 22 14 22H9C7.34 22 6 20.66 6 19V17H5.77C5.83 15.89 5.86 14.86 6 13.87ZM8 17H15V19C15 19.55 14.55 20 14 20H9C8.45 20 8 19.55 8 19V17Z" fill="#e11d48" />
                        </svg>
                        BIREENA ATITHI
                    </Link>

                    <button
                        className="hamburger"
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
                    >
                        <button className="close-btn" onClick={toggleSidebar}>×</button>

                        <ul className="nav-menu">
                            <li
                                className="nav-item"
                                onMouseEnter={() => handleMouseEnter('bireena')}
                                onMouseLeave={handleMouseLeave}
                            >
                                <button className="dropdown-toggle" onClick={() => toggleDropdown('bireena')}>
                                    Bireena Atithi
                                    <svg className="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                                </button>
                            </li>
                            <li
                                className="nav-item"
                                onMouseEnter={() => handleMouseEnter('addons')}
                                onMouseLeave={handleMouseLeave}
                            >
                                <button className="dropdown-toggle" onClick={() => toggleDropdown('addons')}>
                                    Add-ons
                                    <svg className="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                                </button>
                            </li>
                            <li
                                className="nav-item"
                                onMouseEnter={() => handleMouseEnter('outlets')}
                                onMouseLeave={handleMouseLeave}
                            >
                                <button className="dropdown-toggle" onClick={() => toggleDropdown('outlets')}>
                                    Outlet types
                                    <svg className="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                                </button>
                            </li>
                            <li className="nav-item">
                                <Link to="/pricing" className="nav-link">Pricing</Link>
                            </li>
                            <li
                                className="nav-item"
                                onMouseEnter={() => handleMouseEnter('resources')}
                                onMouseLeave={handleMouseLeave}
                            >
                                <button className="dropdown-toggle" onClick={() => toggleDropdown('resources')}>
                                    Resources
                                    <svg className="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                                </button>
                            </li>
                        </ul>

                        <div className="nav-secondary">
                            <Link to="/login" className="demo-btn">Book a free demo</Link>
                        </div>
                    </nav>
                </div>
            </header>

            <div
                className={`menu-overlay ${sidebarActive ? 'active' : ''}`}
                onClick={toggleSidebar}
            ></div>
        </>
    );
}

export default Navbar;
