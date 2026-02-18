const StatusBadge = ({ status }) => {
    const getStatusClass = (status) => {
        switch (status) {
            case 'Upcoming':
                return 'status-upcoming';
            case 'Checked-in':
                return 'status-checkedin';
            case 'Checked-out':
                return 'status-checkedout';
            case 'Cancelled':
                return 'status-cancelled';
            default:
                return '';
        }
    };

    return (
        <span className={`status-badge ${getStatusClass(status)}`}>
            {status}
        </span>
    );
};

export default StatusBadge;
