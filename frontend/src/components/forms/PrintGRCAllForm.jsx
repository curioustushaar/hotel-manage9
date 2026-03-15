import { useState, useEffect } from 'react';
import '../AddPayment.css';

const PrintGRCAllForm = ({ booking, onSubmit, onCancel }) => {
    const [people, setPeople] = useState([]);
    const [selectedPeople, setSelectedPeople] = useState([]);

    useEffect(() => {
        if (!booking) return;

        const allPeople = [];

        // 1. Main Guest
        allPeople.push({
            id: 'main-guest',
            type: 'Main Guest',
            name: booking.guestName || 'Guest',
            phone: booking.mobileNumber || 'N/A',
            email: booking.email || 'N/A'
        });

        // 2. Additional Guests
        if (booking.additionalGuests && booking.additionalGuests.length > 0) {
            booking.additionalGuests.forEach((g, idx) => {
                allPeople.push({
                    id: `add-guest-${idx}`,
                    type: 'Accompanying Guest',
                    name: g.name || 'Unknown',
                    phone: g.mobile || 'N/A',
                    email: g.email || 'N/A'
                });
            });
        }

        // 3. Visitors
        if (booking.visitors && booking.visitors.length > 0) {
            booking.visitors.forEach((v, idx) => {
                allPeople.push({
                    id: `visitor-${idx}`,
                    type: 'Visitor',
                    name: v.name || v.visitorName || 'Unknown',
                    phone: v.mobile || v.visitorMobile || v.phone || 'N/A',
                    email: v.email || 'N/A'
                });
            });
        }

        setPeople(allPeople);
        setSelectedPeople(allPeople.map(p => p.id));
    }, [booking]);

    const handleSelectAll = () => {
        if (selectedPeople.length === people.length) {
            setSelectedPeople([]);
        } else {
            setSelectedPeople(people.map(p => p.id));
        }
    };

    const handleSelectPerson = (id) => {
        setSelectedPeople(prev => 
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        );
    };

    const handlePrintAll = () => {
        if (selectedPeople.length === 0) return;
        const selectedData = people.filter(p => selectedPeople.includes(p.id));
        onSubmit({ action: 'print-grc-all', count: selectedData.length, selectedData, booking });
    };

    return (
        <div className="add-payment-form-premium" style={{ height: '100%', width: '100%', boxSizing: 'border-box' }}>
            <div className="add-payment-body" style={{ padding: '24px', overflowY: 'auto' }}>
                <div className="bookings-list-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <label style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                            Select Guests / Visitors to Print GRC
                        </label>
                        {people.length > 0 && (
                            <button
                                type="button"
                                onClick={handleSelectAll}
                                style={{
                                    background: 'none', border: 'none',
                                    color: '#2563eb', fontSize: '12px',
                                    fontWeight: '600', cursor: 'pointer'
                                }}
                            >
                                {selectedPeople.length === people.length ? 'Deselect All' : 'Select All'}
                            </button>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {people.length === 0 ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '12px' }}>
                                No guests or visitors found.
                            </div>
                        ) : (
                            people.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => handleSelectPerson(p.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '12px',
                                        padding: '12px 16px', borderRadius: '12px',
                                        background: selectedPeople.includes(p.id) ? '#fff1f2' : '#f8fafc',
                                        border: `1px solid ${selectedPeople.includes(p.id) ? '#fda4af' : '#e2e8f0'}`,
                                        cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{
                                        width: '18px', height: '18px', borderRadius: '6px',
                                        border: selectedPeople.includes(p.id) ? 'none' : '2px solid #cbd5e1',
                                        background: selectedPeople.includes(p.id) ? '#f43f5e' : 'white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                                    }}>
                                        {selectedPeople.includes(p.id) && <span style={{ fontSize: '12px' }}>✓</span>}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: selectedPeople.includes(p.id) ? '#1e293b' : '#475569' }}>
                                            {p.name}
                                        </p>
                                        <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>
                                            {p.type} • {p.phone}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="payment-modal-footer">
                <button type="button" className="btn-secondary" onClick={onCancel} style={{ flex: 1 }}>
                    CANCEL
                </button>
                <button
                    type="button"
                    className="btn-primary"
                    onClick={handlePrintAll}
                    disabled={selectedPeople.length === 0}
                    style={{ flex: 2 }}
                >
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    PRINT {selectedPeople.length} GRCs
                </button>
            </div>
        </div>
    );
};

export default PrintGRCAllForm;
