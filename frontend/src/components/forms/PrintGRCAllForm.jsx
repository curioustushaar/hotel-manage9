import { useState, useEffect } from 'react';
import './FormStyles.css';
import API_URL from '../../config/api';

const PrintGRCAllForm = ({ booking, onSubmit, onCancel }) => {
    const [bookings, setBookings] = useState([]);
    const [selectedBookings, setSelectedBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all'); // 'all', 'today', 'week'
    const [printType, setPrintType] = useState('Dot Matrix');

    const printOptions = [
        'Dot Matrix', 'Thermal', 'A4', 'A5', '2 inch', '3 inch'
    ];

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

    const getPrintStyle = (type) => {
        const reset = `
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { color: #000; line-height: 1.3; }
        `;

        if (type === 'A4' || type === 'A5') {
            return `
                ${reset}
                body { 
                    font-family: Arial, sans-serif; 
                    padding: ${type === 'A5' ? '20px' : '40px'}; 
                    font-size: ${type === 'A5' ? '11px' : '13px'};
                }
                .grc-card {
                    padding: 20px;
                    border: 1px solid #000;
                    margin-bottom: 20px;
                    page-break-after: always;
                    height: 95vh;
                }
                .grc-card:last-child { page-break-after: auto; }
                .header {
                    text-align: center;
                    border-bottom: 2px solid #000;
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                }
                .hotel-name {
                    font-size: 22px;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .document-title {
                    text-align: center;
                    background: #000;
                    color: #fff;
                    padding: 8px;
                    font-weight: bold;
                    margin: 20px 0;
                    text-transform: uppercase;
                    font-size: 14px;
                }
                .info-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 15px 0;
                }
                .info-table td {
                    padding: 8px;
                    border: 1px solid #999;
                }
                .info-table .label {
                    font-weight: bold;
                    width: 35%;
                    background: #f0f0f0;
                }
                .additional-info p { margin: 5px 0; }
                .declaration {
                    margin: 20px 0;
                    padding: 10px;
                    border: 1px solid #ccc;
                    font-size: 11px;
                    text-align: justify;
                }
                .signature-area {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 40px;
                }
                .sign-line {
                    border-top: 1px solid #000;
                    padding-top: 5px;
                    text-align: center;
                    width: 40%;
                }
                .footer-note {
                    text-align: center;
                    margin-top: 20px;
                    font-size: 10px;
                    color: #666;
                }
                @media print {
                    @page { size: ${type}; margin: 10mm; }
                }
            `;
        }

        if (type === 'Dot Matrix') {
            return `
                ${reset}
                body { 
                    font-family: 'Courier New', Courier, monospace; 
                    font-size: 13px; 
                    padding: 15px;
                }
                .grc-card {
                    padding: 10px;
                    border-bottom: 2px dashed #000;
                    margin-bottom: 30px;
                    page-break-after: always;
                }
                .header {
                    text-align: center;
                    border-bottom: 1px dashed #000;
                    padding-bottom: 10px;
                    margin-bottom: 15px;
                }
                .hotel-name {
                    font-size: 18px;
                    font-weight: bold;
                    text-transform: uppercase;
                }
                .document-title {
                    text-align: center;
                    border: 1px dashed #000;
                    padding: 5px;
                    font-weight: bold;
                    margin: 15px 0;
                    text-transform: uppercase;
                }
                .info-table {
                    width: 100%;
                    margin: 10px 0;
                }
                .info-table td {
                    padding: 4px 0;
                    border-bottom: 1px dotted #000;
                }
                .info-table .label {
                    font-weight: bold;
                    width: 40%;
                }
                .declaration {
                    margin: 15px 0;
                    padding: 5px;
                    border: 1px dashed #000;
                    font-size: 11px;
                }
                .signature-area { margin-top: 30px; }
                .sign-line {
                    border-top: 1px dashed #000;
                    margin-top: 20px;
                    padding-top: 5px;
                    text-align: center;
                }
                @media print {
                    @page { size: auto; margin: 5mm; }
                }
            `;
        }

        // Thermal / Small Format
        const isSmall = type === '2 inch';
        const width = isSmall ? '56mm' : '78mm';
        const fontSize = isSmall ? '10px' : '11px';

        return `
            ${reset}
            body { 
                font-family: 'Roboto Mono', monospace; 
                font-size: ${fontSize};
                width: ${width};
                background: #fff;
            }
            .grc-card { 
                padding: 0; 
                border-bottom: 2px dashed #000; 
                padding-bottom: 20px;
                margin-bottom: 20px;
            }
            .header { 
                text-align: center; 
                margin-bottom: 10px; 
                border-bottom: 1px dashed #000;
                padding-bottom: 5px;
            }
            .hotel-name { 
                font-size: ${isSmall ? '14px' : '16px'}; 
                font-weight: bold; 
                margin-bottom: 5px;
            }
            .document-title { 
                text-align: center; 
                font-weight: bold; 
                margin: 10px 0; 
                border: 1px solid #000; 
                padding: 4px;
                font-size: ${fontSize};
            }
            .info-table { 
                width: 100%; 
                margin: 10px 0; 
                border-collapse: collapse; 
            }
            .info-table td { 
                padding: 2px 0; 
                border-bottom: 1px dotted #ccc;
                display: ${isSmall ? 'block' : 'table-cell'};
            }
            .info-table .label { 
                font-weight: bold; 
                width: ${isSmall ? '100%' : '40%'}; 
            }
            .declaration { 
                margin: 10px 0; 
                font-size: ${isSmall ? '9px' : '10px'}; 
                text-align: justify;
                border-top: 1px dashed #000;
                padding-top: 5px;
            }
            .signature-area { margin-top: 20px; }
            .sign-line { 
                border-top: 1px solid #000; 
                margin-top: 20px; 
                padding-top: 5px; 
                text-align: center; 
            }
            .footer-note { 
                text-align: center; 
                margin-top: 10px; 
                font-size: 9px; 
                color: #666; 
            }
            @media print {
                @page { size: ${width} auto; margin: 0; }
            }
        `;
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
            timestamp: new Date().toISOString(),
            type: printType
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
                    ${getPrintStyle(printType)}
                </style>
            </head>
            <body>
                ${grcCards}
            </body>
            </html>
        `;
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Main Content */}
            <div className="flex-1 overflow-hidden flex flex-col p-8 space-y-6">
                {/* Filter Section */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <label className="block text-sm font-medium text-gray-500 mb-2">Filter</label>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full px-4 py-2.5 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all"
                    >
                        <option value="all">All Bookings</option>
                        <option value="today">Today's Check-ins</option>
                        <option value="week">This Week</option>
                    </select>
                </div>

                {/* Print Type Dropdown */}
                <div>
                    <label className="block text-base font-semibold text-gray-700 mb-3">Print Type</label>
                    <select
                        value={printType}
                        onChange={(e) => setPrintType(e.target.value)}
                        className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white"
                    >
                        {printOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-gray-500 text-base">Loading bookings...</div>
                ) : (
                    <>
                        {/* Selection Header */}
                        <div className="flex justify-between items-center py-2">
                            <button
                                type="button"
                                onClick={handleSelectAll}
                                className="text-sm px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors border border-gray-300 font-medium"
                            >
                                {selectedBookings.length === bookings.length ? 'Unselect All' : 'Select All'}
                            </button>
                            <span className="text-base text-gray-700 font-semibold">
                                {selectedBookings.length} selected
                            </span>
                        </div>

                        {/* Booking List */}
                        <div className="flex-1 overflow-y-auto border-2 border-gray-200 rounded-lg bg-white">
                            {bookings.length === 0 ? (
                                <div className="p-12 text-center text-gray-500 text-base">
                                    No bookings found
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {bookings.map(b => (
                                        <div
                                            key={b._id}
                                            onClick={() => handleSelectBooking(b._id)}
                                            className={`p-4 cursor-pointer flex items-center gap-4 transition-colors ${selectedBookings.includes(b._id) ? 'bg-green-50 border-l-4 border-green-500' : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedBookings.includes(b._id)}
                                                onChange={() => handleSelectBooking(b._id)}
                                                className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-gray-900 text-base truncate">{b.guestName}</div>
                                                <div className="text-sm text-gray-500 truncate">
                                                    {b.bookingId} • Room: {b.roomNumber || 'TBA'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Footer Action - Centered Green Print Button */}
            <div className="p-6 border-t bg-gray-50">
                <button
                    type="button"
                    onClick={handlePrintAll}
                    disabled={selectedBookings.length === 0}
                    className={`w-full py-3.5 text-base font-semibold rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-2 ${selectedBookings.length === 0
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-green-600 hover:bg-green-700 hover:shadow-lg text-white active:scale-98'
                        }`}
                >
                    <span className="text-xl">🖨️</span>
                    <span>Print {selectedBookings.length} GRC Form{selectedBookings.length !== 1 ? 's' : ''}</span>
                </button>
            </div>
        </div>
    );
};

export default PrintGRCAllForm;
