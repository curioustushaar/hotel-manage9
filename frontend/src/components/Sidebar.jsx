import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { hasModuleAccess, MODULES } from '../config/rbac';
import './Sidebar.css';

// Simple Icon Components
const Icons = {
    Dashboard: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    Rooms: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>, // Actually Home icon, let's use Bed if possible or sticking to generic
    // Bed Icon for Rooms
    Bed: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 12h20M2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6M9 4v8m6-8v8m-12 4h18" /></svg>, // Simplified bed
    Reservation: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Meal: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    Menu: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
    Config: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Add: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Users: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    Settings: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>,
    Report: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    Logout: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
    Cashier: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    Dot: () => <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /></svg>
};

const Sidebar = ({ isOpen, activeMenu, onMenuClick, onLogout, toggleSidebar }) => {
    const { user } = useAuth();
    const [openConfigDropdown, setOpenConfigDropdown] = useState(false);
    const [openReservationDropdown, setOpenReservationDropdown] = useState(false);
    const [openPropertySetupDropdown, setOpenPropertySetupDropdown] = useState(false);
    const [openPropertyConfigDropdown, setOpenPropertyConfigDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');


    // Helper function to check if user has access to a module
    const canAccessModule = (moduleId) => {
        if (!user) return false;
        return hasModuleAccess(user, moduleId);
    };

    const toggleDropdown = (id) => {
        if (id === 'proper-configuration') {
            setOpenConfigDropdown(!openConfigDropdown);
        } else if (id === 'reservations') {
            setOpenReservationDropdown(!openReservationDropdown);
        } else if (id === 'property-setup') {
            setOpenPropertySetupDropdown(!openPropertySetupDropdown);
        } else if (id === 'property-configuration') {
            setOpenPropertyConfigDropdown(!openPropertyConfigDropdown);
        }
    };


    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const clearSearch = () => {
        setSearchQuery('');
    };

    const menuItems = [
        { id: MODULES.DASHBOARD, iconVal: <Icons.Dashboard />, label: 'Dashboard' },
        { id: MODULES.ROOMS, iconVal: <Icons.Bed />, label: 'Rooms' },
        {
            id: MODULES.RESERVATIONS,
            iconVal: <Icons.Reservation />,
            label: 'Reservations',
            hasDropdown: true,
            dropdownItems: [
                { id: 'reservations-dashboard', label: 'Dashboard', iconVal: <Icons.Dot /> },
                { id: 'new-reservation', label: 'New Reservation', iconVal: <Icons.Dot /> },
                { id: 'housekeeping', label: 'Housekeeping View', iconVal: <Icons.Dot /> },
                { id: 'room-service', label: 'Room Service', iconVal: <Icons.Dot /> },
                { id: 'food-order', label: 'Food Order', iconVal: <Icons.Dot /> }
            ]
        },
        { id: MODULES.CASHIER_SECTION, iconVal: <Icons.Cashier />, label: 'Cashier Section' },
        { id: MODULES.GUEST_MEAL_SERVICE, iconVal: <Icons.Meal />, label: 'Table View' },
        { id: MODULES.FOOD_MENU, iconVal: <Icons.Menu />, label: 'Food Menu' },
        {
            id: MODULES.PROPERTY_SETUP,
            iconVal: <Icons.Config />,
            label: 'Property Setup',
            hasDropdown: true,
            dropdownItems: [
                { id: 'discount', label: 'Discount', iconVal: <Icons.Dot /> },
                { id: 'taxes', label: 'Taxes', iconVal: <Icons.Dot /> },
                { id: 'tax-mapping', label: 'Tax Mapping', iconVal: <Icons.Dot /> },
                { id: 'generate-room-qr', label: 'Generate Room QR', iconVal: <Icons.Dot /> }
            ]
        },
        {
            id: MODULES.PROPERTY_CONFIG,
            iconVal: <Icons.Config />,
            label: 'Property Configuration',
            hasDropdown: true,
            dropdownItems: [
                { id: 'room-setup', label: 'Room Setup', iconVal: <Icons.Dot /> },
                { id: 'floor-setup', label: 'Floor Setup', iconVal: <Icons.Dot /> },
                { id: 'bed-type', label: 'Bed Type', iconVal: <Icons.Dot /> },

                { id: 'room-facilities-type', label: 'Room Facilities Type', iconVal: <Icons.Dot /> },
                { id: 'meal-type', label: 'Meal Type', iconVal: <Icons.Dot /> },
                { id: 'reservation-type', label: 'Reservation Type', iconVal: <Icons.Dot /> },
                { id: 'extra-charges', label: 'Extra Charges', iconVal: <Icons.Dot /> },
                { id: 'complimentary-services', label: 'Complimentary Services', iconVal: <Icons.Dot /> },
                { id: 'customer-identity', label: 'Customer Identity', iconVal: <Icons.Dot /> },
                { id: 'booking-source', label: 'Booking Source', iconVal: <Icons.Dot /> },
                { id: 'business-source', label: 'Business Source', iconVal: <Icons.Dot /> },
                { id: 'hotel-customer', label: 'Hotel Customer', iconVal: <Icons.Dot /> },
                { id: 'housekeeping-config', label: 'House Keeping', iconVal: <Icons.Dot /> },
                { id: 'maintenance-block', label: 'Maintenance Block', iconVal: <Icons.Dot /> },
                { id: 'screen-field-rule', label: 'Screen Field Rule', iconVal: <Icons.Dot /> },
                { id: 'company', label: 'Company', iconVal: <Icons.Dot /> }
            ]
        },
        { id: MODULES.CUSTOMERS, iconVal: <Icons.Users />, label: 'Customer List' },
        { id: MODULES.STAFF_MANAGEMENT, iconVal: <Icons.Settings />, label: 'Add Staff' },
        { id: MODULES.CASHIER_LOGS, iconVal: <Icons.Report />, label: 'Cashier Logs' },
        { id: MODULES.PAYMENT_LOGS, iconVal: <Icons.Report />, label: 'Payment Logs' },
    ];

    // Filter items based on role access FIRST - Check parent OR any child access
    const roleFilteredItems = menuItems.filter(item => {
        // If it has children, show if parent works OR any child works
        if (item.hasDropdown) {
            const hasParentAccess = canAccessModule(item.id);
            // Also check children accessibility
            const hasChildAccess = item.dropdownItems.some(sub => canAccessModule(sub.id));
            return hasParentAccess || hasChildAccess;
        }
        // Simple item
        return canAccessModule(item.id);
    });

    const filteredItems = searchQuery
        ? roleFilteredItems.filter(item =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.hasDropdown && item.dropdownItems.some(sub => sub.label.toLowerCase().includes(searchQuery.toLowerCase())))
        )
        : roleFilteredItems;

    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            {/* Search Box per Image 2 */}
            <div className="sidebar-search-container">
                <div className="sidebar-search-box">
                    <svg className="sidebar-search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        className="sidebar-search-input"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                    {searchQuery && (
                        <span className="sidebar-search-close" onClick={clearSearch}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </span>
                    )}
                </div>
                {/* Close Button Next to Search */}
                <button
                    className="sidebar-close-btn"
                    onClick={toggleSidebar}
                    type="button"
                    title="Close Sidebar"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <nav className="sidebar-nav">
                {filteredItems.map((item) => {
                    const isOpenDropdown = item.id === 'proper-configuration' ? openConfigDropdown :
                        item.id === 'reservations' ? openReservationDropdown :
                            item.id === 'property-setup' ? openPropertySetupDropdown :
                                item.id === 'property-configuration' ? openPropertyConfigDropdown : false;


                    // If searching, auto-expand if matched
                    const isSearchMatch = searchQuery && item.hasDropdown && item.dropdownItems.some(sub => sub.label.toLowerCase().includes(searchQuery.toLowerCase()));
                    const showDropdown = isOpenDropdown || isSearchMatch;

                    return item.hasDropdown ? (
                        <div key={item.id} className="nav-dropdown-wrapper">
                            <button
                                className={`nav-item nav-item-dropdown ${showDropdown ? 'dropdown-open' : ''} ${!searchQuery && activeMenu === item.id ? 'active' : ''}`}
                                onClick={() => toggleDropdown(item.id)}
                            >
                                <span className="nav-icon">{item.iconVal}</span>
                                <span className="nav-label">{item.label}</span>
                                <svg
                                    className={`dropdown-arrow ${showDropdown ? 'rotated' : ''}`}
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <div className={`nav-dropdown-menu ${showDropdown ? 'show' : ''}`}>
                                {item.dropdownItems.map((subItem) => {
                                    if (searchQuery && !subItem.label.toLowerCase().includes(searchQuery.toLowerCase())) return null;

                                    // Check permission for sub-item - allow if parent module (item.id) is authorized
                                    const hasSubAccess = canAccessModule(subItem.id) || canAccessModule(item.id);
                                    if (!hasSubAccess) return null;

                                    const isActive = activeMenu === subItem.id;
                                    return (
                                        <button
                                            key={subItem.id}
                                            className={`nav-dropdown-item ${isActive ? 'active' : ''}`}
                                            onClick={() => onMenuClick(subItem.id)}
                                        >
                                            <span className="nav-icon">{subItem.iconVal}</span>
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
                            <span className="nav-icon">{item.iconVal}</span>
                            <span className="nav-label">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <button className="logout-btn" onClick={onLogout}>
                <span className="nav-icon"><Icons.Logout /></span>
                <span className="nav-label">Logout</span>
            </button>
        </div>
    );
};

export default Sidebar;
