import { useState } from 'react';
import './FormStyles.css';
import API_URL from '../../config/api';
import { useSettings } from '../../context/SettingsContext';

const SendInvoiceForm = ({ booking, onSubmit, onCancel }) => {
    const { getCurrencySymbol } = useSettings();
    const cs = getCurrencySymbol();
    const [formData, setFormData] = useState({
        email: booking.email || '',
        subject: `Invoice for Booking ${booking.bookingId}`,
        message: `Dear ${booking.guestName},\n\nThank you for choosing Bireena Athithi Hotel. Please find your booking invoice attached.\n\nBooking Details:\n- Booking ID: ${booking.bookingId}\n- Check-In: ${new Date(booking.checkInDate).toLocaleDateString('en-IN')}\n- Check-Out: ${new Date(booking.checkOutDate).toLocaleDateString('en-IN')}\n- Total Amount: ${cs}${(booking.totalAmount || 0).toLocaleString('en-IN')}\n\nIf you have any questions, please don't hesitate to contact us.\n\nBest regards,\nBireena Athithi Hotel Team`,
        includeGRC: false,
        includeSummary: true
    });
    const [sending, setSending] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSendEmail = async (e) => {
        e.preventDefault();
        
        if (!formData.email) {
            alert('Please enter an email address');
            return;
        }

        if (!formData.email.includes('@')) {
            alert('Please enter a valid email address');
            return;
        }

        setSending(true);

        try {
            // Simulate API call to send email
            // In production, this would call your backend email service
            const response = await new Promise((resolve) => {
                setTimeout(() => {
                    resolve({ success: true });
                }, 2000);
            });

            if (response.success) {
                setEmailSent(true);
                alert(`✅ Invoice sent successfully to ${formData.email}!`);
                
                // Call the onSubmit callback
                onSubmit({
                    action: 'send-invoice',
                    email: formData.email,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Error sending email:', error);
            alert('❌ Failed to send email. Please try again.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="form-container">
            <form onSubmit={handleSendEmail}>
                <div className="form-section">
                    <h3 className="section-title">📧 Send Invoice via Email</h3>
                    <p className="form-description">
                        Send the invoice and booking details to the guest's email address.
                    </p>

                    <div className="form-group">
                        <label className="form-label required">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="guest@example.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Subject</label>
                        <input
                            type="text"
                            name="subject"
                            className="form-input"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="Email subject"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Message</label>
                        <textarea
                            name="message"
                            className="form-input"
                            value={formData.message}
                            onChange={handleChange}
                            rows="10"
                            placeholder="Email message body"
                            required
                            style={{ fontFamily: 'inherit', resize: 'vertical' }}
                        />
                    </div>

                    <div className="form-section" style={{ 
                        background: '#f9fafb', 
                        padding: '15px', 
                        borderRadius: '8px',
                        marginTop: '20px'
                    }}>
                        <h4 style={{ marginBottom: '10px', fontSize: '14px' }}>📎 Attachments</h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="includeSummary"
                                    checked={formData.includeSummary}
                                    onChange={handleChange}
                                    style={{ width: '18px', height: '18px' }}
                                />
                                <span>Include Booking Summary</span>
                            </label>
                            
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="includeGRC"
                                    checked={formData.includeGRC}
                                    onChange={handleChange}
                                    style={{ width: '18px', height: '18px' }}
                                />
                                <span>Include Guest Registration Card</span>
                            </label>
                        </div>
                    </div>

                    <div className="info-card" style={{
                        background: '#eff6ff',
                        border: '1px solid #3b82f6',
                        borderRadius: '8px',
                        padding: '15px',
                        marginTop: '20px'
                    }}>
                        <h4 style={{ color: '#1e40af', marginBottom: '10px', fontSize: '14px' }}>
                            📋 Invoice Preview
                        </h4>
                        <div style={{ fontSize: '13px', color: '#1e3a8a', lineHeight: '1.6' }}>
                            <p><strong>Booking ID:</strong> {booking.bookingId}</p>
                            <p><strong>Guest:</strong> {booking.guestName}</p>
                            <p><strong>Room:</strong> {booking.roomType} ({booking.roomNumber || 'TBA'})</p>
                            <p><strong>Duration:</strong> {new Date(booking.checkInDate).toLocaleDateString('en-IN')} to {new Date(booking.checkOutDate).toLocaleDateString('en-IN')} ({booking.numberOfNights} nights)</p>
                            <hr style={{ margin: '10px 0', borderColor: '#bfdbfe' }} />
                            <p><strong>Total Amount:</strong> {cs}{(booking.totalAmount || 0).toLocaleString('en-IN')}</p>
                            <p style={{ color: '#16a34a' }}><strong>Paid:</strong> {cs}{(booking.advancePaid || 0).toLocaleString('en-IN')}</p>
                            <p style={{ color: '#E31E24' }}><strong>Balance:</strong> {cs}{(booking.remainingAmount || 0).toLocaleString('en-IN')}</p>
                        </div>
                    </div>

                    {emailSent && (
                        <div style={{
                            background: '#d1fae5',
                            border: '1px solid #10b981',
                            borderRadius: '8px',
                            padding: '15px',
                            marginTop: '20px',
                            color: '#065f46'
                        }}>
                            <strong>✅ Email sent successfully!</strong>
                            <p style={{ marginTop: '5px', fontSize: '14px' }}>
                                The invoice has been sent to {formData.email}
                            </p>
                        </div>
                    )}
                </div>

                <div className="form-actions">
                    <button 
                        type="button" 
                        className="btn-secondary"
                        onClick={onCancel}
                        disabled={sending}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        className="btn-primary"
                        disabled={sending || !formData.email}
                    >
                        {sending ? '⏳ Sending...' : '📧 Send Invoice'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SendInvoiceForm;
