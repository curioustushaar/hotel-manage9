import React, { useState, useMemo } from 'react';
import './RouteFolioSidebar.css';

const CATEGORIES_MAPPING = {
    roomCharges: ['Room Tariff', 'Room Stay', 'Room Charges', 'Rent', 'Accommodation'],
    roomPosting: ['Room Posting', 'Food Order', 'Room Order', 'Restaurant', 'In House Order', 'Restaurant Bill', 'Meal', 'Breakfast', 'Lunch', 'Dinner', 'Beverage', 'Drink', 'Mini Bar'],
    laundry: ['Laundry', 'Wash', 'Iron', 'Press', 'Cleaning'],
    dryCleaning: ['Dry Cleaning'],
    spa: ['Spa', 'Wellness', 'Massage', 'Therapy', 'Steam', 'Sauna'],
    gym: ['Gym', 'Fitness', 'Trainer', 'Workout'],
    pool: ['Pool', 'Swimming'],
    pets: ['Pet', 'Dog', 'Cat'],
    special: ['Special Request', 'Extra Person', 'Bed', 'Mattress'],
    deposit: ['Deposit', 'Security', 'Advance'],
    key: ['Key', 'Card Replacement', 'Lost Card'],
    smoking: ['Smoking', 'Cleaning Fee'],
    towels: ['Towel', 'Toiletries', 'Linen'],
    parking: ['Parking', 'Garage'],
    valet: ['Valet']
};

