import { useState } from 'react';
import Drawer from './Drawer';
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
import API_URL from '../config/api';

const BookingActionsManager = ({ isOpen, onClose, actionType, booking, onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getActionTitle = () => {
        const titles = {
            'check-in': '✓ Check-In Guest',
            'add-payment': '💳 Add Payment',
            'amend-stay': '📅 Amend Stay',
            'room-move': '🚪 Room Move',
            'exchange-room': '🔄 Exchange Room',
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
                    endpoint = `/api/bookings/check-in/${booking._id}`;
                    break;
                case 'add-payment':
                    endpoint = `/api/bookings/add-payment/${booking._id}`;
                    break;
                case 'amend-stay':
                    endpoint = `/api/bookings/amend-stay/${booking._id}`;
                    break;
                case 'room-move':
                    endpoint = `/api/bookings/room-move/${booking._id}`;
                    break;
                case 'exchange-room':
                    endpoint = `/api/bookings/room-exchange/${booking._id}`;
                    break;
                case 'add-visitor':
                    endpoint = `/api/bookings/add-visitor/${booking._id}`;
                    break;
                case 'no-show':
                    endpoint = `/api/bookings/no-show/${booking._id}`;
                    break;
                case 'void':
                    endpoint = `/api/bookings/void/${booking._id}`;
                    break;
                case 'cancel':
                    endpoint = `/api/bookings/cancel/${booking._id}`;
                    break;
                default:
                    throw new Error('Invalid action type');
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
                alert(`✅ ${getActionTitle()} completed successfully!`);
                onSuccess?.(data.data); // Notify parent component
                onClose(); // Close drawer
            } else {
                throw new Error(data.message || 'Action failed');
            }

        } catch (error) {
            console.error(`Error performing ${actionType}:`, error);
            alert(`❌ Error: ${error.message}`);
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
            case 'add-visitor':
                return <AddVisitorForm {...formProps} />;
            case 'no-show':
                return <NoShowForm {...formProps} />;
            case 'void':
                return <VoidReservationForm {...formProps} />;
            case 'cancel':
                return <CancelReservationForm {...formProps} />;
            default:
                return <div>Invalid action type</div>;
        }
    };

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title={getActionTitle()}
            height="90vh"
        >
            {renderForm()}
        </Drawer>
    );
};

export default BookingActionsManager;
