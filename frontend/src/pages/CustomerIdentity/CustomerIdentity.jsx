import React, { useState, useEffect } from 'react';
import './CustomerIdentity.css';
import API_URL from '../../config/api';

const CustomerIdentity = () => {
    const [identities, setIdentities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentIdentity, setCurrentIdentity] = useState(null);
    const [formData, setFormData] = useState({ name: '', requiredByLaw: false, usedForReservations: false });

    useEffect(() => { fetchIdentities(); }, []);

    const fetchIdentities = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/customer-identities/list`);
            const data = await res.json();
            if (data.success) setIdentities(data.data);
        } catch (err) { alert('Error fetching data'); }
        finally { setLoading(false); }
    };

    const handleOpenModal = (mode, identity = null) => {
        setModalMode(mode);
        if (mode === 'edit' && identity) {
            setCurrentIdentity(identity);
            setFormData({
                name: identity.name,
                requiredByLaw: identity.requiredByLaw,
                usedForReservations: identity.usedForReservations
            });
        } else {
            setCurrentIdentity(null);
            setFormData({ name: '', requiredByLaw: false, usedForReservations: false });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = modalMode === 'add' ? `${API_URL}/api/customer-identities/add` : `${API_URL}/api/customer-identities/update/${currentIdentity._id}`;
            const method = modalMode === 'add' ? 'POST' : 'PUT';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                setIsModalOpen(false);
                fetchIdentities();
            } else {
                alert(data.message);
            }
        } catch (error) { alert('Error submitting'); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this identity type?')) {
            try {
                await fetch(`${API_URL}/api/customer-identities/delete/${id}`, { method: 'DELETE' });
                fetchIdentities();
            } catch (error) { alert('Error deleting'); }
        }
    };

    return (
        <div className="customer-identity-container">
            <header className="customer-identity-header">
                <h2>Customer Identity</h2>
                <button className="add-btn" onClick={() => handleOpenModal('add')}>+ Add ID Type</button>
            </header>

            {loading ? <div>Loading...</div> : (
                <div className="table-container">
                    <table className="common-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Identity Type</th>
                                <th>Required by Law?</th>
                                <th>Used for Reservations?</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {identities.map((item, index) => (
                                <tr key={item._id}>
                                    <td>{index + 1}</td>
                                    <td>{item.name}</td>
                                    <td>
                                        <div className="checkbox-display">
                                            <input type="checkbox" checked={item.requiredByLaw} readOnly />
                                        </div>
                                    </td>
                                    <td>
                                        <div className="checkbox-display">
                                            <input type="checkbox" checked={item.usedForReservations} readOnly />
                                        </div>
                                    </td>
                                    <td className="text-right">
                                        <div className="action-btns">
                                            <button className="icon-btn edit-btn" onClick={() => handleOpenModal('edit', item)}>✏️</button>
                                            <button className="icon-btn delete-btn" onClick={() => handleDelete(item._id)}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="table-footer">Showing {identities.length} Identity Types</div>
                </div>
            )}

            {/* Premium Modal */}
            {isModalOpen && (
                <div className="add-payment-overlay">
                    <div className="add-payment-modal add-id-premium">
                        <div className="premium-payment-header">
                            <div className="header-icon-wrap">
                                <span style={{ fontSize: '20px' }}>🆔</span>
                            </div>
                            <div className="header-text">
                                <h3>{modalMode === 'add' ? 'Add ID Type' : 'Edit ID Type'}</h3>
                                <span>IDENTITY SETUP</span>
                            </div>
                            <button className="premium-close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                            <div className="add-payment-body">
                                <div className="payment-field-group">
                                    <label className="field-label-premium">IDENTITY TYPE</label>
                                    <div className="premium-input-wrap">
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={e => {
                                                const value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                                                setFormData({ ...formData, name: value });
                                            }}
                                            required
                                            placeholder="e.g. Aadhaar, Passport, Driving License"
                                            className="premium-input"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="payment-field-group">
                                    <label className="field-label-premium">LAW & REGULATIONS</label>
                                    <div 
                                        className={`modern-checkbox-card ${formData.requiredByLaw ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, requiredByLaw: !formData.requiredByLaw })}
                                    >
                                        <div className="checkbox-card-info">
                                            <span className="checkbox-card-title">Required by Law?</span>
                                            <span className="checkbox-card-sub">This ID is mandatory for check-in</span>
                                        </div>
                                        <div className={`checkbox-custom-wrap ${formData.requiredByLaw ? 'checked' : ''}`}>
                                            {formData.requiredByLaw && <span className="check-icon">✓</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="payment-field-group">
                                    <label className="field-label-premium">RESERVATION SETTINGS</label>
                                    <div 
                                        className={`modern-checkbox-card ${formData.usedForReservations ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, usedForReservations: !formData.usedForReservations })}
                                    >
                                        <div className="checkbox-card-info">
                                            <span className="checkbox-card-title">Used for Reservations?</span>
                                            <span className="checkbox-card-sub">Allow this ID for making reservations</span>
                                        </div>
                                        <div className={`checkbox-custom-wrap ${formData.usedForReservations ? 'checked' : ''}`}>
                                            {formData.usedForReservations && <span className="check-icon">✓</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="payment-modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                                    CANCEL
                                </button>
                                <button type="submit" className="btn-primary">
                                    {modalMode === 'add' ? 'ADD ID TYPE' : 'UPDATE ID TYPE'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default CustomerIdentity;
