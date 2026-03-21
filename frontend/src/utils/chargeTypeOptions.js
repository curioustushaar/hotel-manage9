export const DEFAULT_CHARGE_OPTIONS = [
    { value: 'laundry', label: 'Laundry', icon: '🧺' },
    { value: 'dry_cleaning', label: 'Dry Cleaning', icon: '👔' },
    { value: 'spa_wellness', label: 'Spa & Wellness', icon: '🧖' },
    { value: 'gym_access', label: 'Gym Access', icon: '💪' },
    { value: 'pool_access', label: 'Pool Access', icon: '🏊' },
    { value: 'bar', label: 'Bar & Drinks', icon: '🍹' },
    { value: 'special_requests', label: 'Special Service', icon: '✨' },
    { value: 'damage_security', label: 'Damage/Security', icon: '🛡️' },
    { value: 'lost_key', label: 'Key Replacement', icon: '🔑' },
    { value: 'smoking_fees', label: 'Smoking Fees', icon: '🚬' },
];

export const COMPULSORY_APPLIES_TO_OPTIONS = [
    { id: 'ROOM', label: 'Room Charges', locked: true },
    { id: 'FOOD', label: 'Food & Beverage', locked: true },
];

const LEGACY_APPLIES_TO_OPTIONS = [
    { id: 'BILL', label: 'Entire Bill' },
    { id: 'LAUNDRY', label: 'Laundry' },
    { id: 'SPA', label: 'Spa / Services' },
];

const toUpperUnderscore = (value) => String(value || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9_]/g, '');

const uniqueBy = (items, keyFn) => {
    const seen = new Set();
    return items.filter(item => {
        const key = keyFn(item);
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

export const getStoredCustomChargeTypes = () => {
    try {
        const raw = localStorage.getItem('customChargeTypes');
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

export const getAllChargeOptions = () => {
    const custom = getStoredCustomChargeTypes();
    return uniqueBy([...DEFAULT_CHARGE_OPTIONS, ...custom], item => item.value);
};

export const buildLinkedAppliesToOptions = (chargeOptions = []) => {
    const mappedFromCharges = (Array.isArray(chargeOptions) ? chargeOptions : []).map(option => ({
        id: toUpperUnderscore(option?.value || option?.label),
        label: option?.label || option?.value || 'Custom Service',
    }));

    const merged = uniqueBy(
        [
            ...COMPULSORY_APPLIES_TO_OPTIONS,
            ...LEGACY_APPLIES_TO_OPTIONS,
            ...mappedFromCharges,
        ],
        item => item.id
    );

    return merged.map(item => ({
        ...item,
        locked: item.id === 'ROOM' || item.id === 'FOOD' || Boolean(item.locked),
    }));
};