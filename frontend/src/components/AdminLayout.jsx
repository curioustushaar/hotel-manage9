import { motion, AnimatePresence } from 'framer-motion';
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
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeMenu}
                        initial={{ opacity: 0, scale: 0.99, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.99, y: -5 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={`layout-content ${noPadding ? 'no-padding' : ''}`}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminLayout;
