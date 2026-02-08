import { useState, useEffect } from 'react';
import './FormStyles.css';
import API_URL from '../../config/api';

const PrintGRCAllForm = ({ booking, onSubmit, onCancel }) => {
    const [bookings, setBookings] = useState([]);
    const [selectedBookings, setSelectedBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all'); // 'all', 'today', 'week'

    useEffect(() => {
        fetchBookings();
    }, [filter]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/bookings/list`);
            const data = await response.json();
            
            if (data.success) {
                let filtered = data.data;
                
                if (filter === 'today') {
                    const today = new Date().toDateString();
                    filtered = filtered.filter(b => 
                        new Date(b.checkInDate).toDateString() === today
                    );
                } else if (filter === 'week') {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    filtered = filtered.filter(b => 
                        new Date(b.checkInDate) >= weekAgo
                    );
                }
                
                setBookings(filtered);
                // Select all by default
                setSelectedBookings(filtered.map(b => b._id));
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = () => {
        if (selectedBookings.length === bookings.length) {
            setSelectedBookings([]);
        } else {
            setSelectedBookings(bookings.map(b => b._id));
        }
    };

    const handleSelectBooking = (bookingId) => {
        if (selectedBookings.includes(bookingId)) {
            setSelectedBookings(selectedBookings.filter(id => id !== bookingId));
        } else {
            setSelectedBookings([...selectedBookings, bookingId]);
        }
    };

    const handlePrintAll = () => {
        const selectedBookingData = bookings.filter(b => selectedBookings.includes(b._id));
        
        if (selectedBookingData.length === 0) {
            alert('Please select at least one booking');
            return;
        }

        const printContent = generateAllGRC(selectedBookingData);
        
        const printWindow = window.open('', '', 'width=900,height=700');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
        
        onSubmit({ 
            action: 'print-grc-all', 
            count: selectedBookingData.length,
            timestamp: new Date().toISOString() 
        });
    };

    const generateAllGRC = (bookings) => {
        const grcCards = bookings.map((booking, index) => `
            <div class="grc-card" style="page-break-after: always;">
                <div class="header">
                    <div class="hotel-name">BIREENA ATHITHI HOTEL</div>
                    <div style="font-size: 12px;">123 Hotel Street, City, State 12345</div>
                    <div style="font-size: 11px;">Phone: +91-1234-567890</div>
                </div>

                <div class="document-title">GUEST REGISTRATION CARD (Form C)</div>

                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 12px;">
                    <div><strong>Registration No:</strong> ${booking.bookingId || booking._id}</div>
                    <div><strong>Card ${index + 1}/${bookings.length}</strong></div>
                </div>

                <table class="info-table">
                    <tr>
                        <td class="label">Full Name:</td>
                        <td class="value">${booking.guestName || ''}</td>
                    </tr>
                    <tr>
                        <td class="label">Mobile Number:</td>
                        <td class="value">${booking.mobileNumber || ''}</td>
                    </tr>
                    <tr>
                        <td class="label">Email:</td>
                        <td class="value">${booking.email || ''}</td>
                    </tr>
                    <tr>
                        <td class="label">Room Type:</td>
                        <td class="value">${booking.roomType || ''}</td>
                    </tr>
                    <tr>
                        <td class="label">Room Number:</td>
                        <td class="value">${booking.roomNumber || 'TBA'}</td>
                    </tr>
                    <tr>
                        <td class="label">Check-In:</td>
                        <td class="value">${new Date(booking.checkInDate).toLocaleDateString('en-IN')}</td>
                    </tr>
                    <tr>
                        <td class="label">Check-Out:</td>
                        <td class="value">${new Date(booking.checkOutDate).toLocaleDateString('en-IN')}</td>
                    </tr>
                    <tr>
                        <td class="label">No. of Guests:</td>
                        <td class="value">${booking.numberOfGuests || 1}</td>
                    </tr>
                </table>

                <div class="additional-info">
                    <p><strong>Father's/Husband's Name:</strong> _________________________</p>
                    <p><strong>Age:</strong> _______ <strong>Gender:</strong> _______</p>
                    <p><strong>Nationality:</strong> _________________________</p>
                    <p><strong>ID Proof No:</strong> _________________________</p>
                    <p><strong>Permanent Address:</strong> _________________________</p>
                    <p>_________________________________________________</p>
                    <p><strong>Purpose of Visit:</strong> _________________________</p>
                </div>

                <div class="declaration">
                    <strong>DECLARATION:</strong> I declare that the above information is true and correct.
                </div>

                <div class="signature-area">
                    <div>
                        <div class="sign-line">Guest Signature</div>
                        <small>Date: ___________</small>
                    </div>
                    <div>
                        <div class="sign-line">Reception</div>
                        <small>${new Date().toLocaleDateString('en-IN')}</small>
                    </div>
                </div>

                <div class="footer-note">
                    Generated: ${new Date().toLocaleString('en-IN')} | Bireena Athithi Hotel
                </div>
            </div>
        `).join('');

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>GRC - All Guests</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: Arial, sans-serif; 
                        color: #000;
                        font-size: 13px;
                    }
                    .grc-card {
                        padding: 20px;
                        border: 2px solid #000;
                        margin-bottom: 20px;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 2px solid #000;
                        padding-bottom: 10px;
                        margin-bottom: 15px;
                    }
                    .hotel-name {
                        font-size: 20px;
                        font-weight: bold;
                    }
                    .document-title {
                        text-align: center;
                        background: #000;
                        color: #fff;
                        padding: 6px;
                        font-weight: bold;
                        margin: 10px 0;
                    }
                    .info-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 15px 0;
                    }
                    .info-table td {
                        padding: 6px;
                        border: 1px solid #ccc;
                    }
                    .info-table .label {
                        font-weight: bold;
                        width: 35%;
                        background: #f5f5f5;
                    }
                    .additional-info {
                        margin: 15px 0;
                        padding: 10px;
                        border: 1px solid #ccc;
                    }
                    .additional-info p {
                        margin: 5px 0;
                    }
                    .declaration {
                        margin: 15px 0;
                        padding: 8px;
                        border: 1px solid #000;
                        font-size: 11px;
                    }
                    .signature-area {
                        display: flex;
                        justify-content: space-between;
                        margin-top: 20px;
                    }
                    .sign-line {
                        border-top: 1px solid #000;
                        margin-top: 30px;
                        padding-top: 3px;
                        text-align: center;
                    }
                    .footer-note {
                        text-align: center;
                        margin-top: 10px;
                        font-size: 10px;
                        color: #666;
                    }
                    @media print {
                        @page { size: A4; margin: 10mm; }
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                ${grcCards}
            </body>
            </html>
        `;
    };

    return (
        <div className="form-container">
            <div className="form-section">
                <h3 className="section-title">📋 Print Multiple GRC Forms</h3>
                <p className="form-description">
                    Select multiple bookings to print their Guest Registration Cards in batch.
                </p>

                <div className="filter-section" style={{ marginTop: '20px', marginBottom: '15px' }}>
                    <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Filter:</label>
                    <select 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                        style={{
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid #d1d5db'
                        }}
                    >
                        <option value="all">All Bookings</option>
                        <option value="today">Today's Check-ins</option>
                        <option value="week">This Week</option>
                    </select>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>Loading bookings...</div>
                ) : (
                    <>
                        <div style={{ 
                            marginBottom: '15px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <button 
                                type="button"
                                onClick={handleSelectAll}
                                style={{
                                    padding: '8px 16px',
                                    background: '#f3f4f6',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }}
                            >
                                {selectedBookings.length === bookings.length ? '☑️ Deselect All' : '☐ Select All'}
                            </button>
                            <span style={{ color: '#6b7280' }}>
                                {selectedBookings.length} of {bookings.length} selected
                            </span>
                        </div>

                        <div style={{
                            maxHeight: '400px',
                            overflowY: 'auto',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px'
                        }}>
                            {bookings.length === 0 ? (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                                    No bookings found
                                </div>
                            ) : (
                                bookings.map(b => (
                                    <div 
                                        key={b._id}
                                        onClick={() => handleSelectBooking(b._id)}
                                        style={{
                                            padding: '12px',
                                            borderBottom: '1px solid #f3f4f6',
                                            cursor: 'pointer',
                                            background: selectedBookings.includes(b._id) ? '#fef2f2' : '#fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}
                                    >
                                        <input 
                                            type="checkbox"
                                            checked={selectedBookings.includes(b._id)}
                                            onChange={() => handleSelectBooking(b._id)}
                                            style={{ width: '18px', height: '18px' }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 'bold' }}>{b.guestName}</div>
                                            <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                                {b.bookingId} | Room: {b.roomNumber || 'TBA'} | 
                                                Check-in: {new Date(b.checkInDate).toLocaleDateString('en-IN')}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>

            <div className="form-actions">
                <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={onCancel}
                >
                    Cancel
                </button>
                <button 
                    type="button"
                    className="btn-primary"
                    onClick={handlePrintAll}
                    disabled={selectedBookings.length === 0}
                >
                    🖨️ Print {selectedBookings.length} GRC Forms
                </button>
            </div>
        </div>
    );
};

export default PrintGRCAllForm;
