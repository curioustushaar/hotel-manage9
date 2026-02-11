import { useState } from 'react';
import Sidebar from './Sidebar';
import AdminNavbar from './AdminNavbar';
import './AdminLayout.css';

const AdminLayout = ({ children, activeMenu, onMenuClick, onLogout }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

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

            <div className={`main-content ${sidebarOpen ? '' : 'full-width'}`}>
                <div className="layout-content">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
