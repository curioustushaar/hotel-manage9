import React, { useState, useEffect } from 'react';
import './UniversalReport.css';
import { useAuth } from '../../context/AuthContext';
import soundManager from '../../utils/soundManager';

const UniversalReport = ({ type }) => {
    const { user } = useAuth();
    const [dateRange, setDateRange] = useState({
        from: new Date().toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
    });
    const [filters, setFilters] = useState({});
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Report configurations
    const reportConfig = {
        'reports-sales': {
            title: 'SALES REPORTS',
            tabs: ['Dine-In Orders', 'Room Service Orders', 'Take-Away Orders', 'Online Orders'],
            filters: ['Outlet', 'Category', 'Item'],
            columns: ['Bill No', 'Item / Category', 'Qty', 'Amount', 'Tax', 'Net']
        },
        'reports-payments': {
            title: 'PAYMENT REPORTS',
            tabs: ['Payment Mode', 'Cashier Collection', 'Pending Bills', 'Settled Bills', 'Discount', 'Refund'],
            filters: ['Cashier', 'Payment Mode', 'Shift'],
            columns: ['Bill No', 'Cashier', 'Mode', 'Amount', 'Status']
        },
        'reports-rooms': {
            title: 'ROOM REPORTS',
            tabs: ['Room Occupancy', 'Check-In / Check-Out', 'Room Revenue', 'Reservation', 'No-Show', 'Cancellation'],
            filters: ['Room Type', 'Floor', 'Status'],
            columns: ['Room No', 'Guest', 'Check-In', 'Check-Out', 'Nights', 'Amount']
        },
        'reports-kitchen': {
            title: 'KITCHEN REPORTS',
            tabs: ['KOT Pending Time', 'Kitchen Delay', 'Preparation Time', 'Ready vs Delivered', 'Kitchen Load'],
            filters: ['Kitchen Section'],
            columns: ['KOT No', 'Item', 'Start Time', 'Ready Time', 'Delay']
        },
        'reports-gst': {
            title: 'GST & TAX REPORTS',
            tabs: ['GST Summary', 'GST Item Wise', 'CGST / SGST / IGST', 'HSN Wise', 'Taxable vs Non-Taxable'],
            filters: ['Tax Type'],
            columns: ['HSN', 'Description', 'Taxable Value', 'CGST', 'SGST', 'IGST', 'Total Tax']
        },
        'reports-staff': {
            title: 'STAFF REPORTS',
            tabs: ['Staff Order Count', 'Waiter Performance', 'Kitchen Staff Load', 'Service Time'],
            filters: ['Department', 'Staff Role'],
            columns: ['Staff', 'Orders', 'Amount', 'Avg Time']
        },
        'reports-billing': {
            title: 'BILLING REPORTS',
            tabs: ['Bill Wise', 'Split Bill', 'Voided Bills', 'Edited Bills', 'Bill History'],
            filters: ['Bill Status', 'User'],
            columns: ['Bill No', 'Table / Room', 'Amount', 'Status', 'Edited By']
        },
        'reports-reservations': {
            title: 'RESERVATION REPORTS',
            tabs: ['Upcoming', 'Today', 'Completed', 'Guest History', 'Repeat Guests'],
            filters: ['Source', 'Segment'],
            columns: ['Guest', 'Room', 'Check-In', 'Nights', 'Status']
        },
        'reports-analytics': {
            title: 'ANALYTICS REPORTS',
            tabs: ['Top Selling Items', 'Peak Hours', 'Best Table Revenue', 'Room vs Restaurant Revenue', 'Daily Profit Estimate'],
            filters: ['Metric'],
            columns: ['Metric', 'Value', 'Growth', 'Trend']
        }
    };

    const config = reportConfig[type] || reportConfig['reports-sales'];
    const [activeTab, setActiveTab] = useState(config.tabs[0]);

    // Reset active tab when type changes
    useEffect(() => {
        setActiveTab(config.tabs[0]);
    }, [type]);

    const handleGenerate = () => {
        setLoading(true);
        soundManager.play('click');
        // Mocking API call
        setTimeout(() => {
            setLoading(false);
            setReportData([
                { id: 1, val1: 'WEB-1001', val2: 'AC Deluxe', val3: '2', val4: '4500.00', val5: '225.00', val6: '4725.00' },
                { id: 2, val1: 'WEB-1002', val2: 'Standard', val3: '1', val4: '1500.00', val5: '75.00', val6: '1575.00' }
            ]);
        }, 800);
    };

    const mockStats = [
        { label: 'Total Collections', value: '₹0.00', sub: 'Total Payments Received', icon: '💰', color: '#10b981' },
        { label: 'Total Payouts', value: '₹0.00', sub: 'Total Payments Made', icon: '💸', color: '#fee2e2' },
        { label: 'Net Cash Flow', value: '₹0.00', sub: 'Collections - Payouts', icon: '📈', color: '#f59e0b' }
    ];

    const handleExport = (format) => {
        soundManager.play('success');
        alert(`Exporting as ${format}...`);
    };

    return (
        <div className="report-container">
            <header className="report-header">
                <div className="header-top">
                    <h1>{config.title}</h1>
                    <button className="btn-generate-top" onClick={handleGenerate}>
                        {loading ? 'Generating...' : 'Generate Report'}
                    </button>
                </div>

                <div className="header-filters-row">
                    <div className="date-filter-group">
                        <div className="filter-item">
                            <label>START DATE</label>
                            <input type="date" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} />
                        </div>
                        <div className="filter-item">
                            <label>END DATE</label>
                            <input type="date" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} />
                        </div>
                    </div>

                    {config.filters.map(filter => (
                        <div className="control-group-header" key={filter}>
                            <label>{filter}</label>
                            <select onChange={(e) => setFilters({ ...filters, [filter]: e.target.value })}>
                                <option value="All">All {filter}s</option>
                                <option value="Option1">Option 1</option>
                                <option value="Option2">Option 2</option>
                            </select>
                        </div>
                    ))}
                </div>

                <div className="report-tabs-outer">
                    <div className="report-tabs">
                        {config.tabs.map(tab => (
                            <button
                                key={tab}
                                className={`report-tab ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <div className="report-content">
                {/* Summary Cards */}
                <div className="report-stats-grid">
                    {mockStats.map((stat, i) => (
                        <div className="stat-card" key={i}>
                            <div className="stat-icon" style={{ backgroundColor: stat.color }}>
                                {stat.icon}
                            </div>
                            <div className="stat-info">
                                <span className="stat-label">{stat.label}</span>
                                <span className="stat-value">{stat.value}</span>
                                <span className="stat-sub">{stat.sub}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="summary-overview-section">
                    <h2 className="section-title">SUMMARY OVERVIEW</h2>
                    <div className="overview-container-card">
                        <div className="overview-sub-grid">
                            <div className="overview-sub-card">
                                <div className="overview-icon-box green-icon">💰</div>
                                <div className="overview-text">
                                    <span className="overview-label">Opening Balance</span>
                                    <span className="overview-huge-value">₹607.00</span>
                                    <span className="overview-subtext">Total Payments - Paid</span>
                                    <span className="overview-count">3 payments</span>
                                </div>
                            </div>
                            <div className="overview-sub-card">
                                <div className="overview-icon-box pink-icon">💸</div>
                                <div className="overview-text">
                                    <span className="overview-label">Payments Received</span>
                                    <span className="overview-huge-value">₹0.00</span>
                                    <span className="overview-subtext">Total Payments Made</span>
                                    <span className="overview-count">0 payouts</span>
                                </div>
                            </div>
                            <div className="overview-sub-card">
                                <div className="overview-icon-box green-icon">💳</div>
                                <div className="overview-text">
                                    <span className="overview-label">Closing Balance</span>
                                    <span className="overview-huge-value">₹607.00</span>
                                </div>
                            </div>
                            <div className="overview-sub-card">
                                <div className="overview-icon-box pink-icon">💵</div>
                                <div className="overview-text">
                                    <span className="overview-label">Closing Balance</span>
                                    <span className="overview-huge-value">₹607.00</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="transaction-breakdown-section">
                    <h2 className="section-title">TRANSACTION BREAKDOWN</h2>
                    <div className="breakdown-grid">
                        <div className="breakdown-column">
                            <h3>Payments Received</h3>
                            <div className="breakdown-items">
                                <div className="breakdown-item received">
                                    <span className="item-icon">ⓘ</span>
                                    <span className="item-label">Cash</span>
                                    <span className="item-value">₹0.00</span>
                                </div>
                                <div className="breakdown-item received">
                                    <span className="item-icon">ⓘ</span>
                                    <span className="item-label">Card</span>
                                    <span className="item-value">₹0.00</span>
                                </div>
                                <div className="breakdown-item received">
                                    <span className="item-icon">ⓘ</span>
                                    <span className="item-label">UPI</span>
                                    <span className="item-value">₹0.00</span>
                                </div>
                                <div className="breakdown-item received">
                                    <span className="item-icon">ⓘ</span>
                                    <span className="item-label">Bank Transfer</span>
                                    <span className="item-value">₹0.00</span>
                                </div>
                            </div>
                        </div>
                        <div className="breakdown-column">
                            <h3>Payments Made</h3>
                            <div className="breakdown-items">
                                <div className="breakdown-item made">
                                    <span className="item-icon">ⓘ</span>
                                    <span className="item-label">Cash</span>
                                    <span className="item-value">₹0.00</span>
                                </div>
                                <div className="breakdown-item made">
                                    <span className="item-icon">ⓘ</span>
                                    <span className="item-label">Expense Paid</span>
                                    <span className="item-value">₹0.00</span>
                                </div>
                                <div className="breakdown-item made">
                                    <span className="item-icon">ⓘ</span>
                                    <span className="item-label">Refunds</span>
                                    <span className="item-value">₹0.00</span>
                                </div>
                                <div className="breakdown-item made">
                                    <span className="item-icon">ⓘ</span>
                                    <span className="item-label">Salaries</span>
                                    <span className="item-value">₹0.00</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>



                <div className="report-actions">
                    <button onClick={() => handleExport('Excel')}>Export Excel</button>
                    <button onClick={() => handleExport('PDF')}>Export PDF</button>
                    <button onClick={() => handleExport('Print')}>Print</button>
                </div>

                <div className="report-data-card">
                    <div className="table-responsive">
                        <table className="report-table">
                            <thead>
                                <tr>
                                    {config.columns.map(col => <th key={col}>{col}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.length > 0 ? (
                                    reportData.map((row, idx) => (
                                        <tr key={idx}>
                                            {config.columns.map((col, i) => (
                                                <td key={i}>{row[`val${i + 1}`]}</td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={config.columns.length} style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                            {loading ? 'Fetching data...' : 'No data generated. Click "Generate Report" to view results.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UniversalReport;
