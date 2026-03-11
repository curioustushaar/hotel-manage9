import React, { useState } from 'react';
import './FormStyles.css';
import { useSettings } from '../../context/SettingsContext';

const PrintSummaryForm = ({ booking, onSubmit }) => {
    const { settings, getCurrencySymbol, getFullAddress } = useSettings();
    const cs = getCurrencySymbol();
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
        try {
            return new Date(date).toLocaleDateString('en-IN', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            });
        } catch { return 'N/A'; }
    };

    const getPageStyle = (type) => {
        if (type === '2 inch') return '@page { size: 56mm auto; margin: 2mm; }';
        if (type === '3 inch' || type === 'Thermal') return '@page { size: 78mm auto; margin: 2mm; }';
        if (type === 'A5') return '@page { size: A5; margin: 12mm; }';
        if (type === 'Dot Matrix') return '@page { size: auto; margin: 5mm; }';
        return '@page { size: A4; margin: 15mm; }';
    };

    const isReceipt = ['2 inch', '3 inch', 'Thermal'].includes(printType);
    const isDotMatrix = printType === 'Dot Matrix';

    const generatePrintHTML = () => {
        const b = booking || {};
        const nights = b.numberOfNights || 1;
        const adults = b.numberOfAdults || b.adultsCount || 1;
        const children = b.numberOfChildren || b.childrenCount || 0;

        return `<!DOCTYPE html>
<html><head><title>Summary - ${b.bookingId || 'Booking'}</title>
<style>
${getPageStyle(printType)}
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
    font-family: ${isDotMatrix ? "'Courier New', monospace" : isReceipt ? "'Roboto Mono', 'Courier New', monospace" : "'Segoe UI', Arial, sans-serif"};
    font-size: ${isReceipt ? (printType === '2 inch' ? '10px' : '11px') : isDotMatrix ? '12px' : '13px'};
    color: #000;
    padding: ${isReceipt ? '4px' : isDotMatrix ? '10px' : '30px'};
    line-height: 1.5;
    ${isReceipt ? `width: ${printType === '2 inch' ? '56mm' : '78mm'};` : ''}
}
.hotel-name { font-size: ${isReceipt ? '14px' : isDotMatrix ? '16px' : '22px'}; font-weight: bold; text-align: center; margin-bottom: 2px; text-transform: uppercase; }
.hotel-address { text-align: center; font-size: ${isReceipt ? '9px' : '11px'}; color: #444; margin-bottom: ${isReceipt ? '6px' : '15px'}; }
.divider { border: none; border-top: ${isDotMatrix ? '1px dashed #000' : isReceipt ? '1px dashed #333' : '2px solid #333'}; margin: ${isReceipt ? '6px 0' : '12px 0'}; }
.title { text-align: center; font-size: ${isReceipt ? '13px' : isDotMatrix ? '14px' : '18px'}; font-weight: bold; margin: ${isReceipt ? '6px 0' : '15px 0'}; text-transform: uppercase; ${!isReceipt && !isDotMatrix ? 'letter-spacing: 2px;' : ''} }
.info-row { display: flex; justify-content: space-between; padding: ${isReceipt ? '3px 0' : '8px 0'}; border-bottom: 1px ${isDotMatrix ? 'dotted' : 'solid'} ${isReceipt ? '#ddd' : '#e5e5e5'}; }
.info-row:last-child { border-bottom: none; }
.info-label { font-weight: 600; color: #333; }
.info-value { text-align: right; color: #000; }
.total-row { display: flex; justify-content: space-between; padding: ${isReceipt ? '6px 0' : '12px 0'}; font-size: ${isReceipt ? '13px' : '16px'}; font-weight: bold; border-top: 2px solid #000; margin-top: 5px; }
.status-badge { display: inline-block; padding: 2px 10px; border-radius: 4px; font-size: ${isReceipt ? '9px' : '11px'}; font-weight: bold; text-transform: uppercase; }
.footer { text-align: center; margin-top: ${isReceipt ? '10px' : '20px'}; font-size: ${isReceipt ? '9px' : '11px'}; color: #666; }
@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style></head>
<body>
${settings.displayLogoOnBill && settings.logoUrl ? `<div style="text-align:center;margin-bottom:6px"><img src="${settings.logoUrl}" style="max-height:60px;max-width:180px;object-fit:contain" /></div>` : ''}
<div class="hotel-name">${settings.name || 'Hotel'}</div>
<div class="hotel-address">${getFullAddress()}${settings.phone ? ' | ' + settings.phone : ''}</div>
<hr class="divider">
<div class="title">Booking Summary</div>
<hr class="divider">

<div class="info-row"><span class="info-label">Reservation No</span><span class="info-value">${b.bookingId || 'N/A'}</span></div>
<div class="info-row"><span class="info-label">Status</span><span class="info-value"><span class="status-badge" style="background:${b.status === 'Checked-in' ? '#dcfce7;color:#166534' : b.status === 'Checked-out' ? '#f3f4f6;color:#374151' : '#fef3c7;color:#92400e'}">${b.status || 'Reserved'}</span></span></div>
<div class="info-row"><span class="info-label">Guest Name</span><span class="info-value">${b.guestName || 'N/A'}</span></div>
<div class="info-row"><span class="info-label">Mobile</span><span class="info-value">${b.mobileNumber || 'N/A'}</span></div>
${b.email ? `<div class="info-row"><span class="info-label">Email</span><span class="info-value">${b.email}</span></div>` : ''}
<div class="info-row"><span class="info-label">Room</span><span class="info-value">${b.roomNumber || 'TBA'} (${b.roomType || 'Standard'})</span></div>
<div class="info-row"><span class="info-label">Check-in</span><span class="info-value">${formatDate(b.checkInDate)}${b.checkInTime ? ' ' + b.checkInTime : ''}</span></div>
<div class="info-row"><span class="info-label">Check-out</span><span class="info-value">${formatDate(b.checkOutDate)}${b.checkOutTime ? ' ' + b.checkOutTime : ''}</span></div>
<div class="info-row"><span class="info-label">Nights</span><span class="info-value">${nights}</span></div>
<div class="info-row"><span class="info-label">Occupancy</span><span class="info-value">${adults} Adult(s), ${children} Child(ren)</span></div>
<div class="info-row"><span class="info-label">Rate/Night</span><span class="info-value">${cs}${(b.pricePerNight || 0).toLocaleString('en-IN')}</span></div>

<hr class="divider">
<div class="total-row"><span>Total Amount</span><span>${cs}${(b.totalAmount || 0).toLocaleString('en-IN')}</span></div>
${(b.advancePaid || 0) > 0 ? `<div class="info-row" style="color:green;font-weight:600"><span class="info-label">Paid</span><span class="info-value">${cs}${(b.advancePaid || 0).toLocaleString('en-IN')}</span></div>` : ''}
${(b.remainingAmount || 0) > 0 ? `<div class="info-row" style="color:#dc2626;font-weight:600"><span class="info-label">Balance Due</span><span class="info-value">${cs}${(b.remainingAmount || 0).toLocaleString('en-IN')}</span></div>` : ''}

<hr class="divider">
<div class="footer">${settings.thankYouMessage || ('Thank you for choosing ' + (settings.name || 'our hotel') + '!')}<br>Generated: ${new Date().toLocaleString('en-IN')}</div>
</body></html>`;
    };

    const handlePrint = () => {
        const content = generatePrintHTML();
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        printWindow.document.write(content);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
        }, 400);

        if (onSubmit) {
            onSubmit({ action: 'print-summary', timestamp: new Date().toISOString(), type: printType });
        }
    };

    const b = booking || {};
    const nights = b.numberOfNights || 1;

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Booking Info Card */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[11px] text-gray-400 uppercase tracking-wide">Reservation</p>
                            <p className="text-sm font-bold text-gray-900">{b.bookingId || 'N/A'}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${b.status === 'Checked-in' ? 'bg-green-100 text-green-700' : b.status === 'Checked-out' ? 'bg-gray-200 text-gray-600' : 'bg-amber-100 text-amber-700'}`}>
                            {b.status || 'Reserved'}
                        </span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 grid grid-cols-2 gap-2 text-[12px]">
                        <div><span className="text-gray-400">Guest</span><p className="font-semibold text-gray-800 truncate">{b.guestName || 'N/A'}</p></div>
                        <div><span className="text-gray-400">Room</span><p className="font-semibold text-gray-800">{b.roomNumber || 'TBA'} ({b.roomType || 'Std'})</p></div>
                        <div><span className="text-gray-400">Check-in</span><p className="font-semibold text-gray-800">{formatDate(b.checkInDate)}</p></div>
                        <div><span className="text-gray-400">Check-out</span><p className="font-semibold text-gray-800">{formatDate(b.checkOutDate)}</p></div>
                        <div><span className="text-gray-400">Nights</span><p className="font-semibold text-gray-800">{nights}</p></div>
                        <div><span className="text-gray-400">Total</span><p className="font-bold text-gray-900">{cs}{(b.totalAmount || 0).toLocaleString('en-IN')}</p></div>
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
                <button onClick={handlePrint}
                    style={{width:'100%', padding:'12px', background:'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                        color:'#fff', border:'none', borderRadius:'10px', fontWeight:'700', fontSize:'14px',
                        cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                        boxShadow:'0 4px 15px rgba(220,38,38,0.4)', transition:'all 0.2s'
                    }}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    🖨️ Print Summary
                </button>
            </div>
        </div>
    );
};

export default PrintSummaryForm;
