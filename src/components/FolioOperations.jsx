import React, { useState, useEffect } from 'react';
import './FolioOperations.css';
import AddPayment from './AddPayment';
import AddCharges from './AddCharges';
import ApplyDiscountSidebar from './ApplyDiscountSidebar';

const FolioOperations = ({ reservation }) => {
    const [selectedRoom, setSelectedRoom] = useState(0);
    const [showAddPayment, setShowAddPayment] = useState(false);
    const [showAddCharges, setShowAddCharges] = useState(false);
    const [showApplyDiscount, setShowApplyDiscount] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null); // For three dot menu
    const [editingItem, setEditingItem] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = 'http://localhost:5000/api/bookings';

    // Fetch transactions on component load
    useEffect(() => {
        if (reservation && (reservation.id || reservation._id)) {
            fetchTransactions();
        }
    }, [reservation]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const bookingId = reservation.id || reservation._id;
            console.log('Fetching transactions for booking:', bookingId);
            console.log('Full reservation object:', reservation);
            const response = await fetch(`${API_URL}/${bookingId}`);
            const data = await response.json();
            
            console.log('Fetched data:', data);
            console.log('Transactions from API:', data.data?.transactions);
            
            if (data.success && data.data.transactions) {
                setTransactions(data.data.transactions);
                console.log('Set transactions:', data.data.transactions);
            } else {
                console.log('No transactions found or API error');
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (activeMenu !== null && !e.target.closest('.action-menu-btn') && !e.target.closest('.action-dropdown')) {
                setActiveMenu(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [activeMenu]);

    if (!reservation) return null;

    // Handler for adding new charge
    const handleAddCharge = async (chargeData) => {
        const newTransaction = {
            type: 'charge',
            day: new Date(chargeData.date).toLocaleDateString('en-GB', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                weekday: 'short'
            }),
            particulars: chargeData.chargeType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            description: chargeData.description || `${chargeData.chargeType} - Qty: ${chargeData.quantity}`,
            amount: chargeData.totalAmount,
            user: 'current_user'
        };

        try {
            const bookingId = reservation.id || reservation._id;
            const response = await fetch(`${API_URL}/${bookingId}/transactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTransaction)
            });
            
            const data = await response.json();
            if (data.success) {
                await fetchTransactions();
                setShowAddCharges(false);
            }
        } catch (error) {
            console.error('Error adding charge:', error);
            alert('Failed to add charge. Please try again.');
        }
    };

    // Handler for adding new payment
    const handleAddPayment = async (paymentData) => {
        const newTransaction = {
            type: 'payment',
            day: new Date(paymentData.date).toLocaleDateString('en-GB', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                weekday: 'short'
            }),
            particulars: paymentData.paymentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            description: `Payment via ${paymentData.paymentType} ${paymentData.comment ? '- ' + paymentData.comment : ''}`,
            amount: -paymentData.amount,
            user: 'current_user'
        };

        try {
            const bookingId = reservation.id || reservation._id;
            const response = await fetch(`${API_URL}/${bookingId}/transactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTransaction)
            });
            
            const data = await response.json();
            if (data.success) {
                await fetchTransactions();
                setShowAddPayment(false);
            }
        } catch (error) {
            console.error('Error adding payment:', error);
            alert('Failed to add payment. Please try again.');
        }
    };

    // Handler for applying discount
    const handleApplyDiscount = async (discountData) => {
        const discountType = [];
        if (discountData.roomWiseDiscount) discountType.push('Room Wise');
        if (discountData.tableWiseDiscount) discountType.push('Table Wise');

        const newTransaction = {
            type: 'discount',
            day: new Date(discountData.date).toLocaleDateString('en-GB', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                weekday: 'short'
            }),
            particulars: `Discount (${discountData.discountPercent}%)`,
            description: `${discountType.join(' & ')} - ${discountData.comment || 'No comment'}`,
            amount: 0, // Calculate actual discount amount based on bill
            discountPercent: discountData.discountPercent,
            folio: discountData.folio,
            user: 'current_user'
        };

        try {
            const bookingId = reservation.id || reservation._id;
            const response = await fetch(`${API_URL}/${bookingId}/transactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTransaction)
            });
            
            const data = await response.json();
            if (data.success) {
                await fetchTransactions();
                setShowApplyDiscount(false);
            }
        } catch (error) {
            console.error('Error applying discount:', error);
        }
    };

    // Action handlers
    const handlePrint = (index) => {
        const item = transactions[index];
        const printContent = `
===========================================
       TRANSACTION RECEIPT
===========================================

Date:        ${item.day}
Type:        ${item.particulars}
Description: ${item.description}
Amount:      ₹ ${Math.abs(item.amount)}
User:        ${item.user}

===========================================
        Thank you for choosing us!
===========================================
        `;
        
        // Create a downloadable text file
        const blob = new Blob([printContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Receipt_${item.particulars}_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        setActiveMenu(null);
    };

    const handleEdit = (index) => {
        setEditingItem({ ...transactions[index], index, transactionId: transactions[index]._id });
        setShowEditModal(true);
        setActiveMenu(null);
    };

    const handleSaveEdit = async () => {
        if (editingItem && editingItem.transactionId) {
            try {
                const bookingId = reservation.id || reservation._id;
                const response = await fetch(`${API_URL}/${bookingId}/transactions/${editingItem.transactionId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        particulars: editingItem.particulars,
                        description: editingItem.description,
                        amount: editingItem.amount
                    })
                });
                
                const data = await response.json();
                if (data.success) {
                    await fetchTransactions();
                    setShowEditModal(false);
                    setEditingItem(null);
                }
            } catch (error) {
                console.error('Error updating transaction:', error);
                alert('Failed to update transaction. Please try again.');
            }
        }
    };

    const handleVoid = async (index) => {
        const transaction = transactions[index];
        if (transaction._id) {
            try {
                const bookingId = reservation.id || reservation._id;
                const response = await fetch(`${API_URL}/${bookingId}/transactions/${transaction._id}`, {
                    method: 'DELETE'
                });
                
                const data = await response.json();
                if (data.success) {
                    await fetchTransactions();
                }
            } catch (error) {
                console.error('Error deleting transaction:', error);
                alert('Failed to delete transaction. Please try again.');
            }
        }
        setActiveMenu(null);
    };

    const toggleMenu = (index) => {
        setActiveMenu(activeMenu === index ? null : index);
    };

    const calculateTotals = () => {
        const charges = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
        const payments = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
        const grandTotal = charges;
        const remaining = grandTotal - payments;

        return { subTotal: charges, grandTotal, paid: payments, remaining };
    };

    const totals = calculateTotals();

    return (
        <div className="folio-operations-container">
            {/* Left Panel - Room/Folio List */}
            <div className="room-folio-sidebar">
                <div className="folio-sidebar-header">
                    <h3 className="folio-sidebar-title">ROOM / FOLIO</h3>
                    <button className="sidebar-add-btn" onClick={() => {
                        console.log('Add button clicked');
                        setShowAddPayment(true);
                    }}>+</button>
                </div>
                <div className="room-folio-list">
                    <div
                        className={`room-folio-item ${selectedRoom === 0 ? 'active' : ''}`}
                        onClick={() => setSelectedRoom(0)}
                    >
                        <div className="room-number">Deluxe-102</div>
                    </div>
                    <div
                        className="room-folio-item"
                        onClick={() => setSelectedRoom(1)}
                    >
                        <div className="room-number">B2 - Mr. Shahrukh Ahmed</div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Main Content */}
            <div className="folio-main-content">
                {/* Action Buttons */}
                <div className="folio-action-buttons">
                    <button className="folio-action-btn" onClick={() => {
                        console.log('Add Payment clicked');
                        setShowAddPayment(true);
                    }}>Add Payment</button>
                    <button className="folio-action-btn" onClick={() => setShowAddCharges(true)}>Add Charges</button>
                    <button className="folio-action-btn btn-apply-discount" onClick={() => setShowApplyDiscount(true)}>Apply Discount</button>
                    <button className="folio-action-btn btn-folio-ops">Folio Operations</button>
                </div>

                {/* Charges Table */}
                <div className="folio-table-container">
                    <table className="folio-charges-table">
                        <thead>
                            <tr>
                                <th>
                                    <input type="checkbox" />
                                </th>
                                <th>DAY</th>
                                <th>PARTICULARS</th>
                                <th>DESCRIPTION</th>
                                <th style={{ textAlign: 'right' }}>AMOUNT</th>
                                <th style={{ textAlign: 'right' }}>USER</th>
                                <th style={{ textAlign: 'center', width: '60px' }}>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                        Loading transactions...
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                                        No transactions yet. Add charges or payments to get started.
                                    </td>
                                </tr>
                            ) : (
                            transactions.map((transaction, index) => (
                                <tr key={transaction._id || index}>
                                    <td>
                                        <input type="checkbox" />
                                    </td>
                                    <td>{transaction.day}</td>
                                    <td>
                                        <span className={transaction.type === 'payment' ? 'payment-badge' : ''}>
                                            {transaction.particulars}
                                        </span>
                                    </td>
                                    <td>{transaction.description}</td>
                                    <td className={`amount-cell ${transaction.amount < 0 ? 'payment-amount' : ''}`}>
                                        {Math.abs(transaction.amount)}
                                    </td>
                                    <td>{transaction.user}</td>
                                    <td style={{ textAlign: 'center', position: 'relative' }}>
                                        <button 
                                            className="action-menu-btn"
                                            onClick={() => toggleMenu(index)}
                                        >
                                            ⋮
                                        </button>
                                        {activeMenu === index && (
                                            <div className="action-dropdown">
                                                <button onClick={() => handlePrint(index)}>🖨️ Print</button>
                                                <button onClick={() => handleEdit(index)}>✏️ Edit</button>
                                                <button onClick={() => handleVoid(index)}>🗑️ Void</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )))}
                        </tbody>
                    </table>
                </div>

                {/* Summary Footer */}
                <div className="folio-summary-section">
                    <div className="summary-grid">
                        <div className="summary-left">
                            <div className="summary-row">
                                <span className="summary-label-text">Sub Total</span>
                                <span className="summary-amount">₹ {totals.subTotal}</span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label-text">Grand Total</span>
                                <span className="summary-amount grand-total">₹ {totals.grandTotal}</span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label-text">Paid</span>
                                <span className="summary-amount">₹ {totals.paid}</span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label-text">Remaining</span>
                                <span className="summary-amount remaining">₹ {totals.remaining}</span>
                            </div>
                        </div>
                        <div className="summary-right">
                            <div className="summary-row-right">
                                <span className="summary-label-text">Subtotal</span>
                                <span className="summary-amount-right">₹ {totals.subTotal}</span>
                            </div>
                            <div className="summary-row-right">
                                <span className="summary-label-text">Grand Total</span>
                                <span className="summary-amount-right">₹ {totals.grandTotal}</span>
                            </div>
                            <div className="summary-row-right">
                                <span className="summary-label-text">Balance</span>
                                <span className="summary-amount-right">₹ {totals.remaining}</span>
                            </div>
                            <div className="summary-row-right">
                                <span className="summary-label-text">Paid</span>
                                <span className="summary-amount-right paid">₹ {totals.paid}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Payment Modal */}
            {showAddPayment && (
                <AddPayment 
                    onClose={() => setShowAddPayment(false)}
                    onAdd={handleAddPayment}
                    reservation={reservation}
                />
            )}

            {/* Add Charges Modal */}
            {showAddCharges && (
                <AddCharges 
                    onClose={() => setShowAddCharges(false)}
                    onAdd={handleAddCharge}
                    reservation={reservation}
                />
            )}

            {/* Apply Discount Sidebar */}
            {showApplyDiscount && (
                <ApplyDiscountSidebar 
                    onClose={() => setShowApplyDiscount(false)}
                    onApply={handleApplyDiscount}
                    reservation={reservation}
                />
            )}

            {/* Edit Modal */}
            {showEditModal && editingItem && (
                <div className="edit-transaction-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="edit-transaction-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Edit Transaction</h3>
                        <div className="edit-form">
                            <div className="edit-field">
                                <label>Particulars</label>
                                <input 
                                    type="text" 
                                    value={editingItem.particulars}
                                    onChange={(e) => setEditingItem({...editingItem, particulars: e.target.value})}
                                />
                            </div>
                            <div className="edit-field">
                                <label>Description</label>
                                <textarea 
                                    value={editingItem.description}
                                    onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                                />
                            </div>
                            <div className="edit-field">
                                <label>Amount</label>
                                <input 
                                    type="number" 
                                    value={Math.abs(editingItem.amount)}
                                    onChange={(e) => setEditingItem({...editingItem, amount: editingItem.amount < 0 ? -Math.abs(parseFloat(e.target.value)) : Math.abs(parseFloat(e.target.value))})}
                                />
                            </div>
                            <div className="edit-actions">
                                <button className="btn-cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
                                <button className="btn-save" onClick={handleSaveEdit}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FolioOperations;
