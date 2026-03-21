import { CreditCard, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import './BillingSummary.css';

const BillingSummary = ({
    roomCharges = 0,
    discount = 0,
    autoDiscount = 0,
    autoDiscountNames = [],
    manualDiscount = 0,
    manualDiscountType = 'FLAT',
    manualDiscountValue = 0,
    manualDiscountPercent = 0,
    tax = 0,
    taxLabel = '',
    serviceCharge = 0,
    serviceChargeLabel = 'Service Charge',
    totalAmount = 0,
    grossTotal = 0,
    paidAmount = 0,
    balanceDue = 0,
    paymentMode = 'Cash',
    onPaymentModeChange = () => { },
    onPaidAmountChange = () => { },
    onManualDiscountChange = () => { },
    onManualDiscountTypeChange = () => { },
    onTaxExemptChange = () => { },
    taxExempt = false,
    transactionId = '',
    onTransactionIdChange = () => { }
}) => {
    const { getCurrencySymbol, settings } = useSettings();
    const cs = getCurrencySymbol();
    const paidPercentage = totalAmount > 0 ? Math.min(100, Math.round((paidAmount / totalAmount) * 100)) : 0;
    const isFullyPaid = balanceDue <= 0 && totalAmount > 0;

    const roomGstPct = parseFloat(settings.roomGst) || 12;
    const isInclusive = settings.inclusiveTax;
    const pm = settings.paymentModes || {};
    const resolvedTaxLabel = taxLabel || `Tax (${roomGstPct}%)${isInclusive ? ' (incl.)' : ''}`;

    // Build enabled payment options
    const paymentOptions = [
        pm.cash !== false && { value: 'Cash', label: 'Cash' },
        pm.upi !== false && { value: 'UPI', label: 'UPI / Online' },
        pm.card !== false && { value: 'Card', label: 'Card' },
        pm.bankTransfer && { value: 'Bank Transfer', label: 'Bank Transfer' },
        { value: 'Cheque', label: 'Cheque' },
    ].filter(Boolean);

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
                            <span className="value">{cs}{roomCharges.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="summary-item-v2" style={{ marginTop: '20px' }}>
                            <span className="label">{resolvedTaxLabel}</span>
                            <span className="value">{cs}{tax.toLocaleString('en-IN')}</span>
                        </div>
                        {serviceCharge > 0 && (
                            <div className="summary-item-v2" style={{ marginTop: '10px' }}>
                                <span className="label">{serviceChargeLabel}</span>
                                <span className="value">{cs}{serviceCharge.toLocaleString('en-IN')}</span>
                            </div>
                        )}
                        {autoDiscount > 0 && (
                            <div className="summary-item-v2" style={{ marginTop: '10px' }}>
                                <span className="label">
                                    Auto Discount
                                    {autoDiscountNames.length > 0 ? ` (${autoDiscountNames.join(', ')})` : ''}
                                </span>
                                <span className="value" style={{ color: '#059669' }}>-{cs}{Math.round(autoDiscount).toLocaleString('en-IN')}</span>
                            </div>
                        )}
                    </div>

                    <div className="card-body-right">
                        <div className="summary-item-v2 align-right">
                            <span className="label">Subtotal</span>
                            <span className="value">{cs}{(roomCharges - discount).toLocaleString('en-IN')}</span>
                        </div>

                        <div className="total-amount-box-v2">
                            <span className="total-label-v2">GRAND TOTAL</span>
                            <span className="total-value-v2">{cs}{totalAmount.toLocaleString('en-IN')}</span>
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
                                {paymentOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {paymentMode !== 'Cash' && (
                            <div className="payment-form-group-v2">
                                <label className="input-label-v2">TRANSACTION ID <span className="req-star">*</span></label>
                                <div className="premium-input-wrapper-v2">
                                    <input
                                        type="text"
                                        className="premium-input-v2"
                                        value={transactionId}
                                        onChange={(e) => onTransactionIdChange(e.target.value)}
                                        placeholder="Enter transaction ID"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="payment-form-group-v2">
                            <label className="input-label-v2">ADVANCE / PAID AMOUNT</label>
                            <div className="premium-input-wrapper-v2">
                                <input
                                    type="number"
                                    className="premium-input-v2"
                                    value={paidAmount}
                                    onChange={(e) => {
                                        const value = parseFloat(e.target.value) || 0;
                                        if (value > totalAmount) {
                                            onPaidAmountChange(totalAmount);
                                        } else {
                                            onPaidAmountChange(e.target.value);
                                        }
                                    }}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="payment-form-group-v2">
                            <label className="input-label-v2">DISCOUNT</label>
                            <div className="discount-toggle-v2">
                                <button
                                    type="button"
                                    className={`discount-toggle-btn-v2 ${manualDiscountType === 'FLAT' ? 'active' : ''}`}
                                    onClick={() => onManualDiscountTypeChange('FLAT')}
                                >
                                    {cs}
                                </button>
                                <button
                                    type="button"
                                    className={`discount-toggle-btn-v2 ${manualDiscountType === 'PERCENTAGE' ? 'active' : ''}`}
                                    onClick={() => onManualDiscountTypeChange('PERCENTAGE')}
                                >
                                    %
                                </button>
                            </div>
                            <div className="premium-input-wrapper-v2 discount-input-wrap-v2">
                                {manualDiscountType === 'FLAT' ? (
                                    <span className="currency-prefix-v2">{cs}</span>
                                ) : (
                                    <span className="percent-prefix-v2">%</span>
                                )}
                                <input
                                    type="number"
                                    className="premium-input-v2"
                                    min="0"
                                    max={manualDiscountType === 'PERCENTAGE' ? 100 : grossTotal}
                                    value={manualDiscountValue}
                                    onChange={(e) => {
                                        const rawValue = e.target.value;
                                        if (rawValue === '') {
                                            onManualDiscountChange('');
                                            return;
                                        }

                                        const value = Math.max(0, parseFloat(rawValue) || 0);
                                        const capped = manualDiscountType === 'PERCENTAGE'
                                            ? Math.min(value, 100)
                                            : Math.min(value, grossTotal);
                                        onManualDiscountChange(capped);
                                    }}
                                    placeholder={manualDiscountType === 'PERCENTAGE' ? 'Enter discount %' : 'Enter discount amount'}
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
                            <span className="due-label">DUE: {cs}{balanceDue.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>

                {manualDiscount > 0 && (
                    <div className="discount-applied-note-v2">
                        Discount Applied: {cs}{manualDiscount.toLocaleString('en-IN')} ({manualDiscountPercent.toFixed(2)}%)
                    </div>
                )}
            </div>
        </div>
    );
};

export default BillingSummary;

