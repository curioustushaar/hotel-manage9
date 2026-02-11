import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './GuestMealService.css';

const GuestMealService = () => {
    const navigate = useNavigate();

    const dummyTables = [
        { tableId: 'T1', tableName: 'T1', status: 'Available', amount: 0, duration: 0, capacity: 4 },
        { tableId: 'T2', tableName: 'T2', status: 'Running', amount: 850, duration: 45, capacity: 4 },
        { tableId: 'T3', tableName: 'T3', status: 'Available', amount: 0, duration: 0, capacity: 6 },
        { tableId: 'T4', tableName: 'T4', status: 'Billed', amount: 1250, duration: 120, capacity: 4 },
        { tableId: 'T5', tableName: 'T5', status: 'Running', amount: 625, duration: 30, capacity: 2 },
        { tableId: 'T6', tableName: 'T6', status: 'Available', amount: 0, duration: 0, capacity: 8 },
        { tableId: 'T7', tableName: 'T7', status: 'Running', amount: 2150, duration: 90, capacity: 6 },
        { tableId: 'T8', tableName: 'T8', status: 'Available', amount: 0, duration: 0, capacity: 4 },
        { tableId: 'T9', tableName: 'T9', status: 'Billed', amount: 975, duration: 75, capacity: 4 },
        { tableId: 'T10', tableName: 'T10', status: 'Available', amount: 0, duration: 0, capacity: 6 },
        { tableId: 'T11', tableName: 'T11', status: 'Running', amount: 450, duration: 20, capacity: 2 },
        { tableId: 'T12', tableName: 'T12', status: 'Available', amount: 0, duration: 0, capacity: 4 },
    ];

    const [tables, setTables] = useState(dummyTables);
    const [filteredTables, setFilteredTables] = useState(dummyTables);
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddTableModal, setShowAddTableModal] = useState(false);

    // Table Types State
    const [tableTypes, setTableTypes] = useState(['2 Seater', '4 Seater', '6 Seater', '8 Seater', 'Family']);
    const [isAddingTableType, setIsAddingTableType] = useState(false);
    const [newTableType, setNewTableType] = useState('');

    const [newTableData, setNewTableData] = useState({
        tableName: '',
        type: '',
        capacity: ''
    });

    const [stats, setStats] = useState({
        total: tables.length,
        available: tables.filter(t => t.status === 'Available').length,
        running: tables.filter(t => t.status === 'Running').length,
        billed: tables.filter(t => t.status === 'Billed').length
    });

    useEffect(() => {
        let filtered = tables;
        if (statusFilter !== 'All') {
            filtered = filtered.filter(table => table.status === statusFilter);
        }
        if (searchQuery) {
            filtered = filtered.filter(table =>
                table.tableName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        setFilteredTables(filtered);

        // Update stats
        setStats({
            total: tables.length,
            available: tables.filter(t => t.status === 'Available').length,
            running: tables.filter(t => t.status === 'Running').length,
            billed: tables.filter(t => t.status === 'Billed').length
        });
    }, [statusFilter, searchQuery, tables]);

    const formatDuration = (minutes) => {
        if (minutes === 0) return '--';
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h${mins}m` : `${hours}h`;
    };

    const handleTableClick = (table) => {
        const dummyOrderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        navigate('/admin/food-menu', {
            state: {
                tableId: table.tableId,
                tableName: table.tableName,
                orderId: dummyOrderId,
                status: table.status,
                amount: table.amount,
                duration: table.duration
            }
        });
    };

    const handleAddTableType = () => {
        if (!newTableType.trim()) return;
        const type = newTableType.trim();
        if (!tableTypes.includes(type)) {
            setTableTypes([...tableTypes, type]);
            setNewTableData({ ...newTableData, type: type });
        }
        setIsAddingTableType(false);
        setNewTableType('');
    };

    const handleCreateTable = () => {
        if (!newTableData.tableName || !newTableData.capacity) return;

        const newTable = {
            tableId: `T${Date.now()}`,
            tableName: newTableData.tableName,
            status: 'Available',
            amount: 0,
            duration: 0,
            capacity: parseInt(newTableData.capacity),
            type: newTableData.type
        };

        setTables([...tables, newTable]);
        setShowAddTableModal(false);
        setNewTableData({ tableName: '', type: '', capacity: '' });
    };

    return (
        <div className="gms-wrapper">
            {/* Header */}
            <div className="gms-header">
                <div className="gms-header-content">
                    <div>
                        <h1 className="gms-title">Table Service Suite</h1>
                        <p className="gms-subtitle">Manage dining operations in real-time</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            className="gms-refresh-btn"
                            onClick={() => setShowAddTableModal(true)}
                            title="Add New Table"
                            style={{ width: 'auto', padding: '0 15px', borderRadius: '8px', fontSize: '14px' }}
                        >
                            + Add Table
                        </button>
                        <button className="gms-refresh-btn" onClick={() => window.location.reload()} title="Refresh data">
                            ↻
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="gms-stats">
                    <div className="stat-item">
                        <div className="stat-icon">📊</div>
                        <div className="stat-data">
                            <span className="stat-val">{stats.total}</span>
                            <span className="stat-label">Tables</span>
                        </div>
                    </div>
                    <div className="stat-item accent-green">
                        <div className="stat-icon">✓</div>
                        <div className="stat-data">
                            <span className="stat-val">{stats.available}</span>
                            <span className="stat-label">Available</span>
                        </div>
                    </div>
                    <div className="stat-item accent-blue">
                        <div className="stat-icon">🍴</div>
                        <div className="stat-data">
                            <span className="stat-val">{stats.running}</span>
                            <span className="stat-label">Active</span>
                        </div>
                    </div>
                    <div className="stat-item accent-amber">
                        <div className="stat-icon">💳</div>
                        <div className="stat-data">
                            <span className="stat-val">{stats.billed}</span>
                            <span className="stat-label">Payment</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="gms-toolbar">
                <div className="gms-search-wrapper">
                    <input
                        type="text"
                        placeholder="Find table..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="gms-search"
                    />
                    <span className="gms-search-icon">🔍</span>
                </div>

                <div className="gms-filters">
                    {['All', 'Available', 'Running', 'Billed'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`filter-chip ${statusFilter === status ? 'active' : ''}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table Grid */}
            {filteredTables.length === 0 ? (
                <div className="gms-empty">
                    <div className="empty-illustration">📭</div>
                    <p className="empty-text">No tables match your filter</p>
                </div>
            ) : (
                <div className="gms-grid">
                    {filteredTables.map((table) => (
                        <div
                            key={table.tableId}
                            className={`table-item ${table.status.toLowerCase()}`}
                            onClick={() => handleTableClick(table)}
                        >
                            <div className="table-topbar">
                                <span className="table-id">{table.tableName}</span>
                                <span className={`status-tag ${table.status.toLowerCase()}`}>
                                    {table.status}
                                </span>
                            </div>

                            <div className="table-body">
                                <div className="capacity-badge">👥 {table.capacity}</div>

                                {table.status === 'Running' && (
                                    <div className="table-metrics">
                                        <div className="metric">
                                            <span className="metric-label">Amount</span>
                                            <span className="metric-value">₹{table.amount}</span>
                                        </div>
                                        <div className="metric">
                                            <span className="metric-label">Time</span>
                                            <span className="metric-value">{formatDuration(table.duration)}</span>
                                        </div>
                                    </div>
                                )}

                                {table.status === 'Billed' && (
                                    <div className="table-metrics">
                                        <div className="metric full">
                                            <span className="metric-label">Bill</span>
                                            <span className="metric-value">₹{table.amount}</span>
                                        </div>
                                    </div>
                                )}

                                {table.status === 'Available' && (
                                    <div className="available-badge">Ready to serve</div>
                                )}
                            </div>

                            <div className="table-action">
                                <span className="action-text">
                                    {table.status === 'Available' && 'Create Order'}
                                    {table.status === 'Running' && 'Continue'}
                                    {table.status === 'Billed' && 'View Bill'}
                                </span>
                                <span className="action-icon">→</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Table Modal */}
            {showAddTableModal && (
                <div className="sidebar-overlay" style={{ opacity: 1, zIndex: 1000 }} onClick={() => setShowAddTableModal(false)}>
                    <div className="modal-content" style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'white',
                        padding: '24px',
                        borderRadius: '12px',
                        width: '400px',
                        maxWidth: '90%'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0 }}>Add New Table</h2>
                            <button onClick={() => setShowAddTableModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button>
                        </div>

                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Table Name/Number</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g., T15, VIP-1"
                                value={newTableData.tableName}
                                onChange={e => setNewTableData({ ...newTableData, tableName: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Capacity</label>
                            <input
                                type="number"
                                className="form-input"
                                placeholder="e.g., 4"
                                value={newTableData.capacity}
                                onChange={e => setNewTableData({ ...newTableData, capacity: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Table Type</label>
                            {!isAddingTableType ? (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <select
                                        value={newTableData.type}
                                        onChange={e => setNewTableData({ ...newTableData, type: e.target.value })}
                                        style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                    >
                                        <option value="">Select Type</option>
                                        {tableTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => setIsAddingTableType(true)}
                                        style={{ padding: '0 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '18px' }}
                                    >
                                        +
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="text"
                                        placeholder="New type..."
                                        value={newTableType}
                                        onChange={e => setNewTableType(e.target.value)}
                                        autoFocus
                                        style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                    />
                                    <button
                                        onClick={handleAddTableType}
                                        style={{ padding: '0 12px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                    >
                                        ✓
                                    </button>
                                    <button
                                        onClick={() => setIsAddingTableType(false)}
                                        style={{ padding: '0 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={handleCreateTable}
                                style={{ flex: 1, padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                            >
                                Create Table
                            </button>
                            <button
                                onClick={() => setShowAddTableModal(false)}
                                style={{ flex: 1, padding: '12px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GuestMealService;
