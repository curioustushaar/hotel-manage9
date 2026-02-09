import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminNavbar.css'; // We'll create this or use inline/existing styles

const AdminNavbar = ({
    sidebarOpen,
    setSidebarOpen,
    showSidebarToggle = true,
    title = "Bareena"
}) => {
    const navigate = useNavigate();
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [userData, setUserData] = useState({
        name: 'Admin User',
        email: 'admin@bireena.com',
        role: 'Administrator'
    });

    // Load user data from localStorage if not provided
    useEffect(() => {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
            setUserData(JSON.parse(storedUserData));
        }
    }, []);

    const getUserInitials = (name) => {
        if (!name) return 'AU';
        const names = name.split(' ');
        if (names.length >= 2) {
            return (names[0][0] + names[names.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        navigate('/login');
    };

    const handleViewProfile = () => {
        navigate('/admin/my-profile');
        setShowProfileDropdown(false);
    };

    const handleChangePassword = () => {
        // This functionality might be tricky to abstract if it depends on dashboard state
        // For now, we'll just navigate or show a "coming soon" if not in dashboard
        // Or we can accept a prop `onChangePassword`
        navigate('/admin/settings'); // Redirect to settings for now or similar
        setShowProfileDropdown(false);
    };

    const handleComingSoon = () => {
        alert('Coming Soon!');
    };

    return (
        <div className="top-bar">
            <div className="top-bar-left">
                {showSidebarToggle && (
                    <button className="hamburger-menu" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                )}
                <h2 className="top-bar-logo">{title}</h2>
            </div>
            <div className="top-bar-right">
                <button className="top-icon-btn" onClick={handleComingSoon} title="Search">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <button className="top-icon-btn" onClick={handleComingSoon} title="Bookmarks">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <button className="top-icon-btn" onClick={handleComingSoon} title="Shopping">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <div className="profile-dropdown-wrapper">
                    <button
                        className="profile-avatar-btn"
                        onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    >
                        <div className="avatar-initials">
                            {getUserInitials(userData.name)}
                        </div>
                        <span className="dropdown-arrow">▼</span>
                    </button>

                    {showProfileDropdown && (
                        <div className="profile-dropdown">
                            <button className="dropdown-item" onClick={handleViewProfile}>
                                <span className="dropdown-icon">👤</span>
                                My Profile
                            </button>
                            {/* Removed Change Password to keep it simple, or link to settings */}
                            <button className="dropdown-item logout" onClick={handleLogout}>
                                <span className="dropdown-icon">🚪</span>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminNavbar;
