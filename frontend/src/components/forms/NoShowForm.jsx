import React, { useState, useEffect } from 'react';
import { AlertCircle, Calendar, Clock, User, Bed, Loader2 } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const NoShowForm = ({ booking, onSubmit, onCancel }) => {
    const { getCurrencySymbol } = useSettings();
    const cs = getCurrencySymbol();
    const [applyCharge, setApplyCharge] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Calculate approximate charge if available
    const chargeAmount = booking.ratePerNight || booking.pricePerNight || (booking.totalAmount / (booking.nights || booking.numberOfNights || 1));

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            // Pass data to parent handler
            await onSubmit({ applyCharge });
        } catch (error) {
            // Parent handles error alerting usually, but we stop loading
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            backgroundColor: '#fff',
            fontFamily: 'Inter, system-ui, sans-serif'
        }}>
            {/* Header */}
            <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #fee2e2',
                backgroundColor: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#dc2626'
            }}>
                <AlertCircle size={20} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Confirm No-Show</h3>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', flex: 1 }}>

                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    padding: '20px',
                    marginBottom: '24px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#111827', fontWeight: '600' }}>Guest Details</h4>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px' }}>
                        <div>
                            <span style={{ display: 'block', color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>Guest Name</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                                <User size={14} color="#4b5563" /> {booking.guestName}
                            </div>
                        </div>
                        <div>
                            <span style={{ display: 'block', color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>Reservation ID</span>
                            <span style={{ fontWeight: '500', fontFamily: 'monospace' }}>{booking.reservationId || booking.referenceId}</span>
                        </div>
                        <div>
                            <span style={{ display: 'block', color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>Arrival Date</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Calendar size={14} color="#4b5563" />
                                {new Date(booking.checkInDate).toLocaleDateString()}
                            </div>
                        </div>
                        <div>
                            <span style={{ display: 'block', color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>Room Number</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Bed size={14} color="#4b5563" />
                                {booking.roomNumber || 'Unassigned'}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '16px', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '6px', fontSize: '13px' }}>
                        <span style={{ color: '#6b7280' }}>Current Status: </span>
                        <span style={{ fontWeight: '600', color: '#2563eb' }}>{booking.status}</span>
                    </div>
                </div>

                <div style={{
                    padding: '16px',
                    backgroundColor: '#fff1f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    color: '#991b1b',
                    fontSize: '14px',
                    marginBottom: '24px',
                    lineHeight: '1.5'
                }}>
                    <strong>Warning:</strong> This reservation will be marked as <strong>NO-SHOW</strong> and the room will be released immediately. This action cannot be fully undone.
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <input
                        type="checkbox"
                        id="applyCharge"
                        checked={applyCharge}
                        onChange={(e) => setApplyCharge(e.target.checked)}
                        style={{
                            marginTop: '4px',
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer'
                        }}
                    />
                    <label htmlFor="applyCharge" style={{ fontSize: '14px', color: '#374151', cursor: 'pointer' }}>
                        <strong>Apply 1 Night No-Show Charge?</strong>
                        <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '13px' }}>
                            A charge of <strong>{cs}{Math.round(chargeAmount || 0).toLocaleString()}</strong> will be posted to the folio.
                        </p>
                    </label>
                </div>

            </div>

            {/* Footer */}
            <div style={{
                padding: '20px',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px'
            }}>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    style={{
                        padding: '10px 16px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        backgroundColor: '#fff',
                        color: '#374151',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    style={{
                        padding: '10px 24px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}
                >
                    {isLoading && <Loader2 size={16} className="animate-spin" />}
                    {isLoading ? 'Processing...' : 'Confirm No-Show'}
                </button>
            </div>

            <style>{`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default NoShowForm;
