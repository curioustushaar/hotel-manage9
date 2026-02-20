import React, { useState, useEffect, useRef } from 'react';
import './TableManagement.css';
import ReservationModal from '../../components/ReservationModal';
import ReservationListModal from '../../components/ReservationListModal';
import API_URL_CONFIG from '../../config/api';

const TableManagement = () => {
    // Tables Data
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [availableTypes, setAvailableTypes] = useState([]);

    // Filter States
    const [statusFilter, setStatusFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All Types');
    const [searchQuery, setSearchQuery] = useState('');

    // Add Table Modal State
    const [showAddTableModal, setShowAddTableModal] = useState(false);
    const [newTableData, setNewTableData] = useState({
        tableName: '',
        capacity: 4,
        type: 'General'
    });
    const [newTableType, setNewTableType] = useState('');

    // Open Add Table Modal
    const openAddTableModal = () => {
        // Reset form to defaults
        setNewTableData({ tableName: '', capacity: 4, type: 'General' });
        setNewTableType('');
        setShowAddTableModal(true);
    };

    // Close Add Table Modal
    const closeAddTableModal = () => {
        setShowAddTableModal(false);
        setNewTableData({ tableName: '', capacity: 4, type: 'General' });
        setNewTableType('');
    };

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
                console.log('📊 Fetched tables:', data.data.length, 'tables');
                console.log('📋 Table types found:', [...new Set(data.data.map(t => t.type || 'General'))]);
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

    // Update available types whenever tables change
    useEffect(() => {
        const types = [...new Set(tables.map(t => t.type || 'General'))].sort();
        console.log('🔄 Tables updated! Total tables:', tables.length);
        console.log('🏷️ Extracted types:', types);
        setAvailableTypes(types);
    }, [tables]);

    // Get unique table types with counts
    const getTableTypes = () => {
        const types = [...new Set(tables.map(t => t.type || 'General'))];
        return types.sort();
    };

    // Get count of tables for each type
    const getTypeCount = (type) => {
        return tables.filter(t => (t.type || 'General') === type).length;
    };

    // Filter tables based on selected filters
    const getFilteredTables = () => {
        return tables.filter(table => {
            // Status filter
            if (statusFilter !== 'All' && table.status !== statusFilter) return false;
            
            // Type filter
            if (typeFilter !== 'All Types' && table.type !== typeFilter) return false;
            
            // Search query
            if (searchQuery && !table.tableName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            
            return true;
        });
    };

    // Group filtered tables by type
    const getGroupedTables = () => {
        const filtered = getFilteredTables();
        const grouped = {};
        
        filtered.forEach(table => {
            const type = table.type || 'General';
            if (!grouped[type]) {
                grouped[type] = [];
            }
            grouped[type].push(table);
        });
        
        // Sort tables within each group by table number
        Object.keys(grouped).forEach(type => {
            grouped[type].sort((a, b) => {
                const numA = parseInt(a.tableName.replace(/\D/g, '')) || 0;
                const numB = parseInt(b.tableName.replace(/\D/g, '')) || 0;
                return numA - numB;
            });
        });
        
        return grouped;
    };

    // Get icon for table type
    const getTypeIcon = (type) => {
        const icons = {
            'General': '🍽️',
            'AC': '❄️',
            'Non-AC': '🌡️',
            'Garden': '🌳',
            'VIP': '⭐',
            'Outdoor': '☀️',
            'Private': '🔒'
        };
        return icons[type] || '🍽️';
    };

    // Calculate stats
    const getStats = () => {
        const filtered = getFilteredTables();
        return {
            available: filtered.filter(t => t.status === 'Available').length,
            occupied: filtered.filter(t => t.status === 'Running' || t.status === 'Occupied').length,
            upcoming: filtered.filter(t => t.reservations && t.reservations.length > 0).length,
            revenue: filtered.reduce((sum, t) => sum + (t.runningOrderAmount || 0), 0)
        };
    };

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

    // Handle Add New Type
    const handleAddNewType = () => {
        if (newTableType.trim()) {
            const trimmedType = newTableType.trim();
            console.log('➕ Adding new table type:', trimmedType);
            setNewTableData({ ...newTableData, type: trimmedType });
            setNewTableType('');
        }
    };

    // Handle Cancel New Type
    const handleCancelNewType = () => {
        setNewTableType('');
    };

    // Handle Add Table Submit
    const handleAddTableSubmit = async () => {
        try {
            // Validate input
            if (!newTableData.tableName.trim()) {
                alert('Please enter a table name/number');
                return;
            }

            if (!newTableData.capacity || newTableData.capacity < 1) {
                alert('Please enter a valid capacity (minimum 1)');
                return;
            }

            // Check if table name already exists in the same type
            const tableType = newTableData.type;
            const duplicateInSameType = tables.find(
                t => t.tableName.toLowerCase() === newTableData.tableName.trim().toLowerCase() && 
                     (t.type || 'General') === tableType
            );

            if (duplicateInSameType) {
                alert(`Table "${newTableData.tableName}" already exists in "${tableType}" type.\n\nYou can:\n1. Use a different table name\n2. Choose a different type\n\n(Same table names are allowed in different types)`);
                return;
            }

            const tableNumber = tables.length > 0 ? Math.max(...tables.map(t => t.tableNumber || 0)) + 1 : 1;
            
            const payload = {
                tableName: newTableData.tableName.trim(),
                capacity: parseInt(newTableData.capacity) || 4,
                type: tableType,
                tableNumber,
                status: 'Available'
            };

            console.log('Creating table with payload:', payload);

            const response = await fetch(`${API_URL_CONFIG}/api/tables`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success) {
                console.log('✅ Table created successfully:', data);
                console.log('🏷️ Table type:', tableType);
                console.log('📋 Full table data:', data.data);
                
                // Close modal first
                closeAddTableModal();
                
                // Force a fresh fetch from server with promise completion
                console.log('🔄 Fetching updated tables list...');
                await fetchTables();
                
                // Wait for React to finish state updates and re-render
                await new Promise(resolve => setTimeout(resolve, 200));
                
                // Now update filters
                console.log('🎯 Setting type filter to:', tableType);
                setTypeFilter(tableType);
                setStatusFilter('All');
                
                alert(`✅ Table "${newTableData.tableName}" created successfully!\n\n🏷️ Type: "${tableType}"\n\n📍 The filter has been set to "${tableType}" type.\n\nIf you don't see it, please check:\n1. Browser console for logs\n2. Filter dropdown should now include "${tableType}"\n3. Try refreshing the page if needed`);
            } else {
                console.error('❌ Failed to create table:', data.message);
                alert(`Failed to create table: ${data.message}`);
            }
        } catch (error) {
            console.error('Error creating table:', error);
            alert('Failed to create table. Please check your connection and try again.');
        }
    };

    if (loading && tables.length === 0) {
        return <div style={{ padding: '50px', textAlign: 'center', color: '#666' }}>Loading tables...</div>;
    }

    const stats = getStats();
    const groupedTables = getGroupedTables();
    const tableTypes = availableTypes.length > 0 ? availableTypes : getTableTypes();
    
    // Debug: Log available types on every render
    console.log('🎯 Available table types in dropdown:', tableTypes);
    console.log('📊 Available types state:', availableTypes);
    console.log('🔍 Current type filter:', typeFilter);
    console.log('📦 Total tables in state:', tables.length);

    return (
        <div className="table-management-container">
            {/* Header */}
            <div className="dining-header">
                <div className="header-content">
                    <h1 className="page-title">Dining Dashboard</h1>
                    <p className="subtitle">Manage your restaurant tables and reservations</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        className="add-table-btn" 
                        onClick={() => {
                            console.log('🔄 Manual Refresh - Current tables:', tables.length);
                            console.log('📋 Current types:', availableTypes);
                            console.log('📦 All table data:', tables);
                            alert(`Tables: ${tables.length}\nTypes: ${availableTypes.join(', ')}\n\nCheck console for full data`);
                            fetchTables();
                        }}
                        style={{ background: '#3b82f6' }}
                    >
                        🔄 DEBUG
                    </button>
                    <button className="add-table-btn" onClick={openAddTableModal}>
                        + ADD TABLE
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card available">
                    <span className="stat-label">Available Tables</span>
                    <span className="stat-value">{stats.available}</span>
                </div>
                <div className="stat-card occupied">
                    <span className="stat-label">Occupied (Running)</span>
                    <span className="stat-value">{stats.occupied}</span>
                </div>
                <div className="stat-card upcoming">
                    <span className="stat-label">Upcoming Reservations</span>
                    <span className="stat-value">{stats.upcoming}</span>
                </div>
                <div className="stat-card revenue">
                    <span className="stat-label">Revenue Today</span>
                    <span className="stat-value">₹{stats.revenue}</span>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-container">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search table number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${statusFilter === 'All' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('All')}
                    >
                        All
                    </button>
                    <button
                        className={`filter-btn ${statusFilter === 'Available' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('Available')}
                    >
                        Available
                    </button>
                    <button
                        className={`filter-btn ${statusFilter === 'Running' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('Running')}
                    >
                        Running
                    </button>
                    <button
                        className={`filter-btn ${statusFilter === 'Billed' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('Billed')}
                    >
                        Billed
                    </button>
                    <button
                        className={`filter-btn ${statusFilter === 'Reserved' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('Reserved')}
                    >
                        Reserved
                    </button>
                </div>
                <select
                    className="type-dropdown"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    key={`type-filter-${tableTypes.join('-')}`}
                >
                    <option value="All Types">All Types ({tables.length})</option>
                    {tableTypes.map(type => {
                        console.log('🎨 Rendering dropdown option for type:', type);
                        return (
                            <option key={type} value={type}>
                                {type} ({getTypeCount(type)})
                            </option>
                        );
                    })}
                </select>
            </div>

            {/* Grouped Tables by Type */}
            <div className="tables-sections">
                {Object.keys(groupedTables).length > 0 ? (
                    Object.keys(groupedTables).sort().map(type => (
                        <div key={type} className="table-section">
                            <div className="section-header">
                                <h2 className="section-title">
                                    <span className="section-icon">{getTypeIcon(type)}</span>
                                    <span>{type}</span>
                                    <span className="section-count">({groupedTables[type].length} tables)</span>
                                </h2>
                            </div>
                            <div className="tables-grid">
                                {groupedTables[type].map(table => (
                                    <TableCard key={table._id} table={table} onMenuAction={handleMenuAction} />
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-tables">
                        <p>No tables found matching the filters.</p>
                    </div>
                )}
            </div>

            {/* Add Table Modal */}
            {showAddTableModal && (
                <div className="modal-overlay">
                    <div className="modal-content add-table-modal">
                        <div className="modal-header">
                            <h2>Add New Table</h2>
                            <button className="close-btn" onClick={closeAddTableModal}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>TABLE NAME/NUMBER</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., T15, VIP-1"
                                    value={newTableData.tableName}
                                    onChange={(e) => setNewTableData({ ...newTableData, tableName: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>CAPACITY</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="e.g., 4"
                                    min="1"
                                    value={newTableData.capacity}
                                    onChange={(e) => setNewTableData({ ...newTableData, capacity: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="form-group">
                                <label>TABLE TYPE</label>
                                {newTableType === '' ? (
                                    <div className="type-select-group">
                                        <select
                                            className="form-select"
                                            value={newTableData.type}
                                            onChange={(e) => setNewTableData({ ...newTableData, type: e.target.value })}
                                        >
                                            <option value="General">General</option>
                                            <option value="AC">AC</option>
                                            <option value="Non-AC">Non-AC</option>
                                            <option value="Garden">Garden</option>
                                            {tableTypes.filter(t => !['General', 'AC', 'Non-AC', 'Garden'].includes(t)).map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            className="add-type-btn"
                                            onClick={() => setNewTableType(' ')}
                                            title="Add new table type"
                                        >
                                            + Add New Type
                                        </button>
                                    </div>
                                ) : (
                                    <div className="type-input-group">
                                        <input
                                            type="text"
                                            className="form-input new-type-input"
                                            placeholder="Enter new type (e.g., Top Floor, VIP)"
                                            value={newTableType.trim()}
                                            onChange={(e) => setNewTableType(e.target.value)}
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            className="type-action-btn success"
                                            onClick={handleAddNewType}
                                            disabled={!newTableType.trim()}
                                        >
                                            ✓
                                        </button>
                                        <button
                                            type="button"
                                            className="type-action-btn cancel"
                                            onClick={handleCancelNewType}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                                {newTableType === '' && newTableData.type && (
                                    <div className="selected-type-info">
                                        Selected type: <strong>{newTableData.type}</strong>
                                        {!['General', 'AC', 'Non-AC', 'Garden'].includes(newTableData.type) && 
                                         !tableTypes.includes(newTableData.type) && (
                                            <span className="new-type-badge">✨ New Type - Will be added to filter</span>
                                        )}
                                    </div>
                                )}
                                {newTableType !== '' && (
                                    <div className="type-hint">
                                        💡 Create a custom table type. It will automatically appear in the filter dropdown.
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={closeAddTableModal}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleAddTableSubmit}>Create Table</button>
                        </div>
                    </div>
                </div>
            )}

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
