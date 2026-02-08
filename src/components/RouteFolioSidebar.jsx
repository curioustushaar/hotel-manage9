import React, { useState, useEffect } from 'react';
import './RouteFolioSidebar.css';

const RouteFolioSidebar = ({ 
    onClose, 
    onSave, 
    sourceFolioId, 
    sourceFolioName,
    availableFolios,
    transactions 
}) => {
    const [targetFolioId, setTargetFolioId] = useState('');
    const [selectedTransactions, setSelectedTransactions] = useState(new Set());
    const [selectAll, setSelectAll] = useState(false);

    // Filter transactions for the source folio only (charges, not payments)
    const sourceFolioTransactions = transactions.filter(
        t => t.folioId === sourceFolioId && t.type === 'charge' && t.amount > 0
    );

    // Handle select all checkbox
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedTransactions(new Set());
        } else {
            const allIds = sourceFolioTransactions.map(t => t._id);
            setSelectedTransactions(new Set(allIds));
        }
        setSelectAll(!selectAll);
    };

    // Handle individual transaction selection
    const handleTransactionToggle = (transactionId) => {
        const newSelection = new Set(selectedTransactions);
        if (newSelection.has(transactionId)) {
            newSelection.delete(transactionId);
        } else {
            newSelection.add(transactionId);
        }
        setSelectedTransactions(newSelection);
        setSelectAll(newSelection.size === sourceFolioTransactions.length);
    };

    // Update selectAll state when transactions change
    useEffect(() => {
        setSelectAll(
            sourceFolioTransactions.length > 0 && 
            selectedTransactions.size === sourceFolioTransactions.length
        );
    }, [selectedTransactions, sourceFolioTransactions.length]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!targetFolioId) {
            alert('Please select a target folio');
            return;
        }

        if (selectedTransactions.size === 0) {
            alert('Please select at least one transaction to route');
            return;
        }

        if (parseInt(targetFolioId) === sourceFolioId) {
            alert('Source and target folio cannot be the same');
            return;
        }

        // Get target folio details
        const targetFolio = availableFolios.find(f => f.id === parseInt(targetFolioId));
        
        if (onSave) {
            onSave({
                sourceFolioId,
                targetFolioId: parseInt(targetFolioId),
                targetFolioName: targetFolio?.name || '',
                transactionIds: Array.from(selectedTransactions),
                transactionCount: selectedTransactions.size
            });
        }
    };

    // Calculate total amount of selected transactions
    const selectedTotal = sourceFolioTransactions
        .filter(t => selectedTransactions.has(t._id))
        .reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="route-folio-overlay" onClick={onClose}>
            <div className="route-folio-sidebar" onClick={(e) => e.stopPropagation()}>
                <div className="route-folio-header">
                    <h2>Route Folio</h2>
                    <button className="route-folio-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="route-folio-form">
                    <div className="route-folio-section">
                        <div className="source-folio-info">
                            <label className="route-label">Source Folio</label>
                            <div className="source-folio-badge">{sourceFolioName}</div>
                        </div>
                        
                        <label className="route-label">Target Folio <span className="required">*</span></label>
                        <select 
                            value={targetFolioId}
                            onChange={(e) => setTargetFolioId(e.target.value)}
                            className="route-select"
                            required
                        >
                            <option value="">Select Target Folio</option>
                            {availableFolios
                                .filter(folio => folio.id !== sourceFolioId)
                                .map(folio => (
                                    <option key={folio.id} value={folio.id}>
                                        {folio.name}
                                    </option>
                                ))
                            }
                        </select>
                    </div>

                    <div className="route-folio-section">
                        <div className="section-header">
                            <h3 className="route-section-title">Select Transactions to Route</h3>
                            {sourceFolioTransactions.length > 0 && (
                                <div className="select-all-container">
                                    <input 
                                        type="checkbox" 
                                        id="selectAll" 
                                        checked={selectAll} 
                                        onChange={handleSelectAll}
                                        className="route-checkbox"
                                    />
                                    <label htmlFor="selectAll" className="select-all-label">Select All</label>
                                </div>
                            )}
                        </div>

                        <div className="transactions-list">
                            {sourceFolioTransactions.length === 0 ? (
                                <div className="no-transactions">
                                    <p>No charges available to route in this folio</p>
                                </div>
                            ) : (
                                sourceFolioTransactions.map(transaction => (
                                    <div 
                                        key={transaction._id} 
                                        className={`transaction-item ${selectedTransactions.has(transaction._id) ? 'selected' : ''}`}
                                        onClick={() => handleTransactionToggle(transaction._id)}
                                    >
                                        <input 
                                            type="checkbox" 
                                            checked={selectedTransactions.has(transaction._id)}
                                            onChange={() => handleTransactionToggle(transaction._id)}
                                            className="route-checkbox"
                                        />
                                        <div className="transaction-details">
                                            <div className="transaction-main">
                                                <span className="transaction-particulars">{transaction.particulars}</span>
                                                <span className="transaction-amount">₹ {transaction.amount}</span>
                                            </div>
                                            <div className="transaction-meta">
                                                <span className="transaction-date">{transaction.day}</span>
                                                <span className="transaction-description">{transaction.description}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {selectedTransactions.size > 0 && (
                            <div className="routing-summary">
                                <div className="summary-row">
                                    <span>Selected Transactions:</span>
                                    <span className="summary-value">{selectedTransactions.size}</span>
                                </div>
                                <div className="summary-row total">
                                    <span>Total Amount:</span>
                                    <span className="summary-value">₹ {selectedTotal}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="route-folio-footer">
                        <button type="button" className="route-cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="route-save-btn"
                            disabled={selectedTransactions.size === 0 || !targetFolioId}
                        >
                            Route Charges
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RouteFolioSidebar;
