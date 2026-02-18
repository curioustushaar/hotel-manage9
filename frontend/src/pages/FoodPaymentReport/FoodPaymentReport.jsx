import React, { useState } from 'react';
import './FoodPaymentReport.css';

const FoodPaymentReport = () => {
    const [activeTab, setActiveTab] = useState('summary');
    const [startDate, setStartDate] = useState('05/02/2026');
    const [endDate, setEndDate] = useState('05/02/2026');

    // Trends data - Zero data until actual API implementation
    const [trendsData, setTrendsData] = useState([
        {
            date: '05 Feb 2026',
            totalPayments: 0.00,
            totalRefunds: 0.00,
            netCollection: 0.00,
            cashPayments: 0.00,
            cardPayments: 0.00,
            upiPayments: 0.00,
            bankTransfer: 0.00,
            othersPayments: 0.00,
            cashRefunds: 0.00,
            cardRefunds: 0.00,
            upiRefunds: 0.00,
            bankRefunds: 0.00,
            othersRefunds: 0.00,
            transactions: 0,
            paymentsCount: 0,
            refundsCount: 0
        }
    ]);

    // Transactions data - Zero data until actual API implementation
    const [transactionsData, setTransactionsData] = useState([]);

    // Calculate summary totals from trends data
    const calculateSummary = () => {
        const totalPayments = trendsData.reduce((sum, row) => sum + row.totalPayments, 0);
        const totalRefunds = trendsData.reduce((sum, row) => sum + row.totalRefunds, 0);
        const netCollection = totalPayments - totalRefunds;
        const totalPaymentsCount = trendsData.reduce((sum, row) => sum + row.paymentsCount, 0);
        const totalRefundsCount = trendsData.reduce((sum, row) => sum + row.refundsCount, 0);
        const totalTransactions = trendsData.reduce((sum, row) => sum + row.transactions, 0);

        // Calculate food orders from trends data
        const totalOrders = totalPaymentsCount;
        const totalOrderAmount = totalPayments;
        const totalPaid = totalPayments;

        return {
            totalPayments,
            totalRefunds,
            netCollection,
            totalPaymentsCount,
            totalRefundsCount,
            totalTransactions,
            totalOrders,
            totalOrderAmount,
            totalPaid
        };
    };

    const summary = calculateSummary();

    // Export CSV function for Trends
    const handleExportCSV = () => {
        const headers = [
            'Date', 'Total Payments', 'Total Refunds', 'Net Collection',
            'Cash Payments', 'Card Payments', 'UPI Payments', 'Bank Transfer', 'Others',
            'Cash Refunds', 'Card Refunds', 'UPI Refunds', 'Bank Refunds', 'Others Refunds',
            'Transactions'
        ];

        let csvContent = headers.join(',') + '\n';

        trendsData.forEach(row => {
            const rowData = [
                row.date,
                row.totalPayments,
                row.totalRefunds,
                row.netCollection,
                row.cashPayments,
                row.cardPayments,
                row.upiPayments,
                row.bankTransfer,
                row.othersPayments,
                row.cashRefunds,
                row.cardRefunds,
                row.upiRefunds,
                row.bankRefunds,
                row.othersRefunds,
                `${row.transactions} (${row.paymentsCount} payments, ${row.refundsCount} refunds)`
            ];
            csvContent += rowData.join(',') + '\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `food-payment-trends-${startDate}-${endDate}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Export CSV function for Transactions
    const handleExportTransactionsCSV = () => {
        const headers = [
            'Transaction ID', 'Date & Time', 'Food Order ID', 'Booking ID',
            'Transaction', 'Amount', 'Mode', 'Status', 'Notes'
        ];

        let csvContent = headers.join(',') + '\n';

        transactionsData.forEach(row => {
            const rowData = [
                row.transactionId,
                row.dateTime,
                row.foodOrderId,
                row.bookingId,
                row.transaction,
                row.amount,
                row.mode,
                row.status,
                row.notes || ''
            ];
            csvContent += rowData.join(',') + '\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `food-payment-transactions-${startDate}-${endDate}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="food-payment-report">
            {/* Header Section */}
            <div className="report-header">
                <h1>Food Payment Report</h1>
            </div>

            {/* Tabs Section */}
            <div className="tabs-container">
                <button
                    className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
                    onClick={() => setActiveTab('summary')}
                >
                    <span className="tab-icon">◉</span> Summary
                </button>
                <button
                    className={`tab ${activeTab === 'trends' ? 'active' : ''}`}
                    onClick={() => setActiveTab('trends')}
                >
                    <span className="tab-icon">📈</span> Trends
                </button>
                <button
                    className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('transactions')}
                >
                    <span className="tab-icon">📋</span> Transactions
                </button>
            </div>

            {/* Date Filter Section */}
            <div className="date-filter-section">
                <div className="date-filter-wrapper">
                    <div className="date-filter-group">
                        <label>Start Date</label>
                        <input
                            type="text"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="date-input"
                        />
                    </div>
                    <span className="date-separator">-</span>
                    <div className="date-filter-group">
                        <label>End Date</label>
                        <input
                            type="text"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="date-input"
                        />
                    </div>
                </div>
                {activeTab === 'trends' && (
                    <button className="export-csv-btn" onClick={handleExportCSV}>
                        📥 Export CSV
                    </button>
                )}
                {activeTab === 'transactions' && (
                    <button className="export-csv-btn" onClick={handleExportTransactionsCSV}>
                        📥 Export CSV
                    </button>
                )}
            </div>

            {/* SUMMARY TAB CONTENT */}
            {activeTab === 'summary' && (
                <>
                    {/* Summary Cards Section */}
                    <div className="summary-cards">
                        <div className="summary-card pink-card">
                            <div className="card-icon pink-icon">
                                <span>₹</span>
                            </div>
                            <div className="card-content">
                                <h3>Total Collections</h3>
                                <div className="amount">₹{summary.totalPayments.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                <div className="description">Total Payments Received</div>
                                <div className="count">{summary.totalPaymentsCount} payments</div>
                            </div>
                        </div>

                        <div className="summary-card orange-card">
                            <div className="card-icon orange-icon">
                                <span>↻</span>
                            </div>
                            <div className="card-content">
                                <h3>Total Refunds</h3>
                                <div className="amount">₹{summary.totalRefunds.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                <div className="description">Total Refunds Processed</div>
                                <div className="count">{summary.totalRefundsCount} refunds</div>
                            </div>
                        </div>

                        <div className="summary-card green-card">
                            <div className="card-icon green-icon">
                                <span>⚖</span>
                            </div>
                            <div className="card-content">
                                <h3>Net Collection</h3>
                                <div className="amount">₹{summary.netCollection.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                <div className="description">Collection - Refunds</div>
                                <div className="count">{summary.totalTransactions} total transactions</div>
                            </div>
                        </div>
                    </div>

                    {/* Food Order & Payment Statistics Section */}
                    <div className="statistics-section">
                        <h2>Food Order & Payment Statistics</h2>
                        <div className="statistics-cards">
                            <div className="stat-card pink-stat">
                                <div className="stat-label">Total Food Orders</div>
                                <div className="stat-value">
                                    <span className="stat-icon">🛍</span> {summary.totalOrders}
                                </div>
                            </div>

                            <div className="stat-card orange-stat">
                                <div className="stat-label">Total Order Amount</div>
                                <div className="stat-value-row">
                                    <span className="stat-amount">₹ {summary.totalOrderAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>

                            <div className="stat-card green-stat">
                                <div className="stat-label">Total Paid</div>
                                <div className="stat-value-row">
                                    <span className="stat-amount">₹ {summary.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Transaction Summary Section */}
                    <div className="transaction-summary-section">
                        <h2>Transaction Summary</h2>
                        <div className="transaction-cards">
                            <div className="transaction-card pink-transaction">
                                <div className="transaction-header">
                                    <span className="transaction-icon pink-icon">💳</span>
                                    <span className="transaction-title">Payments Received</span>
                                </div>
                                <div className="transaction-body">
                                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981', marginBottom: '5px' }}>
                                        ₹{summary.totalPayments.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                    <p style={{ fontSize: '14px', color: '#6b7280' }}>
                                        Total: {summary.totalPaymentsCount} payments received
                                    </p>
                                </div>
                            </div>

                            <div className="transaction-card orange-transaction">
                                <div className="transaction-header">
                                    <span className="transaction-icon orange-icon">↻</span>
                                    <span className="transaction-title">Refunds Given</span>
                                </div>
                                <div className="transaction-body">
                                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#ef4444', marginBottom: '5px' }}>
                                        ₹{summary.totalRefunds.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                    <p style={{ fontSize: '14px', color: '#6b7280' }}>
                                        Total: {summary.totalRefundsCount} refunds processed
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Methods Breakdown Section */}
                    <div className="payment-methods-section">
                        <h2>Payment Methods Breakdown</h2>
                        <div className="payment-methods-cards">
                            <div className="payment-method-card green-method">
                                <div className="method-header">Payments Received</div>
                                <div className="method-body">
                                    <div className="no-data-box" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '20px', textAlign: 'left' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                                            <span style={{ color: '#6b7280', fontWeight: '500' }}>Cash:</span>
                                            <span style={{ color: '#10b981', fontWeight: '600' }}>₹{trendsData.reduce((sum, row) => sum + row.cashPayments, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                                            <span style={{ color: '#6b7280', fontWeight: '500' }}>Card:</span>
                                            <span style={{ color: '#10b981', fontWeight: '600' }}>₹{trendsData.reduce((sum, row) => sum + row.cardPayments, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                                            <span style={{ color: '#6b7280', fontWeight: '500' }}>UPI:</span>
                                            <span style={{ color: '#10b981', fontWeight: '600' }}>₹{trendsData.reduce((sum, row) => sum + row.upiPayments, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                                            <span style={{ color: '#6b7280', fontWeight: '500' }}>Bank Transfer:</span>
                                            <span style={{ color: '#10b981', fontWeight: '600' }}>₹{trendsData.reduce((sum, row) => sum + row.bankTransfer, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="payment-method-card pink-method">
                                <div className="method-header">Refunds Given</div>
                                <div className="method-body">
                                    <div className="no-data-box" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '20px', textAlign: 'left' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                                            <span style={{ color: '#6b7280', fontWeight: '500' }}>Cash:</span>
                                            <span style={{ color: '#ef4444', fontWeight: '600' }}>₹{trendsData.reduce((sum, row) => sum + row.cashRefunds, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                                            <span style={{ color: '#6b7280', fontWeight: '500' }}>Card:</span>
                                            <span style={{ color: '#ef4444', fontWeight: '600' }}>₹{trendsData.reduce((sum, row) => sum + row.cardRefunds, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                                            <span style={{ color: '#6b7280', fontWeight: '500' }}>UPI:</span>
                                            <span style={{ color: '#ef4444', fontWeight: '600' }}>₹{trendsData.reduce((sum, row) => sum + row.upiRefunds, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                                            <span style={{ color: '#6b7280', fontWeight: '500' }}>Bank Transfer:</span>
                                            <span style={{ color: '#ef4444', fontWeight: '600' }}>₹{trendsData.reduce((sum, row) => sum + row.bankRefunds, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* TRENDS TAB CONTENT */}
            {
                activeTab === 'trends' && (
                    <div className="trends-section">
                        <div className="trends-grid-container">
                            {trendsData.map((row, index) => (
                                <div key={index} className="trends-dashboard-card">
                                    {/* Section A: Header */}
                                    <div className="trends-header">
                                        <div className="trends-date">
                                            <span className="icon">📅</span> {row.date}
                                        </div>
                                        <div className="trends-net-collection">
                                            <span className="label">Net Collection:</span>
                                            <span className={`value ${row.netCollection > 0 ? 'positive' : 'neutral'}`}>
                                                ₹{row.netCollection.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="trends-card-body">
                                        {/* Section B: Payments */}
                                        <div className="trends-section-group payments-group">
                                            <h4 className="trends-section-title">Payments Received</h4>
                                            <div className="trends-metrics-grid">
                                                <div className="metric-card total">
                                                    <span className="metric-label">Total</span>
                                                    <span className="metric-value">₹{row.totalPayments.toFixed(2)}</span>
                                                </div>
                                                <div className="metric-card">
                                                    <span className="metric-label">Cash</span>
                                                    <span className="metric-value">₹{row.cashPayments.toFixed(2)}</span>
                                                </div>
                                                <div className="metric-card">
                                                    <span className="metric-label">Card</span>
                                                    <span className="metric-value">₹{row.cardPayments.toFixed(2)}</span>
                                                </div>
                                                <div className="metric-card">
                                                    <span className="metric-label">UPI</span>
                                                    <span className="metric-value">₹{row.upiPayments.toFixed(2)}</span>
                                                </div>
                                                <div className="metric-card">
                                                    <span className="metric-label">Bank</span>
                                                    <span className="metric-value">₹{row.bankTransfer.toFixed(2)}</span>
                                                </div>
                                                <div className="metric-card">
                                                    <span className="metric-label">Others</span>
                                                    <span className="metric-value">₹{row.othersPayments.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Section C: Refunds */}
                                        <div className="trends-section-group refunds-group">
                                            <h4 className="trends-section-title">Refunds Processed</h4>
                                            <div className="trends-metrics-grid">
                                                <div className="metric-card total-refund">
                                                    <span className="metric-label">Total</span>
                                                    <span className="metric-value">₹{row.totalRefunds.toFixed(2)}</span>
                                                </div>
                                                <div className="metric-card refund">
                                                    <span className="metric-label">Cash</span>
                                                    <span className="metric-value">₹{row.cashRefunds.toFixed(2)}</span>
                                                </div>
                                                <div className="metric-card refund">
                                                    <span className="metric-label">Card</span>
                                                    <span className="metric-value">₹{row.cardRefunds.toFixed(2)}</span>
                                                </div>
                                                <div className="metric-card refund">
                                                    <span className="metric-label">UPI</span>
                                                    <span className="metric-value">₹{row.upiRefunds.toFixed(2)}</span>
                                                </div>
                                                <div className="metric-card refund">
                                                    <span className="metric-label">Bank</span>
                                                    <span className="metric-value">₹{row.bankRefunds.toFixed(2)}</span>
                                                </div>
                                                <div className="metric-card refund">
                                                    <span className="metric-label">Others</span>
                                                    <span className="metric-value">₹{row.othersRefunds.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="trends-footer">
                                        <div className="transaction-count">
                                            <span className="icon">📊</span>
                                            {row.transactions} Total Transactions
                                            <span className="sub-text">({row.paymentsCount} payments, {row.refundsCount} refunds)</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }

            {/* TRANSACTIONS TAB CONTENT */}
            {
                activeTab === 'transactions' && (
                    <div className="transactions-section">
                        {/* Summary Strip */}
                        <div className="transactions-summary-strip">
                            <div className="summary-strip-card">
                                <span className="strip-icon blue-icon">📊</span>
                                <div className="strip-info">
                                    <div className="strip-label">Total Transactions</div>
                                    <div className="strip-value">{transactionsData.length}</div>
                                </div>
                            </div>
                            <div className="summary-strip-card">
                                <span className="strip-icon green-icon">💰</span>
                                <div className="strip-info">
                                    <div className="strip-label">Total Amount</div>
                                    <div className="strip-value">
                                        ₹{transactionsData
                                            .reduce((sum, t) => sum + (t.transaction === 'Payment' ? t.amount : 0), 0)
                                            .toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>
                            <div className="summary-strip-card">
                                <span className="strip-icon purple-icon">✅</span>
                                <div className="strip-info">
                                    <div className="strip-label">Successful</div>
                                    <div className="strip-value">
                                        {transactionsData.filter(t => ['Success', 'Completed', 'Paid'].includes(t.status)).length}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="transactions-table-container">
                            {transactionsData.length === 0 ? (
                                <div className="empty-state-container">
                                    <div className="empty-state-icon">📝</div>
                                    <h3 className="empty-state-title">No Transactions Found</h3>
                                    <p className="empty-state-text">
                                        There are no transactions available for the selected date range.
                                    </p>
                                </div>
                            ) : (
                                <table className="transactions-table">
                                    <thead>
                                        <tr>
                                            <th>Transaction ID</th>
                                            <th>Date & Time</th>
                                            <th>Food Order ID</th>
                                            <th>Booking ID</th>
                                            <th>Transaction</th>
                                            <th>Amount</th>
                                            <th>Mode</th>
                                            <th>Status</th>
                                            <th>Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactionsData.map((row, index) => (
                                            <tr key={index}>
                                                <td className="transaction-id-cell">{row.transactionId}</td>
                                                <td className="date-time-cell">{row.dateTime}</td>
                                                <td>{row.foodOrderId}</td>
                                                <td>{row.bookingId}</td>
                                                <td className={row.transaction === 'Payment' ? 'payment-type' : 'refund-type'}>
                                                    {row.transaction}
                                                </td>
                                                <td className={row.transaction === 'Payment' ? 'positive-value' : 'negative-value'}>
                                                    ₹{row.amount.toFixed(2)}
                                                </td>
                                                <td className="mode-cell">{row.mode}</td>
                                                <td>
                                                    <span className={`status-badge ${row.status.toLowerCase()}`}>
                                                        {row.status}
                                                    </span>
                                                </td>
                                                <td className="notes-cell">{row.notes || '---'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default FoodPaymentReport;
