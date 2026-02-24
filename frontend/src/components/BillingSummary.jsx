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
            <div className="billing-card premium-card-v2">
                <div className="card-header-v2">
                    <div className="header-icon-title">
                        <span className="header-icon-wrap">💰</span>
                        <h3>BILLING SUMMARY</h3>
                    </div>
                </div>

                <div className="card-body-v2">
                    <div className="card-body-left">
                        <div className="summary-item-v2">
                            <span className="label">Room Charges</span>
                            <span className="value">₹{roomCharges.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="summary-item-v2" style={{ marginTop: '20px' }}>
                            <span className="label">Tax (12%)</span>
                            <span className="value">₹{tax.toLocaleString('en-IN')}</span>
                        </div>
                    </div>

                    <div className="card-body-right">
                        <div className="summary-item-v2 align-right">
                            <span className="label">Subtotal</span>
                            <span className="value">₹{(roomCharges - discount).toLocaleString('en-IN')}</span>
                        </div>

                        <div className="total-amount-box-v2">
                            <span className="total-label-v2">GRAND TOTAL</span>
                            <span className="total-value-v2">₹{totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Card: Payment Details */}
            <div className="payment-card premium-card-v2">
                <div className="card-header-v2">
                    <div className="header-icon-title">
                        <span className="header-icon-wrap">💳</span>
                        <h3>PAYMENT DETAILS</h3>
                    </div>
                </div>

                <div className="card-body-v2">
                    <div className="card-body-left">
                        <div className="payment-form-group-v2">
                            <label className="input-label-v2">PAYMENT MODE</label>
                            <select
                                className="premium-select-v2"
                                value={paymentMode}
                                onChange={(e) => onPaymentModeChange(e.target.value)}
                            >
                                <option value="Cash">Cash</option>
                                <option value="Card">Card</option>
                                <option value="UPI">UPI / Online</option>
                                <option value="Cheque">Cheque</option>
                            </select>
                        </div>

                        <div className="payment-form-group-v2">
                            <label className="input-label-v2">ADVANCE / PAID AMOUNT</label>
                            <div className="premium-input-wrapper-v2">
                                <span className="currency-symbol-v2">₹</span>
                                <input
                                    type="number"
                                    className="premium-input-v2"
                                    value={paidAmount}
                                    onChange={(e) => onPaidAmountChange(parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card-body-right">
                        <div className="payment-progress-container-v2">
                            <div className="progress-bar-bg-v2">
                                <div
                                    className="progress-bar-fill-v2"
                                    style={{ width: `${paidPercentage}%` }}
                                ></div>
                            </div>
                            <span className="progress-label-v2">{paidPercentage}% Collected</span>
                        </div>

                        <div className="toggle-group-v2">
                            <div className="premium-checkbox-row">
                                <input
                                    type="checkbox"
                                    id="taxExempt"
                                    checked={taxExempt}
                                    onChange={(e) => onTaxExemptChange(e.target.checked)}
                                />
                                <label htmlFor="taxExempt">Tax Exempt</label>
                            </div>

                            <div className="premium-checkbox-row">
                                <input
                                    type="checkbox"
                                    id="markPaid"
                                    checked={isFullyPaid}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            onPaidAmountChange(totalAmount);
                                        } else {
                                            onPaidAmountChange(0);
                                        }
                                    }}
                                />
                                <label htmlFor="markPaid">Mark as Fully Paid</label>
                            </div>
                        </div>

                        <div className={`due-box-v2 ${balanceDue > 0 ? 'has-due' : 'is-clear'}`}>
                            <span className="due-icon">⚠️</span>
                            <span className="due-label">DUE: ₹{balanceDue.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillingSummary;

