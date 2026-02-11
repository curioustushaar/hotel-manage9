import React, { useState, useEffect } from 'react';
import './FolioOperations.css';
import AddPayment from './AddPayment';
import AddCharges from './AddCharges';
import ApplyDiscountSidebar from './ApplyDiscountSidebar';
import NewFolio from './NewFolio';
import RouteFolioSidebar from './RouteFolioSidebar';
import ConfirmationModal from './ConfirmationModal';
import Toast from './Toast';

const FolioOperations = ({ reservation }) => {
    const [selectedRoom, setSelectedRoom] = useState(0);
    const [showAddPayment, setShowAddPayment] = useState(false);
    const [showAddCharges, setShowAddCharges] = useState(false);
    const [showApplyDiscount, setShowApplyDiscount] = useState(false);
    const [showNewFolio, setShowNewFolio] = useState(false);
    const [showRoutingSection, setShowRoutingSection] = useState(false);
    const [showRouteFolioSidebar, setShowRouteFolioSidebar] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [pendingRouteData, setPendingRouteData] = useState(null);
    const [isProcessingRoute, setIsProcessingRoute] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null); // For three dot menu
    const [editingItem, setEditingItem] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [allTransactions, setAllTransactions] = useState([]); // Store all transactions
    const [loading, setLoading] = useState(true);
    const [folioList, setFolioList] = useState([]);
    const [allBookings, setAllBookings] = useState([]);
    const [toast, setToast] = useState(null);

    const API_URL = 'http://localhost:5001/api/bookings';

    // Fetch all bookings and current booking transactions on component load
    useEffect(() => {
        fetchAllBookings();
        if (reservation && (reservation.id || reservation._id)) {
            fetchTransactions();
        }
    }, [reservation]);

    // Fetch all IN_HOUSE bookings to populate folio list
    const fetchAllBookings = async () => {
        try {
            const response = await fetch(`${API_URL}/list`);
            const data = await response.json();
            
            if (data.success && data.data) {
                const inHouseBookings = data.data.filter(
                    booking => booking.status === 'Checked-in' || booking.status === 'Upcoming'
                );
                setAllBookings(inHouseBookings);
                
                // Create folio list from bookings
                const folios = inHouseBookings.map((booking, index) => ({
                    id: index,
                    name: `${booking.roomNumber} - ${booking.guestName}`,
                    roomNumber: booking.roomNumber,
                    guestName: booking.guestName,
                    bookingId: booking._id
                }));
                
                // Find current reservation's folio and make it first
                const currentBookingId = reservation?.id || reservation?._id;
                const currentIndex = folios.findIndex(f => f.bookingId === currentBookingId);
                if (currentIndex > 0) {
                    const currentFolio = folios.splice(currentIndex, 1)[0];
                    folios.unshift(currentFolio);
                    // Update IDs to maintain order
                    folios.forEach((f, i) => f.id = i);
                }
                
                setFolioList(folios);
                console.log('Populated folio list:', folios);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

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
                // Add folioId to existing transactions that don't have one (default to folio 0)
                const transactionsWithFolios = data.data.transactions.map(t => ({
                    ...t,
                    folioId: t.folioId !== undefined ? t.folioId : 0
                }));
                setAllTransactions(transactionsWithFolios);
                console.log('Set transactions:', transactionsWithFolios);
            } else {
                console.log('No transactions found or API error');
                setAllTransactions([]);
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
            user: 'current_user',
            folioId: selectedRoom // Associate with current folio
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
                
                // Show success toast
                setToast({
                    message: 'Charge added successfully!',
                    type: 'success'
                });
            } else {
                setToast({
                    message: `Failed to add charge: ${data.message}`,
                    type: 'error'
                });
            }
        } catch (error) {
            console.error('Error adding charge:', error);
            setToast({
                message: 'Failed to add charge. Please try again.',
                type: 'error'
            });
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
            user: 'current_user',
            folioId: selectedRoom // Associate with current folio
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
                
                // Show success toast
                setToast({
                    message: 'Payment added successfully!',
                    type: 'success'
                });
            } else {
                setToast({
                    message: `Failed to add payment: ${data.message}`,
                    type: 'error'
                });
            }
        } catch (error) {
            console.error('Error adding payment:', error);
            setToast({
                message: 'Failed to add payment. Please try again.',
                type: 'error'
            });
        }
    };

    // Handler for applying discount
    const handleApplyDiscount = async (discountData) => {
        const discountTypeDesc = [];
        if (discountData.roomWiseDiscount) discountTypeDesc.push('Room Wise');
        if (discountData.tableWiseDiscount) discountTypeDesc.push('Table Wise');

        // Calculate discount amount based on type
        const currentFolioTransactions = allTransactions.filter(t => t.folioId === selectedRoom);
        const currentCharges = currentFolioTransactions.filter(t => t.type === 'charge').reduce((sum, t) => sum + t.amount, 0);
        
        let discountAmount = 0;
        if (discountData.discountType === 'percentage') {
            discountAmount = (currentCharges * parseFloat(discountData.discountValue)) / 100;
        } else {
            discountAmount = parseFloat(discountData.discountValue);
        }

        const discountLabel = discountData.discountType === 'percentage' 
            ? `${discountData.discountValue}%` 
            : `₹${discountData.discountValue}`;

        const newTransaction = {
            type: 'discount',
            day: new Date(discountData.date).toLocaleDateString('en-GB', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                weekday: 'short'
            }),
            particulars: `Discount (${discountLabel})`,
            description: `${discountTypeDesc.join(' & ')} - ${discountData.comment || 'No comment'}`,
            amount: -discountAmount, // Negative amount to reduce total
            discountType: discountData.discountType,
            discountValue: discountData.discountValue,
            folio: discountData.folio,
            user: 'current_user',
            folioId: selectedRoom // Associate with current folio
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
                
                // Show success toast
                setToast({
                    message: 'Discount applied successfully!',
                    type: 'success'
                });
            } else {
                setToast({
                    message: `Failed to apply discount: ${data.message}`,
                    type: 'error'
                });
            }
        } catch (error) {
            console.error('Error applying discount:', error);
            setToast({
                message: 'Failed to apply discount. Please try again.',
                type: 'error'
            });
        }
    };

    // Handler for saving new folio
    const handleSaveNewFolio = async (folioData) => {
        console.log('New Folio Data:', folioData);
        
        try {
            // Find the selected guest
            const response = await fetch('http://localhost:5001/api/bookings/list');
            const data = await response.json();
            
            if (data.success && data.data) {
                const selectedGuest = data.data.find(booking => booking._id === folioData.customer);
                
                if (selectedGuest) {
                    // Add new folio to the list
                    const newFolio = {
                        id: folioList.length,
                        name: `${folioData.rooms} - ${selectedGuest.guestName}`,
                        roomNumber: folioData.rooms,
                        guestName: selectedGuest.guestName,
                        registrationNo: folioData.registrationNo
                    };
                    
                    setFolioList([...folioList, newFolio]);
                    setSelectedRoom(newFolio.id);
                }
            }
        } catch (error) {
            console.error('Error saving folio:', error);
        }
        
        setShowNewFolio(false);
    };

    // Handler for route folio save
    const handleRouteFolioSave = async (routeData) => {
        // Store route data and show confirmation modal
        setPendingRouteData(routeData);
        setShowConfirmationModal(true);
        setShowRouteFolioSidebar(false);
    };

    // Confirm and execute the routing
    const confirmRouting = async () => {
        if (!pendingRouteData) return;

        setIsProcessingRoute(true);

        try {
            const bookingId = reservation.id || reservation._id;
            
            // Get target folio's booking ID
            const targetFolio = folioList.find(f => f.id === pendingRouteData.targetFolioId);
            const targetBookingId = targetFolio?.bookingId;
            
            console.log('Routing Configuration:');
            console.log('- Source Booking ID:', bookingId);
            console.log('- Target Booking ID:', targetBookingId);
            console.log('- Source Folio ID:', pendingRouteData.sourceFolioId);
            console.log('- Target Folio ID:', pendingRouteData.targetFolioId);
            console.log('- Transaction IDs:', pendingRouteData.transactionIds);
            console.log('- Is Cross-Booking?', targetBookingId !== bookingId);
            
            const response = await fetch(`${API_URL}/${bookingId}/route-folio`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sourceFolioId: pendingRouteData.sourceFolioId,
                    targetFolioId: pendingRouteData.targetFolioId,
                    transactionIds: pendingRouteData.transactionIds,
                    routedBy: 'current_user',
                    targetBookingId: targetBookingId
                })
            });

            const data = await response.json();
            console.log('Routing Response:', data);

            if (data.success) {
                // Refresh all bookings and transactions
                await fetchAllBookings();
                await fetchTransactions();
                
                // Switch to target folio to show routed transactions
                setSelectedRoom(pendingRouteData.targetFolioId);
                
                // Show success toast
                setToast({
                    message: `Successfully routed ${pendingRouteData.transactionCount} charge(s) to ${pendingRouteData.targetFolioName}. The charges are now visible in ${pendingRouteData.targetFolioName}'s folio.`,
                    type: 'success'
                });
                
                // Hide routing section and show table
                setShowRoutingSection(false);
            } else {
                setToast({
                    message: `Failed to route charges: ${data.message}`,
                    type: 'error'
                });
            }
        } catch (error) {
            console.error('Error routing folio:', error);
            setToast({
                message: 'Failed to route charges. Please try again.',
                type: 'error'
            });
        } finally {
            setIsProcessingRoute(false);
            setShowConfirmationModal(false);
            setPendingRouteData(null);
        }
    };

    // Action handlers
    const handlePrint = (index) => {
        const item = currentFolioTransactions[index];
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
        setEditingItem({ ...currentFolioTransactions[index], index, transactionId: currentFolioTransactions[index]._id });
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
        const transaction = currentFolioTransactions[index];
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

    // Filter transactions for current folio
    const currentFolioTransactions = allTransactions.filter(t => t.folioId === selectedRoom);

    const calculateTotals = () => {
        const charges = currentFolioTransactions.filter(t => t.type === 'charge').reduce((sum, t) => sum + t.amount, 0);
        const discounts = Math.abs(currentFolioTransactions.filter(t => t.type === 'discount').reduce((sum, t) => sum + t.amount, 0));
        const payments = Math.abs(currentFolioTransactions.filter(t => t.type === 'payment').reduce((sum, t) => sum + t.amount, 0));
        const grandTotal = charges - discounts;
        const remaining = grandTotal - payments;

        return { subTotal: charges, grandTotal, paid: payments, remaining, discounts };
    };

    const totals = calculateTotals();

    return (
        <div className="folio-operations-container">
            {/* Left Panel - Room/Folio List */}
            <div className="room-folio-sidebar">
                <div className="folio-sidebar-header">
                    <h3 className="folio-sidebar-title">ROOM / FOLIO</h3>
                    <button className="sidebar-add-btn" onClick={() => {
                        console.log('New Folio button clicked');
                        setShowNewFolio(true);
                    }}>+</button>
                </div>
                <div className="room-folio-list">
                    {folioList.map((folio) => (
                        <div
                            key={folio.id}
                            className={`room-folio-item ${selectedRoom === folio.id ? 'active' : ''}`}
                            onClick={() => setSelectedRoom(folio.id)}
                        >
                            <div className="room-number">{folio.name}</div>
                        </div>
                    ))}
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
                    <div className="folio-ops-dropdown-container">
                        <button 
                            className="folio-action-btn btn-folio-ops" 
                            onClick={() => {
                                setShowRoutingSection(!showRoutingSection);
                            }}
                        >
                            Folio Operations
                        </button>
                    </div>
                </div>

                {/* Folio Routing Section - Blank area below payment options */}
                {showRoutingSection && (
                    <div className="folio-routing-section">
                        <div className="routing-header">
                            <button 
                                className="routing-back-btn"
                                onClick={() => setShowRoutingSection(false)}
                            >
                                ←
                            </button>
                            <h3 className="routing-header-title">Folio Operations</h3>
                        </div>
                        <div className="routing-options">
                            <div className="routing-option-text">
                                Folio Routing Operation
                            </div>
                            <button 
                                className="routing-option-button"
                                onClick={() => setShowRouteFolioSidebar(true)}
                            >
                                Folio Routing
                            </button>
                        </div>
                    </div>
                )}

                {/* Charges Table - Only show when routing section is hidden */}
                {!showRoutingSection && (
                    <div className="folio-table-container">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                            Loading transactions...
                        </div>
                    ) : currentFolioTransactions.length === 0 ? (
                        <div style={{ minHeight: '300px', background: 'white' }}>
                            {/* Blank white space */}
                        </div>
                    ) : (
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
                            {currentFolioTransactions.map((transaction, index) => (
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
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
                )}

                {/* Summary Footer - Only show when there are transactions */}
                {!loading && !showRoutingSection && currentFolioTransactions.length > 0 && (
                    <div className="folio-summary-section">
                        <div className="summary-grid">
                            <div className="summary-left">
                                <div className="summary-row">
                                    <span className="summary-label-text">Sub Total</span>
                                    <span className="summary-amount">₹ {totals.subTotal}</span>
                                </div>
                                {totals.discounts > 0 && (
                                    <div className="summary-row">
                                        <span className="summary-label-text">Discount</span>
                                        <span className="summary-amount discount-amount">- ₹ {totals.discounts}</span>
                                    </div>
                                )}
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
                                {totals.discounts > 0 && (
                                    <div className="summary-row-right">
                                        <span className="summary-label-text">Discount</span>
                                        <span className="summary-amount-right discount-amount">- ₹ {totals.discounts}</span>
                                    </div>
                                )}
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
                )}
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

            {/* New Folio Modal */}
            {showNewFolio && (
                <NewFolio 
                    onClose={() => setShowNewFolio(false)}
                    onSave={handleSaveNewFolio}
                />
            )}

            {/* Route Folio Sidebar */}
            {showRouteFolioSidebar && (
                <RouteFolioSidebar 
                    onClose={() => setShowRouteFolioSidebar(false)}
                    onSave={handleRouteFolioSave}
                    sourceFolioId={selectedRoom}
                    sourceFolioName={folioList.find(f => f.id === selectedRoom)?.name || ''}
                    availableFolios={folioList}
                    transactions={allTransactions}
                />
            )}

            {/* Confirmation Modal */}
            {showConfirmationModal && pendingRouteData && (
                <ConfirmationModal
                    isOpen={showConfirmationModal}
                    onClose={() => {
                        setShowConfirmationModal(false);
                        setPendingRouteData(null);
                    }}
                    onConfirm={confirmRouting}
                    title="Confirm Folio Routing"
                    message={`Are you sure you want to route ${pendingRouteData.transactionCount} charge(s) to ${pendingRouteData.targetFolioName}? This action will move the selected transactions from the current folio.`}
                    confirmText="Route Charges"
                    cancelText="Cancel"
                    isProcessing={isProcessingRoute}
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

            {/* Toast Notification */}
            {toast && (
                <Toast 
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default FolioOperations;

