import { useState, useEffect } from 'react';
import './HousekeepingView.css';

const HousekeepingView = () => {
    // Initial housekeeping statuses with Room Number added
    const [statuses, setStatuses] = useState([
        { id: 1, roomNumber: '101', name: 'Dirty', color: '#dc3545', isActive: true },
        { id: 2, roomNumber: '102', name: 'Clean', color: '#28a745', isActive: true },
        { id: 3, roomNumber: '201', name: 'Maintenance', color: '#ffc107', isActive: true },
        { id: 4, roomNumber: '205', name: 'Blocked', color: '#17a2b8', isActive: false }
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingStatus, setEditingStatus] = useState(null);
    const [showToast, setShowToast] = useState(false);

    const [formData, setFormData] = useState({
        roomNumber: '',
        name: 'Clean',
        color: '#28a745',
        isActive: true
    });

    // Auto-hide toast after 3 seconds
    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => setShowToast(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    // Filter statuses based on search query
    const filteredStatuses = statuses.filter(status =>
        status.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        status.roomNumber.includes(searchQuery)
    );

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle Status Name Dropdown Change (Auto-set color)
    const handleStatusNameChange = (e) => {
        const name = e.target.value;
        let color = formData.color;

        if (name === 'Dirty') color = '#dc3545';
        else if (name === 'Clean') color = '#28a745';
        else if (name === 'Maintenance') color = '#ffc107';
        else if (name === 'Blocked') color = '#17a2b8';

        setFormData(prev => ({ ...prev, name, color }));
    };

    // Handle Status Toggle (Active/Inactive)
    const handleToggleStatus = (status) => {
        setFormData(prev => ({ ...prev, isActive: status }));
    };

    // Open modal for adding new status
    const handleAddNew = () => {
        setEditingStatus(null);
        setFormData({
            roomNumber: '',
            name: 'Clean',
            color: '#28a745', // Default Green
            isActive: true
        });
        setShowModal(true);
    };

    // Open modal for editing existing status
    const handleEdit = (status) => {
        setEditingStatus(status);
        setFormData({
            roomNumber: status.roomNumber,
            name: status.name,
            color: status.color,
            isActive: status.isActive
        });
        setShowModal(true);
    };

    // Save status (add or update)
    const handleSave = () => {
        if (!formData.roomNumber.trim()) {
            alert('Please enter a Room Number');
            return;
        }

        const saveData = {
            roomNumber: formData.roomNumber,
            name: formData.name,
            color: formData.color,
            isActive: formData.isActive
        };

        if (editingStatus) {
            // Update existing status
            setStatuses(statuses.map(status =>
                status.id === editingStatus.id
                    ? { ...status, ...saveData }
                    : status
            ));
        } else {
            // Add new status
            const newStatus = {
                id: Math.max(...statuses.map(s => s.id), 0) + 1,
                ...saveData
            };
            setStatuses([...statuses, newStatus]);
        }

        setShowModal(false);
        setShowToast(true); // Show success toast
    };

    // Delete status
    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this housekeeping status?')) {
            setStatuses(statuses.filter(status => status.id !== id));
        }
    };

    // Toggle status active/inactive from list
    const toggleStatusList = (id) => {
        setStatuses(statuses.map(status =>
            status.id === id
                ? { ...status, isActive: !status.isActive }
                : status
        ));
    };

    return (
        <div className="housekeeping-view-container">
            {/* Header */}
            <div className="housekeeping-header">
                <div className="header-title">
                    <h2>🧹 Housekeeping Status</h2>
                    <p>Manage housekeeping status types and colors</p>
                </div>
            </div>

            {/* Controls */}
            <div className="housekeeping-controls">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search by name or room number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    <span className="search-icon">🔍</span>
                </div>
                <button className="btn-add" onClick={handleAddNew}>
                    <span>+</span> Add Room Status
                </button>
            </div>

            {/* Table */}
            <div className="housekeeping-table-container">
                <table className="housekeeping-table">
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Room No</th>
                            <th>Status Name</th>
                            <th>Color</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStatuses.length > 0 ? (
                            filteredStatuses.map((status, index) => (
                                <tr key={status.id}>
                                    <td>{index + 1}</td>
                                    <td className="room-no">{status.roomNumber}</td>
                                    <td className="status-name">{status.name}</td>
                                    <td>
                                        <div className="color-indicator-wrapper">
                                            <span
                                                className="color-indicator"
                                                style={{ backgroundColor: status.color }}
                                            ></span>
                                        </div>
                                    </td>
                                    <td>
                                        <span
                                            className={`status-pill ${status.isActive ? 'active' : 'inactive'}`}
                                            onClick={() => toggleStatusList(status.id)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {status.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="action-btn edit-btn"
                                                onClick={() => handleEdit(status)}
                                                title="Edit"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="action-btn delete-btn"
                                                onClick={() => handleDelete(status.id)}
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="no-data">
                                    {searchQuery ? 'No matching results found' : 'No housekeeping statuses available'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingStatus ? 'Edit Housekeeping Status' : 'Add Housekeeping Status'}</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}>
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            {/* Room Number */}
                            <div className="form-group">
                                <label>Room Number *</label>
                                <input
                                    type="number"
                                    name="roomNumber"
                                    value={formData.roomNumber}
                                    onChange={handleInputChange}
                                    placeholder="Enter Room Number"
                                    className="form-input"
                                    autoFocus
                                />
                            </div>

                            {/* Status Name Dropdown */}
                            <div className="form-group">
                                <label>Status Name *</label>
                                <select
                                    name="name"
                                    value={formData.name}
                                    onChange={handleStatusNameChange}
                                    className="form-select"
                                >
                                    <option value="Clean">Clean</option>
                                    <option value="Dirty">Dirty</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Blocked">Blocked</option>
                                </select>
                            </div>

                            {/* Color Picker (Horizontal) */}
                            <div className="form-group">
                                <label>Color *</label>
                                <div className="color-picker-row">
                                    <input
                                        type="color"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleInputChange}
                                        className="color-input-compact"
                                    />
                                    <div className="color-preview-box" style={{ backgroundColor: formData.color }}>
                                    </div>
                                    <span className="color-value">{formData.color}</span>
                                </div>
                            </div>

                            {/* Status Toggle (Pills) */}
                            <div className="form-group">
                                <label>Status *</label>
                                <div className="toggle-group">
                                    <button
                                        type="button"
                                        className={`toggle-btn ${formData.isActive ? 'active' : ''}`}
                                        onClick={() => handleToggleStatus(true)}
                                    >
                                        Active
                                    </button>
                                    <button
                                        type="button"
                                        className={`toggle-btn ${!formData.isActive ? 'inactive-state' : ''}`}
                                        onClick={() => handleToggleStatus(false)}
                                    >
                                        Inactive
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-modal btn-modal-cancel" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button className="btn-modal btn-modal-save" onClick={handleSave}>
                                {editingStatus ? 'Update Status' : 'Save Status'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Toast */}
            {showToast && (
                <div className="toast-success">
                    <span>✔️</span> Housekeeping status updated successfully
                </div>
            )}
        </div>
    );
};

export default HousekeepingView;
