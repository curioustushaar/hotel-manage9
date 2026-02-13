import StatusBadge from './StatusBadge';

const ReservationCard = ({ reservation, onUpdateStatus, onEdit, onDelete, onGenerateInvoice = () => { }, onSelect, isSelected, onActionSelect }) => {


    const getPrimaryAction = (status) => {
        switch (status) {
            case 'RESERVED':
                return { label: 'CHECK-IN', action: 'IN_HOUSE', type: 'checkIn', className: 'btn-check-in' };
            case 'IN_HOUSE':
                return { label: 'CHECK-OUT', action: 'CHECKED_OUT', type: 'checkOut', className: 'btn-check-out' };
            case 'CHECKED_OUT':
                return { label: 'VIEW INVOICE', action: 'viewInvoice', type: 'invoice', className: 'btn-invoice' };
            default:
                return null;
        }
    };

    const primaryAction = getPrimaryAction(reservation.status);

    const handlePrimaryAction = (e) => {
        e.stopPropagation();
        if (primaryAction.type === 'checkOut') {
            onGenerateInvoice(reservation);
        } else if (primaryAction.type === 'invoice') {
            onGenerateInvoice({ ...reservation, actionType: 'viewInvoice' });
        } else {
            onUpdateStatus(reservation.id, primaryAction.action);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    };

    return (
        <div
            className={`reservation-card ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect && onSelect(reservation)}
        >
            <div className="res-card-header">
                <h3 className="guest-name">{reservation.guestName}</h3>
                <span className={`status-text ${reservation.status.toLowerCase()}`}>
                    {reservation.status === 'IN_HOUSE' ? 'IN_HOUSE' :
                        reservation.status === 'CHECKED_OUT' ? 'CHECKED_OUT' : 'RESERVED'}
                </span>
            </div>

            <div className="res-card-ref">
                Ref: {reservation.referenceNumber || reservation.id?.substring(0, 10) + '...'}
            </div>

            <div className="res-card-dates">
                <span className="date">{formatDate(reservation.checkInDate)}</span>
                <span className="arrow">→</span>
                <span className="date">{formatDate(reservation.checkOutDate)}</span>
                <span className="nights">{reservation.nights} night(s)</span>
            </div>

            <div className="res-card-rooms">
                <span className="room-icon">🛏</span>
                <span>{reservation.rooms?.length || 1} Room(s)</span>
            </div>

            <div className="res-card-financials">
                <div className="fin-col">
                    <label>AMOUNT</label>
                    <span className="amount">₹{reservation.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
                <div className="fin-col">
                    <label className="text-green">PAID</label>
                    <span className="amount text-green">₹{reservation.paidAmount?.toLocaleString('en-IN')}</span>
                </div>
                <div className="fin-col">
                    <label className="text-red">BALANCE</label>
                    <span className="amount text-red">₹{reservation.balanceDue?.toLocaleString('en-IN')}</span>
                </div>
            </div>

            <div className="res-card-contact">
                <div className="contact-row">
                    <span className="icon">📞</span>
                    <span>{reservation.guestPhone}</span>
                </div>
                <div className="contact-row">
                    <span className="icon">📧</span>
                    <span className="email-text">{reservation.guestEmail || 'No Email'}</span>
                </div>
            </div>

            <div className="res-card-footer">
                {primaryAction && (
                    <button
                        className={`btn-main-action ${primaryAction.className}`}
                        onClick={handlePrimaryAction}
                    >
                        {primaryAction.label}
                    </button>
                )}

            </div>
        </div>
    );
};

export default ReservationCard;
