import './FloatingDashboard.css';
import DashboardImg from '../assets/second.jpg';

const FloatingDashboard = () => {
    return (
        <div className="floating-dashboard-container">
            <div className="floating-dashboard-card">
                <img
                    src={DashboardImg}
                    alt="Hotel Management Dashboard Preview"
                    className="dashboard-preview-img"
                />
            </div>
        </div>
    );
};

export default FloatingDashboard;
