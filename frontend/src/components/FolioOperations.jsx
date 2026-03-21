import React, { useState, useEffect } from 'react';
import API_URL from '../config/api';
import { useSettings } from '../context/SettingsContext';
import './FolioOperations.css';
import AddPayment from './AddPayment';
import AddCharges from './AddCharges';
import ApplyDiscountSidebar from './ApplyDiscountSidebar';
import NewFolio from './NewFolio';
import RouteFolioSidebar from './RouteFolioSidebar';
import ConfirmationModal from './ConfirmationModal';
import Toast from './Toast';
import VisitorList from './visitors/VisitorList';

const FolioOperations = ({ reservation, onTotalsChange, onRefresh }) => {
    const { settings, getCurrencySymbol } = useSettings();
    const cs = getCurrencySymbol();
    const [selectedRoom, setSelectedRoom] = useState(0);
    const [showAddPayment, setShowAddPayment] = useState(false);
    const [showAddCharges, setShowAddCharges] = useState(false);
    const [showApplyDiscount, setShowApplyDiscount] = useState(false);
    const [showNewFolio, setShowNewFolio] = useState(false);
    const [showRoutingSection, setShowRoutingSection] = useState(false);
    const [showRouteFolioSidebar, setShowRouteFolioSidebar] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [pendingRouteData, setPendingRouteData] = useState(null);
    const [isProcessingRoute, setIsProcessingRoute] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null); // For three dot menu
    const [menuPosition, setMenuPosition] = useState({ bottom: 0, right: 0 });
    const [editingItem, setEditingItem] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [allTransactions, setAllTransactions] = useState([]); // Store all transactions
    const [loading, setLoading] = useState(true);
    const [folioList, setFolioList] = useState([]);
    const [allBookings, setAllBookings] = useState([]);
    const [toast, setToast] = useState(null);
    const [showPrintDrawer, setShowPrintDrawer] = useState(false);
    const [selectedPrintType, setSelectedPrintType] = useState('a4');

    const BASE_API_URL = `${API_URL}/api/bookings`;

    // Fetch all bookings and current booking transactions on component load
    // Also refetch when reservation.updatedAt changes (e.g. after external actions like add payment/visitor)
    useEffect(() => {
        if (reservation?.roomNumber) {
            fetchAllBookings();
        }
    }, [reservation?.roomNumber, reservation?.updatedAt]);

    // Fetch transactions whenever the selected room changes
    useEffect(() => {
        const selectedFolio = folioList.find(f => f.id === selectedRoom);
        if (selectedFolio && selectedFolio.bookingId) {
            fetchTransactions(selectedFolio.bookingId);
        } else if (reservation && (reservation.id || reservation._id)) {
            fetchTransactions(reservation.id || reservation._id);
        }
    }, [selectedRoom, folioList, reservation]);

    // Fetch all IN_HOUSE bookings to populate folio list
    const fetchAllBookings = async () => {
        try {
            if (!reservation?.roomNumber) return;

            const response = await fetch(`${BASE_API_URL}/list`);
            const data = await response.json();

            if (data.success && data.data) {
                const targetRoom = String(reservation.roomNumber).trim();
                const currentBookingId = String(reservation?.id || reservation?._id);

                // Filter bookings for this room
                const roomBookings = data.data.filter(booking => {
                    const status = booking.status;
                    const isStatusValid = ['Checked-in', 'Upcoming', 'IN_HOUSE', 'CheckedIn', 'Checked-out'].includes(status);
                    const isRoomMatch = String(booking.roomNumber).trim() === targetRoom;
                    return isStatusValid && isRoomMatch;
                });

                setAllBookings(roomBookings);

                let folios = [];
                let idCounter = 0;

                // Process each booking in the room
                roomBookings.forEach(booking => {
                    const isCurrent = String(booking._id) === currentBookingId;

                    // Add Primary Folio (folioId: 0)
                    folios.push({
                        id: idCounter++,
                        folioId: 0,
                        name: `${booking.roomNumber} - ${booking.guestName}`,
                        roomNumber: booking.roomNumber,
                        guestName: booking.guestName,
                        bookingId: booking._id,
                        isPrimary: true,
                        isCurrentBooking: isCurrent
                    });

                    // If it's the current booking, also add folios for additional guests
                    if (isCurrent && booking.additionalGuests && Array.isArray(booking.additionalGuests)) {
                        booking.additionalGuests.forEach((guest, gIdx) => {
                            folios.push({
                                id: idCounter++,
                                folioId: gIdx + 1,
                                name: `${booking.roomNumber} - ${guest.name || 'Extra Folio'}`,
                                roomNumber: booking.roomNumber,
                                guestName: guest.name,
                                bookingId: booking._id,
                                isPrimary: false,
                                isCurrentBooking: true
                            });
                        });
                    }
                });

                // Ensure the current selection stays at the top if possible
                const currentFolios = folios.filter(f => f.isCurrentBooking);

                // Only include the current folios to avoid duplicate/extra entries as requested
                const finalFolios = [...currentFolios];

                // Re-assign 'id' to match order for consistency with setSelectedRoom
                finalFolios.forEach((f, i) => f.id = i);

                setFolioList(finalFolios);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

    const fetchTransactions = async (bookingId) => {
        try {
            setLoading(true);
            const idToFetch = bookingId || (reservation.id || reservation._id);
            if (!idToFetch) return;

            console.log('Fetching transactions for booking:', idToFetch);
            const response = await fetch(`${BASE_API_URL}/${idToFetch}`);
            const data = await response.json();

            if (data.success && data.data.transactions) {
                // Map transactions to ensure UI fields exist
                const mappedTransactions = data.data.transactions.map(t => ({
                    ...t,
                    folioId: t.folioId !== undefined ? t.folioId : 0,
                    particulars: t.particulars || (t.type?.toLowerCase() === 'charge' ? 'Room Stay' : t.type),
                    description: t.description || t.notes || '',
                    day: t.day || new Date(t.date || Date.now()).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        weekday: 'short'
                    })
                }));
                setAllTransactions(mappedTransactions);
            } else {
                setAllTransactions([]);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (activeMenu !== null && !e.target.closest('.action-menu-btn') && !e.target.closest('.action-dropdown')) {
                setActiveMenu(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [activeMenu]);

    if (!reservation) return null;

    // Handler for adding new charge
    const handleAddCharge = async (chargeData) => {
        const chargeLabel = chargeData.chargeType
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
        const grossAmount = Number(chargeData.totalAmount) || 0;
        const discountAmount = Number(chargeData.discAmt) || 0;
        const netAmount = Number(chargeData.netAmount ?? grossAmount) || 0;
        const qty = Number(chargeData.quantity) || 1;
        const hasDiscount = discountAmount > 0;
        const discountName = String(chargeData.discountSource || '').trim();
        const discountRateText = chargeData.discountType === 'PERCENTAGE'
            ? `${Number(chargeData.discountValue || 0)}%`
            : `${cs}${Number(chargeData.discountValue || 0).toFixed(2)}`;

        const discountMeta = hasDiscount
            ? `${discountName ? `${discountName} (${discountRateText})` : discountRateText} [${cs}${discountAmount.toFixed(2)}]`
            : 'No discount';

        const detailSummary = `Qty: ${qty} | Gross: ${cs}${grossAmount.toFixed(2)} | Discount: ${discountMeta} | Net: ${cs}${netAmount.toFixed(2)}`;

        const newTransaction = {
            type: 'Charge',
            day: new Date(chargeData.date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                weekday: 'short'
            }),
            particulars: chargeLabel,
            description: chargeData.description
                ? `${chargeData.description} | ${detailSummary}`
                : `${chargeLabel} | ${detailSummary}`,
            amount: netAmount,
            user: 'current_user',
            folioId: selectedRoom // Associate with current folio
        };

        try {
            const bookingId = reservation.id || reservation._id;
            const response = await fetch(`${BASE_API_URL}/${bookingId}/transactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTransaction)
            });

            const data = await response.json();
            if (data.success) {
                const selectedFolio = folioList.find(f => f.id === selectedRoom);
                await fetchTransactions(selectedFolio ? selectedFolio.bookingId : null);
                setShowAddCharges(false);
                if (onRefresh) onRefresh();
            } else {
                setToast({
                    message: `Failed to add charge: ${data.message}`,
                    type: 'error'
                });
            }
        } catch (error) {
            console.error('Error adding charge:', error);
            setToast({
                message: 'Failed to add charge. Please try again.',
                type: 'error'
            });
        }
    };

    // Handler for adding new payment
    const handleAddPayment = async (paymentData) => {
        const newTransaction = {
            type: 'Payment',
            day: new Date(paymentData.date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                weekday: 'short'
            }),
            particulars: paymentData.paymentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            description: `Payment via ${paymentData.paymentType} ${paymentData.comment ? '- ' + paymentData.comment : ''}`,
            amount: -paymentData.amount,
            user: 'current_user',
            folioId: selectedRoom // Associate with current folio
        };

        try {
            const bookingId = reservation.id || reservation._id;
            const response = await fetch(`${BASE_API_URL}/${bookingId}/transactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTransaction)
            });

            const data = await response.json();
            if (data.success) {
                await fetchTransactions(selectedFolio ? selectedFolio.bookingId : null);
                setShowAddPayment(false);
                if (onRefresh) onRefresh();
            } else {
                setToast({
                    message: `Failed to add payment: ${data.message}`,
                    type: 'error'
                });
            }
        } catch (error) {
            console.error('Error adding payment:', error);
            setToast({
                message: 'Failed to add payment. Please try again.',
                type: 'error'
            });
        }
    };

    // Handler for applying discount
    const handleApplyDiscount = async (discountData) => {
        const discountTypeDesc = [];
        if (discountData.roomWiseDiscount) discountTypeDesc.push('Room Wise');
        if (discountData.tableWiseDiscount) discountTypeDesc.push('Table Wise');

        // Calculate discount amount based on type
        const currentFolioTransactions = allTransactions.filter(t => t.folioId === selectedRoom);
        const currentCharges = currentFolioTransactions.filter(t => t.type?.toLowerCase() === 'charge').reduce((sum, t) => sum + t.amount, 0);

        let discountAmount = 0;
        if (discountData.discountType === 'percentage') {
            discountAmount = (currentCharges * parseFloat(discountData.discountValue)) / 100;
        } else {
            discountAmount = parseFloat(discountData.discountValue);
        }

        const discountLabel = discountData.discountType === 'percentage'
            ? `${discountData.discountValue}%`
            : `${cs}${discountData.discountValue}`;

        const newTransaction = {
            type: 'Discount',
            day: new Date(discountData.date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                weekday: 'short'
            }),
            particulars: `Discount (${discountLabel})`,
            description: `${discountTypeDesc.join(' & ')} - ${discountData.comment || 'No comment'}`,
            amount: -discountAmount, // Negative amount to reduce total
            discountType: discountData.discountType,
            discountValue: discountData.discountValue,
            folio: discountData.folio,
            user: 'current_user',
            folioId: selectedRoom // Associate with current folio
        };

        try {
            const bookingId = reservation.id || reservation._id;
            const response = await fetch(`${BASE_API_URL}/${bookingId}/transactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTransaction)
            });

            const data = await response.json();
            if (data.success) {
                const selectedFolio = folioList.find(f => f.id === selectedRoom);
                await fetchTransactions(selectedFolio ? selectedFolio.bookingId : null);
                setShowApplyDiscount(false);
                if (onRefresh) onRefresh();
            } else {
                setToast({
                    message: `Failed to apply discount: ${data.message}`,
                    type: 'error'
                });
            }
        } catch (error) {
            console.error('Error applying discount:', error);
            setToast({
                message: 'Failed to apply discount. Please try again.',
                type: 'error'
            });
        }
    };

    // Handler for saving new folio
    const handleSaveNewFolio = async (folioData) => {
        console.log('New Folio Data:', folioData);

        try {
            let selectedGuestName = '';

            // Check if selected guest is the primary guest
            if (folioData.customer === (reservation.guestId || reservation.id || 'primary')) {
                selectedGuestName = reservation.guestName;
            } else {
                // Check in additional guests
                const addGuest = reservation.additionalGuests?.find(g => (g._id || `guest-${reservation.additionalGuests.indexOf(g)}`) === folioData.customer);
                if (addGuest) {
                    selectedGuestName = addGuest.name;
                }
            }

            // Fallback to global list if not found in current reservation (e.g. if list was fetched from API)
            if (!selectedGuestName) {
                const response = await fetch(`${BASE_API_URL}/list`);
                const data = await response.json();
                if (data.success && data.data) {
                    const guestInList = data.data.find(booking => booking._id === folioData.customer);
                    if (guestInList) selectedGuestName = guestInList.guestName;
                }
            }

            if (selectedGuestName) {
                // Add new folio to the list
                const newFolio = {
                    id: folioList.length,
                    name: `${folioData.rooms} - ${selectedGuestName}`,
                    roomNumber: folioData.rooms,
                    guestName: selectedGuestName,
                    registrationNo: folioData.registrationNo
                };

                setFolioList([...folioList, newFolio]);
                setSelectedRoom(newFolio.id);
            }
        } catch (error) {
            console.error('Error saving folio:', error);
        }

        setShowNewFolio(false);
    };

    // Handler for route folio save
    const handleRouteFolioSave = async (routeData) => {
        // Store route data and show confirmation modal
        setPendingRouteData(routeData);
        setShowConfirmationModal(true);
        setShowRouteFolioSidebar(false);
    };

    // Confirm and execute the routing
    const confirmRouting = async () => {
        if (!pendingRouteData) return;

        setIsProcessingRoute(true);

        try {
            const bookingId = reservation.id || reservation._id;

            // Get target folio's booking ID
            const targetFolio = folioList.find(f => f.id === pendingRouteData.targetFolioId);
            const targetBookingId = targetFolio?.bookingId;

            console.log('Routing Configuration:');
            console.log('- Source Booking ID:', bookingId);
            console.log('- Target Booking ID:', targetBookingId);
            console.log('- Source Folio ID:', pendingRouteData.sourceFolioId);
            console.log('- Target Folio ID:', pendingRouteData.targetFolioId);
            console.log('- Transaction IDs:', pendingRouteData.transactionIds);
            console.log('- Is Cross-Booking?', targetBookingId !== bookingId);

            const response = await fetch(`${BASE_API_URL}/${bookingId}/route-folio`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sourceFolioId: pendingRouteData.sourceFolioId,
                    targetFolioId: targetFolio.folioId, // Use actual folioId (0, 1, 2...)
                    transactionIds: pendingRouteData.transactionIds,
                    selectedCategories: pendingRouteData.selectedCategories,
                    routedBy: 'current_user',
                    targetBookingId: targetBookingId
                })
            });

            const data = await response.json();
            console.log('Routing Response:', data);

            if (data.success) {
                // Refresh all bookings and transactions
                await fetchAllBookings();

                // Fetch transactions for the target booking if different
                await fetchTransactions(targetBookingId || bookingId);

                // Show success toast
                setToast({
                    message: `Successfully routed ${pendingRouteData.transactionCount} charge(s) to ${pendingRouteData.targetFolioName}.`,
                    type: 'success'
                });

                // Hide routing section and show table
                setShowRoutingSection(false);
            } else {
                setToast({
                    message: `Failed to route charges: ${data.message}`,
                    type: 'error'
                });
            }
        } catch (error) {
            console.error('Error routing folio:', error);
            setToast({
                message: 'Failed to route charges. Please try again.',
                type: 'error'
            });
        } finally {
            setIsProcessingRoute(false);
            setShowConfirmationModal(false);
            setPendingRouteData(null);
        }
    };

    // Action handlers
    const printFormats = [
        { key: 'a4', label: 'A4', icon: '📄', desc: 'Standard', pageSize: 'A4', bodyWidth: '100%', windowWidth: 980 },
        { key: 'a5', label: 'A5', icon: '📃', desc: 'Half Sheet', pageSize: 'A5', bodyWidth: '100%', windowWidth: 820 },
        { key: 'thermal', label: 'Thermal', icon: '🧾', desc: '80mm Roll', pageSize: '80mm auto', bodyWidth: '72mm', windowWidth: 420 },
        { key: 'dotmatrix', label: 'Dot Matrix', icon: '🖨️', desc: 'DMP', pageSize: 'A4', bodyWidth: '100%', windowWidth: 980 },
        { key: '3inch', label: '3 inch', icon: '📜', desc: '76mm Roll', pageSize: '76mm auto', bodyWidth: '68mm', windowWidth: 390 },
        { key: '2inch', label: '2 inch', icon: '🔖', desc: '58mm Roll', pageSize: '58mm auto', bodyWidth: '50mm', windowWidth: 360 },
    ];

    // Print full folio statement
    const handlePrintFolio = (format = 'a4') => {
        if (!currentFolioTransactions.length) return;

        const fmt = printFormats.find(f => f.key === format) || printFormats[0];
        const isNarrow = ['thermal', '3inch', '2inch'].includes(fmt.key);
        const fontFamily = fmt.key === 'dotmatrix' ? "'Courier New', monospace" : "'Segoe UI', Arial, sans-serif";
        const baseFont = fmt.key === '2inch' ? '9px' : fmt.key === '3inch' ? '9.5px' : isNarrow ? '10px' : '11px';

        const selectedFolioData = folioList.find(f => f.id === selectedRoom);
        const guestName = selectedFolioData?.guestName || reservation?.guestName || '';
        const roomNo = selectedFolioData?.roomNumber || reservation?.roomNumber || '';
        const hotelName = settings?.name || 'Hotel';
        const address = [settings?.address, settings?.city, settings?.state].filter(Boolean).join(', ');

        const toNum = (v) => {
            const n = Number(v);
            return Number.isFinite(n) ? n : 0;
        };

        const parseAmount = (text, label) => {
            if (!text) return null;
            const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const escapedCurrency = cs.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const re = new RegExp(`${escapedLabel}\\s*:\\s*(?:Rs|INR|${escapedCurrency})?\\s*([0-9]+(?:\\.[0-9]+)?)`, 'i');
            const m = String(text).match(re);
            return m ? toNum(m[1]) : null;
        };

        const tx = currentFolioTransactions.map((t) => ({
            ...t,
            amountAbs: Math.abs(toNum(t.amount)),
            typeLc: String(t.type || '').toLowerCase(),
            particularsLc: String(t.particulars || '').toLowerCase(),
            text: `${t.particulars || ''} ${t.description || ''} ${t.notes || ''}`.toLowerCase(),
        }));

        const getTaxConfig = () => {
            const cgst = toNum(settings?.cgst);
            const sgst = toNum(settings?.sgst);
            const defaultFoodGst = (cgst + sgst) > 0 ? (cgst + sgst) : toNum(settings?.foodGst);
            return {
                roomGstPercent: toNum(settings?.roomGst) || 12,
                foodGstPercent: defaultFoodGst,
                addGstPercent: defaultFoodGst,
                cgst,
                sgst,
                roomServicePercent: toNum(settings?.roomServiceCharge ?? settings?.serviceCharge),
            };
        };

        const isRoomTx = (t) => t.typeLc === 'charge' && (/room\s*(tariff|charge|rent|stay)/i.test(t.particulars) || /room\s*(tariff|charge|rent|stay)/i.test(t.text));
        const isFoodTx = (t) => t.typeLc === 'charge' && (/restaurant|food|meal|kot|dine|table|bill\s*#/i.test(t.text) || /dry\s*cleaning|laundry/.test(t.text) === false && /qty[:\s]|gross[:\s]/i.test(t.text));
        const isDiscountTx = (t) => t.typeLc === 'discount';
        const isPaymentTx = (t) => t.typeLc === 'payment';

        const getRoomCharges = () => {
            const roomTx = tx.filter(isRoomTx);
            const roomCharge = roomTx.reduce((s, t) => s + t.amountAbs, 0);
            const serviceCharge = toNum(reservation?.billing?.serviceCharge);
            const roomDiscount = tx.filter(isDiscountTx).reduce((s, t) => s + t.amountAbs, 0);
            const taxCfg = getTaxConfig();
            const roomTaxable = Math.max(0, roomCharge + serviceCharge - roomDiscount);
            const roomGstAmount = toNum(reservation?.billing?.tax) || (roomTaxable * taxCfg.roomGstPercent / 100);
            const roomTotal = roomTaxable + roomGstAmount;
            return { roomCharge, serviceCharge, roomDiscount, roomTaxable, roomGstPercent: taxCfg.roomGstPercent, roomGstAmount, roomTotal };
        };

        const getFoodItems = () => {
            const foodTx = tx.filter(isFoodTx);
            const taxCfg = getTaxConfig();

            const items = foodTx.map((t, idx) => {
                const desc = `${t.description || ''} ${t.notes || ''}`;
                const gross = parseAmount(desc, 'Gross');
                const discount = parseAmount(desc, 'Discount') || 0;
                const net = parseAmount(desc, 'Net') || t.amountAbs;
                const taxable = gross !== null ? Math.max(0, gross - discount) : net / (1 + taxCfg.foodGstPercent / 100);
                const gstAmount = net - taxable;
                const qtyMatch = desc.match(/qty\s*[:\-]?\s*([0-9]+)/i);
                return {
                    name: t.particulars || `Food Item ${idx + 1}`,
                    qty: qtyMatch ? Number(qtyMatch[1]) : 1,
                    rate: taxable,
                    amount: net,
                    taxable,
                    gstAmount,
                    discount,
                    date: t.day || '',
                };
            });

            const subtotal = items.reduce((s, i) => s + i.taxable, 0);
            const gstAmount = items.reduce((s, i) => s + i.gstAmount, 0);
            const total = items.reduce((s, i) => s + i.amount, 0);

            return { items, subtotal, foodGstPercent: taxCfg.foodGstPercent, foodTaxAmount: gstAmount, total };
        };

        const getAddCharges = () => {
            const addTx = tx.filter(t => t.typeLc === 'charge' && !isRoomTx(t) && !isFoodTx(t));
            const taxCfg = getTaxConfig();

            const items = addTx.map((t) => {
                const desc = `${t.description || ''} ${t.notes || ''}`;
                const gross = parseAmount(desc, 'Gross');
                const discount = parseAmount(desc, 'Discount') || 0;
                const net = parseAmount(desc, 'Net') || t.amountAbs;
                const taxable = gross !== null ? Math.max(0, gross - discount) : net / (1 + taxCfg.addGstPercent / 100);
                const gstAmount = net - taxable;
                return {
                    name: t.particulars || 'Add Charge',
                    taxable,
                    gstAmount,
                    total: net,
                    date: t.day || '',
                };
            });

            const subtotal = items.reduce((s, i) => s + i.taxable, 0);
            const gstAmount = items.reduce((s, i) => s + i.gstAmount, 0);
            const total = items.reduce((s, i) => s + i.total, 0);

            return { items, subtotal, addGstPercent: taxCfg.addGstPercent, addTaxAmount: gstAmount, total };
        };

        const getDiscount = () => {
            const discountTx = tx.filter(isDiscountTx);
            const discountFromTx = discountTx.reduce((s, t) => s + t.amountAbs, 0);
            const roomDiscount = toNum(reservation?.billing?.discount);
            const totalDiscount = Math.max(discountFromTx, roomDiscount);
            return {
                totalDiscount,
                roomDiscount,
                foodDiscount: Math.max(0, totalDiscount - roomDiscount),
                addDiscount: 0,
            };
        };

        const getPayments = () => {
            const payments = tx.filter(isPaymentTx);
            const split = { cash: 0, upi: 0, card: 0, other: 0, total: 0 };
            payments.forEach((p) => {
                const text = `${p.particulars || ''} ${p.description || ''}`.toLowerCase();
                split.total += p.amountAbs;
                if (text.includes('upi')) split.upi += p.amountAbs;
                else if (text.includes('card')) split.card += p.amountAbs;
                else if (text.includes('cash')) split.cash += p.amountAbs;
                else split.other += p.amountAbs;
            });
            return split;
        };

        const room = getRoomCharges();
        const food = getFoodItems();
        const add = getAddCharges();
        const disc = getDiscount();
        const taxCfg = getTaxConfig();
        const pay = getPayments();

        const grossBeforeDiscount = room.roomTotal + food.total + add.total;
        const grandTotal = Math.max(0, grossBeforeDiscount - disc.totalDiscount);
        const pending = Math.max(0, grandTotal - pay.total);

        const gstMap = new Map();
        const pushGstRow = (percent, taxable, taxAmount) => {
            const pct = Number(percent) || 0;
            if (pct <= 0) return;
            const key = pct.toFixed(2);
            const prev = gstMap.get(key) || { taxable: 0, tax: 0 };
            prev.taxable += taxable;
            prev.tax += taxAmount;
            gstMap.set(key, prev);
        };

        pushGstRow(taxCfg.roomGstPercent, room.roomTaxable, room.roomGstAmount);
        pushGstRow(food.foodGstPercent, food.subtotal, food.foodTaxAmount);
        pushGstRow(add.addGstPercent, add.subtotal, add.addTaxAmount);

        [5, 12, 18].forEach((p) => {
            const k = p.toFixed(2);
            if (!gstMap.has(k)) gstMap.set(k, { taxable: 0, tax: 0 });
        });

        const gstRows = [...gstMap.entries()]
            .sort((a, b) => Number(a[0]) - Number(b[0]))
            .map(([pct, v]) => {
                const cgst = v.tax / 2;
                const sgst = v.tax / 2;
                return `<tr><td>${Number(pct).toFixed(2)}%</td><td style="text-align:right">${cs} ${v.taxable.toFixed(2)}</td><td style="text-align:right">${cs} ${cgst.toFixed(2)}</td><td style="text-align:right">${cs} ${sgst.toFixed(2)}</td><td style="text-align:right">${cs} ${(cgst + sgst).toFixed(2)}</td></tr>`;
            }).join('');

        const foodRows = food.items.length
            ? food.items.map(i => `<tr><td>${i.name}</td><td style="text-align:right">${i.qty}</td><td style="text-align:right">${cs} ${i.rate.toFixed(2)}</td><td style="text-align:right">${cs} ${i.amount.toFixed(2)}</td></tr>`).join('')
            : '<tr><td colspan="4" style="text-align:center;color:#94a3b8">No food items</td></tr>';

        const addRows = add.items.length
            ? add.items.map(i => `<tr><td>${i.name}</td><td style="text-align:right">${cs} ${i.taxable.toFixed(2)}</td><td style="text-align:right">${cs} ${i.gstAmount.toFixed(2)}</td><td style="text-align:right">${cs} ${i.total.toFixed(2)}</td></tr>`).join('')
            : '<tr><td colspan="4" style="text-align:center;color:#94a3b8">No add charges</td></tr>';

        const content = `<!DOCTYPE html><html><head><title>Tax Invoice - ${roomNo}</title>
            <style>
                @page { size: ${fmt.pageSize}; margin: ${isNarrow ? '4mm' : '10mm'}; }
                body { font-family: ${fontFamily}; font-size: ${baseFont}; color:#111; margin: 0 auto; width:${fmt.bodyWidth}; max-width:${fmt.bodyWidth}; }
                .topline { display:flex; justify-content:space-between; font-size:${isNarrow ? '8px' : '9px'}; color:#6b7280; margin-bottom:4px; }
                .header { text-align:center; margin-bottom:8px; }
                .title { font-size:${isNarrow ? '14px' : '20px'}; font-weight:800; margin:2px 0; }
                .sub { font-size:${isNarrow ? '8px' : '9px'}; color:#6b7280; }
                .meta { display:flex; justify-content:space-between; gap:8px; background:#f8f9fa; padding:8px; border-radius:6px; margin:8px 0; }
                .meta b { display:block; font-size:${isNarrow ? '9px' : '10px'}; }
                .meta span { font-size:${isNarrow ? '8px' : '9px'}; color:#6b7280; }
                .sec { margin-top:8px; }
                .sec h4 { margin:0 0 4px; font-size:${isNarrow ? '9px' : '10px'}; text-transform:uppercase; letter-spacing:.04em; }
                table { width:100%; border-collapse:collapse; }
                th { text-align:left; padding:5px 4px; border-bottom:1.6px solid #111; font-size:${isNarrow ? '8px' : '9px'}; }
                td { padding:4px; border-bottom:1px solid #ececec; font-size:${isNarrow ? '8px' : '9px'}; vertical-align:top; }
                .sum { margin-top:10px; border-top:1.5px dashed #bbb; padding-top:6px; }
                .line { display:flex; justify-content:space-between; padding:2px 0; font-size:${isNarrow ? '9px' : '10px'}; }
                .grand { border-top:2px solid #111; border-bottom:2px double #111; font-weight:800; padding:6px 0; margin-top:4px; }
                .neg { color:#b91c1c; }
                .pos { color:#166534; }
                .foot { margin-top:12px; text-align:center; color:#94a3b8; font-size:${isNarrow ? '8px' : '9px'}; }
            </style>
        </head><body>
            <div class="topline"><span>${new Date().toLocaleString('en-IN')}</span><span>Folio - ${roomNo}</span></div>
            <div class="header">
                <div class="title">${hotelName}</div>
                ${address ? `<div class="sub">${address}</div>` : ''}
                <div class="sub">TAX INVOICE</div>
            </div>
            <div class="meta">
                <div><span>Room No.</span><b>${roomNo}</b></div>
                <div><span>Guest</span><b>${guestName || 'N/A'}</b></div>
                <div><span>Printed</span><b>${new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</b></div>
            </div>

            <div class="sec">
                <h4>Room Charges</h4>
                <div class="line"><span>Room charge</span><span>${cs} ${room.roomCharge.toFixed(2)}</span></div>
                <div class="line"><span>Service charge</span><span>${cs} ${room.serviceCharge.toFixed(2)}</span></div>
                <div class="line"><span>Room GST (${room.roomGstPercent.toFixed(2)}%)</span><span>${cs} ${room.roomGstAmount.toFixed(2)}</span></div>
                <div class="line"><span>Room total after tax</span><span>${cs} ${room.roomTotal.toFixed(2)}</span></div>
            </div>

            <div class="sec">
                <h4>Food Charges</h4>
                <table>
                    <thead><tr><th>Item</th><th style="text-align:right">Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount</th></tr></thead>
                    <tbody>${foodRows}</tbody>
                </table>
                <div class="line"><span>Food subtotal</span><span>${cs} ${food.subtotal.toFixed(2)}</span></div>
                <div class="line"><span>Food GST (${food.foodGstPercent.toFixed(2)}%)</span><span>${cs} ${food.foodTaxAmount.toFixed(2)}</span></div>
                <div class="line"><span>Food total after tax</span><span>${cs} ${food.total.toFixed(2)}</span></div>
            </div>

            <div class="sec">
                <h4>Add Charges</h4>
                <table>
                    <thead><tr><th>Charge</th><th style="text-align:right">Taxable</th><th style="text-align:right">GST</th><th style="text-align:right">Total</th></tr></thead>
                    <tbody>${addRows}</tbody>
                </table>
                <div class="line"><span>Add charges subtotal</span><span>${cs} ${add.subtotal.toFixed(2)}</span></div>
                <div class="line"><span>GST on add charges (${add.addGstPercent.toFixed(2)}%)</span><span>${cs} ${add.addTaxAmount.toFixed(2)}</span></div>
                <div class="line"><span>Add charges total after tax</span><span>${cs} ${add.total.toFixed(2)}</span></div>
            </div>

            <div class="sec">
                <h4>Discount</h4>
                <div class="line"><span>Room discount</span><span class="neg">- ${cs} ${disc.roomDiscount.toFixed(2)}</span></div>
                <div class="line"><span>Food discount</span><span class="neg">- ${cs} ${disc.foodDiscount.toFixed(2)}</span></div>
                <div class="line"><span>Add discount</span><span class="neg">- ${cs} ${disc.addDiscount.toFixed(2)}</span></div>
                <div class="line"><span>Total discount</span><span class="neg">- ${cs} ${disc.totalDiscount.toFixed(2)}</span></div>
            </div>

            <div class="sec">
                <h4>GST Breakup Details</h4>
                <table>
                    <thead><tr><th>GST %</th><th style="text-align:right">Taxable Amount</th><th style="text-align:right">CGST</th><th style="text-align:right">SGST</th><th style="text-align:right">Total</th></tr></thead>
                    <tbody>${gstRows}</tbody>
                </table>
            </div>

            <div class="sec sum">
                <h4>Final Total</h4>
                <div class="line grand"><span>Grand Total</span><span>${cs} ${grandTotal.toFixed(2)}</span></div>
                <div class="line"><span>Paid Amount</span><span class="pos">${cs} ${pay.total.toFixed(2)}</span></div>
                <div class="line"><span>Cash</span><span>${cs} ${pay.cash.toFixed(2)}</span></div>
                <div class="line"><span>UPI</span><span>${cs} ${pay.upi.toFixed(2)}</span></div>
                <div class="line"><span>Card</span><span>${cs} ${pay.card.toFixed(2)}</span></div>
                ${pay.other > 0 ? `<div class="line"><span>Other</span><span>${cs} ${pay.other.toFixed(2)}</span></div>` : ''}
                <div class="line"><span>Pending</span><span class="${pending > 0 ? 'neg' : 'pos'}">${cs} ${pending.toFixed(2)}</span></div>
            </div>

            <div class="foot">Thank you for staying with us - ${hotelName}</div>
            <script>window.onload=function(){window.print();setTimeout(function(){window.close();},500)}<\/script>
        </body></html>`;

        const w = window.open('', '_blank', `height=760,width=${fmt.windowWidth}`);
        w.document.write(content);
        w.document.close();
        setShowPrintDrawer(false);
    };

    // Print individual receipt
    const handlePrint = (index) => {
        const item = currentFolioTransactions[index];
        const w = window.open('', '_blank', 'height=400,width=550');
        w.document.write(`<!DOCTYPE html><html><head><title>Receipt</title>
            <style>body{font-family:Arial,sans-serif;padding:20mm;font-size:12px;}
            h3{margin:0 0 10px}table{width:100%;border-collapse:collapse;margin-top:12px}
            td{padding:6px 0;border-bottom:1px solid #eee}.label{color:#666}.val{font-weight:700;text-align:right}
            </style></head><body>
            <h3>Transaction Receipt</h3>
            <table><tr><td class=label>Date</td><td class=val>${item.day}</td></tr>
            <tr><td class=label>Type</td><td class=val>${item.particulars}</td></tr>
            <tr><td class=label>Description</td><td class=val>${item.description}</td></tr>
            <tr><td class=label>Amount</td><td class=val>${cs} ${Math.abs(item.amount).toFixed(2)}</td></tr>
            <tr><td class=label>User</td><td class=val>${item.user}</td></tr></table>
            <p style="margin-top:20px;text-align:center;color:#999;font-size:11px">Thank you!</p>
            <script>window.onload=function(){window.print();setTimeout(()=>window.close(),500)}<\/script>
            </body></html>`);
        w.document.close();
        setActiveMenu(null);
    };

    const handleEdit = (index) => {
        setEditingItem({ ...currentFolioTransactions[index], index, transactionId: currentFolioTransactions[index]._id });
        setShowEditModal(true);
        setActiveMenu(null);
    };

    const handleSaveEdit = async () => {
        if (editingItem && editingItem.transactionId) {
            try {
                const bookingId = reservation.id || reservation._id;
                const response = await fetch(`${BASE_API_URL}/${bookingId}/transactions/${editingItem.transactionId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        particulars: editingItem.particulars,
                        description: editingItem.description,
                        amount: editingItem.amount
                    })
                });

                const data = await response.json();
                if (data.success) {
                    await fetchTransactions();
                    setShowEditModal(false);
                    setEditingItem(null);
                }
            } catch (error) {
                console.error('Error updating transaction:', error);
                alert('Failed to update transaction. Please try again.');
            }
        }
    };

    const handleVoid = async (index) => {
        const transaction = currentFolioTransactions[index];
        if (transaction._id) {
            try {
                const bookingId = reservation.id || reservation._id;
                const response = await fetch(`${BASE_API_URL}/${bookingId}/transactions/${transaction._id}`, {
                    method: 'DELETE'
                });

                const data = await response.json();
                if (data.success) {
                    await fetchTransactions();
                }
            } catch (error) {
                console.error('Error deleting transaction:', error);
                alert('Failed to delete transaction. Please try again.');
            }
        }
        setActiveMenu(null);
    };

    const toggleMenu = (index, e) => {
        if (activeMenu === index) {
            setActiveMenu(null);
            return;
        }
        const rect = e.currentTarget.getBoundingClientRect();
        setMenuPosition({
            bottom: window.innerHeight - rect.top + 6,
            right: window.innerWidth - rect.right,
        });
        setActiveMenu(index);
    };

    // Base transactions from API
    const baseTransactions = allTransactions.filter(t => {
        const selectedFolio = folioList.find(f => f.id === selectedRoom);
        if (!selectedFolio) return false;

        const isBookingMatch = String(t.bookingId || (reservation?.id || reservation?._id)) === String(selectedFolio.bookingId);
        const isFolioMatch = Number(t.folioId || 0) === Number(selectedFolio.folioId || 0);

        return isBookingMatch && isFolioMatch;
    });

    // Final transactions to display (including virtual Room Tariff if missing)
    const currentFolioTransactions = [...baseTransactions];
    const selectedFolio = folioList.find(f => f.id === selectedRoom);

    const hasRoomTariff = currentFolioTransactions.some(t => {
        const text = `${t.particulars || ''} ${t.description || ''}`.toLowerCase();
        return text.includes('room tariff') ||
            text.includes('room rent') ||
            text.includes('room charges') ||
            t.particulars === 'Room Charges' ||
            t.particulars === 'Room Tariff';
    });

    // If this is the Primary Folio and no Room Tariff is posted yet, show it as a virtual entry
    if (!hasRoomTariff && selectedFolio && Number(selectedFolio.folioId) === 0) {
        // Use ONLY base room charges for the virtual entry, NOT the total booking amount (which includes extras)
        const roomRate = reservation?.billing?.roomRate ||
            reservation?.pricePerNight ||
            reservation?.rooms?.[0]?.ratePerNight || 0;
        const nights = reservation?.duration?.nights || reservation?.nights || 1;
        const roomTotal = roomRate * nights;

        if (roomTotal > 0) {
            currentFolioTransactions.unshift({
                _id: 'virtual-room-tariff',
                day: new Date(reservation.checkInDate || reservation.arrivalDate || Date.now()).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    weekday: 'short'
                }),
                particulars: 'Room Charges',
                description: `Room Stay (${nights} nights)`,
                amount: roomTotal,
                user: 'System',
                type: 'charge',
                isVirtual: true
            });
        }
    }

    const calculateTotals = () => {
        // Core calculation from transactions list (includes virtual charges)
        let charges = currentFolioTransactions
            .filter(t => t.type?.toLowerCase() === 'charge')
            .reduce((sum, t) => sum + (Math.abs(Number(t.amount)) || 0), 0);

        const discounts = Math.abs(currentFolioTransactions
            .filter(t => t.type?.toLowerCase() === 'discount')
            .reduce((sum, t) => sum + (Number(t.amount) || 0), 0));

        let payments = currentFolioTransactions
            .filter(t => t.type?.toLowerCase() === 'payment')
            .reduce((sum, t) => sum + (Math.abs(Number(t.amount)) || 0), 0);

        const grandTotal = charges - discounts;
        const remaining = grandTotal - payments;

        return { subTotal: charges, grandTotal, paid: payments, remaining, discounts, advance: 0 };
    };

    const totals = calculateTotals();

    // Notify parent about totals change for checkout button control
    useEffect(() => {
        if (onTotalsChange && totals) {
            onTotalsChange(totals);
        }
    }, [totals.remaining, onTotalsChange]);

    return (
        <div className="folio-operations-container">
            {/* Left Panel - Room/Folio List */}
            <div className="room-folio-sidebar">
                <div className="folio-sidebar-header">
                    <h3 className="folio-sidebar-title">ROOM / FOLIO</h3>
                    <button className="sidebar-add-btn" onClick={() => {
                        console.log('New Folio button clicked');
                        setShowNewFolio(true);
                    }}>+</button>
                </div>
                <div className="room-folio-list">
                    {folioList.map((folio) => (
                        <div
                            key={folio.id}
                            className={`room-folio-item ${selectedRoom === folio.id ? 'active' : ''}`}
                            onClick={() => setSelectedRoom(folio.id)}
                        >
                            <div className="room-number">{folio.name}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel - Main Content */}
            <div className="folio-main-content">
                {/* Action Buttons */}
                <div className="folio-action-buttons">
                    <button className="folio-action-btn" onClick={() => {
                        console.log('Add Payment clicked');
                        setShowAddPayment(true);
                    }}>Add Payment</button>
                    <button className="folio-action-btn" onClick={() => setShowAddCharges(true)}>Add Charges</button>
                    <button className="folio-action-btn btn-apply-discount" onClick={() => setShowApplyDiscount(true)}>Apply Discount</button>
                    <div className="folio-ops-dropdown-container">
                        <button
                            className="folio-action-btn btn-folio-ops"
                            onClick={() => {
                                setShowRoutingSection(!showRoutingSection);
                            }}
                        >
                            Folio Operations
                        </button>
                    </div>
                    <button
                        className="folio-action-btn btn-print-folio"
                        onClick={() => setShowPrintDrawer(true)}
                        disabled={currentFolioTransactions.length === 0}
                        title="Open print options"
                    >
                        🖨️ Print Folio
                    </button>
                </div>

                {/* Folio Routing Section - Blank area below payment options */}
                {showRoutingSection && (
                    <div className="folio-routing-section">
                        <div className="routing-header">
                            <button
                                className="routing-back-btn"
                                onClick={() => setShowRoutingSection(false)}
                            >
                                ←
                            </button>
                            <h3 className="routing-header-title">Folio Operations</h3>
                        </div>
                        <div className="routing-options">
                            <div className="routing-option-text">
                                Folio Routing Operation
                            </div>
                            <button
                                className="routing-option-button"
                                onClick={() => setShowRouteFolioSidebar(true)}
                            >
                                Folio Routing
                            </button>
                        </div>
                    </div>
                )}
                {!showRoutingSection && (
                    <div className="folio-table-container">
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                Loading transactions...
                            </div>
                        ) : currentFolioTransactions.length === 0 ? (
                            <div style={{ minHeight: '300px', background: 'white' }}>
                                {/* Blank white space */}
                            </div>
                        ) : (
                            <table className="folio-charges-table">
                                <thead>
                                    <tr>
                                        <th>
                                            <input type="checkbox" />
                                        </th>
                                        <th>DAY</th>
                                        <th>PARTICULARS</th>
                                        <th>DESCRIPTION</th>
                                        <th style={{ textAlign: 'right' }}>AMOUNT</th>
                                        <th style={{ textAlign: 'right' }}>USER</th>
                                        <th style={{ textAlign: 'center', width: '60px' }}>ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentFolioTransactions.map((transaction, index) => (
                                        <tr key={transaction._id || `trans-${index}-${transaction.amount}`}>
                                            <td>
                                                <input type="checkbox" />
                                            </td>
                                            <td>{transaction.day}</td>
                                            <td>
                                                <span className={transaction.type?.toLowerCase() === 'payment' ? 'payment-badge' : ''}>
                                                    {transaction.particulars}
                                                </span>
                                            </td>
                                            <td>{transaction.description}</td>
                                            <td className={`amount-cell ${transaction.amount < 0 ? 'payment-amount' : ''}`}>
                                                {Math.abs(transaction.amount)}
                                            </td>
                                            <td>{transaction.user}</td>
                                            <td style={{ textAlign: 'center', position: 'relative' }}>
                                                <button
                                                    className="action-menu-btn"
                                                    onClick={(e) => { e.stopPropagation(); toggleMenu(index, e); }}
                                                >
                                                    ⋮
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* Summary Footer - Accurate Real-Time Data */}
                {!loading && !showRoutingSection && (
                    <div className="folio-summary-section">
                        <div className="summary-grid">
                            <div className="summary-left">
                                <div className="summary-row">
                                    <span className="summary-label-text">Sub Total</span>
                                    <span className="summary-amount">{cs} {totals.subTotal}</span>
                                </div>
                                {totals.discounts > 0 && (
                                    <div className="summary-row">
                                        <span className="summary-label-text">Discount</span>
                                        <span className="summary-amount discount-amount">- {cs} {totals.discounts}</span>
                                    </div>
                                )}
                                <div className="summary-row">
                                    <span className="summary-label-text">Grand Total</span>
                                    <span className="summary-amount grand-total">{cs} {totals.grandTotal}</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-label-text">Paid {totals.advance > 0 && '(Incl. Advance)'}</span>
                                    <span className="summary-amount">{cs} {totals.paid}</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-label-text">Remaining</span>
                                    <span className="summary-amount remaining">{cs} {totals.remaining}</span>
                                </div>
                            </div>
                            <div className="summary-right">
                                <div className="summary-row-right">
                                    <span className="summary-label-text">Current Balance</span>
                                    <span className="summary-amount-right" style={{ fontSize: '1.2rem', fontWeight: '800', color: totals.remaining > 0 ? '#ef4444' : '#22c55e' }}>
                                        {cs} {totals.remaining}
                                    </span>
                                </div>
                                <div className="summary-row-right" style={{ borderTop: '1px dashed #e2e8f0', marginTop: '10px', paddingTop: '10px' }}>
                                    <span className="summary-label-text">Total Paid</span>
                                    <span className="summary-amount-right paid">{cs} {totals.paid}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


            </div>

            {/* Add Payment Modal */}
            {showAddPayment && (
                <AddPayment
                    onClose={() => setShowAddPayment(false)}
                    onAdd={handleAddPayment}
                    reservation={{
                        ...reservation,
                        totalAmount: totals.grandTotal,
                        paidAmount: totals.paid,
                        remainingAmount: totals.remaining
                    }}
                />
            )}

            {/* Add Charges Modal */}
            {showAddCharges && (
                <AddCharges
                    onClose={() => setShowAddCharges(false)}
                    onAdd={async (chargeData) => {
                        if (handleAddCharge) await handleAddCharge(chargeData);
                        setShowAddCharges(false);
                    }}
                    reservation={{
                        ...reservation,
                        totalAmount: totals.grandTotal,
                        balanceDue: totals.remaining
                    }}
                />
            )}

            {/* Apply Discount Sidebar */}
            {showApplyDiscount && (
                <ApplyDiscountSidebar
                    onClose={() => setShowApplyDiscount(false)}
                    onApply={handleApplyDiscount}
                    reservation={reservation}
                />
            )}

            {/* New Folio Modal */}
            {showNewFolio && (
                <NewFolio
                    onClose={() => setShowNewFolio(false)}
                    onSave={handleSaveNewFolio}
                    reservation={reservation}
                />
            )}

            {/* Route Folio Sidebar */}
            {showRouteFolioSidebar && (
                <RouteFolioSidebar
                    onClose={() => setShowRouteFolioSidebar(false)}
                    onSave={handleRouteFolioSave}
                    sourceFolioId={folioList.find(f => f.id === selectedRoom)?.folioId || 0}
                    sourceFolioName={folioList.find(f => f.id === selectedRoom)?.name || ''}
                    availableFolios={folioList}
                    transactions={allTransactions}
                />
            )}

            {/* Confirmation Modal */}
            {showConfirmationModal && pendingRouteData && (
                <ConfirmationModal
                    isOpen={showConfirmationModal}
                    onClose={() => {
                        setShowConfirmationModal(false);
                        setPendingRouteData(null);
                    }}
                    onConfirm={confirmRouting}
                    title="Confirm Folio Routing"
                    message={`Are you sure you want to route ${pendingRouteData.transactionCount} charge(s) to ${pendingRouteData.targetFolioName}? This action will move the selected transactions from the current folio.`}
                    confirmText="Route Charges"
                    cancelText="Cancel"
                    isProcessing={isProcessingRoute}
                    variant="danger"
                />
            )}

            {/* Print Folio Slide Drawer */}
            {showPrintDrawer && (
                <div className="add-payment-overlay" onClick={() => setShowPrintDrawer(false)}>
                    <div className="add-payment-modal" onClick={(e) => e.stopPropagation()} style={{ width: '420px' }}>
                        <div className="premium-payment-header">
                            <div className="header-icon-wrap" aria-hidden="true">
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.3"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            </div>
                            <div className="header-text">
                                <h3>Print Folio</h3>
                                <span>Select Print Format</span>
                            </div>
                            <button className="premium-close-btn" onClick={() => setShowPrintDrawer(false)} aria-label="Close print options">×</button>
                        </div>

                        <div className="add-payment-form-premium" style={{ height: '100%', width: '100%', boxSizing: 'border-box' }}>
                            <div className="add-payment-body" style={{ gap: '16px' }}>
                                <div className="payment-summary-card" style={{ marginBottom: '4px' }}>
                                    <div className="summary-header">
                                        <span className="ref-tag">FOLIO</span>
                                        <span className="ref-number">{folioList.find(f => f.id === selectedRoom)?.roomNumber || reservation?.roomNumber || '-'}</span>
                                    </div>
                                    <div className="summary-main">
                                        <div className="summary-column">
                                            <div className="summary-item"><label>GUEST</label><span>{folioList.find(f => f.id === selectedRoom)?.guestName || reservation?.guestName || 'N/A'}</span></div>
                                        </div>
                                        <div className="summary-column">
                                            <div className="summary-item"><label>BALANCE</label><span style={{ color: '#e11d48', fontWeight: '900' }}>{cs}{totals.remaining.toFixed(2)}</span></div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="field-label-premium" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span>🖨️</span> SELECT PRINT FORMAT
                                    </label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                        {printFormats.map((fmt) => (
                                            <button
                                                key={fmt.key}
                                                type="button"
                                                onClick={() => setSelectedPrintType(fmt.key)}
                                                style={{
                                                    background: selectedPrintType === fmt.key ? '#fef2f2' : 'white',
                                                    border: selectedPrintType === fmt.key ? '2px solid #e11d48' : '2px solid #f1f5f9',
                                                    borderRadius: '16px',
                                                    padding: '16px 8px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    boxShadow: selectedPrintType === fmt.key ? '0 8px 20px rgba(225, 29, 72, 0.15)' : 'none',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                <span style={{ fontSize: '24px' }}>{fmt.icon}</span>
                                                <span style={{ fontSize: '13px', fontWeight: '800', color: selectedPrintType === fmt.key ? '#e11d48' : '#475569' }}>{fmt.label}</span>
                                                <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700' }}>{fmt.desc}</span>
                                                {selectedPrintType === fmt.key && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '-6px',
                                                        right: '-6px',
                                                        background: '#e11d48',
                                                        color: 'white',
                                                        width: '20px',
                                                        height: '20px',
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '10px',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                                        border: '2px solid white'
                                                    }}>✓</div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ marginTop: 'auto', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px' }}>
                                    <div style={{ color: '#64748b', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Selected Format</div>
                                    <div style={{ color: '#1e293b', fontSize: '14px', fontWeight: '800', marginTop: '4px' }}>
                                        {printFormats.find(p => p.key === selectedPrintType)?.icon} {printFormats.find(p => p.key === selectedPrintType)?.label}
                                    </div>
                                </div>
                            </div>

                            <div className="payment-modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setShowPrintDrawer(false)}>CANCEL</button>
                                <button type="button" className="btn-primary" onClick={() => handlePrintFolio(selectedPrintType)} style={{ flex: 2 }}>
                                    PRINT FOLIO
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editingItem && (
                <div className="edit-transaction-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="edit-transaction-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Edit Transaction</h3>
                        <div className="edit-form">
                            <div className="edit-field">
                                <label>Particulars</label>
                                <input
                                    type="text"
                                    value={editingItem.particulars}
                                    onChange={(e) => setEditingItem({ ...editingItem, particulars: e.target.value })}
                                />
                            </div>
                            <div className="edit-field">
                                <label>Description</label>
                                <textarea
                                    value={editingItem.description}
                                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                                />
                            </div>
                            <div className="edit-field">
                                <label>Amount</label>
                                <input
                                    type="number"
                                    value={Math.abs(editingItem.amount)}
                                    onChange={(e) => setEditingItem({ ...editingItem, amount: editingItem.amount < 0 ? -Math.abs(parseFloat(e.target.value)) : Math.abs(parseFloat(e.target.value)) })}
                                />
                            </div>
                            <div className="edit-actions">
                                <button className="btn-cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
                                <button className="btn-save" onClick={handleSaveEdit}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Global fixed three-dot dropdown — renders above the row */}
            {activeMenu !== null && (
                <>
                    <div
                        style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
                        onClick={() => setActiveMenu(null)}
                    />
                    <div
                        className="action-dropdown action-dropdown-fixed"
                        style={{
                            position: 'fixed',
                            bottom: `${menuPosition.bottom}px`,
                            right: `${menuPosition.right}px`,
                            zIndex: 9999,
                        }}
                    >
                        <button onClick={() => handlePrint(activeMenu)}>🖨️ Print</button>
                        <button onClick={() => handleEdit(activeMenu)}>✏️ Edit</button>
                        <button onClick={() => handleVoid(activeMenu)}>🗑️ Void</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default FolioOperations;

