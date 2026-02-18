import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasModuleAccess } from '../config/rbac';

/**
 * ProtectedRoute Component
 * Protects routes based on authentication and module access permissions
 */
const ProtectedRoute = ({ children, module }) => {
    const { user, isAuthenticated, loading } = useAuth();

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontSize: '20px',
                fontWeight: '500'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '40px', marginBottom: '20px' }}>🔐</div>
                    <div>Checking permissions...</div>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    // If module is specified, check if user has access
    if (module && !hasModuleAccess(user, module)) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                flexDirection: 'column',
                padding: '20px',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '80px', marginBottom: '30px' }}>🚫</div>
                <h1 style={{ fontSize: '32px', marginBottom: '15px' }}>Access Denied</h1>
                <p style={{ fontSize: '18px', marginBottom: '30px', opacity: 0.9 }}>
                    You don't have permission to access this module.
                </p>
                <p style={{ fontSize: '16px', opacity: 0.8 }}>
                    Your Role: <strong>{user.role}</strong>
                </p>
                <button
                    onClick={() => window.history.back()}
                    style={{
                        marginTop: '30px',
                        padding: '12px 30px',
                        fontSize: '16px',
                        background: 'white',
                        color: '#f5576c',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                >
                    ← Go Back
                </button>
            </div>
        );
    }

    // User is authenticated and has access
    return children;
};

export default ProtectedRoute;
