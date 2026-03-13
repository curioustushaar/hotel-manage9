import React, { useMemo } from 'react';
import './EditReservationModal.css';
import { useSettings } from '../context/SettingsContext';

const RoomCharges = ({ reservation }) => {
    const { getCurrencySymbol } = useSettings();
    const cs = getCurrencySymbol();
    if (!reservation) return null;

    const charges = useMemo(() => {
        const items = [];
        const checkIn = new Date(reservation.checkInDate);
        const nights = reservation.nights || 1;
        const rate = reservation.rooms?.[0]?.ratePerNight || 0;
        const roomNo = reservation.rooms?.[0]?.roomNumber || 'TBD';

        // 1. Generate daily room charges (Always attributed to Primary Folio implicitly)
        for (let i = 0; i < nights; i++) {
            const date = new Date(checkIn);
            date.setDate(checkIn.getDate() + i);

            items.push({
                date: date.toISOString().split('T')[0],
                description: `Room Charge - Room ${roomNo}`,
                amount: rate,
                type: 'Room Rent',
                folioName: 'Primary'
            });
        }

        // 2. Add actual transactions categorized by folio
        if (reservation.transactions && reservation.transactions.length > 0) {
            reservation.transactions.forEach(t => {
                // Skip base room tariff transactions as they are generated above virtually for the breakdown
                if (['Room Tariff', 'Room Rent', 'Room Charges'].includes(t.particulars)) return;
                
                if (t.type?.toLowerCase() === 'charge') {
                    // Identify guest name for the folio if possible
                    let fName = Number(t.folioId || 0) === 0 ? 'Primary' : `Guest Folio ${t.folioId}`;
                    if (Number(t.folioId) > 0 && reservation.additionalGuests) {
                        const guest = reservation.additionalGuests[Number(t.folioId) - 1];
                        if (guest) fName = guest.name;
                    }

                    items.push({
                        date: t.date || new Date().toISOString().split('T')[0],
                        description: t.description || t.particulars,
                        amount: t.amount,
                        type: 'Extra',
                        folioName: fName
                    });
                }
            });
        }

        return items;
    }, [reservation]);

    const totalCharges = charges.reduce((sum, item) => sum + item.amount, 0);
    const totalDiscount = reservation.discount || 0;
    const tax = reservation.tax || 0;
    const grandTotal = totalCharges - totalDiscount + tax;

    const formatCurrency = (amount) => {
        return `${cs}${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="booking-details-container">
            <h3 className="details-section-title">Room Charges Breakdown</h3>

            <div className="details-table-container">
                <table className="details-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Folio / Guest</th>
                            <th>Description</th>
                            <th>Type</th>
                            <th className="text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {charges.length > 0 ? (
                            charges.map((charge, index) => (
                                <tr key={index}>
                                    <td>{formatDate(charge.date)}</td>
                                    <td style={{ fontWeight: '600', color: charge.folioName === 'Primary' ? '#111' : '#6366f1' }}>
                                        {charge.folioName}
                                    </td>
                                    <td>{charge.description}</td>
                                    <td>
                                        <span className={`status-badge-modal ${charge.type === 'Room Rent' ? 'in_house' : 'reserved'}`}>
                                            {charge.type}
                                        </span>
                                    </td>
                                    <td className="text-right">{formatCurrency(charge.amount)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colspan="4" className="text-center" style={{ textAlign: 'center', padding: '20px' }}>
                                    No charges found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="billing-summary-grid" style={{ marginTop: '20px' }}>
                <div className="billing-row">
                    <span className="billing-label">Total Charges</span>
                    <span className="billing-value">{formatCurrency(totalCharges)}</span>
                </div>
                <div className="billing-row">
                    <span className="billing-label">Discount Applied</span>
                    <span className="billing-value discount">-{formatCurrency(totalDiscount)}</span>
                </div>
                <div className="billing-row">
                    <span className="billing-label">Taxes</span>
                    <span className="billing-value">{formatCurrency(tax)}</span>
                </div>
                <div className="billing-row total-row">
                    <span className="billing-label">Net Payable</span>
                    <span className="billing-value total">{formatCurrency(grandTotal)}</span>
                </div>
            </div>
        </div>
    );
};

export default RoomCharges;
