import React, { useState, useEffect } from 'react';
import './ExtraCharge.css';
import API_URL from '../../config/api';
import { useSettings } from '../../context/SettingsContext';

const ExtraCharge = () => {
    const { getCurrencySymbol } = useSettings();
    const cs = getCurrencySymbol();
    const [charges, setCharges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentCharge, setCurrentCharge] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        chargeType: 'Fixed',
        amount: '',
        taxApplicable: true
    });

    useEffect(() => { fetchCharges(); }, []);

    const fetchCharges = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/extra-charges/list`);
            const data = await res.json();
            if (data.success) setCharges(data.data);
        } catch (err) { alert('Error fetching data'); }
        finally { setLoading(false); }
    };

    const handleOpenModal = (mode, charge = null) => {
        setModalMode(mode);
        if (mode === 'edit' && charge) {
            setCurrentCharge(charge);
            setFormData({
                name: charge.name,
                chargeType: charge.chargeType,
                amount: charge.amount,
                taxApplicable: charge.taxApplicable
            });
        } else {
            setCurrentCharge(null);
            setFormData({ name: '', chargeType: 'Fixed', amount: '', taxApplicable: true });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = modalMode === 'add' ? `${API_URL}/api/extra-charges/add` : `${API_URL}/api/extra-charges/update/${currentCharge._id}`;
            const method = modalMode === 'add' ? 'POST' : 'PUT';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                setIsModalOpen(false);
                fetchCharges();
            } else {
                alert(data.message);
            }
        } catch (error) { alert('Error submitting'); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this charge?')) {
            try {
                await fetch(`${API_URL}/api/extra-charges/delete/${id}`, { method: 'DELETE' });
                fetchCharges();
            } catch (error) { alert('Error deleting'); }
        }
    };

    return (
        <div className="extra-charge-container">
            <header className="extra-charge-header">
                <h2>Extra Charges</h2>
                <button className="add-btn" onClick={() => handleOpenModal('add')}>+ Add Extra Charge</button>
            </header>

            {loading ? <div>Loading...</div> : (
                <div className="table-container">
                    <table className="common-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Charge Name</th>
                                <th>Charge Type</th>
                                <th>Amount</th>
                                <th>Tax Applicable</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {charges.map((charge, index) => (
                                <tr key={charge._id}>
                                    <td>{index + 1}</td>
                                    <td>{charge.name}</td>
                                    <td>{charge.chargeType}</td>
                                    <td>{cs} {charge.amount}</td>
                                    <td>
                                        <label className="checkbox-container">
                                            <input type="checkbox" checked={charge.taxApplicable} readOnly />
                                            <span className="checkmark"></span>
                                            GST
                                        </label>
                                    </td>
                                    <td className="text-right">
                                        <div className="action-btns">
                                            <button className="icon-btn edit-btn" onClick={() => handleOpenModal('edit', charge)}>✏️</button>
                                            <button className="icon-btn delete-btn" onClick={() => handleDelete(charge._id)}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="table-footer">Showing {charges.length} Extra Charges</div>
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{modalMode === 'add' ? 'Add Charge' : 'Edit Charge'}</h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Charge Name</label>
                                <input type="text" value={formData.name} onChange={e => {
                                    const value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                                    setFormData({ ...formData, name: value });
                                }} required />
                            </div>
                            <div className="form-group">
                                <label>Charge Type</label>
                                <select value={formData.chargeType} onChange={e => setFormData({ ...formData, chargeType: e.target.value })}>
                                    <option value="Fixed">Fixed</option>
                                    <option value="Per Night">Per Night</option>
                                    <option value="Per Item">Per Item</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Amount ({cs})</label>
                                <input type="number" value={formData.amount} onChange={e => {
                                    const val = e.target.value;
                                    if (val === '' || Number(val) >= 0) {
                                        setFormData({ ...formData, amount: val });
                                    }
                                }} min="0" required />
                            </div>
                            <div className="form-group checkbox-group">
                                <label>
                                    <input type="checkbox" checked={formData.taxApplicable} onChange={e => setFormData({ ...formData, taxApplicable: e.target.checked })} />
                                    Tax Applicable (GST)
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
export default ExtraCharge;