const RouteFolioSidebar = ({
    onClose,
    onSave,
    sourceFolioId,
    sourceFolioName,
    availableFolios,
    transactions = [],
    reservation
}) => {
    const [targetFolioId, setTargetFolioId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState({
        roomCharges: false,
        roomPosting: false,
        all: false,
        laundry: false,
        dryCleaning: false,
        spa: false,
        gym: false,
        pool: false,
        pets: false,
        special: false,
        deposit: false,
        key: false,
        smoking: false,
        towels: false,
        parking: false,
        valet: false
    });

    const handleCheckboxChange = (name) => {
        const extraChargeCategories = [
            'laundry', 'dryCleaning', 'spa', 'gym', 'pool', 'pets',
            'special', 'deposit', 'key', 'smoking', 'towels', 'parking', 'valet'
        ];

        if (name === 'all') {
            const newValue = !selectedCategories.all;
            const updated = {};
            extraChargeCategories.forEach(key => {
                updated[key] = newValue;
            });
            setSelectedCategories(prev => ({ ...prev, ...updated, all: newValue }));
        } else {
            setSelectedCategories(prev => {
                const newState = { ...prev, [name]: !prev[name] };
                if (extraChargeCategories.includes(name)) {
                    const allSelected = extraChargeCategories.every(key => newState[key]);
                    newState.all = allSelected;
                }
                return newState;
            });
        }
    };

    const matchingData = useMemo(() => {
        const sourceTransactions = transactions.filter(t =>
            String(t.folioId || 0) === String(sourceFolioId || 0) &&
            t.type?.toLowerCase() === 'charge' &&
            t.amount > 0
        );

        const ids = new Set();
        Object.keys(selectedCategories).forEach(cat => {
            if (selectedCategories[cat] && CATEGORIES_MAPPING[cat]) {
                const keywords = CATEGORIES_MAPPING[cat];
                sourceTransactions.forEach(t => {
                    const text = `${t.particulars || ''} ${t.description || ''} `.toLowerCase();
                    if (keywords.some(kw => text.includes(kw.toLowerCase()))) {
                        ids.add(t._id || t.id);
                    }
                });
            }
        });

        return {
            ids: Array.from(ids),
            count: ids.size
        };
    }, [selectedCategories, transactions, sourceFolioId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!targetFolioId) {
            alert('Please select a target folio');
            return;
        }

        const targetFolio = availableFolios.find(f => String(f.id) === String(targetFolioId));
        setIsSubmitting(true);

        if (onSave) {
            await onSave({
                sourceFolioId,
                targetFolioId: parseInt(targetFolioId),
                targetFolioName: targetFolio?.name || 'Target Folio',
                transactionIds: matchingData.ids,
                transactionCount: matchingData.count,
                selectedCategories
            });
        }
        setTimeout(() => onClose(), 500);
    };

    const hasAnySelection = Object.values(selectedCategories).some(v => v === true);

    return (
        <div className="add-payment-overlay" onClick={onClose}>
            <div className="add-payment-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="premium-payment-header">
                    <div className="header-icon-wrap">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 16V4M7 4L3 8M7 4L11 8m6 0v12m0 0l4-4m-4 4l-4-4"></path></svg>
                    </div>
                    <div className="header-text">
                        <h3>Route Transactions</h3>
                        <span>Move charges between folios</span>
                    </div>
                    <button className="premium-close-btn" onClick={onClose}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className="add-payment-body">
                    {/* Reservation Context Card */}
                    <div className="payment-summary-card">
                        <div className="summary-header">
                            <span className="ref-tag">SOURCE FOLIO</span>
                            <span className="ref-number">{sourceFolioName || 'Main Folio'}</span>
                        </div>
                        <div className="summary-details">
                            <div className="detail-col">
                                <label>Routing Scope</label>
                                <p className="truncate-text">Future folia of this guest</p>
                            </div>
                            <div className="detail-col-group">
                                <div className="detail-sub-col">
                                    <label>Guest</label>
                                    <p>{reservation?.guestName || 'Shekhar Kumar'}</p>
                                </div>
                                <div className="detail-sub-col text-right">
                                    <label>Room</label>
                                    <p className="balance-text-bold">{reservation?.roomNumber || '101'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="payment-field-group">
                        <label className="field-label-premium">Target Destination</label>
                        <div className="modern-select-wrapper">
                            <select
                                value={targetFolioId}
                                onChange={(e) => setTargetFolioId(e.target.value)}
                                className="premium-dropdown-select"
                                required
                            >
                                <option value="">Select Target Folio</option>
                                {availableFolios
                                    ?.filter(folio => String(folio.id) !== String(sourceFolioId))
                                    .map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))
                                }
                            </select>
                            <div className="select-arrow">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </div>
                        </div>
                    </div>

                    <div className="route-grid-section">
                        <label className="field-label-premium">Core Charges</label>
                        <div className="discount-scope-panel">
                            <label className="premium-checkbox-card">
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.roomCharges}
                                    onChange={() => handleCheckboxChange('roomCharges')}
                                />
                                <div className="checkbox-custom-content">
                                    <span className="custom-check-box"></span>
                                    <span className="card-label-text">Room Tariff</span>
                                </div>
                            </label>
                            <label className="premium-checkbox-card">
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.roomPosting}
                                    onChange={() => handleCheckboxChange('roomPosting')}
                                />
                                <div className="checkbox-custom-content">
                                    <span className="custom-check-box"></span>
                                    <span className="card-label-text">Postings</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="route-grid-section" style={{marginTop:'12px'}}>
                        <label className="field-label-premium" style={{display:'flex', justifyContent:'space-between'}}>
                            Other Services
                            <span 
                                onClick={() => handleCheckboxChange('all')} 
                                style={{fontSize:'11px', color:'#f43f5e', cursor:'pointer', fontWeight: 800}}
                            >
                                {selectedCategories.all ? 'DESELECT ALL' : 'SELECT ALL'}
                            </span>
                        </label>
                        <div className="premium-compact-checkbox-list">
                            {[
                                { name: 'laundry', label: 'Laundry' },
                                { name: 'dryCleaning', label: 'Dry Cleaning' },
                                { name: 'spa', label: 'Spa & Wellness' },
                                { name: 'gym', label: 'Gym' },
                                { name: 'pool', label: 'Pool' },
                                { name: 'pets', label: 'Pets' },
                                { name: 'special', label: 'Special Req.' },
                                { name: 'deposit', label: 'Deposit' },
                                { name: 'key', label: 'Key/Card' },
                                { name: 'smoking', label: 'Smoking Fee' },
                                { name: 'towels', label: 'Towels' },
                                { name: 'parking', label: 'Parking' },
                                { name: 'valet', label: 'Valet' }
                            ].map(item => (
                                <label key={item.name} className="compact-checkbox-card">
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories[item.name]}
                                        onChange={() => handleCheckboxChange(item.name)}
                                    />
                                    <div className="compact-check-content">
                                        <span className="dot-marker"></span>
                                        <span>{item.label}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="payment-modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button 
                        className="btn-primary" 
                        onClick={handleSubmit} 
                        disabled={!hasAnySelection || !targetFolioId || isSubmitting}
                    >
                        {isSubmitting ? <div className="spinner-small" /> : (
                            matchingData.count > 0 ? `Move ${matchingData.count} Items` : 'Save Routing'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RouteFolioSidebar;
