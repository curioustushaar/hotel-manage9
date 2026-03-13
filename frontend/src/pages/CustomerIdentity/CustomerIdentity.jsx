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

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{modalMode === 'add' ? 'Add ID Type' : 'Edit ID Type'}</h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Identity Type</label>
                                <input type="text" value={formData.name} onChange={e => {
                                    const value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                                    setFormData({ ...formData, name: value });
                                }} required />
                            </div>
                            <div className="form-group checkbox-row">
                                <label className="checkbox-label">
                                    <input type="checkbox" checked={formData.requiredByLaw} onChange={e => setFormData({ ...formData, requiredByLaw: e.target.checked })} />
                                    Required by Law?
                                </label>
                            </div>
                            <div className="form-group checkbox-row">
                                <label className="checkbox-label">
                                    <input type="checkbox" checked={formData.usedForReservations} onChange={e => setFormData({ ...formData, usedForReservations: e.target.checked })} />
                                    Used for Reservations?
                                </label>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">{modalMode === 'add' ? 'Add' : 'Update'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default CustomerIdentity;
