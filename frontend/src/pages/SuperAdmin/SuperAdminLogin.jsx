import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import '../Login/Login.css'; // Import global Login styles
import './SuperAdminLogin.css'; // Import specific overrides

const SuperAdminLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(formData.email, formData.password, 'admin');

        if (result.success) {
            if (result.user.role === 'super_admin') {
                navigate('/super-admin/dashboard');
            } else {
                setError('Unauthorized access. Super Admins only.');
                setLoading(false);
            }
        } else {
            setError(result.error || 'Login failed');
            setLoading(false);
        }
    };

    return (
        <div className="login-page super-admin-login-wrapper">
            <motion.div
                className="login-container super-admin-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* LEFT SECTION - Branding */}
                <div className="login-left">
                    <div className="branding-content">
                        <div className="logo-large">
                            <h1>BIREENA ATITHI</h1>
                            <div className="logo-subtitle super-admin-subtitle">Super Admin Portal</div>
                        </div>

                        <div className="branding-text">
                            <p>Global System Management</p>
                            <p>Secure Access for Owners Only</p>
                        </div>

                        <div className="login-illustration">
                            <img
                                src="/images/login-hero.png"
                                alt="Admin Access"
                            />
                        </div>

                        <div className="security-badge super-admin-badge">
                            <span className="badge-icon">🛡️</span>
                            <span>Secure Owner Login</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT SECTION - Login Card */}
                <div className="login-right">
                    <motion.div
                        className="login-card"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="email">Secure Email</label>
                                <div className="input-wrapper super-admin-input">
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Enter super admin email"
                                        required
                                        disabled={loading}
                                    />
                                    <span className="input-icon">📧</span>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Passcode</label>
                                <div className="input-wrapper super-admin-input">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Enter secure passcode"
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
                                </div>
                            </div>

                            {error && (
                                <div style={{
                                    color: '#E31E24',
                                    background: '#fee2e2',
                                    padding: '10px',
                                    borderRadius: '6px',
                                    fontSize: '0.9rem',
                                    marginBottom: '1rem',
                                    textAlign: 'center'
                                }}>
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="login-btn super-admin-btn"
                                disabled={loading}
                            >
                                {loading ? 'Verifying...' : 'Access Dashboard'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default SuperAdminLogin;
