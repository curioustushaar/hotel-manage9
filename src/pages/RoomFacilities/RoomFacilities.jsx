import React, { useState, useEffect } from 'react';
import './RoomFacilities.css';
import API_URL from '../../config/api';

const RoomFacilities = () => {
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentFacility, setCurrentFacility] = useState(null);
    const [formData, setFormData] = useState({ name: '' });

    useEffect(() => {
        fetchFacilities();
    }, []);

    const fetchFacilities = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/facilities/list`);
            const data = await response.json();
            if (data.success) {
                setFacilities(data.data);
            } else {
                setError('Failed to fetch facilities');
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
            setFormData({ name: facility.name });
        } else {
            setCurrentFacility(null);
            setFormData({ name: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let response;
            if (modalMode === 'add') {
                response = await fetch(`${API_URL}/api/facilities/add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            } else {
                response = await fetch(`${API_URL}/api/facilities/update/${currentFacility._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            }

            const data = await response.json();
            if (data.success) {
                setIsModalOpen(false);
                fetchFacilities();
            } else {
                alert(data.message || 'Operation failed');
            }
        } catch (error) {
            alert('Error submitting form');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure verify to delete this facility?')) {
            try {
                const response = await fetch(`${API_URL}/api/facilities/delete/${id}`, {
                    method: 'DELETE'
                });
                const data = await response.json();
                if (data.success) {
                    fetchFacilities();
                } else {
                    alert('Failed to delete');
                }
            } catch (error) {
                alert('Error deleting');
            }
        }
    };

    return (
        <div className="room-facilities-container">
            <header className="facilities-header">
                <h2>Room Facilities Setup</h2>
                <button className="add-btn" onClick={() => handleOpenModal('add')}>+ Add Facility</button>
            </header>

            <div className="facilities-table-container">
                {loading ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
                ) : (
                    <table className="facilities-table">
                        <thead>
                            <tr>
                                <th style={{ width: '80px' }}>ID</th>
                                <th>Facility</th>
                                <th style={{ width: '150px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {facilities.map((facility, index) => (
                                <tr key={facility._id}>
                                    <td>{index + 1}</td>
                                    <td>{facility.name}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div className="action-btn-group" style={{ justifyContent: 'flex-end' }}>
                                            <button className="icon-btn edit" onClick={() => handleOpenModal('edit', facility)}>✏️</button>
                                            <button className="icon-btn delete" onClick={() => handleDelete(facility._id)}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                <div className="table-footer">
                    <span>Showing {facilities.length} Facilities</span>
                    {/* Pagination can be added later if needed */}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{modalMode === 'add' ? 'Add New Facility' : 'Edit Facility'}</h3>
                            <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Facility Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="form-input"
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

export default RoomFacilities;
