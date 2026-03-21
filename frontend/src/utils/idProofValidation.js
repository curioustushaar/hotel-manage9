const normalizeIdProofType = (type = '') => {
    const normalized = String(type).trim();

    if (normalized === 'Aadhaar (ID)' || normalized === 'Aadhaar Card') {
        return 'Aadhaar';
    }

    if (normalized === 'PAN' || normalized === 'PAN Card') {
        return 'PAN Card';
    }

    return normalized;
};

export const sanitizeIdProofInput = (type, rawValue = '') => {
    const normalizedType = normalizeIdProofType(type);
    const upperValue = String(rawValue).toUpperCase();

    if (normalizedType === 'Aadhaar') {
        return upperValue.replace(/\D/g, '').slice(0, 12);
    }

    if (normalizedType === 'PAN Card') {
        return upperValue.replace(/[^A-Z0-9]/g, '').slice(0, 10);
    }

    return upperValue.replace(/[^A-Z0-9]/g, '');
};

export const validateIdProofNumber = (type, value) => {
    const normalizedType = normalizeIdProofType(type);
    const sanitizedValue = sanitizeIdProofInput(normalizedType, value).trim();

    if (!sanitizedValue) {
        return {
            isValid: false,
            message: 'ID number is required'
        };
    }

    if (normalizedType === 'Aadhaar') {
        if (!/^\d{12}$/.test(sanitizedValue)) {
            return {
                isValid: false,
                message: 'Aadhaar number must be exactly 12 digits'
            };
        }
        return { isValid: true, message: '' };
    }

    if (normalizedType === 'PAN Card') {
        if (!/^[A-Z0-9]{10}$/.test(sanitizedValue)) {
            return {
                isValid: false,
                message: 'PAN number must be exactly 10 alphanumeric characters'
            };
        }
        return { isValid: true, message: '' };
    }

    if (normalizedType === 'Passport' || normalizedType === 'Driving License' || normalizedType === 'Voter ID') {
        if (!/^[A-Z0-9]+$/.test(sanitizedValue)) {
            return {
                isValid: false,
                message: `${normalizedType} must be alphanumeric`
            };
        }
        return { isValid: true, message: '' };
    }

    return { isValid: true, message: '' };
};

export { normalizeIdProofType };
