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

    const [filteredTables, setFilteredTables] = useState(dummyTables);
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({
        total: dummyTables.length,
        available: dummyTables.filter(t => t.status === 'Available').length,
        running: dummyTables.filter(t => t.status === 'Running').length,
        billed: dummyTables.filter(t => t.status === 'Billed').length
    });

    useEffect(() => {
        let filtered = dummyTables;
        if (statusFilter !== 'All') {
            filtered = filtered.filter(table => table.status === statusFilter);
        }
        if (searchQuery) {
            filtered = filtered.filter(table =>
                table.tableName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        setFilteredTables(filtered);
    }, [statusFilter, searchQuery]);

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

    return (
        <div className="gms-wrapper">
            {/* Header */}
            <div className="gms-header">
                <div className="gms-header-content">
                    <div>
                        <h1 className="gms-title">Table Service Suite</h1>
                        <p className="gms-subtitle">Manage dining operations in real-time</p>
                    </div>
                    <button className="gms-refresh-btn" onClick={() => window.location.reload()} title="Refresh data">
                        ↻
                    </button>
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
        </div>
    );
};

export default GuestMealService;
