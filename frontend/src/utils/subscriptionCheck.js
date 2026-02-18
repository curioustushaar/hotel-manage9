// Subscription Check Utility
// Helper functions for checking subscription features and combined permissions

import { SUBSCRIPTION_TIERS, SUBSCRIPTION_FEATURES } from '../config/rbac';

/**
 * Check if a subscription tier has a specific feature
 */
export const hasSubscriptionFeature = (subscriptionTier, feature) => {
    if (!SUBSCRIPTION_FEATURES[subscriptionTier]) {
        return false;
    }
    return SUBSCRIPTION_FEATURES[subscriptionTier][feature] || false;
};

/**
 * Get all features for a subscription tier
 */
export const getSubscriptionFeatures = (subscriptionTier) => {
    return SUBSCRIPTION_FEATURES[subscriptionTier] || {};
};

/**
 * Compare subscription tiers
 */
export const compareSubscriptionTiers = () => {
    return {
        tiers: [SUBSCRIPTION_TIERS.BASIC, SUBSCRIPTION_TIERS.PRO, SUBSCRIPTION_TIERS.ENTERPRISE],
        comparison: {
            maxRooms: {
                [SUBSCRIPTION_TIERS.BASIC]: SUBSCRIPTION_FEATURES[SUBSCRIPTION_TIERS.BASIC].maxRooms,
                [SUBSCRIPTION_TIERS.PRO]: SUBSCRIPTION_FEATURES[SUBSCRIPTION_TIERS.PRO].maxRooms,
                [SUBSCRIPTION_TIERS.ENTERPRISE]: 'Unlimited'
            },
            maxStaff: {
                [SUBSCRIPTION_TIERS.BASIC]: SUBSCRIPTION_FEATURES[SUBSCRIPTION_TIERS.BASIC].maxStaff,
                [SUBSCRIPTION_TIERS.PRO]: SUBSCRIPTION_FEATURES[SUBSCRIPTION_TIERS.PRO].maxStaff,
                [SUBSCRIPTION_TIERS.ENTERPRISE]: 'Unlimited'
            },
            advancedReports: {
                [SUBSCRIPTION_TIERS.BASIC]: SUBSCRIPTION_FEATURES[SUBSCRIPTION_TIERS.BASIC].advancedReports,
                [SUBSCRIPTION_TIERS.PRO]: SUBSCRIPTION_FEATURES[SUBSCRIPTION_TIERS.PRO].advancedReports,
                [SUBSCRIPTION_TIERS.ENTERPRISE]: SUBSCRIPTION_FEATURES[SUBSCRIPTION_TIERS.ENTERPRISE].advancedReports
            },
            activityLogs: {
                [SUBSCRIPTION_TIERS.BASIC]: SUBSCRIPTION_FEATURES[SUBSCRIPTION_TIERS.BASIC].activityLogs,
                [SUBSCRIPTION_TIERS.PRO]: SUBSCRIPTION_FEATURES[SUBSCRIPTION_TIERS.PRO].activityLogs,
                [SUBSCRIPTION_TIERS.ENTERPRISE]: SUBSCRIPTION_FEATURES[SUBSCRIPTION_TIERS.ENTERPRISE].activityLogs
            },
            multiHotel: {
                [SUBSCRIPTION_TIERS.BASIC]: SUBSCRIPTION_FEATURES[SUBSCRIPTION_TIERS.BASIC].multiHotel,
                [SUBSCRIPTION_TIERS.PRO]: SUBSCRIPTION_FEATURES[SUBSCRIPTION_TIERS.PRO].multiHotel,
                [SUBSCRIPTION_TIERS.ENTERPRISE]: SUBSCRIPTION_FEATURES[SUBSCRIPTION_TIERS.ENTERPRISE].multiHotel
            },
            analytics: {
                [SUBSCRIPTION_TIERS.BASIC]: SUBSCRIPTION_FEATURES[SUBSCRIPTION_TIERS.BASIC].analytics,
                [SUBSCRIPTION_TIERS.PRO]: SUBSCRIPTION_FEATURES[SUBSCRIPTION_TIERS.PRO].analytics,
                [SUBSCRIPTION_TIERS.ENTERPRISE]: SUBSCRIPTION_FEATURES[SUBSCRIPTION_TIERS.ENTERPRISE].analytics
            }
        }
    };
};

