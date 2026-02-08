import { motion, AnimatePresence } from 'framer-motion';
import './Drawer.css';

const Drawer = ({ isOpen, onClose, title, children, height = '600px' }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="drawer-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Drawer */}
                    <motion.div
                        className="drawer-container"
                        style={{ height: height }}
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        {/* Header */}
                        <div className="drawer-header">
                            <h2 className="drawer-title">{title}</h2>
                            <button className="drawer-close-btn" onClick={onClose}>
                                ✕
                            </button>
                        </div>

                        {/* Content - Scrollable */}
                        <div className="drawer-content">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default Drawer;
