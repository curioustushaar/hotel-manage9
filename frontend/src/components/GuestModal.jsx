import { useState, useEffect } from 'react';
import CreateGuestForm from './CreateGuestForm';
import './GuestModal.css';
import API_URL from '../config/api';

const GuestModal = ({ isOpen, onClose, onSelectGuest, guests = [], onRefreshGuests, autoOpenCreate = false }) => {
    const [view, setView] = useState(autoOpenCreate ? 'create' : 'selection'); // 'selection' or 'create'
    const [searchTerm, setSearchTerm] = useState('');
    const [editingGuest, setEditingGuest] = useState(null);
    const [guestsList, setGuestsList] = useState(guests); // Local state for real-time updates

    // Sync local state with props
    useEffect(() => {
        setGuestsList(guests);
    }, [guests]);

    // Update view when autoOpenCreate changes
    useEffect(() => {
        if (autoOpenCreate && isOpen) {
            setView('create');
        } else if (!autoOpenCreate && isOpen) {
            setView('selection');
        }
    }, [autoOpenCreate, isOpen]);

    if (!isOpen) return null;

    const handleSelectGuest = (guest) => {
        onSelectGuest(guest);
        onClose();
    };

    const handleCreateGuest = async (updatedGuest) => {
        console.log('💾 handleCreateGuest called with:', updatedGuest);

        if (editingGuest) {
            // ✅ EDIT MODE - Update state directly
            console.log('✏️ EDIT MODE: Updating guest in state...');

            setGuestsList(prevGuests =>
                prevGuests.map(g =>
                    (g._id === updatedGuest._id || g.id === updatedGuest._id || g.guestId === updatedGuest._id)
                        ? updatedGuest
                        : g
                )
            );

            // Reset editing state
            setEditingGuest(null);

            // Switch back to selection view (AUTO-BACK)
            setView('selection');

            console.log('✅ Guest updated in state, switched to selection view');

            // DO NOT close modal - stay open to show updated guest

        } else {
            // ✅ CREATE MODE - Add to state
            console.log('➕ CREATE MODE: Adding new guest to state...');

            setGuestsList(prevGuests => [...prevGuests, updatedGuest]);

            // Select the newly created guest
            onSelectGuest(updatedGuest);

            console.log('✅ New guest added, closing modal');

            // Close the modal
            onClose();
        }
    };

    const handleEditGuest = (guest) => {
        console.log('✏️ Edit button clicked for:', guest);
        setEditingGuest(guest);
        setView('create');
    };

    const handleDeleteGuest = async (guest) => {
        try {
            const response = await fetch(`${API_URL}/api/guests/${guest.id || guest.guestId || guest._id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                console.log('✅ Guest deleted successfully');
                // Refresh the guests list
                if (onRefreshGuests) {
                    await onRefreshGuests();
                }
            } else {
                const error = await response.json();
                console.error('❌ Failed to delete guest:', error);
                alert('Failed to delete guest. Please try again.');
            }
        } catch (error) {
            console.error('❌ Error deleting guest:', error);
            alert('Error deleting guest. Please try again.');
        }
    };

    const filteredGuests = guestsList.filter(guest =>
        (guest.fullName || guest.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (guest.mobile || '').includes(searchTerm)
    );

    return (
        <div className="guest-modal-overlay" onClick={onClose}>
            <div className="guest-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        {view === 'selection'
                            ? '👥 Select Guest'
                            : editingGuest
                                ? '✏️ Edit Guest Profile'
                                : '🆕 Create New Guest'
                        }
                    </h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    {view === 'selection' ? (
                        <>
                            {/* Search Box - Direct Child, Full Width */}
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

                            <div className="guest-selection-view">
                                {/* Guests List */}
                                <div className="guests-list">
                                    {filteredGuests.length > 0 ? (
                                        filteredGuests.map((guest, idx) => (
                                            <div
                                                key={guest._id || guest.id || guest.guestId || `guest-${idx}`}
                                                className="guest-item"
                                            >
                                                <div
                                                    className="guest-item-main"
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
                                                </div>

                                                <div className="guest-item-actions">
                                                    <button
                                                        className="action-btn edit-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditGuest(guest);
                                                        }}
                                                        title="Edit Guest"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        className="action-btn delete-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (window.confirm(`Are you sure you want to delete ${guest.fullName || guest.name}?`)) {
                                                                handleDeleteGuest(guest);
                                                            }
                                                        }}
                                                        title="Delete Guest"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-results">
                                            {guestsList.length === 0 ? (
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
                        </>
                    ) : (
                        <CreateGuestForm
                            onSave={handleCreateGuest}
                            onCancel={() => {
                                setEditingGuest(null);
                                setView('selection');
                            }}
                            existingGuests={guestsList}
                            editingGuest={editingGuest}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default GuestModal;
