import React, { useState, useEffect } from 'react';
import './BedType.css';
import API_URL from '../../config/api';

const BedType = () => {
    const [bedTypes, setBedTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentBedType, setCurrentBedType] = useState(null);
    const [formData, setFormData] = useState({ name: '' });

    useEffect(() => {
        fetchBedTypes();
    }, []);

    const fetchBedTypes = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/bed-types/list`);
            const data = await response.json();
            if (data.success) {
                setBedTypes(data.data);
            } else {
                setError('Failed to fetch bed types');
            }
        } catch (err) {
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (mode, bed = null) => {
        setModalMode(mode);
        if (mode === 'edit' && bed) {
            setCurrentBedType(bed);
            setFormData({ name: bed.name });
        } else {
            setCurrentBedType(null);
            setFormData({ name: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let response;
            if (modalMode === 'add') {
                response = await fetch(`${API_URL}/api/bed-types/add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            } else {
                response = await fetch(`${API_URL}/api/bed-types/update/${currentBedType._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            }

            const data = await response.json();
            if (data.success) {
                setIsModalOpen(false);
                fetchBedTypes();
            } else {
                alert(data.message || 'Operation failed');
            }
        } catch (error) {
            alert('Error submitting form');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure verify to delete this bed type?')) {
            try {
                const response = await fetch(`${API_URL}/api/bed-types/delete/${id}`, {
                    method: 'DELETE'
                });
                const data = await response.json();
                if (data.success) {
                    fetchBedTypes();
                } else {
                    alert('Failed to delete');
                }
            } catch (error) {
                alert('Error deleting');
            }
        }
    };

    return (
        <div className="bed-type-container">
            <header className="bed-type-header">
                <h2>Bed Type Setup</h2>
                <button className="add-bed-btn" onClick={() => handleOpenModal('add')}>+ Add Bed Type</button>
            </header>

            <div className="bed-type-table-container">
                {loading ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
                ) : (
                    <table className="bed-type-table">
                        <thead>
                            <tr>
                                <th style={{ width: '80px' }}>ID</th>
                                <th>Bed Type</th>
                                <th style={{ width: '150px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bedTypes.map((bed, index) => (
                                <tr key={bed._id}>
                                    <td>{index + 1}</td>
                                    <td>{bed.name}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                                            <button className="icon-button" onClick={() => handleOpenModal('edit', bed)}>✏️</button>
                                            <button className="icon-button" onClick={() => handleDelete(bed._id)}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                <div className="table-footer">
                    <span>Showing {bedTypes.length} Bed Types</span>
                    {/* Pagination can be added later */}
                </div>
            </div>

            {/* Premium Modal */}
            {isModalOpen && (
                <div className="add-payment-overlay">
                    <div className="add-payment-modal add-bed-premium">
                        <div className="premium-payment-header">
                            <div className="header-icon-wrap">
                                <span style={{ fontSize: '20px' }}>🛏️</span>
                            </div>
                            <div className="header-text">
                                <h3>{modalMode === 'add' ? 'Add New Bed Type' : 'Edit Bed Type'}</h3>
                                <span>ROOM SETUP</span>
                            </div>
                            <button className="premium-close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                            <div className="add-payment-body">
                                <div className="payment-field-group">
                                    <label className="field-label-premium">BED TYPE NAME</label>
                                    <div className="premium-input-wrap">
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            placeholder="e.g. King Size, Single Bed"
                                            className="premium-input"
                                            autoFocus
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="payment-modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                                    CANCEL
                                </button>
                                <button type="submit" className="btn-primary">
                                    {modalMode === 'add' ? 'ADD BED' : 'UPDATE BED'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BedType;
