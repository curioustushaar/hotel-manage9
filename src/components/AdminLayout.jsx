import { useState } from 'react';
import Sidebar from './Sidebar';
import AdminNavbar from './AdminNavbar';
import './AdminLayout.css'; // We'll create this or reuse existing styles through className

const AdminLayout = ({ children, activeMenu, onMenuClick, onLogout }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="admin-layout">
            <Sidebar
                isOpen={sidebarOpen}
                activeMenu={activeMenu}
                onMenuClick={onMenuClick}
                onLogout={onLogout}
            />

            <div className={`main-content ${sidebarOpen ? '' : 'full-width'}`}>
                <AdminNavbar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />

                <div className="layout-content">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
