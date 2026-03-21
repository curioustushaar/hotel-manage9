import React from 'react';
import './EditReservationModal.css';

const AuditTrail = ({ reservation }) => {
    if (!reservation) return null;

    const getActionBadgeClass = (action = '') => {
        const upper = String(action).toUpperCase();
        if (upper.includes('CREATE')) return 'in_house';
        if (upper.includes('VOID') || upper.includes('DELETE')) return 'cancelled';
        if (upper.includes('ROUTE')) return 'checked_out';
        return 'reserved';
    };

    const prettifyAction = (action = '') => String(action)
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

    const toAmount = (val) => {
        const n = Number(val);
        return Number.isFinite(n) ? n : 0;
    };

    const buildTransactionAuditEvents = () => {
        const tx = Array.isArray(reservation.transactions) ? reservation.transactions : [];
        return tx.map((t) => {
            const typeLc = String(t.type || '').toLowerCase();
            let action = 'FOLIO_UPDATED';
            if (typeLc === 'charge') action = 'FOLIO_CHARGE_ADDED';
            if (typeLc === 'payment') action = 'FOLIO_PAYMENT_ADDED';
            if (typeLc === 'discount') action = 'FOLIO_DISCOUNT_APPLIED';
            if (typeLc === 'adjustment') action = 'FOLIO_ADJUSTMENT';

            const amount = toAmount(t.amount);
            const desc = `${t.particulars || 'Transaction'} ${amount ? `(${amount > 0 ? '+' : ''}${amount})` : ''}`;

            return {
                action,
                description: t.description || desc,
                performedBy: t.user || t.routedBy || 'System',
                performedAt: t.routedAt || t.date || t.createdAt,
                metadata: {
                    source: 'Folio Transactions',
                    type: t.type,
                    particulars: t.particulars,
                    amount,
                    method: t.method,
                    folioId: t.folioId
                }
            };
        });
    };

    const systemAudit = Array.isArray(reservation.auditTrail) ? reservation.auditTrail : [];
    const txAudit = buildTransactionAuditEvents();

    const mergedAudit = [...systemAudit, ...txAudit]
        .filter((e) => e && (e.action || e.description || e.performedAt))
        .sort((a, b) => new Date(b.performedAt || b.date || 0) - new Date(a.performedAt || a.date || 0));

    const typeCounts = mergedAudit.reduce((acc, item) => {
        const key = item.action || 'UNKNOWN';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    const actorCounts = mergedAudit.reduce((acc, item) => {
        const key = item.performedBy || 'System';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    const topActors = Object.entries(actorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4);

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

            <div className="audit-summary-grid">
                <div className="audit-summary-card">
                    <div className="audit-summary-label">Total History</div>
                    <div className="audit-summary-value">{mergedAudit.length}</div>
                </div>
                <div className="audit-summary-card">
                    <div className="audit-summary-label">Unique Users</div>
                    <div className="audit-summary-value">{Object.keys(actorCounts).length}</div>
                </div>
                <div className="audit-summary-card audit-summary-wide">
                    <div className="audit-summary-label">Users Involved</div>
                    <div className="audit-actor-list">
                        {topActors.length > 0 ? topActors.map(([actor, count]) => (
                            <span key={actor} className="audit-actor-chip">{actor} ({count})</span>
                        )) : <span className="audit-actor-chip">System</span>}
                    </div>
                </div>
            </div>

            <div className="audit-type-wrap">
                {Object.entries(typeCounts).map(([type, count]) => (
                    <span key={type} className="audit-type-chip">
                        {prettifyAction(type)}: {count}
                    </span>
                ))}
            </div>

            <div className="audit-timeline">
                {mergedAudit.length > 0 ? (
                    mergedAudit.map((log, index) => (
                        <div key={index} className="audit-item">
                            <div className="audit-time">
                                {formatDate(log.performedAt || log.date)}
                            </div>
                            <div className="audit-content">
                                <div className="audit-action">
                                    <span className={`status-badge-modal ${getActionBadgeClass(log.action)}`}>
                                        {prettifyAction(log.action)}
                                    </span>
                                    <span className="audit-user">by {log.performedBy || 'System'}</span>
                                </div>
                                <div className="audit-description">
                                    {log.description}
                                </div>
                                {log.metadata?.source && (
                                    <div className="audit-user" style={{ marginTop: '6px' }}>
                                        Source: {log.metadata.source}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : null}
                {/* Fallback mock data if empty (for demonstration) */}
                {mergedAudit.length === 0 && (
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
