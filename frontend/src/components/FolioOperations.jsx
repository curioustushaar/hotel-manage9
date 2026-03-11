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

const FolioOperations = ({ reservation, onTotalsChange }) => {
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
                    particulars: t.particulars || (t.type === 'charge' || t.type === 'Charge' ? 'Room Stay' : t.type),
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
        const newTransaction = {
            type: 'Charge',
            day: new Date(chargeData.date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                weekday: 'short'
            }),
            particulars: chargeData.chargeType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            description: chargeData.description || `${chargeData.chargeType} - Qty: ${chargeData.quantity}`,
            amount: chargeData.totalAmount,
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

                // Show success toast
                setToast({
                    message: 'Charge added successfully!',
                    type: 'success'
                });
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
                const selectedFolio = folioList.find(f => f.id === selectedRoom);
                await fetchTransactions(selectedFolio ? selectedFolio.bookingId : null);
                setShowAddPayment(false);

                // Show success toast
                setToast({
                    message: 'Payment added successfully!',
                    type: 'success'
                });
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
        const currentCharges = currentFolioTransactions.filter(t => t.type === 'charge').reduce((sum, t) => sum + t.amount, 0);

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

                // Show success toast
                setToast({
                    message: 'Discount applied successfully!',
                    type: 'success'
                });
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
    // Print full folio statement
    const handlePrintFolio = () => {
        if (!currentFolioTransactions.length) return;
        const selectedFolioData = folioList.find(f => f.id === selectedRoom);
        const guestName = selectedFolioData?.guestName || reservation?.guestName || '';
        const roomNo = selectedFolioData?.roomNumber || reservation?.roomNumber || '';
        const hotelName = settings?.name || 'Hotel';
        const address = [settings?.address, settings?.city, settings?.state].filter(Boolean).join(', ');

        const rows = currentFolioTransactions.map(t => `
            <tr>
                <td>${t.day || ''}</td>
                <td><strong>${t.particulars || ''}</strong></td>
                <td style="color:#6b7280">${t.description || ''}</td>
                <td style="text-align:right;font-weight:600;color:${t.amount < 0 ? '#16a34a' : '#111'}">
                    ${t.amount < 0 ? '&minus; ' : ''}${cs} ${Math.abs(Number(t.amount)).toFixed(2)}
                </td>
                <td style="color:#9ca3af;font-size:11px">${t.user || ''}</td>
            </tr>`).join('');

        const content = `<!DOCTYPE html><html><head><title>Folio - ${roomNo}</title>
            <style>
                @page { size: A4; margin: 15mm; }
                body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #111; margin: 0; }
                .header { text-align: center; margin-bottom: 18px; }
                .hotel-name { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
                .sub { font-size: 10px; color: #777; margin-top: 2px; }
                .meta { display: flex; justify-content: space-between; margin: 14px 0; padding: 10px 14px;
                    background: #f8f9fa; border-radius: 6px; font-size: 11px; }
                .meta-col { display: flex; flex-direction: column; gap: 3px; }
                .meta span { color: #6b7280; } .meta strong { color: #111; font-size: 12px; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th { padding: 8px 10px; text-align: left; border-bottom: 2px solid #000;
                    font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #374151; }
                td { padding: 8px 10px; border-bottom: 1px solid #f0f0f0; vertical-align: top; }
                .totals-wrap { display: flex; justify-content: flex-end; margin-top: 18px; }
                .totals-table { width: 280px; border-collapse: collapse; }
                .totals-table td { padding: 5px 10px; border: none; }
                .totals-table .grand td { font-weight: 800; font-size: 14px; border-top: 2px solid #000;
                    border-bottom: 2.5px double #000; padding-top: 8px; padding-bottom: 8px; }
                .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #9ca3af;
                    border-top: 1px dashed #ddd; padding-top: 10px; }
            </style></head><body>
            <div class="header">
                <div class="hotel-name">${hotelName}</div>
                ${address ? `<div class="sub">${address}</div>` : ''}
            </div>
            <div class="meta">
                <div class="meta-col"><span>Room No.</span><strong>${roomNo}</strong></div>
                <div class="meta-col"><span>Guest</span><strong>${guestName}</strong></div>
                <div class="meta-col"><span>Printed</span><strong>${new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</strong></div>
            </div>
            <table>
                <thead><tr>
                    <th>Date</th><th>Particulars</th><th>Description</th>
                    <th style="text-align:right">Amount</th><th>User</th>
                </tr></thead>
                <tbody>${rows}</tbody>
            </table>
            <div class="totals-wrap"><table class="totals-table">
                <tr><td>Subtotal</td><td style="text-align:right">${cs} ${totals.subTotal.toFixed(2)}</td></tr>
                ${totals.discounts > 0 ? `<tr><td>Discount</td><td style="text-align:right;color:#dc2626">&minus; ${cs} ${totals.discounts.toFixed(2)}</td></tr>` : ''}
                <tr class="grand"><td>Grand Total</td><td style="text-align:right">${cs} ${totals.grandTotal.toFixed(2)}</td></tr>
                <tr><td>Paid</td><td style="text-align:right;color:#16a34a">${cs} ${totals.paid.toFixed(2)}</td></tr>
                <tr><td style="color:${totals.remaining > 0 ? '#dc2626' : '#16a34a'};font-weight:600">Remaining</td>
                    <td style="text-align:right;color:${totals.remaining > 0 ? '#dc2626' : '#16a34a'};font-weight:700">${cs} ${totals.remaining.toFixed(2)}</td></tr>
            </table></div>
            <div class="footer">Thank you for staying with us &mdash; ${hotelName}</div>
            <script>window.onload=function(){window.print();setTimeout(()=>window.close(),500)}<\/script>
            </body></html>`;

        const w = window.open('', '_blank', 'height=700,width=900');
        w.document.write(content);
        w.document.close();
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

    const hasRoomTariff = currentFolioTransactions.some(t =>
        t.particulars === 'Room Tariff' ||
        t.particulars === 'Room Charges' ||
        (t.description?.toLowerCase().includes('room charges'))
    );

    // If this is the Primary Folio and no Room Tariff is posted yet, show it as a virtual entry
    if (!hasRoomTariff && selectedFolio && Number(selectedFolio.folioId) === 0) {
        const roomTotal = reservation?.billing?.totalAmount || reservation?.totalAmount || 0;
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
                description: `Room Stay (${reservation?.duration?.nights || 1} nights)`,
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

        // Include advance payment from reservation details if this is the primary folio
        const selectedFolio = folioList.find(f => f.id === selectedRoom);
        const advance = (selectedFolio && Number(selectedFolio.folioId) === 0)
            ? Number(reservation?.billing?.advanceAmount || reservation?.advanceAmount || 0)
            : 0;

        payments += advance;

        const grandTotal = charges - discounts;
        const remaining = grandTotal - payments;

        return { subTotal: charges, grandTotal, paid: payments, remaining, discounts, advance };
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
                        onClick={handlePrintFolio}
                        disabled={currentFolioTransactions.length === 0}
                        title="Print full folio"
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

                {/* Charges Table - Only show when routing section is hidden */}
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
                                                <span className={transaction.type === 'payment' ? 'payment-badge' : ''}>
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

                {/* Visitors Section */}
                {!showRoutingSection && (
                    <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Visitors</h3>
                        <VisitorList
                            reservationId={reservation?._id || reservation?.id}
                            refreshTrigger={reservation?.updatedAt}
                        />
                    </div>
                )}
            </div>

            {/* Add Payment Modal */}
            {showAddPayment && (
                <AddPayment
                    onClose={() => setShowAddPayment(false)}
                    onAdd={handleAddPayment}
                    reservation={reservation}
                />
            )}

            {/* Add Charges Modal */}
            {showAddCharges && (
                <AddCharges
                    onClose={() => setShowAddCharges(false)}
                    onAdd={handleAddCharge}
                    reservation={reservation}
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
                />
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

