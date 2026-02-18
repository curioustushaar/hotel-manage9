import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import soundManager from '../utils/soundManager';
import RoleBadge from './RoleBadge';
import './AdminNavbar.css';

const AdminNavbar = ({
    sidebarOpen,
    setSidebarOpen,
    showSidebarToggle = true,
    title = "BIREENA ATITHI"
}) => {
    const navigate = useNavigate();
    const { user } = useAuth(); // Get current user
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(soundManager.isEnabled());

    const toggleSound = () => {
        const newState = !soundEnabled;
        setSoundEnabled(newState);
        soundManager.toggle(newState);
    };

    // Hardcoded user initials as per Image 2 (HY)
    const userInitials = "HY";

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        navigate('/login');
    };

    const handleViewProfile = () => {
        navigate('/admin/my-profile');
        setShowProfileDropdown(false);
    };

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
                    {/* Chef Hat Icon - Dark Grey to match text */}
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 13.87C4.31 13.12 3.25 11.53 3.5 9.77C3.76 7.91 5.38 6.54 7.26 6.54C7.54 6.54 7.82 6.57 8.08 6.63C8.62 3.96 11.08 2 14 2C17.31 2 20 4.69 20 8C20 8.35 19.96 8.69 19.89 9.03C21.43 9.94 22.34 11.64 22.09 13.43C21.82 15.35 20.15 16.71 18.23 16.71H17V19C17 20.66 15.66 22 14 22H9C7.34 22 6 20.66 6 19V17H5.77C5.83 15.89 5.86 14.86 6 13.87ZM8 17H15V19C15 19.55 14.55 20 14 20H9C8.45 20 8 19.55 8 19V17Z" fill="#374151" />
                    </svg>
                    {title}
                </div>
            </div>

            <div className="top-bar-right">
                {/* Sound Toggle */}
                <button
                    className="top-icon-btn"
                    title={soundEnabled ? "Mute Sounds" : "Enable Sounds"}
                    onClick={toggleSound}
                    style={{ marginRight: '10px' }}
                >
                    <span style={{ fontSize: '18px' }}>{soundEnabled ? '🔊' : '🔇'}</span>
                </button>

                {/* Icons from Image 2: Monitor, Gear, H, Mail, Avatar */}
                {/* 1. Monitor Icon */}
                <button className="top-icon-btn" title="Guest Meal Service" onClick={() => navigate('/admin/guest-meal-service')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                        <line x1="8" y1="21" x2="16" y2="21"></line>
                        <line x1="12" y1="17" x2="12" y2="21"></line>
                    </svg>
                </button>

                {/* 2. View Order Icon */}
                <button className="top-icon-btn" title="View Order" onClick={() => navigate('/admin/view-order')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                        <path d="M3 6h18" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                </button>

                {/* 3. Registration Icon */}
                <button className="top-icon-btn" title="Registration Card" onClick={() => navigate('/admin/stay-overview')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4" />
                        <path d="M8 9h8" />
                        <path d="M8 13h4" />
                        <path d="M15 13h1" />
                        <path d="M17 17h.01" />
                    </svg>
                </button>

                {/* 4. Sync Icon */}
                <button className="top-icon-btn" title="Sync Data" onClick={() => alert('Coming Soon...')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                        <path d="M21 3v5h-5" />
                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                        <path d="M3 21v-5h5" />
                    </svg>
                </button>

                {/* 5. Gear Icon */}
                <button className="top-icon-btn" title="Settings" onClick={() => navigate('/admin/settings')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                </button>

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
                        <svg className="profile-caret" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7 10l5 5 5-5z" />
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
