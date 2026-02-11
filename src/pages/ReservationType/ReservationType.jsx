import React, { useState, useEffect } from 'react';
import './ReservationType.css';
import API_URL from '../../config/api';

const ReservationType = () => {
    const [reservationTypes, setReservationTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentReservationType, setCurrentReservationType] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    useEffect(() => {
        fetchReservationTypes();
    }, []);

    const fetchReservationTypes = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/reservation-types/list`);
            const data = await response.json();
            if (data.success) {
                setReservationTypes(data.data);
            } else {
                setError('Failed to fetch reservation types');
            }
        } catch (err) {
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (mode, type = null) => {
        setModalMode(mode);
        if (mode === 'edit' && type) {
            setCurrentReservationType(type);
            setFormData({
                name: type.name,
                description: type.description || ''
            });
        } else {
            setCurrentReservationType(null);
            setFormData({
                name: '',
                description: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let response;
            if (modalMode === 'add') {
                response = await fetch(`${API_URL}/api/reservation-types/add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            } else {
                response = await fetch(`${API_URL}/api/reservation-types/update/${currentReservationType._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            }

            const data = await response.json();
            if (data.success) {
                setIsModalOpen(false);
                fetchReservationTypes();
            } else {
                alert(data.message || 'Operation failed');
            }
        } catch (error) {
            alert('Error submitting form');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this reservation type?')) {
            try {
                const response = await fetch(`${API_URL}/api/reservation-types/delete/${id}`, {
                    method: 'DELETE'
                });
                const data = await response.json();
                if (data.success) {
                    fetchReservationTypes();
                } else {
                    alert('Failed to delete');
                }
            } catch (error) {
                alert('Error deleting');
            }
        }
    };

    return (
        <div className="reservation-type-container">
            <header className="reservation-type-header">
                <h2>Reservation Type</h2>
                <button className="add-reservation-btn" onClick={() => handleOpenModal('add')}>+ Add Reservation Type</button>
            </header>

            <div className="reservation-type-table-container">
                {loading ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
                ) : (
                    <table className="reservation-type-table">
                        <thead>
                            <tr>
                                <th style={{ width: '60px' }}>ID</th>
                                <th>Reservation Type</th>
                                <th>Description</th>
                                <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservationTypes.map((type, index) => (
                                <tr key={type._id}>
                                    <td>{index + 1}</td>
                                    <td>{type.name}</td>
                                    <td>{type.description || '-'}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                                            <button className="icon-button" onClick={() => handleOpenModal('edit', type)}>✏️</button>
                                            <button className="icon-button" onClick={() => handleDelete(type._id)}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                <div className="table-footer">
                    <span>Showing {reservationTypes.length} Reservation Types</span>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{modalMode === 'add' ? 'Add Reservation Type' : 'Edit Reservation Type'}</h3>
                            <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Reservation Type</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="e.g. Walk-In, Online Booking"
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Brief description..."
                                        className="form-input"
                                        rows="3"
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

export default ReservationType;
