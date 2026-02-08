import './FormStyles.css';

const PrintSummaryForm = ({ booking, onSubmit, onCancel }) => {
    
    const handlePrint = () => {
        // Create printable content
        const printContent = generatePrintSummary();
        
        // Open print window
        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
        
        onSubmit({ action: 'print-summary', timestamp: new Date().toISOString() });
    };

    const generatePrintSummary = () => {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Booking Summary - ${booking.bookingId}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                        padding: 40px; 
                        color: #333;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 3px solid #dc2626;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                    }
                    .hotel-name { 
                        font-size: 28px; 
                        font-weight: bold; 
                        color: #dc2626;
                        margin-bottom: 5px;
                    }
                    .hotel-info { 
                        font-size: 12px; 
                        color: #666; 
                        margin-top: 5px;
                    }
                    .document-title {
                        font-size: 22px;
                        font-weight: bold;
                        margin: 20px 0;
                        text-align: center;
                        text-transform: uppercase;
                    }
                    .section {
                        margin-bottom: 25px;
                        border: 1px solid #e5e7eb;
                        border-radius: 8px;
                        padding: 15px;
                    }
                    .section-title {
                        font-size: 16px;
                        font-weight: bold;
                        color: #dc2626;
                        margin-bottom: 15px;
                        border-bottom: 2px solid #fee2e2;
                        padding-bottom: 8px;
                    }
                    .info-row {
                        display: flex;
                        padding: 8px 0;
                        border-bottom: 1px solid #f3f4f6;
                    }
                    .info-row:last-child { border-bottom: none; }
                    .info-label {
                        font-weight: 600;
                        width: 200px;
                        color: #374151;
                    }
                    .info-value {
                        flex: 1;
                        color: #1f2937;
                    }
                    .status-badge {
                        display: inline-block;
                        padding: 4px 12px;
                        border-radius: 12px;
                        font-size: 12px;
                        font-weight: 600;
                        text-transform: uppercase;
                    }
                    .status-upcoming { background: #dbeafe; color: #1e40af; }
                    .status-checkedin { background: #d1fae5; color: #065f46; }
                    .status-checkedout { background: #f3f4f6; color: #374151; }
                    .amount-section {
                        background: #fef2f2;
                        padding: 15px;
                        border-radius: 8px;
                        margin-top: 10px;
                    }
                    .amount-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 6px 0;
                        font-size: 14px;
                    }
                    .total-row {
                        font-size: 18px;
                        font-weight: bold;
                        color: #dc2626;
                        border-top: 2px solid #dc2626;
                        padding-top: 10px;
                        margin-top: 10px;
                    }
                    .footer {
                        margin-top: 40px;
                        text-align: center;
                        font-size: 11px;
                        color: #6b7280;
                        border-top: 1px solid #e5e7eb;
                        padding-top: 20px;
                    }
                    @media print {
                        body { padding: 20px; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="hotel-name">Bireena Athithi Hotel</div>
                    <div class="hotel-info">
                        123 Hotel Street, City, State 12345<br>
                        Phone: +91-1234-567890 | Email: info@bireena-athithi.com<br>
                        GST: 22AACCU1234H1Z0
                    </div>
                </div>

                <div class="document-title">Booking Summary</div>

                <div class="section">
                    <div class="section-title">📋 Reservation Details</div>
                    <div class="info-row">
                        <div class="info-label">Booking ID:</div>
                        <div class="info-value"><strong>${booking.bookingId || 'N/A'}</strong></div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Reference Number:</div>
                        <div class="info-value">${booking.referenceNumber || 'N/A'}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Status:</div>
                        <div class="info-value">
                            <span class="status-badge status-${booking.status?.toLowerCase().replace(' ', '')}">${booking.status || 'N/A'}</span>
                        </div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Booking Date:</div>
                        <div class="info-value">${new Date(booking.createdAt).toLocaleDateString('en-IN')}</div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">👤 Guest Information</div>
                    <div class="info-row">
                        <div class="info-label">Guest Name:</div>
                        <div class="info-value"><strong>${booking.guestName || 'N/A'}</strong></div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Mobile Number:</div>
                        <div class="info-value">${booking.mobileNumber || 'N/A'}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Email:</div>
                        <div class="info-value">${booking.email || 'N/A'}</div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">🏨 Stay Details</div>
                    <div class="info-row">
                        <div class="info-label">Check-In Date:</div>
                        <div class="info-value">${new Date(booking.checkInDate).toLocaleDateString('en-IN')}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Check-Out Date:</div>
                        <div class="info-value">${new Date(booking.checkOutDate).toLocaleDateString('en-IN')}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Number of Nights:</div>
                        <div class="info-value">${booking.numberOfNights || 0} Night(s)</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Room Type:</div>
                        <div class="info-value">${booking.roomType || 'N/A'}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Room Number:</div>
                        <div class="info-value">${booking.roomNumber || 'Not Assigned'}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Number of Guests:</div>
                        <div class="info-value">${booking.numberOfGuests || 1} Guest(s)</div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">💰 Payment Summary</div>
                    <div class="amount-section">
                        <div class="amount-row">
                            <span>Room Charges (${booking.numberOfNights} × ₹${booking.pricePerNight}):</span>
                            <span>₹${(booking.numberOfNights * booking.pricePerNight).toLocaleString('en-IN')}</span>
                        </div>
                        <div class="amount-row">
                            <span>Price per Night:</span>
                            <span>₹${booking.pricePerNight?.toLocaleString('en-IN') || '0'}</span>
                        </div>
                        <div class="amount-row total-row">
                            <span>Total Amount:</span>
                            <span>₹${booking.totalAmount?.toLocaleString('en-IN') || '0'}</span>
                        </div>
                        <div class="amount-row" style="color: #16a34a; font-weight: 600;">
                            <span>Advance Paid:</span>
                            <span>₹${booking.advancePaid?.toLocaleString('en-IN') || '0'}</span>
                        </div>
                        <div class="amount-row" style="color: #dc2626; font-weight: 600;">
                            <span>Remaining Amount:</span>
                            <span>₹${booking.remainingAmount?.toLocaleString('en-IN') || '0'}</span>
                        </div>
                    </div>
                </div>

                <div class="footer">
                    <p>Generated on: ${new Date().toLocaleString('en-IN')}</p>
                    <p style="margin-top: 5px;">This is a computer-generated document. No signature required.</p>
                    <p style="margin-top: 10px; font-weight: 600;">Thank you for choosing Bireena Athithi Hotel!</p>
                </div>
            </body>
            </html>
        `;
    };

    return (
        <div className="form-container">
            <div className="form-section">
                <h3 className="section-title">📄 Print Summary</h3>
                <p className="form-description">
                    This will print a detailed summary of the booking including guest information, 
                    stay details, and payment information.
                </p>
                
                <div className="booking-preview" style={{ 
                    background: '#f9fafb', 
                    padding: '20px', 
                    borderRadius: '8px',
                    marginTop: '20px'
                }}>
                    <h4 style={{ marginBottom: '10px', color: '#dc2626' }}>Preview:</h4>
                    <p><strong>Booking ID:</strong> {booking.bookingId}</p>
                    <p><strong>Guest:</strong> {booking.guestName}</p>
                    <p><strong>Check-In:</strong> {new Date(booking.checkInDate).toLocaleDateString('en-IN')}</p>
                    <p><strong>Check-Out:</strong> {new Date(booking.checkOutDate).toLocaleDateString('en-IN')}</p>
                    <p><strong>Total Amount:</strong> ₹{booking.totalAmount?.toLocaleString('en-IN')}</p>
                </div>
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
                    onClick={handlePrint}
                >
                    🖨️ Print Summary
                </button>
            </div>
        </div>
    );
};

export default PrintSummaryForm;