/**
 * Get pricing for each tier (mock data)
 */
export const getSubscriptionPricing = () => {
    return {
        [SUBSCRIPTION_TIERS.BASIC]: {
            price: 999,
            currency: 'INR',
            billing: 'per month',
            features: [
                'Up to 20 rooms',
                'Up to 5 staff members',
                'Basic reports',
                'QR code generation',
                'KOT system',
                'Email support'
            ]
        },
        [SUBSCRIPTION_TIERS.PRO]: {
            price: 2999,
            currency: 'INR',
            billing: 'per month',
            features: [
                'Up to 100 rooms',
                'Up to 20 staff members',
                'Advanced reports',
                'Activity logs',
                'Analytics dashboard',
                'Priority support',
                'All Basic features'
            ],
            popular: true
        },
        [SUBSCRIPTION_TIERS.ENTERPRISE]: {
            price: 'Custom',
            currency: 'INR',
            billing: 'contact sales',
            features: [
                'Unlimited rooms',
                'Unlimited staff',
                'Multi-hotel management',
                'Custom integrations',
                'Dedicated support',
                'API access',
                'All Pro features'
            ]
        }
    };
};

/**
 * Check if user can add more rooms based on subscription
 */
export const canAddRoom = (currentRoomCount, subscriptionTier) => {
    const maxRooms = SUBSCRIPTION_FEATURES[subscriptionTier]?.maxRooms;
    if (maxRooms === Infinity) return true;
    return currentRoomCount < maxRooms;
};

/**
 * Check if user can add more staff based on subscription
 */
export const canAddStaff = (currentStaffCount, subscriptionTier) => {
    const maxStaff = SUBSCRIPTION_FEATURES[subscriptionTier]?.maxStaff;
    if (maxStaff === Infinity) return true;
    return currentStaffCount < maxStaff;
};

/**
 * Get upgrade suggestions based on current usage
 */
export const getUpgradeSuggestions = (currentTier, roomCount, staffCount) => {
    const suggestions = [];

    if (currentTier === SUBSCRIPTION_TIERS.BASIC) {
        const basicFeatures = SUBSCRIPTION_FEATURES[SUBSCRIPTION_TIERS.BASIC];

        if (roomCount >= basicFeatures.maxRooms * 0.8) {
            suggestions.push({
                reason: 'Room limit',
                message: `You're using ${roomCount} of ${basicFeatures.maxRooms} rooms. Upgrade to Pro for up to 100 rooms.`,
                suggestedTier: SUBSCRIPTION_TIERS.PRO
            });
        }

        if (staffCount >= basicFeatures.maxStaff * 0.8) {
            suggestions.push({
                reason: 'Staff limit',
                message: `You're using ${staffCount} of ${basicFeatures.maxStaff} staff members. Upgrade to Pro for up to 20 staff.`,
                suggestedTier: SUBSCRIPTION_TIERS.PRO
            });
        }

        suggestions.push({
            reason: 'Features',
            message: 'Unlock advanced reports and activity logs with Pro plan.',
            suggestedTier: SUBSCRIPTION_TIERS.PRO
        });
    }

    if (currentTier === SUBSCRIPTION_TIERS.PRO) {
        const proFeatures = SUBSCRIPTION_FEATURES[SUBSCRIPTION_TIERS.PRO];

        if (roomCount >= proFeatures.maxRooms * 0.8) {
            suggestions.push({
                reason: 'Room limit',
                message: `You're using ${roomCount} of ${proFeatures.maxRooms} rooms. Upgrade to Enterprise for unlimited rooms.`,
                suggestedTier: SUBSCRIPTION_TIERS.ENTERPRISE
            });
        }

        suggestions.push({
            reason: 'Multi-hotel',
            message: 'Manage multiple properties with Enterprise plan.',
            suggestedTier: SUBSCRIPTION_TIERS.ENTERPRISE
        });
    }

    return suggestions;
};

export default {
    hasSubscriptionFeature,
    getSubscriptionFeatures,
    compareSubscriptionTiers,
    getSubscriptionPricing,
    canAddRoom,
    canAddStaff,
    getUpgradeSuggestions
};
