import { useState } from 'react';
import './HousekeepingView.css';

const HousekeepingView = () => {
    // Initial housekeeping statuses
    const [statuses, setStatuses] = useState([
        { id: 1, name: 'Dirty', color: '#dc3545', isActive: true, isDirty: false },
        { id: 2, name: 'Clean', color: '#28a745', isActive: true, isDirty: false },
        { id: 3, name: 'Maintenance', color: '#ffc107', isActive: true, isDirty: false },
        { id: 4, name: 'Blocked', color: '#17a2b8', isActive: true, isDirty: false }
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingStatus, setEditingStatus] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        color: '#dc3545',
        colorCode: '#dc3545',
        isActive: true,
        isDirty: false
    });
    const [originalFormData, setOriginalFormData] = useState(null);

    // Filter statuses based on search query
    const filteredStatuses = statuses.filter(status =>
        status.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'name') {
            // Auto-assign color and status based on name
            const nameLower = value.toLowerCase().trim();
            let autoColor = formData.color;
            let autoStatus = formData.isActive;

            if (nameLower === 'dirty') {
                autoColor = '#dc3545'; // Red
                autoStatus = false; // Inactive
            } else if (nameLower === 'clean') {
                autoColor = '#28a745'; // Green
                autoStatus = true; // Active
            } else if (nameLower === 'maintenance') {
                autoColor = '#ffc107'; // Yellow
                autoStatus = false; // Inactive
            } else if (nameLower === 'blocked') {
                autoColor = '#17a2b8'; // Blue/Cyan
                autoStatus = false; // Inactive
            }

            setFormData(prev => ({
                ...prev,
                name: value,
                color: autoColor,
                colorCode: autoColor,
                isActive: autoStatus
            }));
        } else if (name === 'color') {
            // Color picker changed - update both color and colorCode
            setFormData(prev => ({
                ...prev,
                color: value,
                colorCode: value
            }));
        } else if (name === 'colorCode') {
            // Color code input changed - validate and update both
            const hexValue = value.startsWith('#') ? value : `#${value}`;
            setFormData(prev => ({
                ...prev,
                colorCode: hexValue,
                color: /^#[0-9A-F]{6}$/i.test(hexValue) ? hexValue : prev.color
            }));
        } else if (name === 'isActive') {
            // Active checkbox - set isActive to true
            setFormData(prev => ({
                ...prev,
                isActive: true
            }));
        } else if (name === 'isInactive') {
            // Inactive checkbox - set isActive to false
            setFormData(prev => ({
                ...prev,
                isActive: false
            }));
        } else if (name === 'isDirty') {
            setFormData(prev => ({
                ...prev,
                isDirty: checked
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    // Open modal for adding new status
    const handleAddNew = () => {
        const defaultData = {
            name: '',
            color: '#dc3545',
            colorCode: '#dc3545',
            isActive: true,
            isDirty: false
        };
        setEditingStatus(null);
        setFormData(defaultData);
        setOriginalFormData(defaultData);
        setShowModal(true);
    };

    // Open modal for editing existing status
    const handleEdit = (status) => {
        const editData = {
            name: status.name,
            color: status.color,
            colorCode: status.color,
            isActive: status.isActive,
            isDirty: status.isDirty || false
        };
        setEditingStatus(status);
        setFormData(editData);
        setOriginalFormData(editData);
        setShowModal(true);
    };

    // Reset form to default or original values
    const handleReset = () => {
        if (originalFormData) {
            setFormData({ ...originalFormData });
        }
    };

    // Save status (add or update)
    const handleSave = () => {
        if (!formData.name.trim()) {
            alert('Please enter a status name');
            return;
        }

        if (!formData.colorCode || !/^#[0-9A-F]{6}$/i.test(formData.colorCode)) {
            alert('Please enter a valid color code (e.g., #dc3545)');
            return;
        }

        const saveData = {
            name: formData.name,
            color: formData.color,
            isActive: formData.isActive,
            isDirty: formData.isDirty
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
        setFormData({ name: '', color: '#dc3545', colorCode: '#dc3545', isActive: true, isDirty: false });
        setOriginalFormData(null);
    };

    // Delete status
    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this housekeeping status?')) {
            setStatuses(statuses.filter(status => status.id !== id));
        }
    };

    // Toggle status active/inactive
    const toggleStatus = (id) => {
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

            {/* Search and Add Button */}
            <div className="housekeeping-controls">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    <span className="search-icon">🔍</span>
                </div>
                <button className="btn btn-add" onClick={handleAddNew}>
                    + Add Housekeeping Status
                </button>
            </div>

            {/* Table */}
            <div className="housekeeping-table-container">
                <table className="housekeeping-table">
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Name</th>
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
                                            className={`status-badge ${status.isActive ? 'active' : 'inactive'}`}
                                            onClick={() => toggleStatus(status.id)}
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
                                <td colSpan="5" className="no-data">
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
                            <div className="form-group">
                                <label>Status Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter status name"
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Color Code *</label>
                                <input
                                    type="text"
                                    name="colorCode"
                                    value={formData.colorCode}
                                    onChange={handleInputChange}
                                    placeholder="#dc3545"
                                    className="form-input"
                                    maxLength="7"
                                />
                            </div>

                            <div className="form-group">
                                <label>Color *</label>
                                <div className="color-picker-wrapper">
                                    <input
                                        type="color"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleInputChange}
                                        className="color-input"
                                    />
                                    <span className="color-preview" style={{ backgroundColor: formData.color }}></span>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Status *</label>
                                <div className="status-checkboxes">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={formData.isActive === true}
                                            onChange={handleInputChange}
                                        />
                                        <span>Active</span>
                                    </label>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="isInactive"
                                            checked={formData.isActive === false}
                                            onChange={handleInputChange}
                                        />
                                        <span>Inactive</span>
                                    </label>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Additional Options</label>
                                <div className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="isDirty"
                                        checked={formData.isDirty}
                                        onChange={handleInputChange}
                                    />
                                    <span>Is Dirty</span>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-cancel" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-reset" onClick={handleReset}>
                                Reset
                            </button>
                            <button className="btn btn-save" onClick={handleSave}>
                                {editingStatus ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HousekeepingView;
