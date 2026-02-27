import { useState } from 'react';
import './FormStyles.css';

const PrintInvoiceForm = ({ booking, onSubmit, onCancel }) => {
    const [printType, setPrintType] = useState('A4');

    const printOptions = ['A4', 'A5', 'Thermal', 'Dot Matrix', '3 inch', '2 inch'];

    const formatDate = (date) => {
        if (!date) return 'N/A';
        try {
            return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch { return 'N/A'; }
    };

    const b = booking || {};
    const taxRate = 0.12;
    const subtotal = b.totalAmount || 0;
    const tax = Math.round(subtotal * taxRate);
    const grandTotal = subtotal + tax;
    const nights = b.numberOfNights || 1;

    const getPageStyle = (type) => {
        if (type === '2 inch') return '@page { size: 56mm auto; margin: 2mm; }';
        if (type === '3 inch' || type === 'Thermal') return '@page { size: 78mm auto; margin: 2mm; }';
        if (type === 'A5') return '@page { size: A5; margin: 12mm; }';
        if (type === 'Dot Matrix') return '@page { size: auto; margin: 5mm; }';
        return '@page { size: A4; margin: 15mm; }';
    };

    const isReceipt = ['2 inch', '3 inch', 'Thermal'].includes(printType);
    const isDotMatrix = printType === 'Dot Matrix';

    const generateInvoice = () => {
        return `<!DOCTYPE html>
<html><head><title>Invoice - ${b.bookingId || 'INV'}</title>
<style>
${getPageStyle(printType)}
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
    font-family: ${isDotMatrix ? "'Courier New', monospace" : isReceipt ? "'Roboto Mono', 'Courier New', monospace" : "'Segoe UI', Arial, sans-serif"};
    font-size: ${isReceipt ? (printType === '2 inch' ? '10px' : '11px') : isDotMatrix ? '12px' : '13px'};
    color: #000; padding: ${isReceipt ? '4px' : isDotMatrix ? '10px' : '30px'}; line-height: 1.5;
    ${isReceipt ? `width: ${printType === '2 inch' ? '56mm' : '78mm'};` : ''}
}
.hotel-name { font-size: ${isReceipt ? '14px' : isDotMatrix ? '16px' : '24px'}; font-weight: bold; text-align: center; text-transform: uppercase; }
.hotel-addr { text-align: center; font-size: ${isReceipt ? '9px' : '11px'}; color: #444; margin-bottom: ${isReceipt ? '4px' : '8px'}; }
.gst-no { text-align: center; font-size: ${isReceipt ? '9px' : '11px'}; font-weight: bold; color: #333; margin-bottom: ${isReceipt ? '6px' : '12px'}; }
.divider { border: none; border-top: ${isDotMatrix ? '1px dashed #000' : isReceipt ? '1px dashed #333' : '2px solid #333'}; margin: ${isReceipt ? '5px 0' : '10px 0'}; }
.divider-thin { border: none; border-top: 1px solid #ddd; margin: ${isReceipt ? '4px 0' : '8px 0'}; }
.inv-title { text-align: center; font-size: ${isReceipt ? '13px' : isDotMatrix ? '14px' : '18px'}; font-weight: bold; text-transform: uppercase; padding: ${isReceipt ? '4px 0' : '8px 0'}; ${!isReceipt && !isDotMatrix ? 'background: #f3f4f6; border: 1px solid #ddd; letter-spacing: 3px;' : ''} margin: ${isReceipt ? '4px 0' : '10px 0'}; }
.row { display: flex; justify-content: space-between; padding: ${isReceipt ? '2px 0' : '5px 0'}; }
.row .label { color: #555; font-size: ${isReceipt ? '9px' : '12px'}; }
.row .val { font-weight: 600; }
.section-title { font-weight: bold; font-size: ${isReceipt ? '11px' : '13px'}; margin: ${isReceipt ? '6px 0 3px' : '12px 0 5px'}; text-transform: uppercase; color: #333; }
table { width: 100%; border-collapse: collapse; margin: ${isReceipt ? '5px 0' : '10px 0'}; }
th { background: ${isDotMatrix ? 'transparent' : '#f3f4f6'}; padding: ${isReceipt ? '3px 2px' : '8px 10px'}; text-align: left; font-size: ${isReceipt ? '9px' : '12px'}; font-weight: bold; border-bottom: ${isDotMatrix ? '1px dashed #000' : '2px solid #ddd'}; }
td { padding: ${isReceipt ? '3px 2px' : '8px 10px'}; font-size: ${isReceipt ? '10px' : '12px'}; border-bottom: 1px solid #eee; }
.text-right { text-align: right; }
.total-box { ${!isReceipt && !isDotMatrix ? 'float: right; width: 280px;' : ''} margin-top: ${isReceipt ? '6px' : '10px'}; ${!isReceipt && !isDotMatrix ? 'border: 1px solid #ddd; padding: 10px; background: #fafafa;' : ''} }
.total-row { display: flex; justify-content: space-between; padding: ${isReceipt ? '3px 0' : '6px 0'}; }
.grand-total { font-size: ${isReceipt ? '13px' : '16px'}; font-weight: bold; border-top: 2px solid #000; padding-top: 5px; margin-top: 5px; }
.paid { color: green; font-weight: 600; }
.due { color: #dc2626; font-weight: 600; }
.footer { text-align: center; margin-top: ${isReceipt ? '10px' : '25px'}; font-size: ${isReceipt ? '8px' : '10px'}; color: #777; ${!isReceipt ? 'clear: both; padding-top: 20px;' : ''} }
.terms { margin-top: ${isReceipt ? '8px' : '15px'}; font-size: ${isReceipt ? '8px' : '10px'}; color: #666; ${!isReceipt ? 'clear: both; padding-top: 15px;' : ''} }
.terms p { margin: 2px 0; }
@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style></head>
<body>
<div class="hotel-name">Bireena Athithi Hotel</div>
<div class="hotel-addr">123 Hotel Street, City, State 12345 | +91-1234-567890 | info@bireena-athithi.com</div>
<div class="gst-no">GSTIN: 22AACCU1234H1Z0</div>
<hr class="divider">
<div class="inv-title">Tax Invoice</div>
<hr class="divider">

<div class="row"><span class="label">Invoice No:</span><span class="val">${b.bookingId || 'INV-' + Date.now()}</span></div>
<div class="row"><span class="label">Date:</span><span class="val">${new Date().toLocaleDateString('en-IN')}</span></div>
<hr class="divider-thin">
<div class="section-title">Bill To</div>
<div class="row"><span class="label">Guest:</span><span class="val">${b.guestName || 'N/A'}</span></div>
<div class="row"><span class="label">Mobile:</span><span class="val">${b.mobileNumber || 'N/A'}</span></div>
${b.email ? `<div class="row"><span class="label">Email:</span><span class="val">${b.email}</span></div>` : ''}
<hr class="divider-thin">

<table>
<thead><tr><th>Description</th><th class="text-right">Qty</th><th class="text-right">Rate</th><th class="text-right">Amount</th></tr></thead>
<tbody>
<tr>
<td>Room Charges - ${b.roomType || 'Room'}<br><span style="font-size:${isReceipt ? '9px' : '11px'};color:#666">Room ${b.roomNumber || 'TBA'} | ${formatDate(b.checkInDate)} → ${formatDate(b.checkOutDate)}</span></td>
<td class="text-right">${nights} Night${nights > 1 ? 's' : ''}</td>
<td class="text-right">₹${(b.pricePerNight || 0).toLocaleString('en-IN')}</td>
<td class="text-right">₹${subtotal.toLocaleString('en-IN')}</td>
</tr>
</tbody>
</table>

<div class="total-box">
<div class="total-row"><span>Subtotal:</span><span>₹${subtotal.toLocaleString('en-IN')}</span></div>
<div class="total-row"><span>GST (12%):</span><span>₹${tax.toLocaleString('en-IN')}</span></div>
<div class="total-row grand-total"><span>Grand Total:</span><span>₹${grandTotal.toLocaleString('en-IN')}</span></div>
${(b.advancePaid || 0) > 0 ? `<div class="total-row paid"><span>Paid:</span><span>₹${(b.advancePaid || 0).toLocaleString('en-IN')}</span></div>` : ''}
${(b.remainingAmount || 0) > 0 ? `<div class="total-row due"><span>Balance Due:</span><span>₹${(b.remainingAmount || 0).toLocaleString('en-IN')}</span></div>` : ''}
</div>

<div class="terms">
<p><strong>Terms & Conditions:</strong></p>
<p>1. Check-in: 2:00 PM | Check-out: 11:00 AM</p>
<p>2. Late checkout subject to availability and charges</p>
<p>3. Payment at checkout</p>
</div>
<hr class="divider">
<div class="footer">Thank you for your business! | Generated: ${new Date().toLocaleString('en-IN')}</div>
</body></html>`;
    };

    const handlePrint = () => {
        const content = generateInvoice();
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        printWindow.document.write(content);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
        }, 400);
        onSubmit({ action: 'print-invoice', timestamp: new Date().toISOString(), type: printType });
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Booking Info Card */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[11px] text-gray-400 uppercase tracking-wide">Invoice</p>
                            <p className="text-sm font-bold text-gray-900">{b.bookingId || 'N/A'}</p>
                        </div>
                        <p className="text-[11px] text-gray-400">{new Date().toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className="border-t border-gray-200 pt-2 grid grid-cols-2 gap-2 text-[12px]">
                        <div><span className="text-gray-400">Guest</span><p className="font-semibold text-gray-800 truncate">{b.guestName || 'N/A'}</p></div>
                        <div><span className="text-gray-400">Room</span><p className="font-semibold text-gray-800">{b.roomNumber || 'TBA'} ({b.roomType || 'Std'})</p></div>
                        <div><span className="text-gray-400">Check-in</span><p className="font-semibold text-gray-800">{formatDate(b.checkInDate)}</p></div>
                        <div><span className="text-gray-400">Check-out</span><p className="font-semibold text-gray-800">{formatDate(b.checkOutDate)}</p></div>
                    </div>
                    <div className="border-t border-gray-200 pt-2 space-y-1 text-[12px]">
                        <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span className="font-semibold text-gray-800">₹{subtotal.toLocaleString('en-IN')}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">GST (12%)</span><span className="font-semibold text-gray-800">₹{tax.toLocaleString('en-IN')}</span></div>
                        <div className="flex justify-between text-sm font-bold pt-1 border-t border-gray-200"><span className="text-gray-900">Grand Total</span><span className="text-gray-900">₹{grandTotal.toLocaleString('en-IN')}</span></div>
                        {(b.advancePaid || 0) > 0 && <div className="flex justify-between text-[12px]"><span className="text-green-600">Paid</span><span className="font-semibold text-green-600">₹{(b.advancePaid || 0).toLocaleString('en-IN')}</span></div>}
                        {(b.remainingAmount || 0) > 0 && <div className="flex justify-between text-[12px]"><span className="text-red-600">Balance</span><span className="font-semibold text-red-600">₹{(b.remainingAmount || 0).toLocaleString('en-IN')}</span></div>}
                    </div>
                </div>

                {/* Format Selector */}
                <div>
                    <label className="text-[11px] text-gray-400 uppercase tracking-wide mb-1 block">Print Format</label>
                    <div className="grid grid-cols-3 gap-2">
                        {printOptions.map(opt => (
                            <button key={opt} type="button" onClick={() => setPrintType(opt)}
                                className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                                    printType === opt
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                }`}>
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Print Button */}
            <div className="p-4 border-t border-gray-100">
                <button type="button" onClick={handlePrint}
                    className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    Print Invoice
                </button>
            </div>
        </div>
    );
};

export default PrintInvoiceForm;
