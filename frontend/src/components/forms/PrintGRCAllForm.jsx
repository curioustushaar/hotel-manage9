import { useState, useEffect } from 'react';
import '../AddPayment.css';
import API_URL from '../../config/api';

const PrintGRCAllForm = ({ onSubmit, onCancel }) => {
    const [bookings, setBookings] = useState([]);
    const [selectedBookings, setSelectedBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');
    const [printType, setPrintType] = useState('A4');

    const printOptions = ['A4', 'A5', 'Thermal', 'Dot Matrix', '3 inch', '2 inch'];

    useEffect(() => { fetchBookings(); }, [filter]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/bookings/list`);
            const data = await response.json();
            if (data.success) {
                let filtered = data.data;
                if (filter === 'today') {
                    const today = new Date().toDateString();
                    filtered = filtered.filter(b => new Date(b.checkInDate).toDateString() === today);
                } else if (filter === 'week') {
                    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
                    filtered = filtered.filter(b => new Date(b.checkInDate) >= weekAgo);
                }
                setBookings(filtered);
                setSelectedBookings(filtered.map(b => b._id));
            }
        } catch (error) { console.error('Error fetching bookings:', error); }
        finally { setLoading(false); }
    };

    const handleSelectAll = () => {
        setSelectedBookings(selectedBookings.length === bookings.length ? [] : bookings.map(b => b._id));
    };

    const handleSelectBooking = (bookingId) => {
        setSelectedBookings(prev => prev.includes(bookingId) ? prev.filter(id => id !== bookingId) : [...prev, bookingId]);
    };

    const handlePrintAll = () => {
        const selectedData = bookings.filter(b => selectedBookings.includes(b._id));
        if (selectedData.length === 0) return;
        onSubmit({ action: 'print-grc-all', count: selectedData.length, type: printType });
    };

    return (
        <div className="add-payment-form-premium" style={{ height: '100%', width: '100%', boxSizing: 'border-box' }}>
            <div className="add-payment-body">
                {/* Filter & Format Selection */}
                <div className="payment-method-grid" style={{ gap: '12px' }}>
                    <div className="payment-field-group">
                        <label className="field-label-premium">FILTER BOOKINGS</label>
                        <select 
                            value={filter} 
                            onChange={(e) => setFilter(e.target.value)}
                            style={{ width: '100%', height: '46px', borderRadius: '12px', border: '2px solid #f1f5f9', padding: '0 12px', background: '#f8fafc', fontSize: '13px', fontWeight: '700' }}
                        >
                            <option value="all">All Bookings</option>
                            <option value="today">Today's Check-ins</option>
                            <option value="week">Past 7 Days</option>
                        </select>
                    </div>
                    <div className="payment-field-group">
                        <label className="field-label-premium">PRINT FORMAT</label>
                        <select 
                            value={printType} 
                            onChange={(e) => setPrintType(e.target.value)}
                            style={{ width: '100%', height: '46px', borderRadius: '12px', border: '2px solid #f1f5f9', padding: '0 12px', background: '#f8fafc', fontSize: '13px', fontWeight: '700' }}
                        >
                            {printOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                </div>

                {/* List Header */}
                <div className="flex-row-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <button 
                        type="button" 
                        onClick={handleSelectAll}
                        style={{ background: '#f1f5f9', border: 'none', padding: '6px 14px', borderRadius: '10px', fontSize: '11px', fontWeight: '800', color: '#475569', cursor: 'pointer' }}
                    >
                        {selectedBookings.length === bookings.length ? 'UNSELECT ALL' : 'SELECT ALL'}
                    </button>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>
                        SELECTED: {selectedBookings.length < 10 ? `0${selectedBookings.length}` : selectedBookings.length} / {bookings.length}
                    </span>
                </div>

                {/* Scrollable Booking List */}
                <div className="booking-list-container" style={{ 
                    flex: 1, 
                    minHeight: '200px', 
                    background: '#f8fafc', 
                    borderRadius: '20px', 
                    border: '1px solid #e2e8f0',
                    overflowY: 'auto',
                    marginTop: '4px'
                }}>
                    {loading ? (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyCenter: 'center', padding: '40px' }}>
                            <div className="spinner-small" style={{ margin: '0 auto' }}></div>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div style={{ padding: '40px', textCenter: 'center', color: '#94a3b8', fontSize: '13px', fontWeight: '600', textAlign: 'center' }}>
                            No bookings matching filter
                        </div>
                    ) : (
                        <div style={{ padding: '8px' }}>
                            {bookings.map(b => (
                                <div 
                                    key={b._id}
                                    onClick={() => handleSelectBooking(b._id)}
                                    style={{ 
                                        padding: '12px 16px', 
                                        background: selectedBookings.includes(b._id) ? '#ffffff' : 'transparent',
                                        borderRadius: '14px',
                                        marginBottom: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        cursor: 'pointer',
                                        border: selectedBookings.includes(b._id) ? '2px solid #f43f5e' : '2px solid transparent',
                                        transition: 'all 0.2s',
                                        boxShadow: selectedBookings.includes(b._id) ? '0 4px 12px rgba(244, 63, 94, 0.1)' : 'none'
                                    }}
                                >
                                    <div style={{ 
                                        width: '18px', 
                                        height: '18px', 
                                        borderRadius: '6px', 
                                        border: selectedBookings.includes(b._id) ? 'none' : '2px solid #cbd5e1',
                                        background: selectedBookings.includes(b._id) ? '#f43f5e' : 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white'
                                    }}>
                                        {selectedBookings.includes(b._id) && <span style={{ fontSize: '12px' }}>✓</span>}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: selectedBookings.includes(b._id) ? '#1e293b' : '#475569' }}>
                                            {b.guestName}
                                        </p>
                                        <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>
                                            {b.bookingId} • Room {b.roomNumber || 'TBA'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="payment-modal-footer">
                <button type="button" className="btn-secondary" onClick={onCancel} style={{ flex: 1 }}>
                    CANCEL
                </button>
                <button 
                    type="button" 
                    className="btn-primary" 
                    onClick={handlePrintAll} 
                    disabled={selectedBookings.length === 0}
                    style={{ flex: 2 }}
                >
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    PRINT {selectedBookings.length} GRCs
                </button>
            </div>
        </div>
    );
};

export default PrintGRCAllForm;
