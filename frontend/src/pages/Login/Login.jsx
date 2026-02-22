import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { ROLES, getDefaultRoute } from '../../config/rbac';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { login, user, isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState('admin');
    const [loading, setLoading] = useState(false);

    // Redirect if already logged in (Guest Guard) - Client requested to check/fix login page visibility
    // useEffect(() => {
    //     if (isAuthenticated() && user) {
    //         const defaultRoute = getDefaultRoute(user.role);
    //         navigate(defaultRoute, { replace: true });
    //     }
    // }, [isAuthenticated, user, navigate]);
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    // const [showQuickLogin, setShowQuickLogin] = useState(true); // Removed for security
    const [formData, setFormData] = useState({
        admin_email: '',
        admin_password: '',
        staff_id: '',
        staff_password: ''
    });

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: 'easeOut' },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: 'easeOut' },
        }
    };

    const imageVariants = {
        hidden: { opacity: 0, x: -50 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.7, ease: 'easeOut' },
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(''); // Clear error on input change
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const email = activeTab === 'admin' ? formData.admin_email : formData.staff_id;
        const password = activeTab === 'admin' ? formData.admin_password : formData.staff_password;

        const result = await login(email, password);

        if (result.success) {
            // Smart redirect based on user's first accessible page
            const defaultRoute = getDefaultRoute(result.user);
            navigate(defaultRoute);
        } else {
            setError(result.error);
            setLoading(false);
        }
    };

    // QuickLogin removed for security

    return (
        <>
            <motion.div
                className="login-page"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Animated Background Elements - REMOVED */}


                <motion.div
                    className="login-container"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* LEFT SECTION - Branding */}
                    <motion.div
                        className="login-left"
                        variants={imageVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="branding-content">
                            <motion.div
                                className="logo-large"
                                variants={itemVariants}
                            >
                                <h1>BIREENA ATITHI</h1>
                                <div className="logo-subtitle">Hotel Management Made Simple</div>
                            </motion.div>

                            <motion.div
                                className="branding-text"
                                variants={itemVariants}
                            >
                                <p>Manage all your hotel operations efficiently</p>
                                <p>Focus on growing your business with ease</p>
                            </motion.div>

                            {/* Illustration */}
                            <motion.div
                                className="login-illustration"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            >
                                <img
                                    src="/images/login-hero.png"
                                    alt="Hotel Staff"
                                />
                            </motion.div>

                            <motion.div
                                className="security-badge"
                                variants={itemVariants}
                            >
                                <span className="badge-icon"></span>
                                <span>Secure Login</span>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* RIGHT SECTION - Login Card */}
                    <motion.div
                        className="login-right"
                        variants={itemVariants}
                    >
                        <motion.div
                            className="login-card"
                            variants={cardVariants}
                        >
                            {/* Tabs */}
                            <div className="login-tabs">
                                <motion.button
                                    className={`tab ${activeTab === 'admin' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('admin')}
                                    layout
                                >
                                    <span>Admin</span>
                                </motion.button>
                                <motion.button
                                    className={`tab ${activeTab === 'staff' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('staff')}
                                    layout
                                >
                                    <span>Staff</span>
                                </motion.button>

                                {/* Tab Underline Slider */}
                                <motion.div
                                    className="tab-slider"
                                    initial={{ left: 0 }}
                                    animate={{ left: activeTab === 'admin' ? 0 : '50%' }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            </div>

                            {/* Form Content with Animation */}
                            <motion.form
                                onSubmit={handleSubmit}
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* ADMIN LOGIN */}
                                {activeTab === 'admin' && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="form-group">
                                            <label htmlFor="admin_email">Email Address</label>
                                            <motion.div
                                                className="input-wrapper"
                                            >
                                                <input
                                                    id="admin_email"
                                                    type="email"
                                                    name="admin_email"
                                                    value={formData.admin_email}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter your email"
                                                    required
                                                    disabled={loading}
                                                />
                                                <motion.span
                                                    className="input-icon"
                                                    animate={{ scale: 1 }}
                                                >

                                                </motion.span>
                                            </motion.div>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="admin_password">Password</label>
                                            <motion.div
                                                className="input-wrapper"
                                            >
                                                <input
                                                    id="admin_password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    name="admin_password"
                                                    value={formData.admin_password}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter your password"
                                                    required
                                                    disabled={loading}
                                                />
                                                <button
                                                    type="button"
                                                    className="toggle-password"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    tabIndex="-1"
                                                >
                                                    {showPassword ? 'Hide' : 'Show'}
                                                </button>
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* STAFF LOGIN */}
                                {activeTab === 'staff' && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="form-group">
                                            <label htmlFor="staff_id">Staff ID / Phone Number</label>
                                            <motion.div
                                                className="input-wrapper"
                                            >
                                                <input
                                                    id="staff_id"
                                                    type="text"
                                                    name="staff_id"
                                                    value={formData.staff_id}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter your Staff ID or phone"
                                                    required
                                                    disabled={loading}
                                                />
                                                <motion.span
                                                    className="input-icon"
                                                    animate={{ scale: 1 }}
                                                >

                                                </motion.span>
                                            </motion.div>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="staff_password">Password</label>
                                            <motion.div
                                                className="input-wrapper"
                                            >
                                                <input
                                                    id="staff_password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    name="staff_password"
                                                    value={formData.staff_password}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter your password"
                                                    required
                                                    disabled={loading}
                                                />
                                                <button
                                                    type="button"
                                                    className="toggle-password"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    tabIndex="-1"
                                                >
                                                    {showPassword ? 'Hide' : 'Show'}
                                                </button>
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Remember Me & Forgot Password */}
                                <div className="form-bottom">
                                    <label className="remember-me">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            disabled={loading}
                                        />
                                        <span>Remember me</span>
                                    </label>
                                    <motion.a
                                        href="#"
                                        className="forgot-password"
                                        whileHover={{ x: 0 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Forgot password?
                                    </motion.a>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{
                                            padding: '12px',
                                            background: '#fee2e2',
                                            border: '1px solid #fca5a5',
                                            borderRadius: '8px',
                                            color: '#dc2626',
                                            fontSize: '14px',
                                            marginTop: '15px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <span></span>
                                        <span>{error}</span>
                                    </motion.div>
                                )}

                                {/* Submit Button */}
                                <motion.button
                                    type="submit"
                                    className="login-btn"
                                    disabled={loading}
                                    whileTap={!loading ? { scale: 0.98 } : {}}
                                >
                                    {loading ? (
                                        <motion.div
                                            className="loader"
                                            animate={{ rotate: 360 }}
                                            transition={{
                                                duration: 1,
                                                repeat: Infinity,
                                                ease: 'linear',
                                            }}
                                        />
                                    ) : (
                                        <>
                                            <span>Sign In</span>
                                            <motion.span
                                                className="btn-arrow"
                                                animate={{ x: [0, 5, 0] }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                }}
                                            >
                                                →
                                            </motion.span>
                                        </>
                                    )}
                                </motion.button>

                            </motion.form>




                        </motion.div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </>
    );
};

export default Login;
