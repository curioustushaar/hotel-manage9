import React from 'react';
import { useSettings } from '../context/SettingsContext';

const PrintTemplates = ({ type, data, booking }) => {
    const { settings, getCurrencySymbol, formatDate } = useSettings();
    const cs = getCurrencySymbol();
    const format = data?.type || 'A4'; // A4, A5, Thermal, etc.

    const isThermal = ['Thermal', '2 inch', '3 inch'].includes(format);
    const bodyWidth = format === '2 inch' ? '58mm' : format === '3 inch' ? '76mm' : format === 'Thermal' ? '80mm' : '100%';

    const Header = () => (
        <div className="print-header" style={{
            textAlign: 'center',
            marginBottom: isThermal ? '10px' : '20px',
            borderBottom: '2px solid #000',
            paddingBottom: isThermal ? '5px' : '10px'
        }}>
            <h1 style={{ margin: '0 0 5px 0', fontSize: isThermal ? '16px' : '24px', textTransform: 'uppercase' }}>{settings.name}</h1>
            <p style={{ margin: '2px 0', fontSize: isThermal ? '10px' : '14px' }}>{settings.address}, {settings.city}, {settings.state} - {settings.pin}</p>
            <p style={{ margin: '2px 0', fontSize: isThermal ? '10px' : '14px' }}>Ph: {settings.phone} | GSTIN: {settings.gstNumber}</p>
        </div>
    );

    const Footer = () => (
        <div className="print-footer" style={{
            marginTop: '30px',
            textAlign: 'center',
            fontSize: '12px',
            borderTop: '1px solid #eee',
            paddingTop: '10px'
        }}>
            <p style={{ margin: '5px 0' }}>{settings.thankYouMessage || 'Thank you for choosing us!'}</p>
            <p style={{ margin: '2px 0', color: '#666' }}>This is a computer-generated document.</p>
        </div>
    );

    const renderSummary = () => (
        <div className="print-summary">
            <Header />
            <div style={{ textAlign: 'center', backgroundColor: '#f3f4f6', padding: '10px', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '18px' }}>RESERVATION SUMMARY</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                <div>
                    <p><strong>Booking Ref:</strong> {booking.referenceNumber || booking.bookingId || booking.id}</p>
                    <p><strong>Guest Name:</strong> {booking.guestName}</p>
                    <p><strong>Mobile:</strong> {booking.guestPhone || booking.mobileNumber}</p>
                    <p><strong>Email:</strong> {booking.guestEmail || booking.email}</p>
                </div>
                <div>
                    <p><strong>Room No:</strong> {booking.roomNumber || 'TBD'}</p>
                    <p><strong>Room Type:</strong> {booking.roomType || booking.rooms?.[0]?.categoryId?.replace(/-/g, ' ').toUpperCase() || 'N/A'}</p>
                    <p><strong>Stay:</strong> {formatDate(booking.checkInDate)} to {formatDate(booking.checkOutDate)} ({booking.nights} Night{booking.nights > 1 ? 's' : ''})</p>
                </div>
            </div>
            <div style={{ marginBottom: '30px' }}>
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Billing Summary</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                    <span>Subtotal:</span>
                    <span>{cs}{booking.totalAmount - booking.tax}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                    <span>Tax:</span>
                    <span>{cs}{booking.tax}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid #000', fontWeight: 'bold' }}>
                    <span>Total Amount:</span>
                    <span>{cs}{booking.totalAmount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                    <span>Advance Paid:</span>
                    <span>{cs}{booking.paidAmount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid #ddd', color: booking.balanceDue > 0 ? '#ef4444' : '#059669' }}>
                    <span>Balance Due:</span>
                    <span>{cs}{booking.balanceDue}</span>
                </div>
            </div>
            <Footer />
        </div>
    );

    const renderGRC = (person = null) => {
        const p = person || { name: booking.guestName, phone: booking.guestPhone || booking.mobileNumber, type: 'Main Guest' };
        return (
            <div className="print-grc" style={{ pageBreakAfter: 'always' }}>
                <Header />
                <div style={{ textAlign: 'center', backgroundColor: '#f3f4f6', padding: '10px', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, fontSize: '18px' }}>GUEST REGISTRATION CARD (GRC)</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div style={{ border: '1px solid #ddd', padding: '15px' }}>
                        <p style={{ color: '#666', fontSize: '11px', margin: '0 0 5px 0' }}>GUEST DETAILS</p>
                        <p style={{ fontSize: '16px', margin: '0 0 5px 0' }}><strong>{p.name}</strong></p>
                        <p style={{ margin: '2px 0' }}>Type: {p.type}</p>
                        <p style={{ margin: '2px 0' }}>Phone: {p.phone}</p>
                        {p.email && <p style={{ margin: '2px 0' }}>Email: {p.email}</p>}
                    </div>
                    <div style={{ border: '1px solid #ddd', padding: '15px' }}>
                        <p style={{ color: '#666', fontSize: '11px', margin: '0 0 5px 0' }}>STAY DETAILS</p>
                        <p style={{ margin: '2px 0' }}><strong>Ref:</strong> {booking.referenceNumber || booking.id}</p>
                        <p style={{ margin: '2px 0' }}><strong>Room:</strong> {booking.roomNumber || 'TBD'} ({booking.roomType})</p>
                        <p style={{ margin: '2px 0' }}><strong>Check-in:</strong> {formatDate(booking.checkInDate)}</p>
                        <p style={{ margin: '2px 0' }}><strong>Check-out:</strong> {formatDate(booking.checkOutDate)}</p>
                    </div>
                </div>

                <div style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '30px', minHeight: '100px' }}>
                    <p style={{ color: '#666', fontSize: '11px', margin: '0 0 10px 0' }}>ID PROOF / ADDRESS</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>Type: ___________________</div>
                        <div>Number: _________________</div>
                    </div>
                    <div style={{ marginTop: '20px' }}>
                        Address: ___________________________________________________________
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', marginTop: '60px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ borderTop: '1px solid #000', paddingTop: '5px' }}>Guest Signature</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ borderTop: '1px solid #000', paddingTop: '5px' }}>Front Office Executive</div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    };

    const renderGRCAll = () => (
        <div className="print-grc-all">
            {data?.selectedData?.map((p, idx) => (
                <div key={p.id || idx}>
                    {renderGRC(p)}
                </div>
            ))}
        </div>
    );

    const renderInvoice = () => (
        <div className="print-invoice">
            <Header />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>INVOICE</h2>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0 }}><strong>Invoice #:</strong> {booking.invoiceId || 'N/A'}</p>
                    <p style={{ margin: 0 }}><strong>Date:</strong> {formatDate(new Date())}</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '30px' }}>
                <div>
                    <h4 style={{ borderBottom: '1px solid #ddd', paddingBottom: '3px', marginBottom: '8px' }}>GUEST</h4>
                    <p style={{ margin: '2px 0' }}>{booking.guestName}</p>
                    <p style={{ margin: '2px 0' }}>{booking.guestPhone}</p>
                    <p style={{ margin: '2px 0' }}>{booking.guestEmail}</p>
                </div>
                <div>
                    <h4 style={{ borderBottom: '1px solid #ddd', paddingBottom: '3px', marginBottom: '8px' }}>STAY</h4>
                    <p style={{ margin: '2px 0' }}>Room: {booking.roomNumber} ({booking.roomType})</p>
                    <p style={{ margin: '2px 0' }}>Check-in: {formatDate(booking.checkInDate)}</p>
                    <p style={{ margin: '2px 0' }}>Check-out: {formatDate(booking.checkOutDate)}</p>
                </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f3f4f6' }}>
                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Description</th>
                        <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Rate</th>
                        <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Qty</th>
                        <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>Room Charges - {booking.roomType}</td>
                        <td style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #eee' }}>{cs}{booking.pricePerNight}</td>
                        <td style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #eee' }}>{booking.nights}</td>
                        <td style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #eee' }}>{cs}{booking.pricePerNight * booking.nights}</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan="3" style={{ padding: '10px', textAlign: 'right' }}>Subtotal:</td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>{cs}{booking.totalAmount - booking.tax}</td>
                    </tr>
                    <tr>
                        <td colSpan="3" style={{ padding: '10px', textAlign: 'right' }}>Tax (GST):</td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>{cs}{booking.tax}</td>
                    </tr>
                    <tr style={{ fontWeight: 'bold', fontSize: '16px' }}>
                        <td colSpan="3" style={{ padding: '10px', textAlign: 'right', borderTop: '2px solid #000' }}>Grand Total:</td>
                        <td style={{ padding: '10px', textAlign: 'right', borderTop: '2px solid #000' }}>{cs}{booking.totalAmount}</td>
                    </tr>
                    <tr>
                        <td colSpan="3" style={{ padding: '10px', textAlign: 'right' }}>Paid Amount:</td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>{cs}{booking.paidAmount}</td>
                    </tr>
                    <tr style={{ borderTop: '1px solid #ddd' }}>
                        <td colSpan="3" style={{ padding: '10px', textAlign: 'right', color: booking.balanceDue > 0 ? '#ef4444' : '#059669' }}>
                            {booking.balanceDue > 0 ? 'Balance Due:' : 'Status:'}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right', color: booking.balanceDue > 0 ? '#ef4444' : '#059669' }}>
                            {booking.balanceDue > 0 ? `${cs}${booking.balanceDue}` : 'PAID'}
                        </td>
                    </tr>
                </tfoot>
            </table>
            <Footer />
        </div>
    );

    const content = () => {
        switch (type) {
            case 'print-summary': return renderSummary();
            case 'print-grc': return renderGRC();
            case 'print-grc-all': return renderGRCAll();
            case 'print-invoice': return renderInvoice();
            default: return null;
        }
    };

    return (
        <div style={{
            width: bodyWidth,
            margin: '0 auto',
            fontSize: isThermal ? '12px' : '14px',
            color: '#000',
            fontFamily: 'Inter, system-ui, sans-serif'
        }}>
            {content()}
        </div>
    );
};

export default PrintTemplates;
