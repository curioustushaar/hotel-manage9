import React, { useState } from 'react';
import Drawer from '../Drawer';
import Toast from '../Toast';
import { User, X, Calendar, Clock } from 'lucide-react';
import { addVisitor } from '../../services/visitorService';

const AddVisitorDrawer = ({ isOpen, onClose, reservationId, booking, onVisitorAdded }) => {
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        idType: 'Aadhaar (ID)',
        idNumber: '',
        inTime: new Date().toISOString().slice(0, 16), // Default to now
        outTime: ''
    });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.mobile.trim()) {
            setToast({ message: 'Name and Mobile are required', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            console.log('SENDING VISITOR DATA:', {
                ...formData,
                reservationId,
                purpose: 'Visitor',
                chargeAmount: 0
            });

            await addVisitor({
                ...formData,
                reservationId,
                purpose: 'Visitor', // Default purpose
                chargeAmount: 0     // Default charge
            });

            setToast({ message: 'Visitor added successfully', type: 'success' });

            // Allow parent to refresh data
            if (onVisitorAdded) {
                onVisitorAdded();
            }

            // Reset form
            setFormData({
                name: '',
                mobile: '',
                idType: 'Aadhaar (ID)',
                idNumber: '',
                inTime: new Date().toISOString().slice(0, 16),
                outTime: ''
            });

            setTimeout(() => {
                onClose();
            }, 1500);

        } catch (error) {
            console.error('ADD VISITOR ERROR:', error);
            // Check for specific error message structure
            const msg = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to add visitor';
            setToast({ message: msg, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Helper for input styles to match Image 2
    const inputStyle = {
        width: '100%',
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid #E5E7EB', // Gray-200
        backgroundColor: '#F9FAFB',  // Gray-50
        fontSize: '14px',
        color: '#1F2937',           // Gray-800
        outline: 'none',
        transition: 'border-color 0.2s'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151',           // Gray-700
        marginBottom: '6px'
    };

    return (
        <>
            <Drawer
                isOpen={isOpen}
                onClose={onClose}
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User size={20} />
                        <span>Add Visitor</span>
                    </div>
                }
                width="400px" // Adjust width if needed
            >
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

                    <form onSubmit={handleSubmit} style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {/* Visitor Name */}
                        <div>
                            <label style={labelStyle}>Visitor Name:</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter visitor's name"
                                style={inputStyle}
                            />
                        </div>

                        {/* Mobile Number */}
                        <div>
                            <label style={labelStyle}>Mobile Number</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <div style={{
                                    ...inputStyle,
                                    width: 'auto',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontWeight: '600',
                                    padding: '12px'
                                }}>
                                    +91
                                    <span style={{ fontSize: '10px', color: '#6B7280' }}>▼</span>
                                </div>
                                <input
                                    type="tel"
                                    name="mobile"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    placeholder="Enter mobile number"
                                    maxLength="10"
                                    style={{ ...inputStyle, flex: 1 }}
                                />
                            </div>
                        </div>

                        {/* ID Type */}
                        <div>
                            <label style={labelStyle}>ID Type:</label>
                            <div style={{ position: 'relative' }}>
                                <select
                                    name="idType"
                                    value={formData.idType}
                                    onChange={handleChange}
                                    style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                                >
                                    <option value="Aadhaar (ID)">Aadhaar (ID)</option>
                                    <option value="Passport">Passport</option>
                                    <option value="Driving License">Driving License</option>
                                    <option value="PAN Card">PAN Card</option>
                                </select>
                                <span style={{
                                    position: 'absolute',
                                    right: '16px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#9CA3AF',
                                    pointerEvents: 'none'
                                }}>›</span>
                            </div>
                        </div>

                        {/* ID Number */}
                        <div>
                            <label style={labelStyle}>ID Number:</label>
                            <input
                                type="text"
                                name="idNumber"
                                value={formData.idNumber}
                                onChange={handleChange}
                                placeholder="Enter ID number"
                                style={inputStyle}
                            />
                        </div>

                        {/* In Time */}
                        <div>
                            <label style={labelStyle}>In Time:</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="datetime-local"
                                    name="inTime"
                                    value={formData.inTime}
                                    onChange={handleChange}
                                    style={{ ...inputStyle, paddingRight: '10px' }}
                                />
                                {/* Optional: Custom calendar icon could be absolutely positioned if input type wasn't sufficient */}
                            </div>
                        </div>

                        {/* Out Time */}
                        <div>
                            <label style={labelStyle}>Out Time:</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="datetime-local"
                                    name="outTime"
                                    value={formData.outTime}
                                    onChange={handleChange}
                                    style={{ ...inputStyle, paddingRight: '10px' }}
                                />
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div style={{
                            marginTop: 'auto',
                            paddingTop: '20px',
                            fontSize: '12px',
                            color: '#6B7280',
                            display: 'flex',
                            justifyContent: 'space-between',
                            borderTop: '1px solid #F3F4F6'
                        }}>
                            <span>Reservation ID: {reservationId?.substring(0, 16)}...</span>
                            <span>Room Num: <b>{booking?.roomNumber || 'N/A'}</b></span>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #E5E7EB',
                                    backgroundColor: '#FFFFFF',
                                    color: '#374151',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: '#DC2626', // Red-600
                                    color: '#FFFFFF',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                {loading ? 'Saving...' : 'Save Visitor'}
                            </button>
                        </div>
                    </form>
                </div>
            </Drawer>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </>
    );
};

export default AddVisitorDrawer;
