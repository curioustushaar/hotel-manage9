import React from 'react';
import './EditReservationModal.css';

const AuditTrail = ({ reservation }) => {
    if (!reservation) return null;

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="booking-details-container">
            <h3 className="details-section-title">Audit Log</h3>

            <div className="audit-timeline">
                {reservation.auditTrail && reservation.auditTrail.length > 0 ? (
                    reservation.auditTrail.map((log, index) => (
                        <div key={index} className="audit-item">
                            <div className="audit-time">
                                {formatDate(log.performedAt || log.date)}
                            </div>
                            <div className="audit-content">
                                <div className="audit-action">
                                    <span className={`status-badge-modal ${log.action === 'CREATE' ? 'in_house' : 'reserved'}`}>
                                        {log.action}
                                    </span>
                                    <span className="audit-user">by {log.performedBy || 'System'}</span>
                                </div>
                                <div className="audit-description">
                                    {log.description}
                                </div>
                            </div>
                        </div>
                    ))
                ) : null}
                {/* Fallback mock data if empty (for demonstration) */}
                {(!reservation.auditTrail || reservation.auditTrail.length === 0) && (
                    <>
                        <div className="audit-item">
                            <div className="audit-time">
                                {formatDate(reservation.createdAt)}
                            </div>
                            <div className="audit-content">
                                <div className="audit-action">
                                    <span className="status-badge-modal in_house">CREATED</span>
                                    <span className="audit-user">by System</span>
                                </div>
                                <div className="audit-description">
                                    Reservation created initially.
                                </div>
                            </div>
                        </div>
                        {reservation.updatedAt !== reservation.createdAt && (
                            <div className="audit-item">
                                <div className="audit-time">
                                    {formatDate(reservation.updatedAt)}
                                </div>
                                <div className="audit-content">
                                    <div className="audit-action">
                                        <span className="status-badge-modal reserved">UPDATED</span>
                                        <span className="audit-user">by System</span>
                                    </div>
                                    <div className="audit-description">
                                        Last updated.
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AuditTrail;
