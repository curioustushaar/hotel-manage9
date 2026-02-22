import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import soundManager from '../utils/soundManager';
import RoleBadge from './RoleBadge';
import { hasModuleAccess, MODULES } from '../config/rbac';
import './AdminNavbar.css';

const AdminNavbar = ({
    sidebarOpen,
    setSidebarOpen,
    showSidebarToggle = true,
    title = "BIREENA ATITHI"
}) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth(); // Get current user and logout function
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(soundManager.isEnabled());

    const toggleSound = () => {
        const newState = !soundEnabled;
        setSoundEnabled(newState);
        soundManager.toggle(newState);
    };

    // Dynamic user initials
    const userInitials = user?.name ? (
        user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    ) : "ST";

    const handleLogout = () => {
        logout(); // Use centralized logout from AuthContext
        navigate('/login');
    };

    const handleViewProfile = () => {
        navigate('/admin/my-profile');
        setShowProfileDropdown(false);
    };

    const topBarTitle = user?.role === 'staff' ? "STAFF PORTAL" : title;

    return (
        <div className={`top-bar ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <div className="top-bar-left">
                {showSidebarToggle && !sidebarOpen && (
                    <button className="hamburger-menu" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                )}
                <div className="top-bar-logo">
                    {topBarTitle}
                </div>

            </div>

            <div className="top-bar-right">
                {/* 1. Stay Overview Icon */}
                {hasModuleAccess(user, MODULES.RESERVATIONS) && (
                    <button className="top-icon-btn" title="Reservations" onClick={() => navigate('/admin/stay-overview')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                        </svg>
                    </button>
                )}

                {/* 2. Guest Meal Service Icon */}
                {hasModuleAccess(user, MODULES.GUEST_MEAL_SERVICE) && (
                    <button className="top-icon-btn" title="Orders" onClick={() => navigate('/admin/guest-meal-service')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                            <path d="M3 6h18" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                    </button>
                )}

                {/* 3. Notification/Alert Icon */}
                <button className="top-icon-btn" title="Notifications">
                    <div className="icon-with-badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                        <span className="badge-dot"></span>
                    </div>
                </button>

                {/* 4. Sound Toggle */}
                <button
                    className="top-icon-btn"
                    title={soundEnabled ? "Mute Sounds" : "Enable Sounds"}
                    onClick={toggleSound}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {soundEnabled ? (
                            <>
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                            </>
                        ) : (
                            <>
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                <line x1="23" y1="9" x2="17" y2="15"></line>
                                <line x1="17" y1="9" x2="23" y2="15"></line>
                            </>
                        )}
                    </svg>
                </button>

                {/* 5. Sync Icon */}
                {user?.role === 'admin' && (
                    <button className="top-icon-btn" title="Sync Data" onClick={() => alert('Syncing...')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <polyline points="1 20 1 14 7 14"></polyline>
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                        </svg>
                    </button>
                )}

                {/* Role Badge */}
                <RoleBadge />

                {/* Avatar with Profile Dropdown */}
                <div className="profile-dropdown-wrapper">
                    <div
                        className="profile-trigger"
                        onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                        title="Profile"
                    >
                        <div className="profile-avatar">
                            {userInitials}
                        </div>
                        <svg className="profile-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m6 9 6 6 6-6" />
                        </svg>
                    </div>

                    {showProfileDropdown && (
                        <div className="profile-dropdown">
                            <button className="dropdown-item" onClick={handleViewProfile}>
                                👤 My Profile
                            </button>
                            <button className="dropdown-item logout" onClick={handleLogout}>
                                🚪 Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminNavbar;
