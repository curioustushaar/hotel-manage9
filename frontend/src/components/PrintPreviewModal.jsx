import React from 'react';
import './PrintPreviewModal.css';
import { useSettings } from '../context/SettingsContext';

const PrintPreviewModal = ({ isOpen, onClose, onPrint, type, booking }) => {
    const { getCurrencySymbol } = useSettings();
    const cs = getCurrencySymbol();
    if (!isOpen || !booking) return null;

    // Define title and description based on type
    const getModalContent = () => {
        switch (type) {
            case 'print-summary':
                return {
                    title: 'Print Summary',
                    icon: '',
                    desc: 'Print the detailed booking summary with guest information and payment details',
                    buttonText: 'Print Summary'
                };
            case 'print-invoice':
                return {
                    title: 'Print Invoice',
                    icon: '',
                    desc: 'Print the final invoice for this reservation including all charges and payments',
                    buttonText: 'Print Invoice'
                };
            case 'print-grc':
                return {
                    title: 'Print GRC',
                    icon: '',
                    desc: 'Print the Guest Registration Card for the primary guest',
                    buttonText: 'Print GRC'
                };
            case 'print-grc-all':
                return {
                    title: 'Print GRC (All)',
                    icon: '',
                    desc: 'Print Guest Registration Cards for all guests in this booking',
                    buttonText: 'Print All GRCs'
                };
            case 'send-invoice':
                return {
                    title: 'Send Invoice',
                    icon: '',
                    desc: `Send the invoice to ${booking.guestEmail || booking.email}`,
                    buttonText: 'Send Email'
                };
            default:
                return {
                    title: 'Print Document',
                    icon: '',
                    desc: 'Print the selected document',
                    buttonText: 'Print'
                };
        }
    };

    const content = getModalContent();

    return (
        <div className="print-modal-overlay" onClick={onClose}>
            <div className="print-modal-content" onClick={e => e.stopPropagation()}>
                <div className="print-modal-header">
                    <div className="print-title-area">
                        <span className="print-icon">{content.icon}</span>
                        <h2 className="print-modal-title">{content.title}</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <p className="print-modal-desc">{content.desc}</p>

                <div className="booking-preview-card">
                    <h3 className="preview-title">Booking Preview</h3>
                    <div className="preview-details">
                        <div className="preview-item">
                            <span className="preview-icon"></span>
                            <span>ID: {booking.referenceNumber || booking.bookingId || booking.id || 'N/A'}</span>
                        </div>
                        <div className="preview-item">
                            <span className="preview-icon"></span>
                            <span>Guest: {booking.guestName}</span>
                        </div>
                        <div className="preview-item">
                            <span className="preview-icon"></span>
                            <span>Check-in Date: {booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                        </div>

                        <div className="total-amount-section">
                            <span className="amount-label">Total Amount Paid:</span>
                            <span className="amount-value">{cs} {(booking.paidAmount || 0).toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>

                <div className="print-modal-actions">
                    <button className="btn-modal-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn-modal-print" onClick={() => onPrint(type, booking)}>
                        <span></span> {content.buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrintPreviewModal;
