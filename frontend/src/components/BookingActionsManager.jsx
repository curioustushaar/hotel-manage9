import { useState } from 'react';
import Drawer from './Drawer';
import Toast from './Toast';
import CheckInForm from './forms/CheckInForm';
import AddPaymentForm from './forms/AddPaymentForm';
import AmendStayForm from './forms/AmendStayForm';
import RoomMoveForm from './forms/RoomMoveForm';
import ExchangeRoomForm from './forms/ExchangeRoomForm';
import AddVisitorForm from './forms/AddVisitorForm';
import NoShowForm from './forms/NoShowForm';
import VoidReservationForm from './forms/VoidReservationForm';
import CancelReservationForm from './forms/CancelReservationForm';

import PrintSummaryForm from './forms/PrintSummaryForm';
import PrintInvoiceForm from './forms/PrintInvoiceForm';
import PrintGRCForm from './forms/PrintGRCForm';
import PrintGRCAllForm from './forms/PrintGRCAllForm';
import SendInvoiceForm from './forms/SendInvoiceForm';
import AddVisitorDrawer from './visitors/AddVisitorDrawer';
import API_URL from '../config/api';
import soundManager from '../utils/soundManager';

const ACTION_CONFIG = {
    'check-in': { title: '✓ Check-In Guest', endpoint: (id) => `/api/reservations/checkin/${id}`, method: 'PUT' },
    'add-payment': { title: '💳 Add Payment', endpoint: (id) => `/api/bookings/add-payment/${id}`, method: 'POST' },
    'amend-stay': { title: '📅 Amend Stay', endpoint: (id) => `/api/reservations/amend/${id}`, method: 'PUT' },
    'room-move': { title: '🚪 Room Move', endpoint: (id) => `/api/reservations/${id}/room-move`, method: 'PUT' },
    'exchange-room': { title: '⇄ Exchange Room', endpoint: (id) => `/api/reservations/${id}/exchange-room`, method: 'PUT' },
    'add-visitor': { title: '👤 Add Visitor', endpoint: (id) => `/api/bookings/add-visitor/${id}`, method: 'POST' },
    'no-show': { title: '❌ Mark No-Show', endpoint: (id) => `/api/reservations/${id}/no-show`, method: 'PUT' },
    'void': { title: '🗑️ Void Reservation', endpoint: (id) => `/api/reservations/${id}/void`, method: 'PUT' },
    'cancel': { title: '⚠️ Cancel Reservation', endpoint: (id) => `/api/bookings/cancel/${id}`, method: 'POST' },
    'print-summary': { title: '📄 Print Summary' },
    'print-invoice': { title: '🧾 Print Invoice' },
    'print-grc': { title: '📋 Print GRC' },
    'print-grc-all': { title: '📋 Print All GRCs' },
    'send-invoice': { title: '📧 Send Invoice' },
};

const PRINT_ACTIONS = ['print-summary', 'print-invoice', 'print-grc', 'print-grc-all', 'send-invoice'];

const BookingActionsManager = ({ isOpen, onClose, actionType, booking, onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState(null);

    const config = ACTION_CONFIG[actionType] || {};

    const handleSubmit = async (formData) => {
        if (PRINT_ACTIONS.includes(actionType)) {
            onSuccess?.(booking);
            onClose();
            return;
        }

        const bookingId = booking?._id || booking?.id;
        if (!bookingId) {
            setToast({ message: 'Booking ID not found', type: 'error' });
            return;
        }

        if (!config.endpoint) {
            setToast({ message: 'Invalid action type', type: 'error' });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_URL}${config.endpoint(bookingId)}`, {
                method: config.method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Action failed');

            if (data.success) {
                if (actionType === 'check-in') soundManager.play('success');

                if (actionType !== 'add-payment') {
                    setToast({ message: data.message || `${config.title} completed successfully!`, type: 'success' });
                }

                const updatedData = data.data || data.updatedReservation;
                if (updatedData) onSuccess?.(updatedData);

                const closingDelay = (actionType === 'add-payment' || actionType === 'check-in') ? 500 : 1500;
                setTimeout(() => onClose(), closingDelay);
            } else {
                throw new Error(data.message || 'Action failed');
            }
        } catch (error) {
            setToast({ message: error.message, type: 'error' });
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderForm = () => {
        if (!booking) return null;
        const formProps = { booking, onSubmit: handleSubmit, onCancel: onClose };

        switch (actionType) {
            case 'check-in': return <CheckInForm {...formProps} />;
            case 'add-payment': return <AddPaymentForm {...formProps} />;
            case 'amend-stay': return <AmendStayForm {...formProps} />;
            case 'room-move': return <RoomMoveForm {...formProps} />;
            case 'exchange-room': return <ExchangeRoomForm {...formProps} />;
            case 'add-visitor': return <AddVisitorForm {...formProps} />;
            case 'no-show': return <NoShowForm {...formProps} />;
            case 'void': return <VoidReservationForm {...formProps} />;
            case 'cancel': return <CancelReservationForm {...formProps} />;
            case 'print-summary': return <PrintSummaryForm {...formProps} />;
            case 'print-invoice': return <PrintInvoiceForm {...formProps} />;
            case 'print-grc': return <PrintGRCForm {...formProps} />;
            case 'print-grc-all': return <PrintGRCAllForm {...formProps} />;
            case 'send-invoice': return <SendInvoiceForm {...formProps} />;
            default: return <div className="p-6 text-center text-gray-500">Invalid action</div>;
        }
    };

    if (actionType === 'add-visitor' && booking) {
        return (
            <AddVisitorDrawer
                isOpen={isOpen}
                onClose={onClose}
                reservationId={booking._id || booking.id}
                booking={booking}
                onVisitorAdded={() => onSuccess?.(booking)}
            />
        );
    }

    return (
        <>
            <Drawer isOpen={isOpen} onClose={onClose} title={config.title || 'Action'} height="premium">
                {renderForm()}
            </Drawer>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </>
    );
};

export default BookingActionsManager;
