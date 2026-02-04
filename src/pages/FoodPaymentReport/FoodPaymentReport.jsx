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
                        <div className="trends-table-container">
                            <table className="trends-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Total Payments</th>
                                        <th>Total Refunds</th>
                                        <th>Net Collection</th>
                                        <th>Cash Payments</th>
                                        <th>Card Payments</th>
                                        <th>UPI Payments</th>
                                        <th>Bank Transfer</th>
                                        <th>Others</th>
                                        <th>Cash Refunds</th>
                                        <th>Card Refunds</th>
                                        <th>UPI Refunds</th>
                                        <th>Bank Refunds</th>
                                        <th>Others Refunds</th>
                                        <th>Transactions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trendsData.map((row, index) => (
                                        <tr key={index}>
                                            <td className="date-cell">{row.date}</td>
                                            <td className={row.totalPayments > 0 ? 'positive-value' : 'zero-value'}>
                                                ₹{row.totalPayments.toFixed(2)}
                                            </td>
                                            <td className={row.totalRefunds > 0 ? 'negative-value' : 'zero-value'}>
                                                ₹{row.totalRefunds.toFixed(2)}
                                            </td>
                                            <td className={row.netCollection > 0 ? 'positive-value' : 'zero-value'}>
                                                ₹{row.netCollection.toFixed(2)}
                                            </td>
                                            <td className={row.cashPayments > 0 ? 'positive-value' : 'zero-value'}>
                                                ₹{row.cashPayments.toFixed(2)}
                                            </td>
                                            <td className={row.cardPayments > 0 ? 'positive-value' : 'zero-value'}>
                                                ₹{row.cardPayments.toFixed(2)}
                                            </td>
                                            <td className={row.upiPayments > 0 ? 'positive-value' : 'zero-value'}>
                                                ₹{row.upiPayments.toFixed(2)}
                                            </td>
                                            <td className={row.bankTransfer > 0 ? 'positive-value' : 'zero-value'}>
                                                ₹{row.bankTransfer.toFixed(2)}
                                            </td>
                                            <td className={row.othersPayments > 0 ? 'positive-value' : 'zero-value'}>
                                                ₹{row.othersPayments.toFixed(2)}
                                            </td>
                                            <td className={row.cashRefunds > 0 ? 'negative-value' : 'zero-value'}>
                                                ₹{row.cashRefunds.toFixed(2)}
                                            </td>
                                            <td className={row.cardRefunds > 0 ? 'negative-value' : 'zero-value'}>
                                                ₹{row.cardRefunds.toFixed(2)}
                                            </td>
                                            <td className={row.upiRefunds > 0 ? 'negative-value' : 'zero-value'}>
                                                ₹{row.upiRefunds.toFixed(2)}
                                            </td>
                                            <td className={row.bankRefunds > 0 ? 'negative-value' : 'zero-value'}>
                                                ₹{row.bankRefunds.toFixed(2)}
                                            </td>
                                            <td className={row.othersRefunds > 0 ? 'negative-value' : 'zero-value'}>
                                                ₹{row.othersRefunds.toFixed(2)}
                                            </td>
                                            <td className="transactions-cell">
                                                {row.transactions} ({row.paymentsCount} payments, {row.refundsCount} refunds)
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }

            {/* TRANSACTIONS TAB CONTENT */}
            {
                activeTab === 'transactions' && (
                    <div className="transactions-section">
                        <div className="transactions-table-container">
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
                                    {transactionsData.length === 0 ? (
                                        <tr>
                                            <td colSpan="9" className="no-data-cell">
                                                <div className="no-data-message">
                                                    <p style={{ fontSize: '18px', color: '#9ca3af', margin: '40px 0' }}>
                                                        📋 No transactions found for the selected date range
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        transactionsData.map((row, index) => (
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
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default FoodPaymentReport;
