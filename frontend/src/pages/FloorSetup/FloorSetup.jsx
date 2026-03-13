import React, { useState, useEffect } from 'react';
import './FloorSetup.css';
import API_URL from '../../config/api';

const FloorSetup = () => {
    const [floors, setFloors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentFloor, setCurrentFloor] = useState(null);
    const [formData, setFormData] = useState({ name: '', roomCount: '' });

    useEffect(() => {
        fetchFloors();
    }, []);

    const fetchFloors = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/floors/list`);
            const data = await response.json();
            if (data.success) {
                setFloors(data.data);
            } else {
                setError('Failed to fetch floors');
            }
        } catch (err) {
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (mode, floor = null) => {
        setModalMode(mode);
        if (mode === 'edit' && floor) {
            setCurrentFloor(floor);
            setFormData({
                name: floor.name,
                roomCount: floor.roomCount || ''
            });
        } else {
            setCurrentFloor(null);
            setFormData({ name: '', roomCount: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            name: formData.name,
            roomCount: Number(formData.roomCount) || 0
        };

        try {
            let response;
            if (modalMode === 'add') {
                response = await fetch(`${API_URL}/api/floors/add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                response = await fetch(`${API_URL}/api/floors/update/${currentFloor._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            const data = await response.json();
            if (data.success) {
                setIsModalOpen(false);
                fetchFloors();
            } else {
                alert(data.message || 'Operation failed');
            }
        } catch (error) {
            alert('Error submitting form');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure verify to delete this floor?')) {
            try {
                const response = await fetch(`${API_URL}/api/floors/delete/${id}`, {
                    method: 'DELETE'
                });
                const data = await response.json();
                if (data.success) {
                    fetchFloors();
                } else {
                    alert('Failed to delete');
                }
            } catch (error) {
                alert('Error deleting');
            }
        }
    };

    return (
        <div className="floor-setup-container">
            <header className="floor-setup-header">
                <h2>Floor Setup</h2>
                <button className="add-floor-btn" onClick={() => handleOpenModal('add')}>+ Add Floor</button>
            </header>

            <div className="floor-table-container">
                {loading ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
                ) : (
                    <table className="floor-table">
                        <thead>
                            <tr>
                                <th style={{ width: '80px' }}>ID</th>
                                <th>Floor Name</th>
                                <th>Room Count</th>
                                <th style={{ width: '150px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {floors.map((floor, index) => (
                                <tr key={floor._id}>
                                    <td>{index + 1}</td>
                                    <td>{floor.name}</td>
                                    <td>{floor.roomCount || 0}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                                            <button className="icon-button" onClick={() => handleOpenModal('edit', floor)}>✏️</button>
                                            <button className="icon-button" onClick={() => handleDelete(floor._id)}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                <div className="table-footer">
                    <span>Showing {floors.length} Floors</span>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{modalMode === 'add' ? 'Add New Floor' : 'Edit Floor'}</h3>
                            <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Floor Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (/^[a-zA-Z\s]*$/.test(val)) {
                                                setFormData({ ...formData, name: val });
                                            }
                                        }}
                                        required
                                        placeholder="e.g. Ground Floor"
                                        className="form-input"
                                        autoFocus
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Room Count</label>
                                    <input
                                        type="number"
                                        value={formData.roomCount}
                                        onChange={(e) => setFormData({ ...formData, roomCount: e.target.value })}
                                        required
                                        placeholder="e.g. 10"
                                        className="form-input"
                                        min="0"
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

export default FloorSetup;
