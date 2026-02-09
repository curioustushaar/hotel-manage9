import { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ isOpen, activeMenu, onMenuClick, onLogout }) => {
    const [openConfigDropdown, setOpenConfigDropdown] = useState(false);
    const [openReservationDropdown, setOpenReservationDropdown] = useState(false);

    // Initial state setup to keep dropdowns open if active item is inside
    // This could be enhanced with useEffect but keeping it simple for now

    const menuItems = [
        { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
        { id: 'rooms', icon: '🛏️', label: 'Rooms' },
        {
            id: 'reservations',
            icon: '🏨',
            label: 'Reservation & Stay Management',
            hasDropdown: true,
            dropdownItems: [
                { id: 'new-reservation', label: 'New Reservation', icon: '📅' },
                { id: 'housekeeping', label: 'Housekeeping View', icon: '🧹' },
                { id: 'room-service', label: 'Room Service', icon: '🛎️' },
                { id: 'food-order', label: 'Food Order', icon: '🍽️' }
            ]
        },
        { id: 'guest-meal-service', icon: '🍴', label: 'Guest Meal Service' },
        { id: 'food-menu', icon: '🍽️', label: 'Food Menu' },
        {
            id: 'proper-configuration',
            icon: '⚙️',
            label: 'Proper Configuration',
            hasDropdown: true,
            dropdownItems: [
                { id: 'discount', label: 'Discount', icon: '💸' },
                { id: 'taxes', label: 'Taxes', icon: '🧾' },
                { id: 'tax-mapping', label: 'Tax Mapping', icon: '🔗' },
                { id: 'generate-room-qr', label: 'Generate Room QR', icon: '📱' }
            ]
        },
        { id: 'add-booking', icon: '➕', label: 'Add Booking' },
        { id: 'customers', icon: '👥', label: 'Customers' },
        { id: 'settings', icon: '⚙️', label: 'Settings' },
        { id: 'cashier-report', icon: '💰', label: 'Cashier Report' },
        { id: 'food-payment-report', icon: '🧾', label: 'Food Payment Report' },
    ];

    const toggleDropdown = (id) => {
        if (id === 'proper-configuration') {
            setOpenConfigDropdown(!openConfigDropdown);
        } else if (id === 'reservations') {
            setOpenReservationDropdown(!openReservationDropdown);
        }
    };

    const handleItemClick = (item) => {
        if (item.hasDropdown) {
            toggleDropdown(item.id);
        } else {
            onMenuClick(item.id);
        }
    };

    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-header">
                <h2 className="sidebar-logo">Bareena</h2>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => {
                    const isOpenDropdown = item.id === 'proper-configuration' ? openConfigDropdown :
                        item.id === 'reservations' ? openReservationDropdown : false;

                    return item.hasDropdown ? (
                        <div key={item.id} className="nav-dropdown-wrapper">
                            <button
                                className={`nav-item nav-item-dropdown ${isOpenDropdown ? 'dropdown-open' : ''}`}
                                onClick={() => toggleDropdown(item.id)}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                <span className="nav-label">{item.label}</span>
                                <svg
                                    className={`dropdown-arrow ${isOpenDropdown ? 'rotated' : ''}`}
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <div className={`nav-dropdown-menu ${isOpenDropdown ? 'show' : ''}`}>
                                {item.dropdownItems.map((subItem) => {
                                    const isActive = activeMenu === subItem.id;

                                    return (
                                        <button
                                            key={subItem.id}
                                            className={`nav-dropdown-item ${isActive ? 'active' : ''}`}
                                            onClick={() => onMenuClick(subItem.id)}
                                        >
                                            <span className="nav-icon">{subItem.icon}</span>
                                            <span className="nav-label">{subItem.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <button
                            key={item.id}
                            className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
                            onClick={() => onMenuClick(item.id)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <button className="logout-btn" onClick={onLogout}>
                <span className="nav-icon">🔓</span>
                <span className="nav-label">Logout</span>
            </button>
        </div>
    );
};

export default Sidebar;
