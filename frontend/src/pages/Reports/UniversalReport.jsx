import React, { useState, useEffect } from 'react';
import './UniversalReport.css';
import { useAuth } from '../../context/AuthContext';
import soundManager from '../../utils/soundManager';
import axios from 'axios';
import { io } from 'socket.io-client';

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
            tabs: ['Cashier Collection', 'Pending Bills', 'Settled Bills', 'Discount', 'Refund'],
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

    const [menuItems, setMenuItems] = useState([]);

    // Fetch dynamic options if it's a sales report
    useEffect(() => {
        if (type === 'reports-sales') {
            fetch('http://localhost:5000/api/menu/list')
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setMenuItems(data.data);
                    }
                })
                .catch(err => console.error("Error fetching menu:", err));
        }
    }, [type]);

    // Derived dynamic items
    const selectedCategory = filters['Category'] || 'All';
    const dynamicCategories = ['Starters', 'Main Course', 'Breakfast', 'Rice', 'Desserts', 'Beverages', 'Chinese', 'Continental'];

    // Fallback specific items for sales reports
    const outletOptions = ['Dine-In', 'Room Service', 'Take Away', 'Online'];

    const getOptionsForFilter = (filterName) => {
        if (type !== 'reports-sales' && type !== 'reports-payments') {
            return ['Option 1', 'Option 2'];
        }

        if (filterName === 'Outlet') return outletOptions;
        if (filterName === 'Category') return dynamicCategories;
        if (filterName === 'Item') {
            if (!menuItems.length) return ['No Items Loaded'];
            const filtered = selectedCategory === 'All'
                ? menuItems
                : menuItems.filter(i => i.category === selectedCategory);
            return filtered.map(item => item.itemName);
        }

        if (type === 'reports-payments') {
            if (filterName === 'Cashier') return ['Dine-In', 'Room', 'Take Away', 'Delivery', 'Online Order'];
            if (filterName === 'Payment Mode') return ['UPI', 'Card', 'Cash'];
            if (filterName === 'Shift') return ['Morning', 'Lunch', 'Night'];
        }

        return ['Option 1', 'Option 2'];
    };

    const fetchSalesReport = async (isManual = false) => {
        if (isManual) setLoading(true);
        try {
            const queryParams = {
                outlet: activeTab === 'Dine-In Orders' ? 'Dine-In' : activeTab === 'Room Service Orders' ? 'Room Service' : activeTab === 'Take-Away Orders' ? 'Take Away' : activeTab === 'Online Orders' ? 'Online' : filters['Outlet'] || 'All',
                category: filters['Category'] || 'All',
                item: filters['Item'] || 'All',
                startDate: dateRange.from,
                endDate: dateRange.to
            };

            const res = await axios.get("http://localhost:5000/api/sales-report", { params: queryParams });
            if (res.data.success) {
                const mappedData = res.data.data.map((tx, idx) => ({
                    id: tx.id || idx,
                    val1: tx.billNo,
                    val2: `${tx.itemName} / ${tx.category}`,
                    val3: tx.qty,
                    val4: `₹${parseFloat(tx.price).toFixed(2)}`,
                    val5: `₹${parseFloat(tx.subtotal - (tx.qty * tx.price) || 0).toFixed(2)}`,
                    val6: `₹${parseFloat(tx.subtotal).toFixed(2)}`,
                    rawSubtotal: tx.subtotal,
                    paymentMethod: tx.paymentMethod || 'Cash'
                }));
                setReportData(mappedData);

                // Download CSV if triggered manually
                if (isManual && mappedData.length > 0) {
                    const headers = config.columns.join(',');
                    const rows = mappedData.map(row => config.columns.map((_, i) => `"${row[`val${i + 1}`] || ''}"`).join(','));
                    const csvString = [headers, ...rows].join('\n');

                    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvString], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.setAttribute("href", url);
                    link.setAttribute("download", `Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }
            }
        } catch (error) {
            console.error("Error fetching sales report:", error);
        } finally {
            if (isManual) setLoading(false);
        }
    };

    const fetchPaymentReport = async (isManual = false) => {
        if (isManual) setLoading(true);
        try {
            const queryParams = {
                startDate: dateRange.from,
                endDate: dateRange.to,
                cashier: filters['Cashier'] || 'All',
                paymentMode: filters['Payment Mode'] || 'All',
                shift: filters['Shift'] || 'All'
            };

            const res = await axios.get("http://localhost:5000/api/payment-report", { params: queryParams });
            if (res.data.success) {
                const rawData = res.data.transactions || [];

                // Filter based on active tab locally
                let filteredData = rawData;
                if (activeTab === 'Settled Bills') {
                    filteredData = rawData.filter(d => d.status === 'Completed' || d.status === 'Settled' || d.status === 'Closed');
                } else if (activeTab === 'Pending Bills') {
                    filteredData = rawData.filter(d => d.status === 'Pending' || d.status === 'Active');
                } else if (activeTab === 'Cashier Collection') {
                    // Show all collections (Settled/Closed usually represent the real collection here)
                    filteredData = rawData;
                } else if (activeTab === 'Discount' || activeTab === 'Refund') {
                    // Empty array as no specific backend data for this mock at the moment
                    filteredData = [];
                }

                const mappedData = filteredData.map((d, index) => ({
                    id: d.id || index,
                    val1: d.billNo,
                    val2: d.cashier,
                    val3: d.paymentMode,
                    val4: `₹${parseFloat(d.amount).toFixed(2)}`,
                    val5: d.status
                }));
                setReportData(mappedData);

                // Download CSV if triggered manually
                if (isManual && mappedData.length > 0) {
                    const headers = config.columns.join(',');
                    const rows = mappedData.map(row => config.columns.map((_, i) => `"${row[`val${i + 1}`] || ''}"`).join(','));
                    const csvString = [headers, ...rows].join('\n');

                    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvString], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.setAttribute("href", url);
                    link.setAttribute("download", `Payment_Report_${new Date().toISOString().split('T')[0]}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }

                return res.data;
            }
        } catch (error) {
            console.error("Error fetching payment report:", error);
        } finally {
            if (isManual) setLoading(false);
        }
    };

    const handleGenerate = () => {
        soundManager.play('click');
        if (type === 'reports-sales') {
            fetchSalesReport(true); // Pass true flag to trigger CSV download
        } else if (type === 'reports-payments') {
            fetchPaymentReport(true); // Pass true flag to trigger CSV download
        } else {
            setLoading(true);
            setTimeout(() => {
                setLoading(false);
                setReportData([
                    { id: 1, val1: 'WEB-1001', val2: 'AC Deluxe', val3: '2', val4: '4500.00', val5: '225.00', val6: '4725.00' },
                    { id: 2, val1: 'WEB-1002', val2: 'Standard', val3: '1', val4: '1500.00', val5: '75.00', val6: '1575.00' }
                ]);
            }, 800);
        }
    };

    // Auto-fetch and socket connection for Sales and Payment Reports
    useEffect(() => {
        if (type === 'reports-sales' || type === 'reports-payments') {
            if (type === 'reports-sales') {
                fetchSalesReport();
            } else {
                fetchPaymentReport(false).then((data) => {
                    if (data && data.success) {
                        if (activeTab === 'Cashier Collection') {
                            setSummaryStats(prev => ({
                                ...prev,
                                totalCollections: data.totals.totalAmount || 0,
                                netCashFlow: data.totals.totalAmount || 0,
                                paymentsReceived: data.totals.totalAmount || 0,
                                paymentsCount: data.totalTransactions || 0,
                                paymentMethods: {
                                    cash: data.totals.totalCash || 0,
                                    card: data.totals.totalCard || 0,
                                    upi: data.totals.totalUPI || 0,
                                    bankTransfer: data.totals.totalOther || 0
                                }
                            }));
                        } else {
                            setSummaryStats(prev => ({
                                ...prev,
                                totalCollections: 0,
                                netCashFlow: 0,
                                paymentsReceived: 0,
                                paymentsCount: 0,
                                paymentMethods: { cash: 0, card: 0, upi: 0, bankTransfer: 0 }
                            }));
                        }
                    }
                });
            }

            const socket = io("http://localhost:5000");

            socket.on("connect", () => console.log(`Connected to universal report socket for ${type}`));
            socket.on("salesUpdated", () => {
                console.log("Real-time update received!");
                if (type === 'reports-sales') {
                    fetchSalesReport();
                } else {
                    fetchPaymentReport(false).then((data) => {
                        if (data && data.success) {
                            if (activeTab === 'Cashier Collection') {
                                setSummaryStats(prev => ({
                                    ...prev,
                                    totalCollections: data.totals.totalAmount || 0,
                                    netCashFlow: data.totals.totalAmount || 0,
                                    paymentsReceived: data.totals.totalAmount || 0,
                                    paymentsCount: data.totalTransactions || 0,
                                    paymentMethods: {
                                        cash: data.totals.totalCash || 0,
                                        card: data.totals.totalCard || 0,
                                        upi: data.totals.totalUPI || 0,
                                        bankTransfer: data.totals.totalOther || 0
                                    }
                                }));
                            } else {
                                setSummaryStats(prev => ({
                                    ...prev,
                                    totalCollections: 0,
                                    netCashFlow: 0,
                                    paymentsReceived: 0,
                                    paymentsCount: 0,
                                    paymentMethods: { cash: 0, card: 0, upi: 0, bankTransfer: 0 }
                                }));
                            }
                        }
                    });
                }
            });

            return () => socket.disconnect();
        }
    }, [type, activeTab, filters, dateRange.from, dateRange.to]);

    const [summaryStats, setSummaryStats] = useState({
        totalCollections: 0,
        totalPayouts: 0,
        netCashFlow: 0,
        openingBalance: 0,
        paymentsReceived: 0,
        paymentsCount: 0,
        paymentMethods: { cash: 0, card: 0, upi: 0, bankTransfer: 0 }
    });

    useEffect(() => {
        if (type === 'reports-sales') {
            let collections = 0;
            let pm = { cash: 0, card: 0, upi: 0, bankTransfer: 0 };

            reportData.forEach(item => {
                const amount = item.rawSubtotal || 0;
                collections += amount;

                const method = (item.paymentMethod || 'cash').toLowerCase();
                if (method.includes('card')) pm.card += amount;
                else if (method.includes('upi')) pm.upi += amount;
                else if (method.includes('bank') || method.includes('transfer')) pm.bankTransfer += amount;
                else pm.cash += amount;
            });

            setSummaryStats({
                totalCollections: collections,
                totalPayouts: 0, // No payouts for sales
                netCashFlow: collections,
                openingBalance: 0, // Base register starts 0 for pure sales view
                paymentsReceived: collections,
                paymentsCount: reportData.length,
                paymentMethods: pm
            });
        }
    }, [reportData, type]);

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
                                {getOptionsForFilter(filter).map((opt, idx) => (
                                    <option key={idx} value={opt}>{opt}</option>
                                ))}
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
                    <div className="stat-card">
                        <div className="stat-icon" style={{ backgroundColor: '#10b981' }}>💰</div>
                        <div className="stat-info">
                            <span className="stat-label">Total Collections</span>
                            <span className="stat-value">₹{summaryStats.totalCollections.toFixed(2)}</span>
                            <span className="stat-sub">Total Payments Received</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ backgroundColor: '#fee2e2' }}>💸</div>
                        <div className="stat-info">
                            <span className="stat-label">Total Payouts</span>
                            <span className="stat-value">₹{summaryStats.totalPayouts.toFixed(2)}</span>
                            <span className="stat-sub">Total Payments Made</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ backgroundColor: '#f59e0b' }}>📈</div>
                        <div className="stat-info">
                            <span className="stat-label">Net Cash Flow</span>
                            <span className="stat-value">₹{summaryStats.netCashFlow.toFixed(2)}</span>
                            <span className="stat-sub">Collections - Payouts</span>
                        </div>
                    </div>
                </div>

                <div className="summary-overview-section">
                    <h2 className="section-title">SUMMARY OVERVIEW</h2>
                    <div className="overview-container-card">
                        <div className="overview-sub-grid">
                            <div className="overview-sub-card">
                                <div className="overview-icon-box green-icon">💰</div>
                                <div className="overview-text">
                                    <span className="overview-label">Opening Balance</span>
                                    <span className="overview-huge-value">₹{summaryStats.openingBalance.toFixed(2)}</span>
                                    <span className="overview-subtext">Base Register Balance</span>
                                </div>
                            </div>
                            <div className="overview-sub-card">
                                <div className="overview-icon-box pink-icon">💸</div>
                                <div className="overview-text">
                                    <span className="overview-label">Payments Received</span>
                                    <span className="overview-huge-value">₹{summaryStats.paymentsReceived.toFixed(2)}</span>
                                    <span className="overview-subtext">Total Sales Revenue</span>
                                    <span className="overview-count">{summaryStats.paymentsCount} payments</span>
                                </div>
                            </div>
                            <div className="overview-sub-card">
                                <div className="overview-icon-box green-icon">💳</div>
                                <div className="overview-text">
                                    <span className="overview-label">Closing Balance</span>
                                    <span className="overview-huge-value">₹{summaryStats.netCashFlow.toFixed(2)}</span>
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
                                    <span className="item-value">₹{summaryStats.paymentMethods.cash.toFixed(2)}</span>
                                </div>
                                <div className="breakdown-item received">
                                    <span className="item-icon">ⓘ</span>
                                    <span className="item-label">Card</span>
                                    <span className="item-value">₹{summaryStats.paymentMethods.card.toFixed(2)}</span>
                                </div>
                                <div className="breakdown-item received">
                                    <span className="item-icon">ⓘ</span>
                                    <span className="item-label">UPI</span>
                                    <span className="item-value">₹{summaryStats.paymentMethods.upi.toFixed(2)}</span>
                                </div>
                                <div className="breakdown-item received">
                                    <span className="item-icon">ⓘ</span>
                                    <span className="item-label">Bank Transfer</span>
                                    <span className="item-value">₹{summaryStats.paymentMethods.bankTransfer.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="breakdown-column">
                            <h3>Payments Made</h3>
                            <div className="breakdown-items">
                                <div className="breakdown-item made">
                                    <span className="item-icon">ⓘ</span>
                                    <span className="item-label">Refunds</span>
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
