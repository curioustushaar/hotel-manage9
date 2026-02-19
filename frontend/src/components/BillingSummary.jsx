import { CreditCard, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import './BillingSummary.css';

const BillingSummary = ({
    roomCharges = 0,
    discount = 0,
    tax = 0,
    totalAmount = 0,
    paidAmount = 0,
    balanceDue = 0,
    paymentMode = 'Cash',
    onPaymentModeChange = () => { },
    onPaidAmountChange = () => { },
    onTaxExemptChange = () => { },
    taxExempt = false
}) => {
    const paidPercentage = totalAmount > 0 ? Math.min(100, Math.round((paidAmount / totalAmount) * 100)) : 0;
    const isFullyPaid = balanceDue <= 0 && totalAmount > 0;

    return (
        <div className="billing-payment-dual-container">
            {/* Left Card: Billing Summary */}
            <div className="billing-card premium-card">
                <div className="card-header">
                    <div className="header-icon-title">
                        <FileText className="header-icon" size={20} />
                        <h3>Billing Summary</h3>
                    </div>
                </div>

                <div className="card-body">
                    <div className="summary-list">
                        <div className="summary-item">
                            <span className="label">Room Charges</span>
                            <span className="value">₹{roomCharges.toLocaleString('en-IN')}</span>
                        </div>

                        <div className="summary-item subtotal">
                            <span className="label">Subtotal</span>
                            <span className="value">₹{(roomCharges - discount).toLocaleString('en-IN')}</span>
                        </div>

                        <div className="summary-item">
                            <span className="label">Tax (12%)</span>
                            <span className="value">₹{tax.toLocaleString('en-IN')}</span>
                        </div>
                    </div>

                    <div className="total-amount-box">
                        <div className="total-label-group">
                            <CheckCircle2 size={18} className="total-icon" />
                            <span className="total-label">Total Amount</span>
                        </div>
                        <span className="total-value">₹{totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>

            {/* Right Card: Payment Details */}
            <div className="payment-card premium-card">
                <div className="card-header">
                    <div className="header-icon-title">
                        <CreditCard className="header-icon" size={20} />
                        <h3>Payment Details</h3>
                    </div>
                </div>

                <div className="card-body">
                    <div className="payment-form-group">
                        <label className="input-label">Payment Mode</label>
                        <select
                            className="premium-select"
                            value={paymentMode}
                            onChange={(e) => onPaymentModeChange(e.target.value)}
                        >
                            <option value="Cash">Cash</option>
                            <option value="Card">Card</option>
                            <option value="UPI">UPI / Online</option>
                            <option value="Cheque">Cheque</option>
                        </select>
                    </div>

                    <div className="payment-form-group">
                        <div className="premium-input-wrapper">
                            <span className="currency-symbol">₹</span>
                            <input
                                type="number"
                                className="premium-input"
                                value={paidAmount}
                                onChange={(e) => onPaidAmountChange(parseFloat(e.target.value) || 0)}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="payment-progress-container">
                        <div className="progress-bar-bg">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${paidPercentage}%` }}
                            ></div>
                        </div>
                        <span className="progress-label">{paidPercentage}% Paid</span>
                    </div>

                    <div className="toggle-group">
                        <div className="premium-toggle-row">
                            <span className="toggle-label">Tax Exempt</span>
                            <label className="premium-switch">
                                <input
                                    type="checkbox"
                                    checked={taxExempt}
                                    onChange={(e) => onTaxExemptChange(e.target.checked)}
                                />
                                <span className="switch-slider"></span>
                            </label>
                        </div>

                        <div className="premium-toggle-row">
                            <span className="toggle-label">Mark as Fully Paid</span>
                            <label className="premium-switch">
                                <input
                                    type="checkbox"
                                    checked={isFullyPaid}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            onPaidAmountChange(totalAmount);
                                        } else {
                                            onPaidAmountChange(0);
                                        }
                                    }}
                                />
                                <span className="switch-slider"></span>
                            </label>
                        </div>
                    </div>

                    <button
                        className={`balance-btn ${isFullyPaid ? 'fully-paid' : ''}`}
                        disabled={isFullyPaid}
                    >
                        {isFullyPaid ? (
                            <><CheckCircle2 size={16} /> FULLY PAID</>
                        ) : (
                            <><AlertCircle size={16} /> BALANCE REMAINING : ₹{balanceDue.toLocaleString('en-IN')}</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BillingSummary;

