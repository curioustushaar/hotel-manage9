import React from 'react';
import './ReservationTabs.css';

const ReservationTabs = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: 'folio-operations', label: 'Folio Operations' },
        { id: 'booking-details', label: 'Booking Details' },
        { id: 'guest-details', label: 'Guest Details' },
        { id: 'room-charges', label: 'Room Charges' },
        { id: 'audit-trail', label: 'Audit Trail' }
    ];

    return (
        <div className="reservation-tabs-container">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    className={`reservation-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => onTabChange(tab.id)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default ReservationTabs;
