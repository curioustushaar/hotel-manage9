import './FormStyles.css';

const PrintInvoiceForm = ({ booking, onSubmit, onCancel }) => {
    
    const handlePrint = () => {
        const printContent = generateInvoice();
        
        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
        
        onSubmit({ action: 'print-invoice', timestamp: new Date().toISOString() });
    };

    const generateInvoice = () => {
        const taxRate = 0.12; // 12% GST
        const subtotal = booking.totalAmount || 0;
        const tax = subtotal * taxRate;
        const grandTotal = subtotal + tax;

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice - ${booking.bookingId}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: 'Courier New', monospace; 
                        padding: 30px; 
                        color: #000;
                    }
                    .invoice-container {
                        border: 2px solid #000;
                        padding: 20px;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 2px solid #000;
                        padding-bottom: 15px;
                        margin-bottom: 20px;
                    }
                    .hotel-name {
                        font-size: 24px;
                        font-weight: bold;
                        margin-bottom: 5px;
                    }
                    .invoice-title {
                        font-size: 20px;
                        font-weight: bold;
                        margin: 15px 0;
                        text-align: center;
                        text-decoration: underline;
                    }
                    .section {
                        margin: 15px 0;
                    }
                    .row {
                        display: flex;
                        justify-content: space-between;
                        padding: 5px 0;
                    }
                    .label { font-weight: bold; }
                    .table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 15px 0;
                    }
                    .table th, .table td {
                        border: 1px solid #000;
                        padding: 8px;
                        text-align: left;
                    }
                    .table th {
                        background: #f0f0f0;
                        font-weight: bold;
                    }
                    .text-right { text-align: right; }
                    .total-section {
                        margin-top: 20px;
                        border-top: 2px solid #000;
                        padding-top: 10px;
                    }
                    .grand-total {
                        font-size: 18px;
                        font-weight: bold;
                        background: #000;
                        color: #fff;
                        padding: 10px;
                        margin-top: 10px;
                    }
                    .footer {
                        margin-top: 30px;
                        text-align: center;
                        font-size: 12px;
                        border-top: 1px solid #000;
                        padding-top: 15px;
                    }
                    @media print {
                        body { padding: 10px; }
                    }
                </style>
            </head>
            <body>
                <div class="invoice-container">
                    <div class="header">
                        <div class="hotel-name">BIREENA ATHITHI HOTEL</div>
                        <div>123 Hotel Street, City, State 12345</div>
                        <div>Phone: +91-1234-567890 | Email: info@bireena-athithi.com</div>
                        <div>GST No: 22AACCU1234H1Z0</div>
                    </div>

                    <div class="invoice-title">TAX INVOICE</div>

                    <div class="section">
                        <div class="row">
                            <div>
                                <div class="label">Invoice No: ${booking.bookingId || 'INV-' + Date.now()}</div>
                                <div>Date: ${new Date().toLocaleDateString('en-IN')}</div>
                            </div>
                            <div style="text-align: right;">
                                <div class="label">Booking Ref: ${booking.bookingId}</div>
                                <div>Status: ${booking.status}</div>
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <div class="label">BILL TO:</div>
                        <div>${booking.guestName || 'Guest'}</div>
                        <div>Mobile: ${booking.mobileNumber || 'N/A'}</div>
                        <div>Email: ${booking.email || 'N/A'}</div>
                    </div>

                    <table class="table">
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th class="text-right">Qty</th>
                                <th class="text-right">Rate</th>
                                <th class="text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <strong>Room Charges - ${booking.roomType || 'Room'}</strong><br>
                                    Room No: ${booking.roomNumber || 'TBA'}<br>
                                    Check-In: ${new Date(booking.checkInDate).toLocaleDateString('en-IN')}<br>
                                    Check-Out: ${new Date(booking.checkOutDate).toLocaleDateString('en-IN')}
                                </td>
                                <td class="text-right">${booking.numberOfNights || 1} Night(s)</td>
                                <td class="text-right">₹${(booking.pricePerNight || 0).toLocaleString('en-IN')}</td>
                                <td class="text-right">₹${subtotal.toLocaleString('en-IN')}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="total-section">
                        <div class="row">
                            <div class="label">Subtotal:</div>
                            <div>₹${subtotal.toLocaleString('en-IN')}</div>
                        </div>
                        <div class="row">
                            <div class="label">GST (12%):</div>
                            <div>₹${tax.toLocaleString('en-IN')}</div>
                        </div>
                        <div class="grand-total row">
                            <div>GRAND TOTAL:</div>
                            <div>₹${grandTotal.toLocaleString('en-IN')}</div>
                        </div>
                        <div class="row" style="color: green; font-weight: bold; margin-top: 10px;">
                            <div>Paid Amount:</div>
                            <div>₹${(booking.advancePaid || 0).toLocaleString('en-IN')}</div>
                        </div>
                        <div class="row" style="color: red; font-weight: bold;">
                            <div>Balance Due:</div>
                            <div>₹${(booking.remainingAmount || 0).toLocaleString('en-IN')}</div>
                        </div>
                    </div>

                    <div class="footer">
                        <p><strong>Terms & Conditions:</strong></p>
                        <p>1. Check-in time: 2:00 PM | Check-out time: 11:00 AM</p>
                        <p>2. Late checkout subject to availability and additional charges</p>
                        <p>3. Payment must be made at the time of checkout</p>
                        <p style="margin-top: 15px;"><strong>Thank you for your business!</strong></p>
                        <p style="margin-top: 5px;">Generated: ${new Date().toLocaleString('en-IN')}</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    };

    return (
        <div className="form-container">
            <div className="form-section">
                <h3 className="section-title">🧾 Print Tax Invoice</h3>
                <p className="form-description">
                    This will generate and print a detailed tax invoice with GST breakdown.
                </p>
                
                <div className="booking-preview" style={{ 
                    background: '#f9fafb', 
                    padding: '20px', 
                    borderRadius: '8px',
                    marginTop: '20px',
                    border: '2px solid #e5e7eb'
                }}>
                    <h4 style={{ marginBottom: '15px', color: '#dc2626' }}>Invoice Details:</h4>
                    <div style={{ display: 'grid', gap: '10px' }}>
                        <p><strong>Invoice No:</strong> {booking.bookingId || 'INV-' + Date.now()}</p>
                        <p><strong>Guest Name:</strong> {booking.guestName}</p>
                        <p><strong>Room Type:</strong> {booking.roomType}</p>
                        <p><strong>Duration:</strong> {booking.numberOfNights} Night(s)</p>
                        <hr style={{ margin: '10px 0' }} />
                        <p><strong>Subtotal:</strong> ₹{(booking.totalAmount || 0).toLocaleString('en-IN')}</p>
                        <p><strong>GST (12%):</strong> ₹{((booking.totalAmount || 0) * 0.12).toLocaleString('en-IN')}</p>
                        <p style={{ fontSize: '18px', color: '#dc2626' }}>
                            <strong>Grand Total:</strong> ₹{((booking.totalAmount || 0) * 1.12).toLocaleString('en-IN')}
                        </p>
                    </div>
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
                    🖨️ Print Invoice
                </button>
            </div>
        </div>
    );
};

export default PrintInvoiceForm;
