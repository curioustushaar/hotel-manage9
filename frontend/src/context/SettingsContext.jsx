import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SettingsContext = createContext(null);

const defaultSettings = {
    name: 'Bireena Atithi',
    address: '123, MG Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    pin: '400050',
    gstNumber: '22AAAAA0000A125',
    phone: '',
    logoUrl: null,
    currency: 'INR (₹)',
    timezone: '(GMT+05:30) Kolkata',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12 Hour',
    taxType: 'GST',
    cgst: 2.5,
    sgst: 2.5,
    serviceCharge: 10,
    roomGst: 12,
    foodGst: 5,
    roomServiceCharge: 5,
    inclusiveTax: true,
    invoicePrefix: 'INV-2026-',
    billingInvoicePrefix: 'ATITHI',
    startingInvoiceNumber: '1001',
    panNumber: '',
    autoGenerateInvoice: true,
    autoIncrementInvoice: true,
    billPrintFormat: 'Hotel Invoice',
    thankYouMessage: 'Thank you for visiting our hotel!',
    enableRoomPosting: true,
    posEnabled: true,
    displayLogoOnBill: true,
    printKOTHeader: true,
    paymentModes: { cash: true, upi: true, card: true, bankTransfer: true },
    billingRules: { autoPost: true, mandatorySettlement: true, splitBill: true, mergeTable: true, addToRoom: true },
    discountRules: { maxDiscount: 25, maxDiscountType: 'PERCENTAGE', managerApproval: true, couponEnabled: true }
};

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(defaultSettings);
    const [loaded, setLoaded] = useState(false);

    const fetchSettings = useCallback(async () => {
        try {
            const res = await fetch('http://localhost:5000/api/hotel/settings');
            const data = await res.json();
            if (data.success && data.data) {
                setSettings(prev => ({ ...prev, ...data.data }));
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
        } finally {
            setLoaded(true);
        }
    }, []);

    useEffect(() => { fetchSettings(); }, [fetchSettings]);

    const getCurrencySymbol = useCallback(() => {
        const c = settings.currency || 'INR (₹)';
        if (c.includes('₹') || c.includes('INR')) return '₹';
        if (c.includes('$') || c.includes('USD')) return '$';
        if (c.includes('€') || c.includes('EUR')) return '€';
        if (c.includes('£') || c.includes('GBP')) return '£';
        return '₹';
    }, [settings.currency]);

    const formatDate = useCallback((dateStr) => {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        if (isNaN(d)) return 'N/A';
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        const fmt = settings.dateFormat || 'DD/MM/YYYY';
        if (fmt === 'MM/DD/YYYY') return `${mm}/${dd}/${yyyy}`;
        if (fmt === 'YYYY-MM-DD') return `${yyyy}-${mm}-${dd}`;
        return `${dd}/${mm}/${yyyy}`;
    }, [settings.dateFormat]);

    const formatTime = useCallback((timeStr) => {
        if (!timeStr) return '';
        const fmt = settings.timeFormat || '12 Hour';
        if (fmt === '24 Hour') return timeStr;
        const [h, m] = timeStr.split(':').map(Number);
        if (isNaN(h)) return timeStr;
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
    }, [settings.timeFormat]);

    const getFullAddress = useCallback(() => {
        const parts = [settings.address, settings.city, settings.state, settings.pin].filter(Boolean);
        return parts.join(', ');
    }, [settings.address, settings.city, settings.state, settings.pin]);

    return (
        <SettingsContext.Provider value={{
            settings, setSettings, fetchSettings, loaded,
            getCurrencySymbol, formatDate, formatTime, getFullAddress
        }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
    return ctx;
};
