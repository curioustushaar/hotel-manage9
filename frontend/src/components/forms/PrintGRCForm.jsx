import { useState } from 'react';
import './FormStyles.css';
import { useSettings } from '../../context/SettingsContext';

const PrintGRCForm = ({ booking, onSubmit, onCancel }) => {
    const { settings, getFullAddress } = useSettings();
    const [printType, setPrintType] = useState('A4');

    const printOptions = [
        { id: 'A4', label: 'A4', icon: '📄', desc: 'Standard' },
        { id: 'A5', label: 'A5', icon: '📃', desc: 'Half Sheet' },
        { id: 'Thermal', label: 'Thermal', icon: '🧾', desc: '80mm Roll' },
        { id: 'Dot Matrix', label: 'Dot Matrix', icon: '🖨️', desc: 'DMP' },
        { id: '3 inch', label: '3 inch', icon: '📜', desc: '76mm Roll' },
        { id: '2 inch', label: '2 inch', icon: '🔖', desc: '58mm Roll' },
    ];

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
${settings.displayLogoOnBill && settings.logoUrl ? `<div style="text-align:center;margin-bottom:4px"><img src="${settings.logoUrl}" style="max-height:50px;max-width:150px;object-fit:contain" /></div>` : ''}
<div class="hotel-name">${settings.name || 'Hotel'}</div>
<div class="hotel-addr">${getFullAddress()}${settings.phone ? ' | ' + settings.phone : ''}</div>
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
<div class="footer">Generated: ${new Date().toLocaleString('en-IN')} | ${settings.name || 'Hotel'}</div>
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
                    <label className="text-[11px] text-gray-400 uppercase tracking-wide mb-2 block">
                        <span style={{marginRight:'6px'}}>🖨️</span> Select Print Format
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {printOptions.map(opt => (
                            <button key={opt.id} type="button" onClick={() => setPrintType(opt.id)}
                                style={printType === opt.id ? {
                                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                                    color: '#fff', border: '2px solid #dc2626', borderRadius: '10px',
                                    padding: '10px 4px', boxShadow: '0 4px 12px rgba(220,38,38,0.3)',
                                    transform: 'translateY(-1px)', cursor: 'pointer', transition: 'all 0.2s',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px'
                                } : {
                                    background: '#fff', color: '#374151', border: '1.5px solid #e5e7eb',
                                    borderRadius: '10px', padding: '10px 4px', cursor: 'pointer',
                                    transition: 'all 0.2s', display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', gap: '3px'
                                }}
                            >
                                <span style={{fontSize:'18px'}}>{opt.icon}</span>
                                <span style={{fontSize:'11px', fontWeight:'700'}}>{opt.label}</span>
                                <span style={{fontSize:'9px', opacity:'0.7'}}>{opt.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Print Button */}
            <div className="p-4 border-t border-gray-100">
                <div style={{marginBottom:'8px', fontSize:'11px', color:'#6b7280', textAlign:'center'}}>
                    Format: <strong style={{color:'#dc2626'}}>{printOptions.find(p => p.id === printType)?.icon} {printType}</strong>
                </div>
                <button type="button" onClick={handlePrint}
                    style={{width:'100%', padding:'12px', background:'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                        color:'#fff', border:'none', borderRadius:'10px', fontWeight:'700', fontSize:'14px',
                        cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                        boxShadow:'0 4px 15px rgba(220,38,38,0.4)', transition:'all 0.2s'
                    }}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    📋 Print GRC
                </button>
            </div>
        </div>
    );
};

export default PrintGRCForm;
