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
    transactions = []
}) => {
    const [targetFolioId, setTargetFolioId] = useState('');
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
        if (name === 'all') {
            const newValue = !selectedCategories.all;
            const updated = {};
            Object.keys(selectedCategories).forEach(key => {
                if (key !== 'roomCharges') { // Include roomPosting in 'all'
                    updated[key] = newValue;
                }
            });
            setSelectedCategories(prev => ({ ...prev, ...updated, all: newValue }));
        } else {
            setSelectedCategories(prev => ({ ...prev, [name]: !prev[name] }));
        }
    };

    // Calculate matching transactions for current selection
    const matchingData = useMemo(() => {
        const sourceTransactions = transactions.filter(t =>
            // Use loose comparison for IDs which could be string/number mixtures
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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!targetFolioId) {
            alert('Please select a target folio');
            return;
        }

        const targetFolio = availableFolios.find(f => String(f.id) === String(targetFolioId));

        if (onSave) {
            onSave({
                sourceFolioId,
                targetFolioId: parseInt(targetFolioId),
                targetFolioName: targetFolio?.name || 'Target Folio',
                transactionIds: matchingData.ids,
                transactionCount: matchingData.count,
                selectedCategories
            });
        }
    };

    const hasAnySelection = Object.values(selectedCategories).some(v => v === true);

    return (
        <div className="route-folio-overlay" onClick={onClose}>
            <div className="route-folio-sidebar" onClick={(e) => e.stopPropagation()}>
                <div className="route-folio-header">
                    <h2>Route Folio</h2>
                    <button className="route-folio-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="route-folio-form">
                    <div className="route-folio-body">
                        {/* Source Folio */}
                        <div className="route-form-group">
                            <label className="route-main-label">Source Folio: {sourceFolioName}</label>
                        </div>

                        {/* Scope */}
                        <div className="route-form-group">
                            <label className="route-sub-label">scope</label>
                            <input
                                type="text"
                                className="route-read-only-input"
                                value="All future folia of this guest"
                                readOnly
                            />
                        </div>

                        {/* Target Folio */}
                        <div className="route-form-group">
                            <label className="route-sub-label">Folios</label>
                            <select
                                value={targetFolioId}
                                onChange={(e) => setTargetFolioId(e.target.value)}
                                className="route-select-modern"
                                required
                            >
                                <option value="">Select Target Folio</option>
                                {availableFolios
                                    ?.filter(folio => folio.id !== sourceFolioId)
                                    .map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))
                                }
                            </select>
                        </div>

                        {/* Route Section */}
                        <div className="route-section-modern">
                            <h3 className="route-section-title-modern">Route</h3>
                            <div className="checkout-group">
                                <label className="modern-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.roomCharges}
                                        onChange={() => handleCheckboxChange('roomCharges')}
                                    />
                                    <span>Room Charges & Taxes</span>
                                </label>
                                <label className="modern-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.roomPosting}
                                        onChange={() => handleCheckboxChange('roomPosting')}
                                    />
                                    <span>Room Posting</span>
                                </label>
                                <label className="modern-checkbox-label disabled">
                                    <input type="checkbox" disabled />
                                    <span>Inclusions</span>
                                </label>
                            </div>
                        </div>

                        {/* Extra Charges Section */}
                        <div className="route-section-modern">
                            <h3 className="route-section-title-modern">Extra Charges & Taxes</h3>
                            <div className="checkout-list">
                                {[
                                    { name: 'all', label: 'All' },
                                    { name: 'laundry', label: 'Laundry' },
                                    { name: 'dryCleaning', label: 'Dry Cleaning' },
                                    { name: 'spa', label: 'Spa and Wellness' },
                                    { name: 'gym', label: 'Gym Access' },
                                    { name: 'pool', label: 'Pool Access' },
                                    { name: 'pets', label: 'Pets' },
                                    { name: 'special', label: 'Special Requests' },
                                    { name: 'deposit', label: 'Damage or Security Deposit' },
                                    { name: 'key', label: 'Lost Key or Card Replacement' },
                                    { name: 'smoking', label: 'Smoking Fees' },
                                    { name: 'towels', label: 'Extra Towels or Toiletries' },
                                    { name: 'parking', label: 'Security Parking' },
                                    { name: 'valet', label: 'Valet Parking' }
                                ].map(item => (
                                    <label key={item.name} className="modern-checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories[item.name]}
                                            onChange={() => handleCheckboxChange(item.name)}
                                        />
                                        <span>{item.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="route-folio-footer-modern">
                        <button
                            type="submit"
                            className="route-save-btn-modern"
                            disabled={!hasAnySelection || !targetFolioId}
                        >
                            {matchingData.count > 0 ? `Route ${matchingData.count} Items` : 'Save Rules'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RouteFolioSidebar;
