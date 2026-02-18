import React from 'react';
import './ReservationModal.css'; // Reusing styles

const ReservationListModal = ({ table, onClose }) => {
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
                                    <th style={{ padding: '10px' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservations.map(res => (
                                    <tr key={res.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td style={{ padding: '10px' }}>{res.date}</td>
                                        <td style={{ padding: '10px' }}>{res.startTime} - {res.endTime}</td>
                                        <td style={{ padding: '10px' }}>
                                            <div style={{ fontWeight: '600' }}>{res.name}</div>
                                            <div style={{ fontSize: '11px', color: '#666' }}>{res.phone}</div>
                                        </td>
                                        <td style={{ padding: '10px' }}>{res.guests}</td>
                                        <td style={{ padding: '10px' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '11px',
                                                background: res.status === 'Upcoming' ? '#dbeafe' : '#f3f4f6',
                                                color: res.status === 'Upcoming' ? '#1e40af' : '#374151'
                                            }}>
                                                {res.status}
                                            </span>
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
