import './FormStyles.css';

const PrintGRCForm = ({ booking, onSubmit, onCancel }) => {
    
    const handlePrint = () => {
        const printContent = generateGRC();
        
        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
        
        onSubmit({ action: 'print-grc', timestamp: new Date().toISOString() });
    };

    const generateGRC = () => {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>GRC - ${booking.guestName}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: Arial, sans-serif; 
                        padding: 20px; 
                        color: #000;
                    }
                    .grc-container {
                        border: 3px double #000;
                        padding: 20px;
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 2px solid #000;
                        padding-bottom: 15px;
                        margin-bottom: 20px;
                    }
                    .hotel-name {
                        font-size: 22px;
                        font-weight: bold;
                        margin-bottom: 5px;
                    }
                    .document-title {
                        font-size: 18px;
                        font-weight: bold;
                        text-align: center;
                        background: #000;
                        color: #fff;
                        padding: 8px;
                        margin: 15px 0;
                    }
                    .form-section {
                        margin: 15px 0;
                        border: 1px solid #000;
                        padding: 15px;
                    }
                    .section-title {
                        font-weight: bold;
                        background: #e0e0e0;
                        padding: 5px;
                        margin-bottom: 10px;
                    }
                    .form-field {
                        display: flex;
                        padding: 8px 0;
                        border-bottom: 1px dotted #ccc;
                    }
                    .field-label {
                        font-weight: bold;
                        width: 200px;
                    }
                    .field-value {
                        flex: 1;
                        border-bottom: 1px solid #000;
                        min-height: 20px;
                        padding-left: 10px;
                    }
                    .signature-section {
                        display: flex;
                        justify-content: space-between;
                        margin-top: 30px;
                        padding-top: 20px;
                    }
                    .signature-box {
                        text-align: center;
                        width: 45%;
                    }
                    .signature-line {
                        border-top: 1px solid #000;
                        margin-top: 40px;
                        padding-top: 5px;
                    }
                    .declaration {
                        margin-top: 20px;
                        padding: 10px;
                        border: 1px solid #000;
                        font-size: 11px;
                    }
                    @media print {
                        body { padding: 10px; }
                        @page { size: A4; margin: 15mm; }
                    }
                </style>
            </head>
            <body>
                <div class="grc-container">
                    <div class="header">
                        <div class="hotel-name">BIREENA ATHITHI HOTEL</div>
                        <div style="font-size: 12px;">123 Hotel Street, City, State 12345</div>
                        <div style="font-size: 11px;">Phone: +91-1234-567890 | Email: info@bireena-athithi.com</div>
                    </div>

                    <div class="document-title">GUEST REGISTRATION CARD (Form C)</div>

                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 12px;">
                        <div><strong>Registration No:</strong> ${booking.bookingId}</div>
                        <div><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</div>
                    </div>

                    <div class="form-section">
                        <div class="section-title">GUEST INFORMATION</div>
                        
                        <div class="form-field">
                            <div class="field-label">Full Name:</div>
                            <div class="field-value">${booking.guestName || ''}</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Father's/Husband's Name:</div>
                            <div class="field-value"></div>
                        </div>
                        
                        <div style="display: flex; gap: 10px;">
                            <div class="form-field" style="flex: 1;">
                                <div class="field-label">Age:</div>
                                <div class="field-value"></div>
                            </div>
                            <div class="form-field" style="flex: 1;">
                                <div class="field-label">Gender:</div>
                                <div class="field-value"></div>
                            </div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Nationality:</div>
                            <div class="field-value">Indian</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Passport/ID No:</div>
                            <div class="field-value"></div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Mobile Number:</div>
                            <div class="field-value">${booking.mobileNumber || ''}</div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Email Address:</div>
                            <div class="field-value">${booking.email || ''}</div>
                        </div>
                    </div>

                    <div class="form-section">
                        <div class="section-title">ADDRESS DETAILS</div>
                        
                        <div class="form-field">
                            <div class="field-label">Permanent Address:</div>
                            <div class="field-value"></div>
                        </div>
                        
                        <div style="display: flex; gap: 10px;">
                            <div class="form-field" style="flex: 1;">
                                <div class="field-label">City:</div>
                                <div class="field-value"></div>
                            </div>
                            <div class="form-field" style="flex: 1;">
                                <div class="field-label">State:</div>
                                <div class="field-value"></div>
                            </div>
                            <div class="form-field" style="flex: 1;">
                                <div class="field-label">PIN:</div>
                                <div class="field-value"></div>
                            </div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Coming From:</div>
                            <div class="field-value"></div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Going To:</div>
                            <div class="field-value"></div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Purpose of Visit:</div>
                            <div class="field-value"></div>
                        </div>
                    </div>

                    <div class="form-section">
                        <div class="section-title">RESERVATION DETAILS</div>
                        
                        <div style="display: flex; gap: 10px;">
                            <div class="form-field" style="flex: 1;">
                                <div class="field-label">Room No:</div>
                                <div class="field-value">${booking.roomNumber || 'TBA'}</div>
                            </div>
                            <div class="form-field" style="flex: 1;">
                                <div class="field-label">Room Type:</div>
                                <div class="field-value">${booking.roomType || ''}</div>
                            </div>
                        </div>
                        
                        <div style="display: flex; gap: 10px;">
                            <div class="form-field" style="flex: 1;">
                                <div class="field-label">Check-In Date:</div>
                                <div class="field-value">${new Date(booking.checkInDate).toLocaleDateString('en-IN')}</div>
                            </div>
                            <div class="form-field" style="flex: 1;">
                                <div class="field-label">Check-In Time:</div>
                                <div class="field-value">${new Date(booking.checkInDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                        </div>
                        
                        <div style="display: flex; gap: 10px;">
                            <div class="form-field" style="flex: 1;">
                                <div class="field-label">Check-Out Date:</div>
                                <div class="field-value">${new Date(booking.checkOutDate).toLocaleDateString('en-IN')}</div>
                            </div>
                            <div class="form-field" style="flex: 1;">
                                <div class="field-label">No. of Guests:</div>
                                <div class="field-value">${booking.numberOfGuests || 1}</div>
                            </div>
                        </div>
                        
                        <div class="form-field">
                            <div class="field-label">Vehicle Number (if any):</div>
                            <div class="field-value"></div>
                        </div>
                    </div>

                    <div class="declaration">
                        <strong>DECLARATION:</strong> I hereby declare that the above information is true and correct to the best of my knowledge. 
                        I understand that providing false information is a punishable offense. I agree to abide by the hotel rules and regulations.
                    </div>

                    <div class="signature-section">
                        <div class="signature-box">
                            <div class="signature-line">Guest Signature</div>
                            <div style="margin-top: 5px; font-size: 11px;">Date: _______________</div>
                        </div>
                        <div class="signature-box">
                            <div class="signature-line">Reception Officer</div>
                            <div style="margin-top: 5px; font-size: 11px;">Date: ${new Date().toLocaleDateString('en-IN')}</div>
                        </div>
                    </div>

                    <div style="margin-top: 20px; text-align: center; font-size: 10px; color: #666;">
                        This document is generated electronically and is valid without signature | Generated: ${new Date().toLocaleString('en-IN')}
                    </div>
                </div>
            </body>
            </html>
        `;
    };

    return (
        <div className="form-container">
            <div className="form-section">
                <h3 className="section-title">📋 Print Guest Registration Card (Form C)</h3>
                <p className="form-description">
                    This will print the official Guest Registration Card (Form C) as required by local authorities.
                    The guest must fill and sign this form during check-in.
                </p>
                
                <div className="booking-preview" style={{ 
                    background: '#f9fafb', 
                    padding: '20px', 
                    borderRadius: '8px',
                    marginTop: '20px',
                    border: '2px solid #e5e7eb'
                }}>
                    <h4 style={{ marginBottom: '15px', color: '#dc2626' }}>Registration Details:</h4>
                    <div style={{ display: 'grid', gap: '10px' }}>
                        <p><strong>Registration No:</strong> {booking.bookingId}</p>
                        <p><strong>Guest Name:</strong> {booking.guestName}</p>
                        <p><strong>Mobile:</strong> {booking.mobileNumber}</p>
                        <p><strong>Email:</strong> {booking.email || 'N/A'}</p>
                        <p><strong>Room No:</strong> {booking.roomNumber || 'To Be Assigned'}</p>
                        <p><strong>Check-In:</strong> {new Date(booking.checkInDate).toLocaleDateString('en-IN')}</p>
                        <p><strong>Check-Out:</strong> {new Date(booking.checkOutDate).toLocaleDateString('en-IN')}</p>
                    </div>
                </div>

                <div style={{
                    background: '#fffbeb',
                    border: '1px solid #fbbf24',
                    borderRadius: '6px',
                    padding: '15px',
                    marginTop: '15px'
                }}>
                    <p style={{ fontSize: '14px', color: '#92400e' }}>
                        <strong>⚠️ Note:</strong> Guest must complete all fields and sign the form during check-in. 
                        Keep this form for hotel records as per local regulations.
                    </p>
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
                    🖨️ Print GRC
                </button>
            </div>
        </div>
    );
};

export default PrintGRCForm;
