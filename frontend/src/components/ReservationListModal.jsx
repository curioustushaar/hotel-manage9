import React from 'react';
import './ReservationModal.css'; // Reusing styles

const ReservationListModal = ({ table, onClose, onCancel }) => {
    const reservations = table.reservations || [];

    // Sort by date/time
    reservations.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
    });

    return (
        <div className="reservation-modal-overlay">
            <div className="reservation-modal-content" style={{ width: '600px' }}>
                <div className="modal-header">
                    <h3>Reservations - {table.tableName}</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="reservations-list">
                    {reservations.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>No upcoming reservations</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>
                                    <th style={{ padding: '10px' }}>Date</th>
                                    <th style={{ padding: '10px' }}>Time</th>
                                    <th style={{ padding: '10px' }}>Guest</th>
                                    <th style={{ padding: '10px' }}>Count</th>
                                    <th style={{ padding: '10px' }}>Source</th>
                                    <th style={{ padding: '10px' }}>Status</th>
                                    <th style={{ padding: '10px' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservations.map(res => (
                                    <tr key={res._id || res.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td style={{ padding: '10px' }}>{res.date}</td>
                                        <td style={{ padding: '10px' }}>{res.startTime} - {res.endTime}</td>
                                        <td style={{ padding: '10px' }}>
                                            <div style={{ fontWeight: '600' }}>{res.name || res.guestName}</div>
                                            <div style={{ fontSize: '11px', color: '#666' }}>{res.phone}</div>
                                        </td>
                                        <td style={{ padding: '10px' }}>{res.guests}</td>
                                        <td style={{ padding: '10px' }}>
                                            <span style={{ fontSize: '11px', color: '#666' }}>{res.source || 'Phone'}</span>
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '11px',
                                                background:
                                                    res.status === 'Completed' ? '#dcfce7' :
                                                        res.status === 'Cancelled' ? '#fee2e2' :
                                                            res.status === 'No Show' ? '#fef3c7' :
                                                                res.status === 'Upcoming' ? '#dbeafe' : '#f3f4f6',
                                                color:
                                                    res.status === 'Completed' ? '#166534' :
                                                        res.status === 'Cancelled' ? '#991b1b' :
                                                            res.status === 'No Show' ? '#92400e' :
                                                                res.status === 'Upcoming' ? '#1e40af' : '#374151'
                                            }}>
                                                {res.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                            {res.status === 'Upcoming' && (
                                                <button
                                                    onClick={() => onCancel(res._id || res.id)}
                                                    style={{
                                                        background: 'transparent',
                                                        border: '1px solid #ef4444',
                                                        color: '#ef4444',
                                                        padding: '3px 7px',
                                                        borderRadius: '3px',
                                                        fontSize: '10px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default ReservationListModal;
