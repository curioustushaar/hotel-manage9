import { useState } from 'react';
import './FormStyles.css';

const PrintInvoiceForm = ({ booking, onSubmit, onCancel }) => {
    const [printType, setPrintType] = useState('Dot Matrix');

    const printOptions = [
        'Dot Matrix', 'Thermal', 'A4', 'A5', '2 inch', '3 inch'
    ];

    const getPrintStyle = (type) => {
        const reset = `
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { color: #000; line-height: 1.4; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .bold { font-weight: bold; }
            .row { display: flex; justify-content: space-between; }
            .flex-col { flex-direction: column; }
        `;

        // A4 and A5 specific styles (Standard Invoice)
        if (type === 'A4' || type === 'A5') {
            return `
                ${reset}
                body { 
                    font-family: Arial, Helvetica, sans-serif; 
                    padding: 40px; 
                    font-size: ${type === 'A5' ? '11px' : '14px'};
                }
                .invoice-container { 
                    border: 1px solid #ccc; 
                    padding: 20px; 
                    height: 100%; 
                }
                .header { 
                    border-bottom: 2px solid #333; 
                    padding-bottom: 10px; 
                    margin-bottom: 20px; 
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .hotel-name { 
                    font-size: 24px; 
                    font-weight: 800; 
                    color: #000;
                }
                .invoice-title { 
                    text-align: center; 
                    font-size: 20px; 
                    font-weight: bold; 
                    margin: 10px 0 20px 0; 
                    text-transform: uppercase; 
                    background: #f8f8f8;
                    padding: 5px;
                    border: 1px solid #ddd;
                }
                .section { margin-bottom: 20px; }
                .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                .table th { 
                    background: #f3f4f6; 
                    padding: 10px; 
                    border: 1px solid #ddd; 
                    font-weight: bold; 
                    text-align: left;
                }
                .table td { 
                    padding: 10px; 
                    border: 1px solid #ddd; 
                }
                .total-section { 
                    float: right; 
                    width: 300px; 
                    border: 1px solid #ddd; 
                    padding: 10px;
                    background: #f9f9f9;
                }
                .grand-total { 
                    font-size: 16px; 
                    font-weight: bold; 
                    border-top: 2px solid #000; 
                    margin-top: 5px; 
                    padding-top: 5px;
                }
                @page { size: ${type}; margin: 10mm; }
            `;
        }

        // Dot Matrix (Courier, dashed lines)
        if (type === 'Dot Matrix') {
            return `
                ${reset}
                body { 
                    font-family: 'Courier New', Courier, monospace; 
                    font-size: 13px; 
                    padding: 20px;
                }
                .invoice-container { 
                    padding: 10px; 
                    border: 1px dashed #000;
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
                .invoice-title { 
                    text-align: center; 
                    font-weight: bold; 
                    margin: 15px 0; 
                    border-top: 1px dashed #000;
                    border-bottom: 1px dashed #000;
                    padding: 5px;
                }
                .table { width: 100%; margin: 15px 0; }
                .table th { 
                    border-bottom: 1px dashed #000; 
                    padding: 5px 0; 
                    text-align: left;
                }
                .table td { padding: 5px 0; }
                .total-section { 
                    border-top: 1px dashed #000; 
                    margin-top: 10px; 
                    padding-top: 10px;
                }
                .grand-total { font-weight: bold; font-size: 15px; }
                @page { size: auto; margin: 5mm; }
            `;
        }

        // Thermal, 3 inch, 2 inch (Receipt style)
        // 2 inch = 58mm, 3 inch/Thermal = 80mm
        const isSmall = type === '2 inch';
        const width = isSmall ? '56mm' : '78mm'; // slightly less than 58/80 for safety
        const fontSize = isSmall ? '10px' : '12px';

        return `
            ${reset}
            body { 
                font-family: 'Roboto Mono', monospace;
                font-size: ${fontSize};
                width: ${width};
                background: #fff;
            }
            .invoice-container { padding: 0; }
            .header { 
                text-align: center; 
                margin-bottom: 10px; 
            }
            .hotel-name { 
                font-size: ${isSmall ? '14px' : '16px'}; 
                font-weight: bold; 
                margin-bottom: 5px;
            }
            .header div { margin-bottom: 2px; }
            .invoice-title { 
                text-align: center; 
                font-weight: bold; 
                border-top: 1px dashed #000; 
                border-bottom: 1px dashed #000; 
                padding: 4px 0;
                margin: 10px 0;
            }
            .section { margin-bottom: 10px; }
            .row { 
                display: flex; 
                justify-content: space-between; 
                ${isSmall ? 'flex-direction: column; margin-bottom: 4px;' : 'margin-bottom: 2px;'}
            }
            .table { width: 100%; margin: 10px 0; border-collapse: collapse; }
            .table th { 
                text-align: left; 
                border-bottom: 1px solid #000; 
                font-size: ${isSmall ? '9px' : '11px'};
                padding: 2px 0;
            }
            .table td { 
                padding: 2px 0; 
                vertical-align: top;
            }
            .total-section { 
                border-top: 1px dashed #000; 
                padding-top: 5px; 
                margin-top: 10px; 
            }
            .grand-total { 
                font-weight: bold; 
                font-size: ${isSmall ? '12px' : '14px'}; 
                margin-top: 5px;
            }
            .footer { 
                text-align: center; 
                margin-top: 15px; 
                font-size: ${isSmall ? '9px' : '10px'};
            }
            @page { size: ${width} auto; margin: 0; }
        `;
    };

    const handlePrint = () => {
        const printContent = generateInvoice();

        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();

        onSubmit({ action: 'print-invoice', timestamp: new Date().toISOString(), type: printType });
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
                    ${getPrintStyle(printType)}
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
        <div className="flex flex-col h-full bg-white">
            {/* Main Content */}
            <div className="flex-1 p-8 space-y-8">
                {/* Reservation Number */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <p className="text-sm font-medium text-gray-500 mb-2">Reservation No</p>
                    <h3 className="text-2xl font-bold text-gray-900">{booking.bookingId || 'RES-51'}</h3>
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
            </div>

            {/* Footer Action - Centered Green Print Button */}
            <div className="p-6 border-t bg-gray-50">
                <button
                    type="button"
                    onClick={handlePrint}
                    className="w-full py-3.5 bg-green-600 text-white text-base font-semibold rounded-lg shadow-md hover:bg-green-700 hover:shadow-lg transform transition-all duration-200 active:scale-98 flex items-center justify-center gap-2"
                >
                    <span className="text-xl">🖨️</span>
                    <span>Print Invoice</span>
                </button>
            </div>
        </div>
    );
};

export default PrintInvoiceForm;
