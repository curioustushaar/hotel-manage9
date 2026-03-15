import React, { useEffect, useState } from 'react';
import { getVisitorsByReservation, exitVisitor, convertToGuest } from '../../services/visitorService';
import { UserPlus, LogOut, Clock, UserCheck } from 'lucide-react';

const VisitorList = ({ reservationId, refreshTrigger }) => {
    const [visitors, setVisitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchVisitors = async () => {
        if (!reservationId) return;

        try {
            setLoading(true);
            const response = await getVisitorsByReservation(reservationId);
            if (response.data.success) { // Note: axios response.data contains the backend response
                setVisitors(response.data.data);
            }
        } catch (err) {
            setError('Failed to load visitors');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVisitors();
    }, [reservationId, refreshTrigger]);

    const handleExit = async (visitorId) => {
        if (!window.confirm('Mark visitor as exited?')) return;

        try {
            await exitVisitor(visitorId);
            fetchVisitors(); // Refresh list
        } catch (err) {
            alert('Failed to exit visitor');
        }
    };

    const handleConvert = async (visitorId) => {
        const charge = prompt("Enter extra conversion charge (leave empty for 0):", "0");
        if (charge === null) return;

        try {
            await convertToGuest(visitorId, charge);
            alert('Visitor converted to guest successfully!');
            fetchVisitors(); // Refresh list
            // Ideally, parent should also refresh main reservation data to reflect new pax count
        } catch (err) {
            alert('Failed to convert visitor: ' + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>Loading visitors...</div>;

    if (visitors.length === 0) {
        return (
            <div style={{
                padding: '30px',
                textAlign: 'center',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px dashed #e5e7eb',
                color: '#6b7280'
            }}>
                <UserPlus size={24} style={{ marginBottom: '10px', opacity: 0.5 }} />
                <p>No visitors recorded yet.</p>
            </div>
        );
    }

    return (
        <div className="visitor-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {visitors.map(visitor => (
                <div key={visitor._id} style={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}>
                    {/* Header: Name & Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: visitor.status === 'ACTIVE' ? '#dcfce7' : '#f3f4f6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: visitor.status === 'ACTIVE' ? '#166534' : '#6b7280'
                            }}>
                                <UserCheck size={20} />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#111827' }}>{visitor.name}</h4>
                                <span style={{ fontSize: '13px', color: '#6b7280' }}>{visitor.mobile}</span>
                            </div>
                        </div>

                        <span style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: visitor.status === 'ACTIVE' ? '#dcfce7' : '#f3f4f6',
                            color: visitor.status === 'ACTIVE' ? '#15803d' : '#4b5563'
                        }}>
                            {visitor.status}
                        </span>
                    </div>

                    {/* Details Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '10px',
                        fontSize: '13px',
                        backgroundColor: '#f9fafb',
                        padding: '12px',
                        borderRadius: '8px'
                    }}>
                        <div style={{ color: '#4b5563' }}>
                            <span style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }}>ID PROOF</span>
                            {visitor.idType}: {visitor.idNumber || 'N/A'}
                        </div>
                        <div style={{ color: '#4b5563' }}>
                            <span style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }}>PURPOSE</span>
                            {visitor.purpose || 'Not specified'}
                        </div>
                        <div style={{ color: '#4b5563', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} /> In: {new Date(visitor.inTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            <br />
                            <span style={{ fontSize: '11px', color: '#9ca3af' }}>{new Date(visitor.inTime).toLocaleDateString()}</span>
                        </div>
                        {visitor.outTime && (
                            <div style={{ color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <LogOut size={12} /> Out: {new Date(visitor.outTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        )}
                    </div>

                    {/* Actions if Active */}
                    {visitor.status === 'ACTIVE' && !visitor.isConvertedToGuest && (
                        <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f3f4f6', paddingTop: '12px' }}>
                            <button
                                onClick={() => handleExit(visitor._id)}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    borderRadius: '6px',
                                    border: '1px solid #e5e7eb',
                                    backgroundColor: '#fff',
                                    color: '#E31E24',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px'
                                }}
                            >
                                <LogOut size={14} /> Exit
                            </button>
                            <button
                                onClick={() => handleConvert(visitor._id)}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    borderRadius: '6px',
                                    border: '1px solid #e5e7eb',
                                    backgroundColor: '#ede9fe',
                                    color: '#6d28d9',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px'
                                }}
                            >
                                <UserPlus size={14} /> Convert to Guest
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default VisitorList;
