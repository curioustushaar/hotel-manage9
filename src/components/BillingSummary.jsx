const BillingSummary = ({
    roomCharges = 0,
    discount = 0,
    tax = 0,
    totalAmount = 0,
    paidAmount = 0,
    balanceDue = 0,
    paymentMode = 'Cash',
    onPaymentModeChange = () => {},
    onPaidAmountChange = () => {},
    onTaxExemptChange = () => {},
    taxExempt = false
}) => {
    return (
        <div className="billing-summary-panel">
            <div className="panel-header">
                <h3>💰 Billing Summary</h3>
            </div>

            <div className="panel-body">
                <div className="summary-items">
                    <div className="summary-row">
                        <span className="label">Room Charges</span>
                        <span className="value">₹{roomCharges.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                    </div>

                    {discount > 0 && (
                        <div className="summary-row discount">
                            <span className="label">Discount</span>
                            <span className="value">-₹{discount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                        </div>
                    )}

                    <div className="summary-row total">
                        <span className="label">Subtotal</span>
                        <span className="value">₹{(roomCharges - discount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                    </div>

                    {!taxExempt && (
                        <div className="summary-row">
                            <span className="label">Tax (12%)</span>
                            <span className="value">₹{tax.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                        </div>
                    )}

                    <div className="summary-row total">
                        <span className="label">Total Amount</span>
                        <span className="value">₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                    </div>
                </div>

                <div className="summary-divider"></div>

                <div className="payment-details">
                    <h4>Payment Details</h4>
                    
                    <div className="form-row">
                        <label>Payment Mode</label>
                        <select
                            className="payment-select"
                            value={paymentMode}
                            onChange={(e) => onPaymentModeChange(e.target.value)}
                        >
                            <option value="Cash">Cash</option>
                            <option value="Card">Card</option>
                            <option value="Cheque">Cheque</option>
                            <option value="Online">Online Transfer</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="paid-amount-group">
                        <label>Paid Amount</label>
                        <input
                            type="number"
                            className="paid-amount-input"
                            value={paidAmount}
                            onChange={(e) => onPaidAmountChange(parseFloat(e.target.value) || 0)}
                            min="0"
                            max={totalAmount}
                        />
                    </div>

                    <label className="tax-exempt-checkbox">
                        <input
                            type="checkbox"
                            checked={taxExempt}
                            onChange={(e) => onTaxExemptChange(e.target.checked)}
                        />
                        Tax Exempt
                    </label>

                    <div className="summary-divider"></div>

                    {balanceDue > 0 ? (
                        <div className="summary-row balance" style={{ fontWeight: 'bold', color: '#c82333', padding: '0.6rem 0', margin: 0 }}>
                            <span className="label">Balance Due</span>
                            <span className="value">₹{balanceDue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                        </div>
                    ) : (
                        <div className="summary-row paid-full">
                            ✓ Fully Paid
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BillingSummary;
