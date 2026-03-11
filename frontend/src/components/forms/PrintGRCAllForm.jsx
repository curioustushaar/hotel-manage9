import { useState, useEffect } from 'react';
import './FormStyles.css';
import API_URL from '../../config/api';
import { useSettings } from '../../context/SettingsContext';

const PrintGRCAllForm = ({ booking, onSubmit, onCancel }) => {
    const { settings, getFullAddress } = useSettings();
    const [bookings, setBookings] = useState([]);
    const [selectedBookings, setSelectedBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');
    const [printType, setPrintType] = useState('A4');

    const printOptions = ['A4', 'A5', 'Thermal', 'Dot Matrix', '3 inch', '2 inch'];

    useEffect(() => { fetchBookings(); }, [filter]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/bookings/list`);
            const data = await response.json();
            if (data.success) {
                let filtered = data.data;
                if (filter === 'today') {
                    const today = new Date().toDateString();
                    filtered = filtered.filter(b => new Date(b.checkInDate).toDateString() === today);
                } else if (filter === 'week') {
                    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
                    filtered = filtered.filter(b => new Date(b.checkInDate) >= weekAgo);
                }
                setBookings(filtered);
                setSelectedBookings(filtered.map(b => b._id));
            }
        } catch (error) { console.error('Error fetching bookings:', error); }
        finally { setLoading(false); }
    };

    const handleSelectAll = () => {
        setSelectedBookings(selectedBookings.length === bookings.length ? [] : bookings.map(b => b._id));
    };

    const handleSelectBooking = (bookingId) => {
        setSelectedBookings(prev => prev.includes(bookingId) ? prev.filter(id => id !== bookingId) : [...prev, bookingId]);
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        try { return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }); } catch { return 'N/A'; }
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

    const generateSingleGRC = (b, index, total) => {
        return `
<div class="grc-card" ${index < total - 1 ? 'style="page-break-after: always;"' : ''}>
<div class="hotel-name">${settings.name || 'Hotel'}</div>
<div class="hotel-addr">${getFullAddress()}${settings.phone ? ' | ' + settings.phone : ''}</div>
<hr class="divider">
<div class="doc-title">Guest Registration Card (Form C)</div>
<hr class="divider">
<div class="reg-row"><span>Reg No: ${b.bookingId || b._id || 'N/A'}</span><span>Card ${index + 1}/${total}</span></div>
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
<div class="declaration"><strong>DECLARATION:</strong> I declare that the above information is true and correct.</div>
<div class="sig-area">
<div class="sig-block"><div class="sig-line">Guest Signature</div><small>Date: ___________</small></div>
<div class="sig-block"><div class="sig-line">Reception</div><small>${new Date().toLocaleDateString('en-IN')}</small></div>
</div>
<div class="footer">Generated: ${new Date().toLocaleString('en-IN')} | ${settings.name || 'Hotel'}</div>
</div>`;
    };

    const generateAllGRC = (selectedData) => {
        const cards = selectedData.map((b, i) => generateSingleGRC(b, i, selectedData.length)).join('\n');
        return `<!DOCTYPE html>
<html><head><title>GRC - All Guests</title>
<style>
${getPageStyle(printType)}
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
    font-family: ${isDotMatrix ? "'Courier New', monospace" : isReceipt ? "'Roboto Mono', 'Courier New', monospace" : "'Segoe UI', Arial, sans-serif"};
    font-size: ${isReceipt ? (printType === '2 inch' ? '10px' : '11px') : isDotMatrix ? '12px' : '13px'};
    color: #000; padding: ${isReceipt ? '4px' : isDotMatrix ? '10px' : '30px'}; line-height: 1.5;
    ${isReceipt ? `width: ${printType === '2 inch' ? '56mm' : '78mm'};` : ''}
}
.grc-card { ${!isReceipt ? 'margin-bottom: 20px;' : 'padding-bottom: 10px; border-bottom: 2px dashed #000; margin-bottom: 10px;'} }
.hotel-name { font-size: ${isReceipt ? '14px' : isDotMatrix ? '16px' : '22px'}; font-weight: bold; text-align: center; text-transform: uppercase; }
.hotel-addr { text-align: center; font-size: ${isReceipt ? '9px' : '11px'}; color: #444; margin-bottom: ${isReceipt ? '4px' : '8px'}; }
.divider { border: none; border-top: ${isDotMatrix ? '1px dashed #000' : isReceipt ? '1px dashed #333' : '2px solid #333'}; margin: ${isReceipt ? '5px 0' : '10px 0'}; }
.doc-title { text-align: center; font-size: ${isReceipt ? '12px' : isDotMatrix ? '13px' : '16px'}; font-weight: bold; text-transform: uppercase; padding: ${isReceipt ? '4px 0' : '8px 0'}; ${!isReceipt && !isDotMatrix ? 'background: #1f2937; color: #fff; letter-spacing: 2px;' : ''} margin: ${isReceipt ? '4px 0' : '10px 0'}; }
.reg-row { display: flex; justify-content: space-between; font-size: ${isReceipt ? '10px' : '12px'}; margin-bottom: ${isReceipt ? '5px' : '10px'}; font-weight: bold; }
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
<body>${cards}</body></html>`;
    };

    const handlePrintAll = () => {
        const selectedData = bookings.filter(b => selectedBookings.includes(b._id));
        if (selectedData.length === 0) { alert('Please select at least one booking'); return; }
        const content = generateAllGRC(selectedData);
        const printWindow = window.open('', '_blank', 'width=900,height=700');
        printWindow.document.write(content);
        printWindow.document.close();
        setTimeout(() => { printWindow.focus(); printWindow.print(); }, 400);
        onSubmit({ action: 'print-grc-all', count: selectedData.length, timestamp: new Date().toISOString(), type: printType });
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex-1 overflow-hidden flex flex-col p-5 space-y-3">
                {/* Controls Row */}
                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className="text-[11px] text-gray-400 uppercase tracking-wide mb-1 block">Filter</label>
                        <select value={filter} onChange={(e) => setFilter(e.target.value)}
                            className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
                            <option value="all">All Bookings</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="text-[11px] text-gray-400 uppercase tracking-wide mb-1 block">Format</label>
                        <select value={printType} onChange={(e) => setPrintType(e.target.value)}
                            className="w-full px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-400 bg-white">
                            {printOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        {/* Selection header */}
                        <div className="flex justify-between items-center">
                            <button type="button" onClick={handleSelectAll}
                                className="text-[11px] px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg border border-gray-200 font-semibold">
                                {selectedBookings.length === bookings.length ? 'Unselect All' : 'Select All'}
                            </button>
                            <span className="text-xs font-bold text-gray-500">
                                {selectedBookings.length}/{bookings.length}
                            </span>
                        </div>

                        {/* Booking List */}
                        <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                            {bookings.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 text-xs">No bookings found</div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {bookings.map(b => (
                                        <div key={b._id}
                                            onClick={() => handleSelectBooking(b._id)}
                                            className={`p-2.5 flex items-center gap-2.5 cursor-pointer transition-colors ${selectedBookings.includes(b._id) ? 'bg-blue-50 border-l-3 border-blue-500' : 'hover:bg-gray-50 border-l-3 border-transparent'}`}>
                                            <input type="checkbox" checked={selectedBookings.includes(b._id)}
                                                onChange={() => handleSelectBooking(b._id)}
                                                className="w-3.5 h-3.5 text-blue-600 rounded border-gray-300" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-gray-900 truncate">{b.guestName}</p>
                                                <p className="text-[10px] text-gray-400">{b.bookingId} | Room {b.roomNumber || 'TBA'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Print Button */}
            <div className="p-4 border-t border-gray-100">
                <button type="button" onClick={handlePrintAll}
                    disabled={selectedBookings.length === 0}
                    style={selectedBookings.length === 0 ? {
                        width:'100%', padding:'12px', background:'#e5e7eb', color:'#9ca3af',
                        border:'none', borderRadius:'10px', fontWeight:'700', fontSize:'14px',
                        cursor:'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'
                    } : {
                        width:'100%', padding:'12px', background:'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                        color:'#fff', border:'none', borderRadius:'10px', fontWeight:'700', fontSize:'14px',
                        cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                        boxShadow:'0 4px 15px rgba(220,38,38,0.4)', transition:'all 0.2s'
                    }}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    📋 Print {selectedBookings.length} GRC{selectedBookings.length !== 1 ? 's' : ''}
                </button>
            </div>
        </div>
    );
};

export default PrintGRCAllForm;
