import React from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import AdminNavbar from './AdminNavbar';
import './AdminLayout.css';

const AdminLayout = ({ children, activeMenu, onMenuClick, onLogout, noPadding = false }) => {
    const { sidebarOpen, setSidebarOpen } = useAuth();

    return (
        <div className="admin-layout">
            <AdminNavbar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />

            <Sidebar
                isOpen={sidebarOpen}
                toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                activeMenu={activeMenu}
                onMenuClick={onMenuClick}
                onLogout={onLogout}
            />

            <div className={`main-content ${sidebarOpen ? '' : 'full-width'} ${noPadding ? 'no-padding' : ''}`}>
                <div className={`layout-content ${noPadding ? 'no-padding' : ''}`}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
