import React, { useState, useEffect, useRef } from 'react';
import './TableManagement.css';

const TableManagement = () => {
    // Initial Tables Data
    const [tables, setTables] = useState([
        { id: 'T1', name: 'T1', seats: 4, guests: 4, amount: 1070, status: 'Running', duration: '45m' },
        { id: 'T2', name: 'T2', seats: 4, guests: 0, amount: 0, status: 'Available', duration: '-' },
        { id: 'T3', name: 'T3', seats: 6, guests: 6, amount: 2450, status: 'Billed', duration: '1h 20m' },
        { id: 'T4', name: 'T4', seats: 2, guests: 0, amount: 0, status: 'Available', duration: '-' },
        { id: 'T5', name: 'T5', seats: 4, guests: 3, amount: 890, status: 'Running', duration: '30m' },
        { id: 'T6', name: 'T6', seats: 4, guests: 0, amount: 0, status: 'Available', duration: '-' },
        { id: 'T7', name: 'T7', seats: 8, guests: 7, amount: 3200, status: 'Running', duration: '1h 10m' },
        { id: 'T8', name: 'T8', seats: 2, guests: 0, amount: 0, status: 'Available', duration: '-' },
        { id: 'T9', name: 'T9', seats: 4, guests: 2, amount: 560, status: 'Running', duration: '15m' },
        { id: 'T10', name: 'T10', seats: 4, guests: 4, amount: 1800, status: 'Billed', duration: '55m' },
        { id: 'T11', name: 'T11', seats: 6, guests: 0, amount: 0, status: 'Available', duration: '-' },
        { id: 'T12', name: 'T12', seats: 2, guests: 0, amount: 0, status: 'Available', duration: '-' },
    ]);

    // Modal State
    const [showSplitModal, setShowSplitModal] = useState(false);
    const [splitTableId, setSplitTableId] = useState(null);
    const [splitParts, setSplitParts] = useState(2);
    const [splitSubTables, setSplitSubTables] = useState([]);

    // Waiters List
    const waiters = ['Rahul', 'Aman', 'Suresh', 'Priya', 'Kavita'];

    // Handle Menu Action
    const handleMenuAction = (action, table) => {
        console.log(`Action: ${action} on Table: ${table.name}`);
        if (action === 'Split Table') {
            openSplitModal(table);
        }
        // Implement other actions like Move, Merge, Close as needed
    };

    // Open Split Modal
    const openSplitModal = (table) => {
        setSplitTableId(table.id);
        setSplitParts(2);
        // Initialize sub-tables for 2 parts
        const initialSubTables = [
            { name: `${table.name}-A`, guests: Math.ceil(table.guests / 2), waiter: waiters[0] },
            { name: `${table.name}-B`, guests: Math.floor(table.guests / 2), waiter: waiters[1] }
        ];
        setSplitSubTables(initialSubTables);
        setShowSplitModal(true);
    };

    // Handle Split Parts Change
    const handleSplitPartsChange = (e) => {
        const parts = parseInt(e.target.value);
        setSplitParts(parts);

        const currentTable = tables.find(t => t.id === splitTableId);
        if (!currentTable) return;

        const newSubTables = [];
        const guestsPerTable = Math.floor(currentTable.guests / parts);
        let remainingGuests = currentTable.guests;

        for (let i = 0; i < parts; i++) {
            const suffix = String.fromCharCode(65 + i); // A, B, C...
            const guests = i === parts - 1 ? remainingGuests : guestsPerTable;
            remainingGuests -= guests;

            newSubTables.push({
                name: `${currentTable.name}-${suffix}`,
                guests: guests > 0 ? guests : 1, // Default at least 1 guest capacity/seat
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
        const originalTable = tables.find(t => t.id === splitTableId);
        if (!originalTable) return;

        // Create new table objects
        const newTables = splitSubTables.map((sub, index) => ({
            id: sub.name, // Use name as ID for simplicity
            name: sub.name,
            seats: sub.guests, // Assuming seats = guests allocated for now, or just capacity
            guests: sub.guests, // Active guests
            amount: Math.floor(Math.random() * 1000) + 100, // Random amount as per demo req (450, 620 etc)
            status: 'Running',
            duration: '0m'
        }));

        // Replace original table with new tables in the list
        // Finding index of original table
        const originalIndex = tables.findIndex(t => t.id === splitTableId);

        const updatedTables = [...tables];
        // Remove original and insert new ones
        updatedTables.splice(originalIndex, 1, ...newTables);

        setTables(updatedTables);
        setShowSplitModal(false);
    };

    return (
        <div className="table-management-container">
            <div className="page-header">
                <h1 className="page-title">Table Management</h1>
                <div className="page-actions">
                    {/* Add filters or actions if needed */}
                </div>
            </div>

            <div className="tables-grid">
                {tables.map(table => (
                    <TableCard key={table.id} table={table} onMenuAction={handleMenuAction} />
                ))}
            </div>

            {showSplitModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Split Table {tables.find(t => t.id === splitTableId)?.name}</h2>
                            <button className="close-btn" onClick={() => setShowSplitModal(false)}>×</button>
                        </div>

                        <div className="modal-info">
                            <div className="info-item">
                                <span className="info-label">Table NO</span>
                                <span className="info-value">{tables.find(t => t.id === splitTableId)?.name}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Total Seats</span>
                                <span className="info-value">{tables.find(t => t.id === splitTableId)?.seats}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Current Guests</span>
                                <span className="info-value">{tables.find(t => t.id === splitTableId)?.guests}</span>
                            </div>
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
                                <span>Guests</span>
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

    return (
        <div className="table-card">
            <div className="card-header">
                <span className="table-number">{table.name}</span>
                <div className="menu-container" ref={menuRef}>
                    <div className="menu-trigger" onClick={() => setShowMenu(!showMenu)}>
                        ⋮
                    </div>
                    {showMenu && (
                        <div className="context-menu">
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
                        👥 Seats: {table.seats}
                    </span>
                    <span className={`status-badge status-${table.status.toLowerCase()}`}>
                        {table.status}
                    </span>
                </div>

                <div className="info-row">
                    <span className="amount">₹ {table.amount}</span>
                    <span className="duration">{table.duration}</span>
                </div>
            </div>

            <div className="card-footer">
                <span>{table.status === 'Available' ? 'Ready to serve' : 'In Service'}</span>
                {table.status !== 'Available' && <span>›</span>}
            </div>
        </div>
    );
};

export default TableManagement;
