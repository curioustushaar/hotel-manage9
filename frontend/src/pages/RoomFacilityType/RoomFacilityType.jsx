import React, { useState, useEffect } from 'react';
import './RoomFacilityType.css';
import API_URL from '../../config/api';

const RoomFacilityType = () => {
    const [facilityTypes, setFacilityTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentFacility, setCurrentFacility] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    useEffect(() => {
        fetchFacilityTypes();
    }, []);

    const fetchFacilityTypes = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/facility-types/list`);
            const data = await response.json();
            if (data.success) {
                setFacilityTypes(data.data);
            } else {
                setError('Failed to fetch facility types');
            }
        } catch (err) {
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (mode, facility = null) => {
        setModalMode(mode);
        if (mode === 'edit' && facility) {
            setCurrentFacility(facility);
            setFormData({ name: facility.name, description: facility.description || '' });
        } else {
            setCurrentFacility(null);
            setFormData({ name: '', description: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let response;
            if (modalMode === 'add') {
                response = await fetch(`${API_URL}/api/facility-types/add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            } else {
                response = await fetch(`${API_URL}/api/facility-types/update/${currentFacility._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            }

            const data = await response.json();
            if (data.success) {
                setIsModalOpen(false);
                fetchFacilityTypes();
            } else {
                alert(data.message || 'Operation failed');
            }
        } catch (error) {
            alert('Error submitting form');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this facility type?')) {
            try {
                const response = await fetch(`${API_URL}/api/facility-types/delete/${id}`, {
                    method: 'DELETE'
                });
                const data = await response.json();
                if (data.success) {
                    fetchFacilityTypes();
                } else {
                    alert('Failed to delete');
                }
            } catch (error) {
                alert('Error deleting');
            }
        }
    };

    return (
        <div className="room-facility-type-container">
            <header className="room-facility-type-header">
                <h2>Room Facilities Setup</h2>
                <button className="add-facility-btn" onClick={() => handleOpenModal('add')}>+ Add Facility</button>
            </header>

            <div className="facility-type-table-container">
                {loading ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
                ) : (
                    <table className="facility-type-table">
                        <thead>
                            <tr>
                                <th style={{ width: '80px' }}>ID</th>
                                <th>FACILITY</th>
                                <th>FACILITY TYPE</th>
                                <th style={{ width: '150px', textAlign: 'right' }}>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {facilityTypes.map((facility, index) => (
                                <tr key={facility._id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <span className="facility-name">{facility.name}</span>
                                    </td>
                                    <td>
                                        <span className="facility-description">
                                            {facility.description ? (
                                                <span className="facility-tag">{facility.description}</span>
                                            ) : (
                                                <span className="text-muted">-</span>
                                            )}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                                            <button className="icon-button" onClick={() => handleOpenModal('edit', facility)}>✏️</button>
                                            <button className="icon-button" onClick={() => handleDelete(facility._id)}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {facilityTypes.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No facilities found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
                <div className="table-footer">
                    <span>Showing {facilityTypes.length} Facility Types</span>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{modalMode === 'add' ? 'Add Facility' : 'Edit Facility'}</h3>
                            <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>FACILITY</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="e.g. Standard Room"
                                        className="form-input"
                                        autoFocus
                                    />
                                </div>
                                <div className="form-group">
                                    <label>FACILITY TYPE</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="e.g. Double/Queen Bed, AC/Fan, TV..."
                                        className="form-input"
                                        rows="3"
                                        style={{ resize: 'vertical' }}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{modalMode === 'add' ? 'Add' : 'Update'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomFacilityType;
