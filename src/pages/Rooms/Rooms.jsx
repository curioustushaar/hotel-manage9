import { useNavigate } from 'react-router-dom';
import './Rooms.css';

const Rooms = () => {
    const navigate = useNavigate();

    return (
        <div className="placeholder-page">
            <div className="placeholder-content">
                <div className="placeholder-icon">🛏️</div>
                <h1>Rooms Management</h1>
                <p>This page is under development</p>
                <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>
                    ← Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default Rooms;
