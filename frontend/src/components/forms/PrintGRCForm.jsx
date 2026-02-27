import { useState } from 'react';
import './FormStyles.css';

const PrintGRCForm = ({ booking, onSubmit, onCancel }) => {
    const [printType, setPrintType] = useState('A4');

    const printOptions = ['A4', 'A5', 'Thermal', 'Dot Matrix', '3 inch', '2 inch'];

    const formatDate = (date) => {
        if (!date) return 'N/A';
        try { return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }); } catch { return 'N/A'; }
    };

    const b = booking || {};

    const getPageStyle = (type) => {
        if (type === '2 inch') return '@page { size: 56mm auto; margin: 2mm; }';
        if (type === '3 inch' || type === 'Thermal') return '@page { size: 78mm auto; margin: 2mm; }';
        if (type === 'A5') return '@page { size: A5; margin: 12mm; }';
        if (type === 'Dot Matrix') return '@page { size: auto; margin: 5mm; }';
        return '@page { size: A4; margin: 15mm; }';
    };

    const isReceipt = ['2 inch', '3 inch', 'Thermal'].includes(printType);
    const isDotMatrix = printType === 'Dot Matrix';

    const generateGRC = () => {
        return `<!DOCTYPE html>
<html><head><title>GRC - ${b.guestName || 'Guest'}</title>
<style>
${getPageStyle(printType)}
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
    font-family: ${isDotMatrix ? "'Courier New', monospace" : isReceipt ? "'Roboto Mono', 'Courier New', monospace" : "'Segoe UI', Arial, sans-serif"};
    font-size: ${isReceipt ? (printType === '2 inch' ? '10px' : '11px') : isDotMatrix ? '12px' : '13px'};
    color: #000; padding: ${isReceipt ? '4px' : isDotMatrix ? '10px' : '30px'}; line-height: 1.5;
    ${isReceipt ? `width: ${printType === '2 inch' ? '56mm' : '78mm'};` : ''}
}
.hotel-name { font-size: ${isReceipt ? '14px' : isDotMatrix ? '16px' : '22px'}; font-weight: bold; text-align: center; text-transform: uppercase; }
.hotel-addr { text-align: center; font-size: ${isReceipt ? '9px' : '11px'}; color: #444; margin-bottom: ${isReceipt ? '4px' : '8px'}; }
.divider { border: none; border-top: ${isDotMatrix ? '1px dashed #000' : isReceipt ? '1px dashed #333' : '2px solid #333'}; margin: ${isReceipt ? '5px 0' : '10px 0'}; }
.doc-title { text-align: center; font-size: ${isReceipt ? '12px' : isDotMatrix ? '13px' : '16px'}; font-weight: bold; text-transform: uppercase; padding: ${isReceipt ? '4px 0' : '8px 0'}; ${!isReceipt && !isDotMatrix ? 'background: #1f2937; color: #fff; letter-spacing: 2px;' : ''} margin: ${isReceipt ? '4px 0' : '10px 0'}; }
.reg-no { font-size: ${isReceipt ? '10px' : '12px'}; margin-bottom: ${isReceipt ? '5px' : '10px'}; }
table { width: 100%; border-collapse: collapse; margin: ${isReceipt ? '5px 0' : '10px 0'}; }
th { background: ${isDotMatrix ? 'transparent' : '#f3f4f6'}; padding: ${isReceipt ? '3px 4px' : '8px 10px'}; text-align: left; font-size: ${isReceipt ? '9px' : '12px'}; font-weight: bold; border-bottom: ${isDotMatrix ? '1px dashed #000' : '2px solid #ddd'}; width: 38%; }
td { padding: ${isReceipt ? '3px 4px' : '8px 10px'}; font-size: ${isReceipt ? '10px' : '12px'}; border-bottom: 1px solid #eee; }
.blank-fields p { margin: ${isReceipt ? '4px 0' : '8px 0'}; font-size: ${isReceipt ? '10px' : '12px'}; }
.declaration { margin: ${isReceipt ? '8px 0' : '15px 0'}; padding: ${isReceipt ? '5px' : '10px'}; border: 1px solid #ddd; font-size: ${isReceipt ? '9px' : '11px'}; text-align: justify; background: #fafafa; }
.sig-area { display: ${isReceipt ? 'block' : 'flex'}; justify-content: space-between; margin-top: ${isReceipt ? '15px' : '40px'}; }
.sig-block { text-align: center; ${!isReceipt ? 'width: 40%;' : 'margin-bottom: 15px;'} }
.sig-line { border-top: 1px solid #000; padding-top: 5px; margin-top: ${isReceipt ? '20px' : '30px'}; font-size: ${isReceipt ? '9px' : '11px'}; font-weight: bold; }
.footer { text-align: center; margin-top: ${isReceipt ? '10px' : '20px'}; font-size: ${isReceipt ? '8px' : '10px'}; color: #777; }
@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style></head>
<body>
<div class="hotel-name">Bireena Athithi Hotel</div>
<div class="hotel-addr">123 Hotel Street, City, State 12345 | +91-1234-567890</div>
<hr class="divider">
<div class="doc-title">Guest Registration Card (Form C)</div>
<hr class="divider">

<div class="reg-no"><strong>Reg No:</strong> ${b.bookingId || b._id || 'N/A'}</div>

<table>
<tr><th>Full Name</th><td>${b.guestName || ''}</td></tr>
<tr><th>Mobile</th><td>${b.mobileNumber || ''}</td></tr>
<tr><th>Email</th><td>${b.email || ''}</td></tr>
<tr><th>Room Type</th><td>${b.roomType || ''}</td></tr>
<tr><th>Room No</th><td>${b.roomNumber || 'TBA'}</td></tr>
<tr><th>Check-In</th><td>${formatDate(b.checkInDate)}</td></tr>
<tr><th>Check-Out</th><td>${formatDate(b.checkOutDate)}</td></tr>
<tr><th>No. of Guests</th><td>${b.numberOfGuests || 1}</td></tr>
</table>

<div class="blank-fields">
<p><strong>Father's/Husband's Name:</strong> _________________________</p>
<p><strong>Age:</strong> _______ &nbsp; <strong>Gender:</strong> _______</p>
<p><strong>Nationality:</strong> _________________________</p>
<p><strong>ID Proof No:</strong> _________________________</p>
<p><strong>Permanent Address:</strong> _________________________</p>
<p>_________________________________________________</p>
<p><strong>Purpose of Visit:</strong> _________________________</p>
</div>

<div class="declaration">
<strong>DECLARATION:</strong> I declare that the above information is true and correct to the best of my knowledge.
</div>

<div class="sig-area">
<div class="sig-block"><div class="sig-line">Guest Signature</div><small>Date: ___________</small></div>
<div class="sig-block"><div class="sig-line">Reception</div><small>${new Date().toLocaleDateString('en-IN')}</small></div>
</div>

<hr class="divider">
<div class="footer">Generated: ${new Date().toLocaleString('en-IN')} | Bireena Athithi Hotel</div>
</body></html>`;
    };

    const handlePrint = () => {
        const content = generateGRC();
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        printWindow.document.write(content);
        printWindow.document.close();
        setTimeout(() => { printWindow.focus(); printWindow.print(); }, 400);
        onSubmit({ action: 'print-grc', timestamp: new Date().toISOString(), type: printType });
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Booking Info Card */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[11px] text-gray-400 uppercase tracking-wide">Registration</p>
                            <p className="text-sm font-bold text-gray-900">{b.bookingId || b._id || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 pt-2 grid grid-cols-2 gap-2 text-[12px]">
                        <div><span className="text-gray-400">Guest</span><p className="font-semibold text-gray-800 truncate">{b.guestName || 'N/A'}</p></div>
                        <div><span className="text-gray-400">Mobile</span><p className="font-semibold text-gray-800">{b.mobileNumber || 'N/A'}</p></div>
                        <div><span className="text-gray-400">Room</span><p className="font-semibold text-gray-800">{b.roomNumber || 'TBA'} ({b.roomType || 'Std'})</p></div>
                        <div><span className="text-gray-400">Guests</span><p className="font-semibold text-gray-800">{b.numberOfGuests || 1}</p></div>
                        <div><span className="text-gray-400">Check-in</span><p className="font-semibold text-gray-800">{formatDate(b.checkInDate)}</p></div>
                        <div><span className="text-gray-400">Check-out</span><p className="font-semibold text-gray-800">{formatDate(b.checkOutDate)}</p></div>
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
                    Print GRC
                </button>
            </div>
        </div>
    );
};

export default PrintGRCForm;
