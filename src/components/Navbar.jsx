import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
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

    const toggleDropdown = (dropdownId) => {
        setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
    };

    const handleMouseEnter = (dropdownId) => {
        if (window.innerWidth > 900) {
            setOpenDropdown(dropdownId);
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

                        <ul className="nav-menu">
                            <li
                                className={`dropdown ${openDropdown === 'hms' ? 'open' : ''}`}
                                onMouseEnter={() => handleMouseEnter('hms')}
                                onMouseLeave={handleMouseLeave}
                            >
                                <button
                                    type="button"
                                    className="dropdown-toggle"
                                    onClick={() => toggleDropdown('hms')}
                                    aria-expanded={openDropdown === 'hms'}
                                >
                                    Bireena Atithi
                                    <svg className="dropdown-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                                <div className="dropdown-panel" aria-hidden={openDropdown !== 'hms'}>
                                    <ul className="panel-list">
                                        <li><a className="panel-link" href="/sections/billing.html"><span className="left"><span>Billing</span></span></a></li>
                                        <li><a className="panel-link" href="/sections/inventory.html"><span className="left"><span>Inventory</span></span></a></li>
                                        <li><a className="panel-link" href="/sections/online-ordering.html"><span className="left"><span>Online ordering</span></span></a></li>
                                        <li><a className="panel-link" href="/sections/reporting.html"><span className="left"><span>Reporting</span></span></a></li>
                                        <li><a className="panel-link" href="/sections/menu.html"><span className="left"><span>Menu</span></span></a></li>
                                        <li><a className="panel-link" href="/sections/crm.html"><span className="left"><span>CRM</span></span></a></li>
                                    </ul>
                                </div>
                            </li>

                            <li
                                className={`dropdown ${openDropdown === 'addons' ? 'open' : ''}`}
                                onMouseEnter={() => handleMouseEnter('addons')}
                                onMouseLeave={handleMouseLeave}
                            >
                                <button
                                    type="button"
                                    className="dropdown-toggle"
                                    onClick={() => toggleDropdown('addons')}
                                    aria-expanded={openDropdown === 'addons'}
                                >
                                    Add-ons
                                    <svg className="dropdown-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                                <div className="dropdown-panel" aria-hidden={openDropdown !== 'addons'}>
                                    <ul className="panel-list simple">
                                        <li><a className="panel-link has-arrow" href="/sections/marketplace.html"><span className="left">Marketplace</span></a></li>
                                        <li><a className="panel-link has-arrow" href="/sections/integration.html"><span className="left">Integration</span></a></li>
                                    </ul>
                                </div>
                            </li>

                            <li
                                className={`dropdown ${openDropdown === 'types' ? 'open' : ''}`}
                                onMouseEnter={() => handleMouseEnter('types')}
                                onMouseLeave={handleMouseLeave}
                            >
                                <button
                                    type="button"
                                    className="dropdown-toggle"
                                    onClick={() => toggleDropdown('types')}
                                    aria-expanded={openDropdown === 'types'}
                                >
                                    Outlet types
                                    <svg className="dropdown-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                                <div className="dropdown-panel wide" aria-hidden={openDropdown !== 'types'}>
                                    <div className="types-grid">
                                        <a className="panel-link type-link has-arrow" href="/sections/fine-dine.html"><span className="left"><span>Fine dine</span></span></a>
                                        <a className="panel-link type-link has-arrow" href="/sections/qsr.html"><span className="left"><span>QSR</span></span></a>
                                        <a className="panel-link type-link has-arrow" href="/sections/cafe.html"><span className="left"><span>Cafe</span></span></a>
                                        <a className="panel-link type-link has-arrow" href="/sections/food-courts.html"><span className="left"><span>Food court</span></span></a>
                                        <a className="panel-link type-link has-arrow" href="/sections/cloud-kitchen.html"><span className="left"><span>Cloud kitchen</span></span></a>
                                        <a className="panel-link type-link has-arrow" href="/sections/desserts.html"><span className="left"><span>Ice cream & desserts</span></span></a>
                                        <a className="panel-link type-link has-arrow" href="/sections/bakery.html"><span className="left"><span>Bakery</span></span></a>
                                        <a className="panel-link type-link has-arrow" href="/sections/bar-brewery.html"><span className="left"><span>Bar & brewery</span></span></a>
                                        <a className="panel-link type-link has-arrow" href="/sections/pizzeria.html"><span className="left"><span>Pizzeria</span></span></a>
                                        <a className="panel-link type-link has-arrow" href="/sections/large-chains.html"><span className="left"><span>Large chain</span></span></a>
                                    </div>
                                </div>
                            </li>

                            <li className="pricing-li"><a href="/sections/pricing.html">Pricing</a></li>
                        </ul>

                        <div className="nav-secondary">
                            <div
                                className={`dropdown resources-dropdown ${openDropdown === 'resources' ? 'open' : ''}`}
                                onMouseEnter={() => handleMouseEnter('resources')}
                                onMouseLeave={handleMouseLeave}
                            >
                                <button
                                    type="button"
                                    className="dropdown-toggle"
                                    onClick={() => toggleDropdown('resources')}
                                    aria-expanded={openDropdown === 'resources'}
                                >
                                    Resources
                                    <svg className="dropdown-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                                <div className="dropdown-panel align-right" aria-hidden={openDropdown !== 'resources'}>
                                    <ul className="panel-list resources-list">
                                        <li><a className="panel-link has-arrow" href="/sections/blogs.html"><span className="left"><span>Blogs</span></span></a></li>
                                        <li><a className="panel-link has-arrow" href="/sections/webinars.html"><span className="left"><span>Webinars</span></span></a></li>
                                        <li><a className="panel-link has-arrow" href="/sections/support.html"><span className="left"><span>Support</span></span></a></li>
                                    </ul>
                                </div>
                            </div>

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
}

export default Navbar;
