import { useState } from 'react';
import './FormStyles.css';

const PrintGRCForm = ({ booking, onSubmit, onCancel }) => {
    const [printType, setPrintType] = useState('Dot Matrix');

    const printOptions = [
        'Dot Matrix', 'Thermal', 'A4', 'A5', '2 inch', '3 inch'
    ];


    const getPrintStyle = (type) => {
        const reset = `
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { color: #000; line-height: 1.3; }
            .text-center { text-align: center; }
            .bold { font-weight: bold; }
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
                    height: 100%;
                }
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
                @page { size: ${type}; margin: 10mm; }
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
                .signature-area {
                    margin-top: 30px;
                }
                .sign-line {
                    border-top: 1px dashed #000;
                    margin-top: 20px;
                    padding-top: 5px;
                    text-align: center;
                }
                @page { size: auto; margin: 5mm; }
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
            .grc-card { padding: 0; border: none; }
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
            @page { size: ${width} auto; margin: 0; }
        `;
    };

    const handlePrint = () => {
        const printContent = generateGRC();

        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();

        onSubmit({ action: 'print-grc', timestamp: new Date().toISOString(), type: printType });
    };

    const generateGRC = () => {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>GRC - ${booking.guestName}</title>
                <style>
                    ${getPrintStyle(printType)}
                </style>
            </head>
            <body>
                <div class="grc-card">
                    <div class="header">
                        <div class="hotel-name">BIREENA ATHITHI HOTEL</div>
                        <div style="font-size: 12px;">123 Hotel Street, City, State 12345</div>
                        <div style="font-size: 11px;">Phone: +91-1234-567890</div>
                    </div>

                    <div class="document-title">GUEST REGISTRATION CARD (Form C)</div>

                    <div style="margin-bottom: 10px; font-size: 12px;">
                        <strong>Registration No:</strong> ${booking.bookingId || booking._id}
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
                    <label className="block text-base font-semibold text-gray-700 mb-3">GRC Type</label>
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
                    <span>Print GRC</span>
                </button>
            </div>
        </div>
    );
};

export default PrintGRCForm;
