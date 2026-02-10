import StatusBadge from './StatusBadge';
import MoreOptionsMenu from './MoreOptionsMenu';

const ReservationCard = ({ reservation, onUpdateStatus, onEdit, onDelete, onGenerateInvoice = () => { }, onSelect, isSelected, onActionSelect }) => {


    const getPrimaryAction = (status) => {
        switch (status) {
            case 'RESERVED':
                return { label: 'Check In', action: 'IN_HOUSE', type: 'checkIn', icon: '🏨' };
            case 'IN_HOUSE':
                return { label: 'Check Out', action: 'CHECKED_OUT', type: 'checkOut', icon: '👋' };
            case 'CHECKED_OUT':
                return { label: 'View Invoice', action: 'viewInvoice', type: 'invoice', icon: '🧾' };
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

    const checkInDateObj = new Date(reservation.checkInDate);
    const checkOutDateObj = new Date(reservation.checkOutDate);

    const formatDate = (date) => date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    const formatTime = (time) => {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const h = parseInt(hours, 10);
        const period = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${period}`;
    };

    const roomNumber = reservation.rooms?.[0]?.roomNumber || 'N/A';
    const adults = reservation.rooms?.[0]?.adultsCount || 0;
    const children = reservation.rooms?.[0]?.childrenCount || 0;

    return (
        <div
            className={`reservation-card-list-item ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect && onSelect(reservation)}
        >
            <div className="card-left-section">
                <div className="room-number-box">
                    <span>{roomNumber}</span>
                </div>
                <div className="guest-info-box">
                    <h4 className="guest-name">{reservation.guestName}</h4>
                    {/* <span className="guest-id">Ref: {reservation.id.substring(0, 8)}</span> */}
                </div>
            </div>

            <div className="card-middle-section">
                <div className="info-col">
                    <label>CHECK-IN</label>
                    <span className="info-date">{formatDate(checkInDateObj)}</span>
                    <span className="info-time">{formatTime(reservation.checkInTime)}</span>
                </div>
                <div className="info-col">
                    <label>CHECK-OUT</label>
                    <span className="info-date">{formatDate(checkOutDateObj)}</span>
                    <span className="info-time">{formatTime(reservation.checkOutTime)}</span>
                </div>
                <div className="info-col">
                    <label>RATE</label>
                    <span className="info-rate">₹{reservation.totalAmount?.toLocaleString('en-IN') || '0'}</span>
                </div>
                <div className="info-col">
                    <label>GUESTS</label>
                    <div className="guest-counts">
                        <span title="Adults">👨 × {adults}</span>
                        {children > 0 && <span title="Children">👶 × {children}</span>}
                    </div>
                </div>
            </div>

            <div className="card-right-section">
                <div className="action-icons">
                    <button className="icon-btn" title="Statistics">📊</button>
                    <button className="icon-btn" title="Inspect" onClick={(e) => { e.stopPropagation(); onSelect && onSelect(reservation); }}>�</button>
                    <button className="icon-btn" title="Services">👔</button>
                </div>

                {primaryAction && (
                    <button
                        className="view-order-btn"
                        onClick={handlePrimaryAction}
                    >
                        {/* <span className="btn-icon">{primaryAction.icon}</span> */}
                        {primaryAction.label}
                    </button>
                )}
                <div className="menu-container" onClick={e => e.stopPropagation()}>
                    <MoreOptionsMenu
                        booking={reservation}
                        onActionSelect={onActionSelect}
                        buttonLabel="+"
                        buttonClassName="plus-menu-btn"
                        options={[
                            { id: 'print-summary', label: '📄 Print Summary', color: '#6366f1', disabled: false },
                            { id: 'print-invoice', label: '🧾 Print Invoice', color: '#8b5cf6', disabled: false },
                            { id: 'print-grc', label: '📋 Print GRC', color: '#0ea5e9', disabled: false },
                            { id: 'print-grc-all', label: '📋 Print GRC All', color: '#06b6d4', disabled: false },
                            { id: 'send-invoice', label: '📧 Send Invoice', color: '#14b8a6', disabled: !reservation.guestEmail }
                        ]}
                    />
                </div>
            </div>
        </div>
    );
};

export default ReservationCard;
