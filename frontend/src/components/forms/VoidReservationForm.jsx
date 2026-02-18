import React, { useState } from 'react';
import { Trash2, Calendar, User, Bed, AlertTriangle, Loader2 } from 'lucide-react';

const VoidReservationForm = ({ booking, onSubmit, onCancel }) => {
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!reason.trim()) {
            setError('Please provide a reason for voiding this reservation.');
            return;
        }

        setIsLoading(true);
        try {
            await onSubmit({ reason });
        } catch (err) {
            // Error handling usually in parent, but we catching here just to stop loading
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            fontFamily: 'Inter, sans-serif'
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
                <Trash2 size={20} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Void Reservation</h3>
            </div>

            {/* Content */}
            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>

                {/* Details Card */}
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    padding: '16px',
                    marginBottom: '24px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reservation Details</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px' }}>
                        <div>
                            <span style={{ display: 'block', color: '#6b7280', fontSize: '12px', marginBottom: '2px' }}>Guest</span>
                            <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <User size={14} /> {booking.guestName}
                            </div>
                        </div>
                        <div>
                            <span style={{ display: 'block', color: '#6b7280', fontSize: '12px', marginBottom: '2px' }}>ID</span>
                            <span style={{ fontFamily: 'monospace', fontWeight: '500' }}>{booking.reservationId || booking.referenceId}</span>
                        </div>
                        <div>
                            <span style={{ display: 'block', color: '#6b7280', fontSize: '12px', marginBottom: '2px' }}>Arrival</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Calendar size={14} /> {new Date(booking.checkInDate).toLocaleDateString()}
                            </div>
                        </div>
                        <div>
                            <span style={{ display: 'block', color: '#6b7280', fontSize: '12px', marginBottom: '2px' }}>Current Status</span>
                            <span style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                backgroundColor: '#e0f2fe',
                                color: '#0369a1',
                                fontSize: '12px',
                                fontWeight: '600'
                            }}>
                                {booking.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Warning */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '16px',
                    backgroundColor: '#fff1f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    color: '#991b1b',
                    fontSize: '14px',
                    marginBottom: '24px'
                }}>
                    <AlertTriangle size={20} style={{ flexShrink: 0 }} />
                    <div>
                        <strong>Warning:</strong> This action will permanently mark this reservation as <strong>VOID</strong> and release the room. All financial records will be zeroed out. This cannot be undone.
                    </div>
                </div>

                {/* Reason Input */}
                <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                        Reason for Voiding <span style={{ color: 'red' }}>*</span>
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g. Duplicate booking, Test entry, Guest requested cancellation..."
                        rows={4}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '6px',
                            border: error ? '1px solid #ef4444' : '1px solid #d1d5db',
                            fontSize: '14px',
                            outline: 'none',
                            resize: 'vertical'
                        }}
                    />
                    {error && <p style={{ margin: '4px 0 0 0', color: '#ef4444', fontSize: '13px' }}>{error}</p>}
                </div>
            </div>

            {/* Footer */}
            <div style={{
                padding: '20px',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                backgroundColor: '#f9fafb'
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
                        cursor: 'pointer'
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
                        boxShadow: '0 1px 2px rgba(220, 38, 38, 0.2)'
                    }}
                >
                    {isLoading && <Loader2 size={16} className="animate-spin" />}
                    {isLoading ? 'Processing...' : 'Void Reservation'}
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

export default VoidReservationForm;
