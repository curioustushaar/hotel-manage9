import { useState } from 'react';
import CreateGuestForm from './CreateGuestForm';
import './GuestModal.css';

const GuestModal = ({ isOpen, onClose, onSelectGuest, guests = [] }) => {
    const [view, setView] = useState('selection'); // 'selection' or 'create'
    const [searchTerm, setSearchTerm] = useState('');

    if (!isOpen) return null;

    const handleSelectGuest = (guest) => {
        onSelectGuest(guest);
        onClose();
    };

    const handleCreateGuest = (newGuest) => {
        // Select the newly created guest
        onSelectGuest(newGuest);
        onClose();
    };

    const filteredGuests = guests.filter(guest =>
        (guest.fullName || guest.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (guest.mobile || '').includes(searchTerm)
    );

    return (
        <div className="guest-modal-overlay" onClick={onClose}>
            <div className="guest-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{view === 'selection' ? '👥 Select Guest' : '🆕 Create New Guest'}</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    {view === 'selection' ? (
                        <div className="guest-selection-view">
                            {/* Search Box */}
                            <div className="search-box">
                                <span className="search-icon">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Search by name or phone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                            </div>

                            {/* Guests List */}
                            <div className="guests-list">
                                {filteredGuests.length > 0 ? (
                                    filteredGuests.map(guest => (
                                        <div
                                            key={guest.id || guest.guestId}
                                            className="guest-item"
                                            onClick={() => handleSelectGuest(guest)}
                                        >
                                            <div className="guest-item-avatar">
                                                {(guest.fullName || guest.name)?.charAt(0).toUpperCase()}
                                            </div>

                                            <div className="guest-item-info">
                                                <p className="guest-name">{guest.fullName || guest.name}</p>
                                                <p className="guest-phone">📱 {guest.mobile || guest.phone}</p>
                                                {(guest.email) && <p className="guest-email">✉️ {guest.email}</p>}
                                            </div>

                                            <div className="guest-item-meta">
                                                {guest.bookingCount && (
                                                    <span className="booking-badge">
                                                        {guest.bookingCount || 1} booking(s)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-results">
                                        {guests.length === 0 ? (
                                            <>
                                                <p className="no-results-icon">😔</p>
                                                <p>No guests available</p>
                                                <p className="no-results-hint">Create a new guest to get started</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="no-results-icon">🔍</p>
                                                <p>No guests found</p>
                                                <p className="no-results-hint">Try a different search term</p>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="modal-actions">
                                <button
                                    className="btn-create-new"
                                    onClick={() => setView('create')}
                                >
                                    + Create New Guest
                                </button>
                            </div>
                        </div>
                    ) : (
                        <CreateGuestForm
                            onSave={handleCreateGuest}
                            onCancel={() => setView('selection')}
                            existingGuests={guests}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default GuestModal;
