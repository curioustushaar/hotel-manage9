import { useState, useEffect } from 'react';
import './HousekeepingView.css';
import API_URL_CONFIG from '../config/api';

const HousekeepingView = () => {
    const API_URL = `${API_URL_CONFIG}/api/housekeeping`;
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Fetch pending tasks on mount
    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/list`);
            const data = await response.json();
            if (data.success) {
                setTasks(data.data);
            }
        } catch (error) {
            console.error('Error fetching housekeeping tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    // Auto-hide toast after 3 seconds
    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => setShowToast(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    // Filter tasks based on search query
    const filteredTasks = tasks.filter(task =>
        task.roomNumber.includes(searchQuery)
    );

    // Mark room as clean
    const handleMarkClean = async (taskId, roomNumber) => {
        try {
            const response = await fetch(`${API_URL}/mark-clean`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskId, roomNumber })
            });
            const data = await response.json();

            if (data.success) {
                setToastMessage(`Room ${roomNumber} is now Clean!`);
                setShowToast(true);
                // Refresh list
                fetchTasks();

                // Play success sound if available
                if (window.soundManager) {
                    window.soundManager.play('success');
                }
            } else {
                alert(data.message || 'Error updating status');
            }
        } catch (error) {
            console.error('Error marking clean:', error);
            alert('Server error while updating status');
        }
    };

    return (
        <div className="housekeeping-view-container">
            {/* Header */}
            <div className="housekeeping-header">
                <div className="header-title">
                    <h2>🧹 Housekeeping Dashboard</h2>
                    <p>Track and manage room cleaning tasks</p>
                </div>
            </div>

            {/* Controls */}
            <div className="housekeeping-controls">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search by room number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    <span className="search-icon">🔍</span>
                </div>
                <button className="btn-refresh" onClick={fetchTasks} disabled={loading}>
                    {loading ? '🔄 Loading...' : '🔄 Refresh List'}
                </button>
            </div>

            {/* Table */}
            <div className="housekeeping-table-container">
                <table className="housekeeping-table">
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Room No</th>
                            <th>Status</th>
                            <th>Requested At</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="no-data">Loading tasks...</td>
                            </tr>
                        ) : filteredTasks.length > 0 ? (
                            filteredTasks.map((task, index) => (
                                <tr key={task._id}>
                                    <td>{index + 1}</td>
                                    <td className="room-no">{task.roomNumber}</td>
                                    <td>
                                        <span className="status-pill dirty">Needs Cleaning</span>
                                    </td>
                                    <td>{new Date(task.createdAt).toLocaleString()}</td>
                                    <td>
                                        <button
                                            className="action-btn clean-btn"
                                            onClick={() => handleMarkClean(task._id, task.roomNumber)}
                                            title="Mark as Clean"
                                        >
                                            ✨ Mark Clean
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="no-data">
                                    {searchQuery ? 'No matching rooms found' : 'All rooms are clean! ✨'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Success Toast */}
            {showToast && (
                <div className="toast-success">
                    <span>✔️</span> {toastMessage}
                </div>
            )}
        </div>
    );
};

export default HousekeepingView;
