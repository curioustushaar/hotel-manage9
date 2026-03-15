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

            {/* Premium Modal */}
            {isModalOpen && (
                <div className="add-payment-overlay">
                    <div className="add-payment-modal add-charge-premium">
                        <div className="premium-payment-header">
                            <div className="header-icon-wrap">
                                <span style={{ fontSize: '20px' }}>💰</span>
                            </div>
                            <div className="header-text">
                                <h3>{modalMode === 'add' ? 'Add Charge' : 'Edit Charge'}</h3>
                                <span>BILLING SETUP</span>
                            </div>
                            <button className="premium-close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                            <div className="add-payment-body">
                                <div className="payment-field-group">
                                    <label className="field-label-premium">CHARGE NAME</label>
                                    <div className="premium-input-wrap">
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={e => {
                                                const value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                                                setFormData({ ...formData, name: value });
                                            }}
                                            required
                                            placeholder="e.g. Service Charge, Extra Bed"
                                            className="premium-input"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="payment-field-group">
                                    <label className="field-label-premium">CHARGE TYPE</label>
                                    <div className="premium-input-wrap">
                                        <select
                                            value={formData.chargeType}
                                            onChange={e => setFormData({ ...formData, chargeType: e.target.value })}
                                            className="premium-input"
                                        >
                                            <option value="Fixed">Fixed</option>
                                            <option value="Per Night">Per Night</option>
                                            <option value="Per Item">Per Item</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="payment-field-group">
                                    <label className="field-label-premium">AMOUNT ({cs})</label>
                                    <div className="premium-input-wrap">
                                        <input
                                            type="number"
                                            value={formData.amount}
                                            onChange={e => {
                                                const val = e.target.value;
                                                if (val === '' || Number(val) >= 0) {
                                                    setFormData({ ...formData, amount: val });
                                                }
                                            }}
                                            min="0"
                                            placeholder="0.00"
                                            required
                                            className="premium-input"
                                        />
                                    </div>
                                </div>

                                <div className="payment-field-group">
                                    <label className="field-label-premium">TAX CONFIGURATION</label>
                                    <div
                                        className={`modern-checkbox-card ${formData.taxApplicable ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, taxApplicable: !formData.taxApplicable })}
                                    >
                                        <div className="checkbox-card-info">
                                            <span className="checkbox-card-title">Tax Applicable (GST)</span>
                                            <span className="checkbox-card-sub">Enable GST calculation for this charge</span>
                                        </div>
                                        <div className={`checkbox-custom-wrap ${formData.taxApplicable ? 'checked' : ''}`}>
                                            {formData.taxApplicable && <span className="check-icon">✓</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="payment-modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                                    CANCEL
                                </button>
                                <button type="submit" className="btn-primary">
                                    {modalMode === 'add' ? 'ADD CHARGE' : 'UPDATE CHARGE'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default ExtraCharge;
