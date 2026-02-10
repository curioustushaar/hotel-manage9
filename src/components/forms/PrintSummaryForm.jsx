import React, { useState } from 'react';
import './FormStyles.css';

const PrintSummaryForm = ({ booking, onSubmit }) => {
    const [printType, setPrintType] = useState('Dot Matrix');

    const printOptions = [
        'Dot Matrix', 'Thermal', 'A4', 'A5', '2 inch', '3 inch'
    ];

    const getPrintStyle = (type) => {
        const reset = `
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 10px;
                color: #000;
                line-height: 1.4;
            }
            .header { 
                text-align: center; 
                margin-bottom: 20px; 
                border-bottom: 1px solid #ccc; 
                padding-bottom: 10px; 
            }
            .header h3 { margin: 0; font-size: 18px; }
            .content { font-size: 14px; }
            .row { 
                display: flex; 
                justify-content: space-between; 
                margin-bottom: 8px; 
                border-bottom: 1px dotted #eee;
                padding-bottom: 4px;
            }
            .footer { 
                margin-top: 20px; 
                text-align: center; 
                font-size: 12px; 
                color: #666; 
                border-top: 1px solid #ccc;
                padding-top: 10px;
            }
        `;

        // A4 and A5
        if (type === 'A4' || type === 'A5') {
            return `
                ${reset}
                body { 
                    padding: 40px; 
                    font-size: 14px;
                }
                .header { border-bottom: 2px solid #000; }
                .header h3 { font-size: 24px; }
                .row { border-bottom: 1px solid #eee; padding: 8px 0; }
                .footer { border-top: 1px solid #000; }
                @page { size: ${type}; margin: 20mm; }
            `;
        }

        // Dot Matrix
        if (type === 'Dot Matrix') {
            return `
                ${reset}
                body { font-family: 'Courier New', monospace; font-size: 13px; }
                .header { border-bottom: 1px dashed #000; text-transform: uppercase; }
                .row { border-bottom: 1px dashed #ccc; }
                .footer { border-top: 1px dashed #000; }
                @page { size: auto; margin: 5mm; }
            `;
        }

        // Thermal / Small
        const isSmall = type === '2 inch';
        const width = isSmall ? '56mm' : '78mm';
        const fontSize = isSmall ? '10px' : '12px';

        return `
            ${reset}
            body { 
                font-family: 'Roboto Mono', monospace; 
                font-size: ${fontSize};
                width: ${width};
                padding: 0;
            }
            .header { 
                border-bottom: 1px dashed #000; 
                margin-bottom: 10px; 
                padding-bottom: 5px;
            }
            .header h3 { font-size: ${isSmall ? '14px' : '16px'}; }
            .content { font-size: ${fontSize}; }
            .row { 
                ${isSmall ? 'flex-direction: column; align-items: flex-start;' : ''}
                margin-bottom: ${isSmall ? '4px' : '6px'};
                border-bottom: none;
            }
            .footer { 
                border-top: 1px dashed #000; 
                margin-top: 10px; 
                padding-top: 5px;
                font-size: ${isSmall ? '9px' : '10px'};
            }
            @page { size: ${width} auto; margin: 0; }
        `;
    };

    const generatePrintContent = () => {
        const { bookingId, guestName, checkInDate, checkOutDate, totalAmount } = booking || {};
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Summary_${bookingId || 'Booking'}</title>
                <style>${getPrintStyle(printType)}</style>
            </head>
            <body>
                <div class="header"><h3>Booking Summary</h3></div>
                <div class="content">
                    <div class="row"><strong>Reservation No:</strong> <span>${bookingId || 'N/A'}</span></div>
                    <div class="row"><strong>Guest:</strong> <span>${guestName || 'N/A'}</span></div>
                    <div class="row"><strong>Check-in:</strong> <span>${checkInDate || 'N/A'}</span></div>
                    <div class="row"><strong>Check-out:</strong> <span>${checkOutDate || 'N/A'}</span></div>
                    <div class="row" style="margin-top: 10px; font-weight: bold;">
                        <strong>Total Amount:</strong> <span>₹${totalAmount || 0}</span>
                    </div>
                </div>
                <div class="footer">
                    Thank you for staying with us!
                </div>
            </body>
            </html>
        `;
    };

    const handlePrint = () => {
        const content = generatePrintContent();
        const printWindow = window.open('', '_blank');
        printWindow.document.write(content);
        printWindow.document.close();

        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }, 500);

        if (onSubmit) {
            onSubmit({ action: 'print-summary', timestamp: new Date().toISOString(), type: printType });
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Main Content */}
            <div className="flex-1 p-8 space-y-8">
                {/* Reservation No Display */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <p className="text-sm font-medium text-gray-500 mb-2">Reservation No</p>
                    <h3 className="text-2xl font-bold text-gray-900">{booking?.bookingId || 'RES-000'}</h3>
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
                    onClick={handlePrint}
                    className="w-full py-3.5 bg-green-600 text-white text-base font-semibold rounded-lg shadow-md hover:bg-green-700 hover:shadow-lg transform transition-all duration-200 active:scale-98 flex items-center justify-center gap-2"
                >
                    <span className="text-xl">🖨️</span>
                    <span>Print</span>
                </button>
            </div>
        </div>
    );
};

export default PrintSummaryForm;
