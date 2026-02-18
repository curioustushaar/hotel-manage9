import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLES, SUBSCRIPTION_TIERS } from '../../config/rbac';
import { getSubscriptionPricing, getUpgradeSuggestions } from '../../utils/subscriptionCheck';
import { motion } from 'framer-motion';
import './SubscriptionManager.css';

/**
 * Subscription Manager Component
 * Super Admin-only interface for managing subscriptions
 */
const SubscriptionManager = () => {
    const { user } = useAuth();
    const [selectedTier, setSelectedTier] = useState(SUBSCRIPTION_TIERS.PRO);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    // Only Super Admin can access
    if (user.role !== ROLES.SUPER_ADMIN) {
        return (
            <div className="subscription-denied">
                <h3>🔒 Super Admin Access Only</h3>
                <p>Subscription management requires Super Admin privileges</p>
            </div>
        );
    }

    const pricing = getSubscriptionPricing();
    const suggestions = getUpgradeSuggestions(user.subscriptionTier, 80, 15); // Mock: 80 rooms, 15 staff

    const tierFeatures = {
        [SUBSCRIPTION_TIERS.BASIC]: [
            'Up to 20 rooms',
            'Up to 5 staff members',
            'Basic reports',
            'QR code generation',
            'KOT system',
            'Email support',
            'Mobile app access'
        ],
        [SUBSCRIPTION_TIERS.PRO]: [
            'Up to 100 rooms',
            'Up to 20 staff members',
            'Advanced reports & analytics',
            'Activity logs & audit trail',
            'Priority email & phone support',
            'Custom branding',
            'API access (limited)',
            'All Basic features'
        ],
        [SUBSCRIPTION_TIERS.ENTERPRISE]: [
            'Unlimited rooms',
            'Unlimited staff members',
            'Multi-hotel management',
            'Custom integrations',
            'Dedicated account manager',
            '24/7 premium support',
            'Full API access',
            'White-label solution',
            'All Pro features'
        ]
    };

    const getTierColor = (tier) => {
        switch (tier) {
            case SUBSCRIPTION_TIERS.BASIC: return '#3b82f6';
            case SUBSCRIPTION_TIERS.PRO: return '#8b5cf6';
            case SUBSCRIPTION_TIERS.ENTERPRISE: return '#f59e0b';
            default: return '#6b7280';
        }
    };

    const getTierIcon = (tier) => {
        switch (tier) {
            case SUBSCRIPTION_TIERS.BASIC: return '🌱';
            case SUBSCRIPTION_TIERS.PRO: return '🚀';
            case SUBSCRIPTION_TIERS.ENTERPRISE: return '👑';
            default: return '📦';
        }
    };

    return (
        <div className="subscription-manager">
            <div className="subscription-header">
                <div>
                    <h2>💳 Subscription Management</h2>
                    <p className="subscription-subtitle">Manage plans and billing for your organization</p>
                </div>
                <div className="current-plan-badge" style={{ background: `${getTierColor(user.subscriptionTier)}20`, border: `2px solid ${getTierColor(user.subscriptionTier)}` }}>
                    <span style={{ fontSize: '20px' }}>{getTierIcon(user.subscriptionTier)}</span>
                    <div>
                        <small>Current Plan</small>
                        <strong style={{ color: getTierColor(user.subscriptionTier) }}>{user.subscriptionTier}</strong>
                    </div>
                </div>
            </div>

            {/* Upgrade Suggestions */}
            {suggestions.length > 0 && (
                <div className="upgrade-suggestions">
                    <h3>💡 Recommended Upgrades</h3>
                    <div className="suggestions-grid">
                        {suggestions.map((suggestion, index) => (
                            <div key={index} className="suggestion-card">
                                <span className="suggestion-icon">⚠️</span>
                                <div className="suggestion-content">
                                    <strong>{suggestion.reason}</strong>
                                    <p>{suggestion.message}</p>
                                    <button
                                        className="upgrade-btn-small"
                                        onClick={() => {
                                            setSelectedTier(suggestion.suggestedTier);
                                            setShowUpgradeModal(true);
                                        }}
                                    >
                                        Upgrade to {suggestion.suggestedTier} →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Pricing Plans */}
            <div className="pricing-section">
                <h3>Available Plans</h3>
                <div className="pricing-grid">
                    {Object.values(SUBSCRIPTION_TIERS).map(tier => {
                        const plan = pricing[tier];
                        const isCurrentPlan = tier === user.subscriptionTier;
                        const isPopular = plan.popular;

                        return (
                            <motion.div
                                key={tier}
                                className={`pricing-card ${isCurrentPlan ? 'current' : ''} ${isPopular ? 'popular' : ''}`}
                                whileHover={{ y: -5 }}
                                transition={{ duration: 0.2 }}
                            >
                                {isPopular && <div className="popular-badge">Most Popular</div>}
                                {isCurrentPlan && <div className="current-badge">Current Plan</div>}

                                <div className="pricing-header" style={{ background: `linear-gradient(135deg, ${getTierColor(tier)} 0%, ${getTierColor(tier)}dd 100%)` }}>
                                    <span className="tier-icon">{getTierIcon(tier)}</span>
                                    <h4>{tier}</h4>
                                    <div className="pricing-amount">
                                        {typeof plan.price === 'number' ? (
                                            <>
                                                <span className="currency">₹</span>
                                                <span className="price">{plan.price.toLocaleString()}</span>
                                                <span className="period">/month</span>
                                            </>
                                        ) : (
                                            <span className="custom-price">{plan.price}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="pricing-features">
                                    {tierFeatures[tier].map((feature, index) => (
                                        <div key={index} className="feature-item">
                                            <span className="feature-check">✓</span>
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    className={`plan-action-btn ${isCurrentPlan ? 'current-plan-btn' : ''}`}
                                    onClick={() => {
                                        if (!isCurrentPlan) {
                                            setSelectedTier(tier);
                                            setShowUpgradeModal(true);
                                        }
                                    }}
                                    disabled={isCurrentPlan}
                                >
                                    {isCurrentPlan ? 'Active Plan' : tier === SUBSCRIPTION_TIERS.ENTERPRISE ? 'Contact Sales' : 'Upgrade Now'}
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Usage Stats */}
            <div className="usage-stats">
                <h3>Current Usage</h3>
                <div className="stats-grid">
                    <div className="stat-box">
                        <div className="stat-icon">🏨</div>
                        <div className="stat-details">
                            <span className="stat-label">Rooms</span>
                            <span className="stat-value">80 / 100</span>
                            <div className="stat-bar">
                                <div className="stat-progress" style={{ width: '80%', background: getTierColor(user.subscriptionTier) }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="stat-box">
                        <div className="stat-icon">👥</div>
                        <div className="stat-details">
                            <span className="stat-label">Staff Members</span>
                            <span className="stat-value">15 / 20</span>
                            <div className="stat-bar">
                                <div className="stat-progress" style={{ width: '75%', background: getTierColor(user.subscriptionTier) }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="stat-box">
                        <div className="stat-icon">📊</div>
                        <div className="stat-details">
                            <span className="stat-label">API Calls (This Month)</span>
                            <span className="stat-value">12,458</span>
                            <small className="stat-note">No limit on current plan</small>
                        </div>
                    </div>

                    <div className="stat-box">
                        <div className="stat-icon">💾</div>
                        <div className="stat-details">
                            <span className="stat-label">Storage Used</span>
                            <span className="stat-value">2.4 GB / 10 GB</span>
                            <div className="stat-bar">
                                <div className="stat-progress" style={{ width: '24%', background: getTierColor(user.subscriptionTier) }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Billing History */}
            <div className="billing-history">
                <h3>Billing History</h3>
                <table className="billing-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Invoice</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Feb 1, 2026</td>
                            <td>Pro Plan - Monthly</td>
                            <td>₹2,999</td>
                            <td><span className="status-badge success">Paid</span></td>
                            <td><button className="download-btn">📥 Download</button></td>
                        </tr>
                        <tr>
                            <td>Jan 1, 2026</td>
                            <td>Pro Plan - Monthly</td>
                            <td>₹2,999</td>
                            <td><span className="status-badge success">Paid</span></td>
                            <td><button className="download-btn">📥 Download</button></td>
                        </tr>
                        <tr>
                            <td>Dec 1, 2025</td>
                            <td>Basic Plan - Monthly</td>
                            <td>₹999</td>
                            <td><span className="status-badge success">Paid</span></td>
                            <td><button className="download-btn">📥 Download</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Upgrade Modal */}
            {showUpgradeModal && (
                <div className="modal-overlay" onClick={() => setShowUpgradeModal(false)}>
                    <motion.div
                        className="upgrade-modal"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <h3>Upgrade to {selectedTier}?</h3>
                        <p>You're about to upgrade your subscription. This will take effect immediately.</p>
                        <div className="modal-actions">
                            <button className="modal-cancel" onClick={() => setShowUpgradeModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="modal-confirm"
                                onClick={() => {
                                    alert(`Subscription upgraded to ${selectedTier}!`);
                                    setShowUpgradeModal(false);
                                }}
                            >
                                Confirm Upgrade
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionManager;
