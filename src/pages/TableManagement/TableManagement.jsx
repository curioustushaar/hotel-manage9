import React, { useState, useEffect, useRef } from 'react';
import './TableManagement.css';
import ReservationModal from '../../components/ReservationModal';
import ReservationListModal from '../../components/ReservationListModal';
import API_URL_CONFIG from '../../config/api';

const TableManagement = () => {
    // Tables Data
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);

    // Split Modal State
    const [showSplitModal, setShowSplitModal] = useState(false);
    const [splitTableId, setSplitTableId] = useState(null);
    const [splitParts, setSplitParts] = useState(2);
    const [splitSubTables, setSplitSubTables] = useState([]);

    // Reservation Modal State
    const [showReservationModal, setShowReservationModal] = useState(false);
    const [selectedTableForReservation, setSelectedTableForReservation] = useState(null);

    // Reservation List Modal State
    const [showReservationListModal, setShowReservationListModal] = useState(false);
    const [selectedTableForList, setSelectedTableForList] = useState(null);

    // Waiters List
    const waiters = ['Rahul', 'Aman', 'Suresh', 'Priya', 'Kavita'];

    // Fetch Tables
    const fetchTables = async () => {
        try {
            // setLoading(true); // Don't show loading on every refresh to avoid flicker
            const response = await fetch(`${API_URL_CONFIG}/api/tables/list`);
            const data = await response.json();
            if (data.success) {
                setTables(data.data);
            }
        } catch (error) {
            console.error('Error fetching tables:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchTables();
        const interval = setInterval(fetchTables, 10000); // 10s auto refresh
        return () => clearInterval(interval);
    }, []);

    // Handle Menu Action
    const handleMenuAction = (action, table) => {
        console.log(`Action: ${action} on Table: ${table.tableName}`);
        if (action === 'Split Table') {
            openSplitModal(table);
        } else if (action === 'Reserve Table') {
            setSelectedTableForReservation(table);
            setShowReservationModal(true);
        } else if (action === 'Reservation List') {
            setSelectedTableForList(table);
            setShowReservationListModal(true);
        }
    };

    // Open Split Modal
    const openSplitModal = (table) => {
        setSplitTableId(table._id);
        setSplitParts(2);
        const initialSubTables = [
            { name: `${table.tableName}-A`, guests: Math.ceil(table.capacity / 2), waiter: waiters[0] },
            { name: `${table.tableName}-B`, guests: Math.floor(table.capacity / 2), waiter: waiters[1] }
        ];
        setSplitSubTables(initialSubTables);
        setShowSplitModal(true);
    };

    // Handle Split Parts Change
    const handleSplitPartsChange = (e) => {
        const parts = parseInt(e.target.value);
        setSplitParts(parts);

        const currentTable = tables.find(t => t._id === splitTableId);
        if (!currentTable) return;

        const newSubTables = [];
        const capacityPerTable = Math.floor(currentTable.capacity / parts);
        let remainingCapacity = currentTable.capacity;

        for (let i = 0; i < parts; i++) {
            const suffix = String.fromCharCode(65 + i);
            const cap = i === parts - 1 ? remainingCapacity : capacityPerTable;
            remainingCapacity -= cap;

            newSubTables.push({
                name: `${currentTable.tableName}-${suffix}`,
                guests: cap > 0 ? cap : 1,
                waiter: waiters[i % waiters.length]
            });
        }
        setSplitSubTables(newSubTables);
    };

    // Handle Sub Table Change
    const handleSubTableChange = (index, field, value) => {
        const updated = [...splitSubTables];
        updated[index][field] = value;
        setSplitSubTables(updated);
    };

    // Submit Split
    const handleSplitSubmit = () => {
        alert('Split functionality to be integrated with backend');
        setShowSplitModal(false);
    };

    // Submit Reservation
    const handleReservationSubmit = async (formData) => {
        try {
            const response = await fetch(`${API_URL_CONFIG}/api/tables/${selectedTableForReservation._id}/reserve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                alert('Table reserved successfully!');
                setShowReservationModal(false);
                fetchTables();
            } else {
                alert(`Failed to reserve: ${data.message}`);
            }
        } catch (error) {
            console.error('Error reserving table:', error);
            alert('Failed to reserve table. Please check connection.');
        }
    };

    if (loading && tables.length === 0) {
        return <div style={{ padding: '50px', textAlign: 'center', color: '#666' }}>Loading tables...</div>;
    }

    return (
        <div className="table-management-container">
            <div className="page-header">
                <h1 className="page-title">Table Management</h1>
                <div className="page-actions">
                    <button className="btn btn-primary" onClick={() => { setLoading(true); fetchTables(); }}>Refresh</button>
                </div>
            </div>

            <div className="tables-grid">
                {tables.length > 0 ? tables.map(table => (
                    <TableCard key={table._id} table={table} onMenuAction={handleMenuAction} />
                )) : (
                    <div className="no-tables">
                        <p>No tables found.</p>
                        <button className="btn btn-secondary" onClick={() => window.location.reload()}>Retry</button>
                    </div>
                )}
            </div>

            {/* Reservation Creation Modal */}
            {showReservationModal && selectedTableForReservation && (
                <ReservationModal
                    table={{ name: selectedTableForReservation.tableName, seats: selectedTableForReservation.capacity }}
                    onClose={() => setShowReservationModal(false)}
                    onReserve={handleReservationSubmit}
                />
            )}

            {/* Reservation List Modal */}
            {showReservationListModal && selectedTableForList && (
                <ReservationListModal
                    table={selectedTableForList}
                    onClose={() => setShowReservationListModal(false)}
                />
            )}

            {/* Split Modal */}
            {showSplitModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Split Table {tables.find(t => t._id === splitTableId)?.tableName}</h2>
                            <button className="close-btn" onClick={() => setShowSplitModal(false)}>×</button>
                        </div>
                        <div className="form-group">
                            <label>Split Into</label>
                            <select className="form-select" value={splitParts} onChange={handleSplitPartsChange}>
                                <option value={2}>2 Parts</option>
                                <option value={3}>3 Parts</option>
                                <option value={4}>4 Parts</option>
                            </select>
                        </div>
                        <div className="sub-tables-container">
                            <div className="sub-table-header">
                                <span>Sub Table</span>
                                <span>Capacity</span>
                                <span>Waiter</span>
                            </div>
                            {splitSubTables.map((sub, index) => (
                                <div key={index} className="sub-table-row">
                                    <div className="sub-table-display">{sub.name}</div>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={sub.guests}
                                        min="1"
                                        onChange={(e) => handleSubTableChange(index, 'guests', parseInt(e.target.value))}
                                    />
                                    <select
                                        className="form-select"
                                        value={sub.waiter}
                                        onChange={(e) => handleSubTableChange(index, 'waiter', e.target.value)}
                                    >
                                        {waiters.map(w => <option key={w} value={w}>{w}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowSplitModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSplitSubmit}>Split Table</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const TableCard = ({ table, onMenuAction }) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleAction = (action) => {
        onMenuAction(action, table);
        setShowMenu(false);
    };

    // Determine Logic for Status Display
    let displayStatus = table.status;
    let timeInfo = table.duration || '-';
    let statusClass = table.status.toLowerCase();

    // Specific logic for reserved tables
    if (table.reservations && table.reservations.length > 0) {
        // Find nearest upcoming reservation
        const now = new Date();
        const upcoming = table.reservations
            .filter(r => new Date(`${r.date}T${r.endTime}`) > now)
            .sort((a, b) => new Date(`${a.date}T${a.startTime}`) - new Date(`${b.date}T${b.startTime}`));

        if (upcoming.length > 0) {
            const nextRes = upcoming[0];
            const start = new Date(`${nextRes.date}T${nextRes.startTime}`);
            const end = new Date(`${nextRes.date}T${nextRes.endTime}`);

            if (now >= start && now <= end) {
                displayStatus = 'Reserved Active';
                statusClass = 'reserved-active';
                timeInfo = `Until ${nextRes.endTime}`;
            } else if (now < start && (start - now) < 2 * 60 * 60 * 1000) { // Within 2 hours
                // displayStatus = `Reserved ${nextRes.startTime}`;
                // statusClass = 'reserved-upcoming';
            }
        }
    }

    return (
        <div className={`table-card ${statusClass}`}>
            <div className="card-header">
                <span className="table-number">{table.tableName}</span>
                <div className="menu-container" ref={menuRef}>
                    <div className="menu-trigger" onClick={() => setShowMenu(!showMenu)}>
                        ⋮
                    </div>
                    {showMenu && (
                        <div className="context-menu">
                            <div className="menu-item" onClick={() => handleAction('Reserve Table')}>
                                <span>📅</span> Reserve Table
                            </div>
                            <div className="menu-item" onClick={() => handleAction('Reservation List')}>
                                <span>📋</span> Reservation List
                            </div>
                            <div className="menu-item" onClick={() => handleAction('Split Table')}>
                                <span>🪓</span> Split Table
                            </div>
                            <div className="menu-item" onClick={() => handleAction('Move Guests')}>
                                <span>➡️</span> Move Guests
                            </div>
                            <div className="menu-item" onClick={() => handleAction('Merge Table')}>
                                <span>🔗</span> Merge Table
                            </div>
                            <div className="menu-item" onClick={() => handleAction('Close Table')}>
                                <span>❌</span> Close Table
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="card-body">
                <div className="info-row">
                    <span className="seats-info">
                        👥 Seats: {table.capacity}
                    </span>
                    <span className={`status-badge status-${statusClass}`}>
                        {displayStatus}
                    </span>
                </div>

                <div className="info-row">
                    <span className="amount">₹ {table.runningOrderAmount || 0}</span>
                    <span className="duration">{timeInfo}</span>
                </div>
            </div>

            <div className="card-footer">
                <span>
                    {displayStatus === 'Available' ? 'Ready to serve' :
                        displayStatus === 'Reserved Active' ? 'Reserved Guest' : 'In Service'}
                </span>
                {displayStatus !== 'Available' && <span>›</span>}
            </div>
        </div>
    );
};

export default TableManagement;
