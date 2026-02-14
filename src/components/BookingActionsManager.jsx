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
import { LayoutGrid } from 'lucide-react';
import API_URL from '../config/api';

const BookingActionsManager = ({ isOpen, onClose, actionType, booking, onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState(null);

    const getActionTitle = () => {
        if (actionType === 'exchange-room') {
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <LayoutGrid size={20} strokeWidth={2.5} />
                    <span>Exchange Room</span>
                </div>
            );
        }

        const titles = {
            'check-in': '✓ Check-In Guest',
            'add-payment': '💳 Add Payment',
            'amend-stay': '📅 Amend Stay',
            'room-move': '🚪 Room Move',
            'add-visitor': '👤 Add / Show Visitor',
            'no-show': '❌ Mark No-Show',
            'void': '🗑️ Void Reservation',
            'cancel': '⚠️ Cancel Reservation',
            'print-summary': '📄 Print Summary',
            'print-invoice': '🧾 Print Invoice',
            'print-grc': '📋 Print GRC',
            'print-grc-all': '📋 Print All GRCs',
            'send-invoice': '📧 Send Invoice'
        };
        return titles[actionType] || 'Action';
    };

    const handleSubmit = async (formData) => {
        // For print and email actions, handle locally without API call
        if (['print-summary', 'print-invoice', 'print-grc', 'print-grc-all', 'send-invoice'].includes(actionType)) {
            console.log(`${actionType} completed:`, formData);
            onSuccess?.(booking);
            onClose();
            return;
        }

        setIsSubmitting(true);

        try {
            let endpoint = '';
            let method = 'POST';

            // Determine endpoint based on action type
            switch (actionType) {
                case 'check-in':
                    if (!booking._id) throw new Error("Invalid booking ID");
                    endpoint = `/api/reservations/checkin/${booking._id}`;
                    console.log("Calling URL:", endpoint);
                    method = 'PUT';
                    break;
                case 'add-payment':
                    endpoint = `/api/bookings/add-payment/${booking._id}`;
                    break;
                case 'amend-stay':
                    endpoint = `/api/reservations/amend/${booking._id}`;
                    method = 'PUT';
                    break;
                case 'room-move':
                    endpoint = `/api/reservations/${booking._id || booking.id}/room-move`;
                    method = 'PUT';
                    break;
                case 'exchange-room':
                    endpoint = `/api/bookings/room-exchange/${booking._id}`;
                    break;
                case 'add-visitor':
                    endpoint = `/api/bookings/add-visitor/${booking._id}`;
                    break;
                case 'no-show':
                    const nsId = booking._id || booking.id;
                    if (!nsId) throw new Error("Booking ID not found");
                    endpoint = `/api/reservations/${nsId}/no-show`;
                    console.log(`[Frontend] Calling No-Show API: ${endpoint}`);
                    method = 'PUT';
                    break;
                case 'void':
                    const vId = booking._id || booking.id;
                    if (!vId) throw new Error("Booking ID not found");
                    endpoint = `/api/reservations/${vId}/void`;
                    method = 'PUT';
                    break;
                case 'cancel':
                    endpoint = `/api/bookings/cancel/${booking._id}`;
                    break;
            }


            const response = await fetch(`${API_URL}${endpoint}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Action failed');
            }

            if (data.success) {
                console.log("Response data for Check-In:", data);
                if (actionType !== 'check-in') {
                    if (actionType === 'amend-stay') {
                        setToast({ message: 'Stay amended successfully', type: 'success' });
                    } else if (actionType === 'room-move') {
                        setToast({ message: data.message || 'Room moved successfully', type: 'success' });
                    } else if (actionType === 'exchange-room') {
                        setToast({ message: data.message || 'Room exchanged successfully', type: 'success' });
                    } else {
                        alert(`✅ ${getActionTitle()} completed successfully!`);
                    }
                }
                const updatedData = data.data || data.updatedReservation;
                if (updatedData) {
                    console.log("Calling onSuccess with:", updatedData);
                    onSuccess?.(updatedData); // Notify parent component
                } else {
                    console.error("Updated reservation data missing in response!");
                }

                // If it was toast-based, wait for toast before closing
                if (['amend-stay', 'room-move', 'exchange-room'].includes(actionType)) {
                    setTimeout(() => onClose(), 2000);
                } else {
                    onClose(); // Close sidebar
                }
            } else {
                console.error("Action failed with message:", data.message);
                throw new Error(data.message || 'Action failed');
            }

        } catch (error) {
            console.error(`Error performing ${actionType}:`, error);
            if (actionType !== 'check-in') {
                if (['amend-stay', 'room-move', 'exchange-room'].includes(actionType)) {
                    setToast({ message: error.message, type: 'error' });
                } else {
                    alert(`❌ Error: ${error.message}`);
                }
            } else {
                if (error.response?.data?.message) {
                    console.error("Server error message:", error.response.data.message);
                } else {
                    console.error("Unknown error details:", error);
                }
            }
            throw error; // Re-throw to let form handle it
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderForm = () => {
        if (!booking) return null;

        const formProps = {
            booking,
            onSubmit: handleSubmit,
            onCancel: onClose
        };

        switch (actionType) {
            case 'check-in':
                return <CheckInForm {...formProps} />;
            case 'add-payment':
                return <AddPaymentForm {...formProps} />;
            case 'amend-stay':
                return <AmendStayForm {...formProps} />;
            case 'room-move':
                return <RoomMoveForm {...formProps} />;
            case 'exchange-room':
                return <ExchangeRoomForm {...formProps} />;
            case 'add-visitor':
                return <AddVisitorForm {...formProps} />;
            case 'no-show':
                return <NoShowForm {...formProps} />;
            case 'void':
                return <VoidReservationForm {...formProps} />;
            case 'cancel':
                return <CancelReservationForm {...formProps} />;
            case 'print-summary':
                return <PrintSummaryForm {...formProps} />;
            case 'print-invoice':
                return <PrintInvoiceForm {...formProps} />;
            case 'print-grc':
                return <PrintGRCForm {...formProps} />;
            case 'print-grc-all':
                return <PrintGRCAllForm {...formProps} />;
            case 'send-invoice':
                return <SendInvoiceForm {...formProps} />;

            default:
                return <div>Invalid action type</div>;
        }
    };



    if (actionType === 'add-visitor' && booking) {
        return (
            <AddVisitorDrawer
                isOpen={isOpen}
                onClose={onClose}
                reservationId={booking._id || booking.id}
                booking={booking}
                onVisitorAdded={() => {
                    if (onSuccess) onSuccess(booking);
                }}
            />
        );
    }

    return (
        <>
            <Drawer
                isOpen={isOpen}
                onClose={onClose}
                title={getActionTitle()}
                height="90vh"
            >
                {renderForm()}
            </Drawer>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </>
    );
};

export default BookingActionsManager;
