import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../../config/api';
import { useSettings } from '../../context/SettingsContext';
import './GuestMealService.css';

// MenuItem helper component for premium feel
const MenuItem = ({ icon, label, onClick, color = '#111827', weight = '500' }) => (
    <div
        onMouseDown={onClick}
        className="menu-item-hover"
        style={{
            padding: '10px 12px',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            fontSize: '0.9rem',
            cursor: 'pointer',
            borderRadius: '10px',
            color: color,
            fontWeight: weight,
            transition: 'background 0.2s ease'
        }}
    >
        <span style={{ fontSize: '1.1rem' }}>{icon}</span>
        {label}
    </div>
);

const GuestMealService = () => {
    // Add internal animation styles
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes fadeInScale {
                from { opacity: 0; transform: scale(0.95) translateY(-10px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
            }
            .menu-item-hover:hover {
                background-color: #f3f4f6;
            }
            @keyframes blink {
                0% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(1.2); }
                100% { opacity: 1; transform: scale(1); }
            }
            .blink-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                display: inline-block;
                position: absolute;
                top: 15px;
                right: 50px;
                animation: blink 1.5s infinite ease-in-out;
                box-shadow: 0 0 8px rgba(0,0,0,0.2);
                border: 2px solid white;
            }
            .blink-yellow { background-color: #fca5a5; box-shadow: 0 0 10px #fca5a5; }   /* Pending - Reddish/Yellow per user request? User said Pending -> Yellow blink. Preparing -> Red blink. */
            /* Wait, user said Pending -> Yellow, Preparing -> Red. Let's fix colors. */
            .blink-yellow-real { background-color: #fbbf24; box-shadow: 0 0 10px #fbbf24; }
            .blink-red-real { background-color: #ef4444; box-shadow: 0 0 10px #ef4444; }
            .blink-green-real { background-color: #22c55e; box-shadow: 0 0 10px #22c55e; }
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.02); }
                100% { transform: scale(1); }
            }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);
    // --- STATE MANAGEMENT ---
    const navigate = useNavigate();
    const { settings, getCurrencySymbol } = useSettings();
    const cs = getCurrencySymbol();

    // Tables State
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredTables, setFilteredTables] = useState([]);

    // Filters & Search
    const [statusFilter, setStatusFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Modals
    const [showAddTableModal, setShowAddTableModal] = useState(false);

    // Table Types State
    const [tableTypes, setTableTypes] = useState(['General', 'AC', 'Non-AC', 'Garden']);
    const [isAddingTableType, setIsAddingTableType] = useState(false);
    const [newTableType, setNewTableType] = useState('');
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const typeDropdownRef = useRef(null);

    const [newTableData, setNewTableData] = useState({
        tableName: '',
        type: '',
        capacity: ''
    });

    // Close type dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target)) {
                setShowTypeDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Move Guest State
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [moveSourceTable, setMoveSourceTable] = useState(null);
    const [moveTargetTableId, setMoveTargetTableId] = useState('');

    // Reserve Table State
    const [showReserveModal, setShowReserveModal] = useState(false);
    const [reserveTargetTable, setReserveTargetTable] = useState(null);
    const [reserveFormData, setReserveFormData] = useState({
        name: '',
        date: '',
        startTime: '',
        endTime: '',
        guests: '',
        phone: '',
        source: 'Phone',
        advancePayment: 0
    });

    // Merge Table State
    const [showMergeModal, setShowMergeModal] = useState(false);
    const [mergeSelectedTargetIds, setMergeSelectedTargetIds] = useState([]);
    const [mergeSourceTable, setMergeSourceTable] = useState(null);
    const [mergeSourceGuests, setMergeSourceGuests] = useState(0);

    // Close Table State
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [closeTableData, setCloseTableData] = useState(null);

    // Split Modal State
    const [showSplitModal, setShowSplitModal] = useState(false);
    const [splitTableId, setSplitTableId] = useState(null);
    const [splitParts, setSplitParts] = useState(2);
    // Verify User State
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [verifyPhoneInput, setVerifyPhoneInput] = useState('');
    const [verifyTableId, setVerifyTableId] = useState(null);

    const [splitSubTables, setSplitSubTables] = useState([]);
    // Reservation List State
    const [showReservationListModal, setShowReservationListModal] = useState(false);
    const [reservationListTable, setReservationListTable] = useState(null);
    const [reservationSearchQuery, setReservationSearchQuery] = useState('');

    const [stats, setStats] = useState({
        total: 0,
        available: 0,
        running: 0,
        billed: 0,
        reserved: 0,
        revenue: 0,
        upcomingCount: 0
    });

    // Time Availability Filter State
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [filterTime, setFilterTime] = useState(new Date().toTimeString().slice(0, 5));
    // Persisted "Applied" filters
    const [appliedDate, setAppliedDate] = useState(new Date().toISOString().split('T')[0]);
    const [appliedTime, setAppliedTime] = useState(new Date().toTimeString().slice(0, 5));
    const [isTimeFilterActive, setIsTimeFilterActive] = useState(false);

    // Fetch tables on mount and periodically
    useEffect(() => {
        fetchTables();
        const interval = setInterval(fetchTables, 15000); // Refresh every 15 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchTables = async () => {
        try {
            const response = await fetch(`${API_URL}/api/guest-meal/tables`);
            const data = await response.json();
            if (data.success) {
                setTables(data.data);
                // Extract unique types
                const types = [...new Set(data.data.map(t => t.type))]
                    .filter(t => t && !t.toLowerCase().includes('burr'));
                // Merge with default types
                setTableTypes(prev => {
                    const merged = [...new Set([...prev, ...types])]
                        .filter(t => !t.toLowerCase().includes('burr'));
                    return merged;
                });
            } else {
                console.error("Failed to fetch tables", data);
            }
        } catch (error) {
            console.error('Error fetching tables:', error);
        } finally {
            setLoading(false);
        }
    };

    // --- TOAST NOTIFICATION ---
    const [toast, setToast] = useState({ show: false, message: '', subtext: '' });
    const showToast = (message, subtext = '') => {
        setToast({ show: true, message, subtext });
        setTimeout(() => setToast({ show: false, message: '', subtext: '' }), 2000);
    };

    const handleSendToCashier = async (e, table) => {
        e.stopPropagation();
        if (!table.currentOrderId) {
            showToast('No Order', 'This table has no active order to send.');
            return;
        }

        // Prevent sending if already sent (pending payment/billed)
        if (table.status === 'Billed' || table.orderStatus === 'Pending Payment') {
            showToast('Already Sent', 'Bill is already with cashier');
            return;
        }

        try {
            const orderId = table.currentOrderId._id || table.currentOrderId;

            console.log(`Sending order ${orderId} to cashier...`);
            const response = await fetch(`${API_URL}/api/guest-meal/orders/${orderId}/send-to-cashier`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();

            if (data.success) {
                showToast('Send Successful', 'Bill sent to cashier');
                fetchTables(); // Refresh UI

                console.log('Navigation state:', { activeMenu: 'cashier-section', refresh: true });
                // Navigate to cashier section directly
                navigate('/admin/cashier-section', {
                    state: { activeMenu: 'cashier-section', refresh: true }
                });
            } else {
                showToast('Send Failed', data.message || 'Error occurred');
            }
        } catch (error) {
            console.error('Error sending to cashier:', error);
            alert('Error sending to cashier');
        }
    };

    // Periodic stats refresh
    useEffect(() => {
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch(`${API_URL}/api/guest-meal/analytics/dashboard`);
            const data = await response.json();
            if (data.success) {
                const s = data.data;
                setStats({
                    total: s.totalTables || 0,
                    available: s.availableTables || 0,
                    running: s.runningTables || 0,
                    billed: s.billedTables || 0,
                    revenue: s.totalRevenue || 0,
                    upcomingCount: s.totalOrders || 0, // Using total orders today as proxy or similar
                    reserved: s.billedTables || 0 // Assuming reserved might be mapped elsewhere or just keeping billed for now
                });
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const isTimeOverlap = (start1, end1, start2, end2) => {
        if (!start1 || !end1 || !start2 || !end2) return false;
        const [s1h, s1m] = start1.split(':').map(Number);
        const [e1h, e1m] = end1.split(':').map(Number);
        const [s2h, s2m] = start2.split(':').map(Number);
        const [e2h, e2m] = end2.split(':').map(Number);

        const s1 = s1h * 60 + s1m;
        const e1 = e1h * 60 + e1m;
        const s2 = s2h * 60 + s2m;
        const e2 = e2h * 60 + e2m;

        return s1 < e2 && s2 < e1;
    };

    const checkReservationConflict = (table, formData) => {
        if (!table || !table.reservations) return null;
        return table.reservations.find(res =>
            res.id !== formData.id &&
            res.date === formData.date &&
            isTimeOverlap(res.startTime, res.endTime, formData.startTime, formData.endTime)
        );
    };

    // Reserve Table State removed

    // Waiters List
    const waiters = ['Rahul', 'Aman', 'Suresh', 'Priya', 'Kavita'];

    // Handle Menu Action
    const handleMenuAction = (action, table) => {
        if (action === 'Split Table') {
            openSplitModal(table);
        } else if (action === 'Reserve Table') {
            openReserveModal(table);
        } else if (action === 'Move Guests') {
            openMoveModal(table);
        } else if (action === 'Merge Table') {
            openMergeModal(table);
        } else if (action === 'Close Table') {
            openCloseModal(table);
        } else if (action === 'Verify User') {
            openVerifyModal(table);
        } else if (action === 'Reservation List') {
            openReservationListModal(table);
        } else if (action === 'Walk-in') {
            const handleWalkIn = async () => {
                const guestCount = prompt("Number of guests?", table.capacity) || table.capacity;
                try {
                    const targetId = table.tableId || table._id;
                    const response = await fetch(`${API_URL}/api/guest-meal/tables/${targetId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            status: 'Occupied',
                            currentOrderGuestCount: guestCount,
                            currentOrderGuestName: 'Walk-in'
                        })
                    });
                    const data = await response.json();
                    if (data.success) {
                        setTables(prev => prev.map(t => (t.tableId || t._id) === targetId ? {
                            ...data.data,
                            tableId: data.data._id || data.data.tableId
                        } : t));
                    }
                } catch (err) {
                    console.error("Walk-in error:", err);
                }
            };
            handleWalkIn();
        } else if (action === 'Release Table') {
            handleReleaseTable(table);
        } else if (action === 'Create Order' || action === 'Continue' || action === 'View Bill') {
            handleTableClick(table);
        }
    };

    const openReservationListModal = (table) => {
        setReservationListTable(table);
        setShowReservationListModal(true);
    };

    // Verify User Logic
    const openVerifyModal = (table = null) => {
        setVerifyTableId(table ? table.tableId : null);
        setVerifyPhoneInput('');
        setShowVerifyModal(true);
    };

    const handleVerifyUser = async () => {
        let tableToVerify = null;
        let matchedReservation = null;

        if (verifyTableId) {
            tableToVerify = tables.find(t => t.tableId === verifyTableId);
            matchedReservation = tableToVerify?.reservation;
        } else {
            // Global Search across all tables
            for (const t of tables) {
                const match = (t.reservations || []).find(r => r.phone === verifyPhoneInput);
                if (match) {
                    tableToVerify = t;
                    matchedReservation = match;
                    break;
                }
            }
        }

        if (!tableToVerify || !matchedReservation) {
            alert("No matching reservation found for this phone number.");
            return;
        }

        if (matchedReservation.phone === verifyPhoneInput) {
            // Verified! Just seat the guest as 'Occupied'
            setShowVerifyModal(false);

            try {
                const targetId = tableToVerify.tableId || tableToVerify._id;
                const response = await fetch(`${API_URL}/api/guest-meal/tables/${targetId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        status: 'Occupied',
                        currentOrderGuestName: matchedReservation.name,
                        currentOrderGuestPhone: matchedReservation.phone,
                        currentOrderGuestCount: matchedReservation.guests
                    })
                });

                const data = await response.json();
                if (data.success) {
                    setTables(prev => prev.map(t => (t.tableId || t._id) === targetId ? {
                        ...data.data,
                        tableId: data.data._id || data.data.tableId
                    } : t));

                    setToast({
                        show: true,
                        message: "Guest Verified",
                        subtext: `${matchedReservation.name} seated at Table ${tableToVerify.tableName}`
                    });
                    setTimeout(() => setToast({ show: false, message: '', subtext: '' }), 3000);
                    // Update local state to Occupied (Guest is seated/verified but hasn't ordered yet)
                    setTables(prev => prev.map(t => (t.tableId === tableToVerify.tableId || t._id === tableToVerify._id) ? { ...t, status: 'Occupied' } : t));

                    // Navigate with guest details
                    navigate('/admin/dashboard', {
                        state: {
                            activeMenu: 'food-order',
                            orderMode: 'dinein',
                            source: 'table-order',
                            room: {
                                roomNumber: tableToVerify.tableName,
                                guestName: matchedReservation.name,
                                guestPhone: matchedReservation.phone,
                                id: tableToVerify.tableId || tableToVerify._id
                            }
                        }
                    });
                }
            } catch (error) {
                console.error("Error verifying user:", error);
                alert("Network error during verification.");
            }
        }
    };

    // Open Split Modal
    const openSplitModal = (table) => {
        setSplitTableId(table.tableId);
        setSplitParts(2);
        // Initialize sub-tables for 2 parts
        const guests = table.guests || table.capacity; // Fallback to capacity if guests is 0
        const initialSubTables = [
            { name: `${table.tableName}-A`, guests: Math.ceil(guests / 2), waiter: waiters[0] },
            { name: `${table.tableName}-B`, guests: Math.floor(guests / 2), waiter: waiters[1] }
        ];
        setSplitSubTables(initialSubTables);
        setShowSplitModal(true);
    };

    // Handle Split Parts Change
    const handleSplitPartsChange = (e) => {
        const parts = parseInt(e.target.value);
        setSplitParts(parts);

        const currentTable = tables.find(t => t.tableId === splitTableId);
        if (!currentTable) return;

        const newSubTables = [];
        const totalGuests = currentTable.guests || currentTable.capacity;
        const guestsPerTable = Math.floor(totalGuests / parts);
        let remainingGuests = totalGuests;

        for (let i = 0; i < parts; i++) {
            const suffix = String.fromCharCode(65 + i); // A, B, C...
            const guests = i === parts - 1 ? remainingGuests : guestsPerTable;
            remainingGuests -= guests;

            newSubTables.push({
                name: `${currentTable.tableName}-${suffix}`,
                guests: guests > 0 ? guests : 1, // Default at least 1 guest capacity/seat
                waiter: waiters[i % waiters.length]
            });
        }
        setSplitSubTables(newSubTables);
    };

    // Handle Sub Table Change
    const handleSubTableChange = (index, field, value) => {
        const updated = [...splitSubTables];
        updated[index][field] = value;
        setSplitSubTables(updated);
    };

    // Submit Split
    const handleSplitSubmit = () => {
        const originalTable = tables.find(t => t.tableId === splitTableId);
        if (!originalTable) return;

        // Create new table objects
        const newTables = splitSubTables.map((sub, index) => ({
            tableId: `SPLIT-${Date.now()}-${index}`,
            parentTableId: originalTable._id || originalTable.tableId, // Store parent reference
            tableName: sub.name,
            status: 'Running',
            amount: Math.floor(Math.random() * 1000) + 100, // Random amount demo
            duration: 0,
            capacity: sub.guests,
            guests: sub.guests
        }));

        // Replace original table with new tables in the list
        const originalIndex = tables.findIndex(t => t.tableId === splitTableId);
        const updatedTables = [...tables];
        updatedTables.splice(originalIndex, 1, ...newTables);

        setTables(updatedTables);
        setShowSplitModal(false);
    };

    // --- MOVE GUEST LOGIC (Dropdown Style) ---
    const openMoveModal = (table) => {
        setMoveSourceTable(table);
        setMoveTargetTableId('');
        setShowMoveModal(true);
    };

    const handleMoveSubmit = () => {
        if (!moveSourceTable || !moveTargetTableId) return;

        const targetTable = tables.find(t => t.tableId === moveTargetTableId);
        if (!targetTable) return;

        // Move logic: Source becomes Available, Target becomes Running with Source's data
        const updatedTables = tables.map(t => {
            if (t.tableId === moveSourceTable.tableId) {
                // Reset source table
                return { ...t, status: 'Available', guests: 0, amount: 0, duration: 0 };
            }
            if (t.tableId === moveTargetTableId) {
                // Update target table
                return {
                    ...t,
                    status: 'Running',
                    guests: moveSourceTable.guests,
                    amount: moveSourceTable.amount,
                    duration: moveSourceTable.duration
                };
            }
            return t;
        });

        setTables(updatedTables);
        setShowMoveModal(false);
    };

    const getValidMoveTargets = () => {
        if (!moveSourceTable) return [];
        return tables.filter(t =>
            t.status === 'Available' &&
            t.tableId !== moveSourceTable.tableId &&
            t.capacity >= (moveSourceTable.guests || 1)
        );
    };

    // --- RESERVE TABLE LOGIC ---
    const openReserveModal = (table, reservation = null) => {
        setReserveTargetTable(table);
        if (reservation) {
            setReserveFormData({
                id: reservation.id,
                name: reservation.name,
                date: reservation.date,
                startTime: reservation.startTime,
                endTime: reservation.endTime,
                guests: reservation.guests,
                phone: reservation.phone,
                source: reservation.source || 'Phone',
                note: reservation.note || '',
                advancePayment: reservation.advancePayment || 0
            });
        } else {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMin = now.getMinutes();
            const startTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;

            // Calculate automatic duration
            // Morning: 04:00 - 10:59 (60 mins), Lunch: 11:00 - 16:59 (90 mins), Dinner: 17:00 onwards (120 mins)
            let durationMins = 60; // Default Morning
            if (currentHour >= 17 || currentHour < 4) {
                durationMins = 120; // Dinner
            } else if (currentHour >= 11) {
                durationMins = 90; // Lunch
            } else {
                durationMins = 60; // Morning
            }

            const endDate = new Date(now.getTime() + durationMins * 60000);
            const endTimeStr = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

            setReserveFormData({
                name: '',
                date: new Date().toISOString().split('T')[0],
                startTime: startTimeStr,
                endTime: endTimeStr,
                guests: table.capacity, // Default to capacity
                phone: '',
                source: 'Phone',
                advancePayment: 0
            });
        }
        setShowReserveModal(true);
    };

    const handleReserveSubmit = async () => {
        if (!reserveTargetTable || !reserveFormData.name || !reserveFormData.startTime || !reserveFormData.endTime || !reserveFormData.source) {
            alert("Please fill all required fields.");
            return;
        }

        // --- VALIDATIONS ---
        // 1. Phone Validation (10 digits)
        if (reserveFormData.phone && !/^\d{10}$/.test(reserveFormData.phone)) {
            alert("Phone number must be exactly 10 digits.");
            return;
        }

        // 2. Name Validation (Alphabets only)
        if (!/^[a-zA-Z\s]+$/.test(reserveFormData.name)) {
            alert("Guest name should only contain alphabets.");
            return;
        }

        // 3. Duration Validation (Min 30 mins)
        const [sh, sm] = reserveFormData.startTime.split(':').map(Number);
        const [eh, em] = reserveFormData.endTime.split(':').map(Number);
        const startTotal = sh * 60 + sm;
        const endTotal = eh * 60 + em;

        if (endTotal <= startTotal) {
            alert("End time must be after start time.");
            return;
        }

        if (endTotal - startTotal < 30) {
            alert("Reservation duration must be at least 30 minutes.");
            return;
        }

        // 4. Past Time Validation
        const now = new Date();
        const selectedDate = new Date(reserveFormData.date);
        const todayStr = now.toISOString().split('T')[0];

        if (reserveFormData.date === todayStr) {
            const currentTotal = now.getHours() * 60 + now.getMinutes();
            if (startTotal < currentTotal) {
                alert("Cannot book a reservation for a past time.");
                return;
            }
        } else if (selectedDate < new Date().setHours(0, 0, 0, 0)) {
            alert("Cannot book a reservation for a past date.");
            return;
        }

        // 5. Time Conflict Validation matches user request: "same time pe do log na kare"
        // Also checks explicit overlap range
        const conflict = checkReservationConflict(reserveTargetTable, reserveFormData);
        if (conflict) {
            alert(`Conflict! Table is already reserved for this time slot:\n${conflict.startTime} - ${conflict.endTime} by ${conflict.name}`);
            return;
        }

        try {
            const isEditing = !!reserveFormData.id;
            let payload = {};

            if (isEditing) {
                // If editing, send the whole modified array
                const updatedReservations = (reserveTargetTable.reservations || []).map(r =>
                    r.id === reserveFormData.id ? { ...reserveFormData } : r
                );
                payload = { reservations: updatedReservations };
            } else {
                const newReservation = {
                    id: Date.now().toString(), // Simple ID
                    ...reserveFormData
                };
                payload = { newReservation };
            }

            const targetId = reserveTargetTable.tableId || reserveTargetTable._id;
            const response = await fetch(`${API_URL}/api/guest-meal/tables/${targetId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (data.success) {
                // Ensure data from server is augmented for frontend state consistency
                const updatedTable = {
                    ...data.data,
                    tableId: data.data._id || data.data.tableId
                };

                setTables(prev => prev.map(t => (t.tableId || t._id) === targetId ? updatedTable : t));
                if (reservationListTable && (reservationListTable.tableId || reservationListTable._id) === targetId) {
                    setReservationListTable(updatedTable);
                }
                setShowReserveModal(false);
            } else {
                alert("Failed to reserve: " + data.message);
            }
        } catch (error) {
            console.error("Error reserving table:", error);
            alert("Network error.");
        }
    };

    const handleCancelReservation = async (table, reservationId) => {
        const targetId = table.tableId || table._id;
        try {
            const response = await fetch(`${API_URL}/api/guest-meal/tables/${targetId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ removeReservationId: reservationId })
            });

            const data = await response.json();
            if (data.success) {
                setTables(prev => prev.map(t => {
                    if ((t.tableId || t._id) === targetId) {
                        return {
                            ...t,
                            reservations: (t.reservations || []).filter(r => r.id !== reservationId)
                        };
                    }
                    return t;
                }));
                // Also update the local reservationListTable if it's the same table
                if (reservationListTable && (reservationListTable.tableId || reservationListTable._id) === targetId) {
                    setReservationListTable(prev => ({
                        ...prev,
                        reservations: (prev.reservations || []).filter(r => r.id !== reservationId)
                    }));
                }
            }
        } catch (error) {
            console.error("Error cancelling reservation:", error);
        }
    };





    // --- MERGE TABLE LOGIC ---
    const openMergeModal = (table) => {
        setMergeSourceTable(table);
        setMergeSourceGuests(table.guests || 0);
        setMergeSelectedTargetIds([]);
        setShowMergeModal(true);
    };

    const handleMergeSubmit = async () => {
        if (!mergeSourceTable || mergeSelectedTargetIds.length === 0) return;

        try {
            const response = await fetch(`${API_URL}/api/guest-meal/tables/merge`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sourceTableId: mergeSourceTable.tableId,
                    targetTableIds: mergeSelectedTargetIds
                })
            });

            const data = await response.json();
            if (data.success) {
                // Refresh data
                fetchTables();
                setShowMergeModal(false);

                // Navigate to POS with the updated table info
                navigate('/admin/dashboard', {
                    state: {
                        activeMenu: 'food-order',
                        orderMode: 'dinein',
                        room: {
                            roomNumber: data.data.tableName,
                            guestName: 'Merged Table',
                            guestPhone: '',
                            id: data.data._id
                        }
                    }
                });
            } else {
                throw new Error(data.message || "Failed to merge tables");
            }

        } catch (error) {
            console.error("Merge error:", error);
            alert("Failed to merge tables: " + error.message);
        }
    };

    // --- CLOSE TABLE LOGIC ---
    const openCloseModal = (table) => {
        setCloseTableData(table);
        setShowCloseModal(true);
    };

    const handleCloseSubmit = async () => {
        if (!closeTableData) return;

        try {
            // Step 1: Close the order if it exists
            if (closeTableData.currentOrderId) {
                const orderId = closeTableData.currentOrderId._id || closeTableData.currentOrderId;
                try {
                    const closeOrderResponse = await fetch(`${API_URL}/api/guest-meal/orders/${orderId}/close`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    const closeOrderData = await closeOrderResponse.json();
                    if (!closeOrderData.success) {
                        console.warn('Failed to close order:', closeOrderData.message);
                    }
                } catch (orderError) {
                    console.error('Error closing order:', orderError);
                    // Continue with table closure even if order close fails
                }
            }

            // Handle Split Tables: If it's a split table, we need to close the PARENT table in the DB
            // and then refresh the UI to show the parent table again instead of its splits.
            if (String(closeTableData.tableId).startsWith('SPLIT-') && closeTableData.parentTableId) {
                const response = await fetch(`${API_URL}/api/guest-meal/tables/${closeTableData.parentTableId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        status: 'Available',
                        guests: 0,
                        currentOrderId: null,
                        runningOrderAmount: 0,
                        orderStartTime: null
                    })
                });

                if (response.ok) {
                    fetchTables();
                    setShowCloseModal(false);
                    showToast('Success', 'Table closed successfully');
                    return;
                }
            }

            // If the table is merged, we should release it back to its original state
            if (closeTableData.mergedTableIds && closeTableData.mergedTableIds.length > 0) {
                await fetch(`${API_URL}/api/guest-meal/tables/${closeTableData.tableId}/release`, {
                    method: 'POST'
                });
            }

            // Determine handling based on reservation
            let updatePayload = {
                status: 'Available',
                guests: 0,
                currentOrderId: null,
                runningOrderAmount: 0,
                orderStartTime: null
            };

            // Smart Reservation Handling
            if (closeTableData.reservation && closeTableData.reservation.startTime && closeTableData.reservation.endTime) {
                const now = new Date();
                const currentH = now.getHours();
                const currentM = now.getMinutes();
                const currentVal = currentH * 60 + currentM;

                const [startH, startM] = closeTableData.reservation.startTime.split(':').map(Number);
                const [endH, endM] = closeTableData.reservation.endTime.split(':').map(Number);

                const startVal = startH * 60 + startM;
                const endVal = endH * 60 + endM;

                if (currentVal >= endVal) {
                    updatePayload.reservation = null;
                } else if (currentVal < startVal) {
                    // Future reservation - keep it
                } else {
                    updatePayload.reservation = null;
                }
            } else {
                updatePayload.reservation = null;
            }

            const response = await fetch(`${API_URL}/api/guest-meal/tables/${closeTableData.tableId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatePayload)
            });
            const data = await response.json();
            if (data.success) {
                fetchTables(); // Refresh all tables to see unmerged ones
                setShowCloseModal(false);
                showToast('Success', 'Table closed successfully');
            } else {
                alert('Failed to close table: ' + data.message);
            }
        } catch (error) {
            console.error(error);
            alert('Error closing table: ' + error.message);
        }
    };

    const handleReleaseTable = async (table) => {
        try {
            const response = await fetch(`${API_URL}/api/guest-meal/tables/${table.tableId}/release`, {
                method: 'POST'
            });
            const data = await response.json();
            if (data.success) {
                fetchTables();
            } else {
                alert("Failed to release table: " + data.message);
            }
        } catch (error) {
            console.error("Error releasing table:", error);
            alert("Network error.");
        }
    };



    // Auto-update reservation status based on time
    // Check for reservations (Run every minute)
    useEffect(() => {
        const checkReservations = () => {
            const now = new Date();
            const currentH = now.getHours();
            const currentM = now.getMinutes();
            const currentVal = currentH * 60 + currentM;
            const todayStr = now.toISOString().split('T')[0];

            setTables(prevTables => {
                return prevTables.map(t => {
                    // Skip if Running or Billed (Active Session)
                    if (t.status === 'Running' || t.status === 'Billed') return t;

                    const reservations = t.reservations || [];

                    // Check if ANY reservation is active NOW
                    let isActive = false;
                    let activeReservation = null;

                    for (const res of reservations) {
                        // Check Date (assuming format YYYY-MM-DD or ignoring date if simple time)
                        // If no date, assume today. If date exists, check it.
                        if (res.date && res.date !== todayStr) continue;

                        const [startH, startM] = res.startTime.split(':').map(Number);
                        const [endH, endM] = res.endTime.split(':').map(Number);
                        const startVal = startH * 60 + startM;
                        const endVal = endH * 60 + endM;

                        if (currentVal >= startVal && currentVal < endVal) {
                            isActive = true;
                            activeReservation = res;
                            break;
                        }
                    }

                    if (isActive) {
                        if (t.status !== 'Reserved') return { ...t, status: 'Reserved', reservation: activeReservation };
                    } else {
                        // If logic dictates it should be Available (and currently Reserved for past slot)
                        if (t.status === 'Reserved') return { ...t, status: 'Available', reservation: null };
                    }
                    return t;
                });
            });
        };

        const interval = setInterval(checkReservations, 60000); // Check every minute
        checkReservations(); // Initial check

        return () => clearInterval(interval);
    }, []);



    // Filter Logic
    useEffect(() => {
        // Create working copy with dynamic status calculation and exclude merged templates
        let tableList = tables.filter(t => !t.tableName.startsWith('_MERGED_')).map(table => {
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];
            const currentH = now.getHours();
            const currentM = now.getMinutes();
            const currentVal = currentH * 60 + currentM;

            // Check for current active reservation
            const activeRes = (table.reservations || []).find(res => {
                if (res.date !== todayStr) return false;
                const [sH, sM] = res.startTime.split(':').map(Number);
                const [eH, eM] = res.endTime.split(':').map(Number);
                const startVal = sH * 60 + sM;
                const endVal = eH * 60 + eM;
                return currentVal >= startVal && currentVal < endVal;
            });

            let calculatedStatus = table.status;
            // Auto-promote to Reserved if there's an active reservation and table is Available
            if (activeRes && (table.status === 'Available' || table.status === 'Reserved')) {
                calculatedStatus = 'Reserved';
            }

            return { ...table, calculatedStatus, activeReservation: activeRes };
        });

        // Apply Status Filter using calculatedStatus
        if (statusFilter !== 'All') {
            tableList = tableList.filter(table => table.calculatedStatus === statusFilter);
        }

        // Filter by Type
        if (typeFilter !== 'All') {
            tableList = tableList.filter(table => table.type === typeFilter);
        }

        // --- Time Availability Filter Logic ---
        if (isTimeFilterActive) {
            const selectedTimeStamp = new Date(`${appliedDate}T${appliedTime}`).getTime();
            const now = new Date();
            const isSelectedTimeNearNow = Math.abs(selectedTimeStamp - now.getTime()) < 30 * 60 * 1000;

            tableList = tableList.filter(table => {
                const hasConflict = (table.reservations || []).some(res => {
                    if (res.date !== appliedDate) return false;
                    const [startH, startM] = res.startTime.split(':').map(Number);
                    const [endH, endM] = res.endTime.split(':').map(Number);
                    const [filterH, filterM] = appliedTime.split(':').map(Number);
                    const startTotal = startH * 60 + startM;
                    const endTotal = endH * 60 + endM;
                    const filterTotal = filterH * 60 + filterM;
                    return filterTotal >= startTotal && filterTotal < endTotal;
                });

                if (hasConflict) return false;
                if (isSelectedTimeNearNow && (table.status === 'Running' || table.status === 'Billed')) return false;
                return true;
            });
        }

        // Search Table or User
        if (searchQuery) {
            tableList = tableList.filter(table => {
                const query = searchQuery.toLowerCase();
                const tableMatch = table.tableName.toLowerCase().includes(query);
                const guestMatch = table.reservation?.name?.toLowerCase().includes(query);
                const phoneMatch = table.reservation?.phone?.includes(searchQuery);
                const allReservationsMatch = table.reservations?.some(r =>
                    r.name?.toLowerCase().includes(query) ||
                    r.phone?.includes(searchQuery)
                );
                return tableMatch || guestMatch || phoneMatch || allReservationsMatch;
            });
        }
        setFilteredTables(tableList);

        // Update stats
        const todayStr = new Date().toISOString().split('T')[0];
        const upcomingCount = tables.reduce((count, table) => {
            const todayRes = (table.reservations || []).filter(r => r.date === todayStr);
            // Count reservations that haven't happened yet (start time > now)
            const now = new Date();
            const currentVal = now.getHours() * 60 + now.getMinutes();
            return count + todayRes.filter(r => {
                const [h, m] = r.startTime.split(':').map(Number);
                return (h * 60 + m) > currentVal;
            }).length;
        }, 0);

        // Combined Revenue: Backend (Closed) + Current Active Table Total
        const activeRevenue = tables.reduce((acc, t) => acc + (t.amount || 0), 0);

        // Calculate availability for the stats based on the APPLIED time
        let availableCount = tables.filter(t => t.status === 'Available').length;

        if (isTimeFilterActive) {
            const selectedTimeStamp = new Date(`${appliedDate}T${appliedTime}`).getTime();
            const now = new Date();
            const isSelectedTimeNearNow = Math.abs(selectedTimeStamp - now.getTime()) < 30 * 60 * 1000;

            availableCount = tables.filter(table => {
                const hasConflict = (table.reservations || []).some(res => {
                    if (res.date !== appliedDate) return false;
                    const [startH, startM] = res.startTime.split(':').map(Number);
                    const [endH, endM] = res.endTime.split(':').map(Number);
                    const [filterH, filterM] = appliedTime.split(':').map(Number);
                    const startTotal = startH * 60 + startM;
                    const endTotal = endH * 60 + endM;
                    const filterTotal = filterH * 60 + filterM;
                    return filterTotal >= startTotal && filterTotal < endTotal;
                });
                if (hasConflict) return false;
                if (isSelectedTimeNearNow && (table.status === 'Running' || table.status === 'Billed')) return false;
                return true;
            }).length;
        }

        setStats(prev => ({
            ...prev,
            total: tables.length,
            available: availableCount,
            running: tables.filter(t => t.status === 'Running').length,
            billed: tables.filter(t => t.status === 'Billed').length,
            reserved: tableList.filter(t => t.calculatedStatus === 'Reserved').length,
            upcomingCount: upcomingCount,
            revenue: prev.revenue
        }));
    }, [statusFilter, typeFilter, searchQuery, tables, appliedDate, appliedTime, isTimeFilterActive]);

    const formatDuration = (minutes) => {
        if (minutes === 0) return '--';
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h${mins}m` : `${hours}h`;
    };

    const handleTableClick = async (table) => {
        if (!settings.posEnabled) {
            alert('POS is disabled. Cannot create orders. Enable POS from Company Settings.');
            return;
        }
        // If table is Available, make it Running (Check-in / Walk-in)
        // If table is Reserved, check time window
        if (table.status === 'Reserved') {
            if (table.reservation && table.reservation.startTime && table.reservation.endTime) {
                const now = new Date();
                const currentVal = now.getHours() * 60 + now.getMinutes();
                const [startH, startM] = table.reservation.startTime.split(':').map(Number);
                const [endH, endM] = table.reservation.endTime.split(':').map(Number);
                const startVal = startH * 60 + startM;
                const endVal = endH * 60 + endM;

                if ((currentVal >= startVal && currentVal < endVal) || table.isReservationHold) {
                    openVerifyModal(table);
                    return;
                }
            }
        }

        // Determine guest details if they exist
        let guestName = 'Walk-in';
        let guestPhone = '';

        if (table.reservation) {
            guestName = table.reservation.name || 'Walk-in';
            guestPhone = table.reservation.phone || '';
        } else if (table.guestName) {
            guestName = table.guestName;
            guestPhone = table.guestPhone || '';
        }

        if (table.status === 'Occupied') {
            try {
                // Update status to Running via API immediately
                await fetch(`${API_URL}/api/guest-meal/tables/${table.tableId || table._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'Running' })
                });

                // Update local state for immediate feedback
                setTables(prev => prev.map(t => (t.tableId === table.tableId || t._id === table._id) ? { ...t, status: 'Running' } : t));
            } catch (error) {
                console.error("Error updating table status:", error);
            }
        }

        // Navigate to food order
        navigate('/admin/dashboard', {
            state: {
                activeMenu: 'food-order',
                orderMode: 'dinein', // Lock to Dine In only
                source: 'table-order', // Indicate it's from table management
                room: {
                    roomNumber: table.tableName,
                    guestName: guestName,
                    guestPhone: guestPhone,
                    id: table.tableId || table._id,
                    orderId: table.currentOrderId
                }
            }
        });
    };

    const handleAddTableType = () => {
        if (!newTableType.trim()) return;
        const type = newTableType.trim();
        if (!tableTypes.includes(type)) {
            setTableTypes([...tableTypes, type]);
            setNewTableData({ ...newTableData, type: type });
        }
        setIsAddingTableType(false);
        setNewTableType('');
    };

    const handleCreateTable = async () => {
        if (!newTableData.tableName || !newTableData.capacity) return;

        try {
            const tablePayload = {
                tableName: newTableData.tableName,
                capacity: parseInt(newTableData.capacity),
                type: newTableData.type || 'General'
            };

            const response = await fetch(`${API_URL}/api/guest-meal/tables`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tablePayload)
            });

            const data = await response.json();

            if (data.success) {
                // Determine if we need to add the type to the list (handled by state visually, but backend saves it)
                if (newTableData.type && !tableTypes.includes(newTableData.type)) {
                    setTableTypes([...tableTypes, newTableData.type]);
                }

                // Refresh tables from backend to ensure consistent state
                fetchTables();

                setShowAddTableModal(false);
                setNewTableData({ tableName: '', type: '', capacity: '' });
            } else {
                alert('Failed to create table: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error creating table:', error);
            alert('Error creating table: Network error or server is down');
        }
    };

    return (
        <div className="gms-wrapper">
            {/* Header / Stats */}
            <div className="gms-header" style={{ marginBottom: '24px', background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', color: '#111827' }}>Dining Dashboard</h1>
                        <p style={{ color: '#6b7280', margin: '4px 0 0' }}>Manage your restaurant tables and reservations</p>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowAddTableModal(true)}
                        style={{
                            background: '#dc2626',
                            borderRadius: '10px',
                            padding: '12px 24px',
                            fontWeight: '700',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 10px rgba(220, 38, 38, 0.2)',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        + ADD TABLE
                    </button>
                </div>

                <div className="gms-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '12px', border: '1px solid #dcfce7' }}>
                        <div style={{ fontSize: '0.875rem', color: '#166534', fontWeight: '600' }}>Available Tables</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', marginTop: '8px' }}>{stats.available}</div>
                    </div>
                    <div style={{ background: '#fef2f2', padding: '20px', borderRadius: '12px', border: '1px solid #fee2e2' }}>
                        <div style={{ fontSize: '0.875rem', color: '#991b1b', fontWeight: '600' }}>Occupied (Running)</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', marginTop: '8px' }}>{stats.running}</div>
                    </div>
                    <div style={{ background: '#fff7ed', padding: '20px', borderRadius: '12px', border: '1px solid #ffedd5' }}>
                        <div style={{ fontSize: '0.875rem', color: '#9a3412', fontWeight: '600' }}>Upcoming Reservations</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', marginTop: '8px' }}>{stats.upcomingCount}</div>
                    </div>
                    <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '12px', border: '1px solid #dbeafe' }}>
                        <div style={{ fontSize: '0.875rem', color: '#1e40af', fontWeight: '600' }}>Revenue Today</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', marginTop: '8px' }}>{cs}{Math.floor(stats.revenue + tables.reduce((acc, t) => acc + (t.amount || 0), 0))}</div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="gms-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '20px' }}>
                <div className="gms-time-calendar-wrapper" style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, maxWidth: '600px' }}>
                    <div style={{ position: 'relative', flex: '1' }}>
                        <input
                            type="date"
                            value={filterDate}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => {
                                const selected = e.target.value;
                                setFilterDate(selected);
                                // If today is selected, ensure time isn't in the past
                                const todayStr = new Date().toISOString().split('T')[0];
                                if (selected === todayStr) {
                                    const nowStr = new Date().toTimeString().slice(0, 5);
                                    if (filterTime < nowStr) {
                                        setFilterTime(nowStr);
                                    }
                                }
                            }}
                            style={{
                                width: '100%',
                                padding: '12px 16px 12px 40px',
                                borderRadius: '12px',
                                border: '2px solid #e5e7eb',
                                outline: 'none',
                                background: '#fff',
                                fontWeight: '700',
                                color: '#111827'
                            }}
                        />
                        <span style={{ position: 'absolute', left: '14px', top: '12px', color: '#dc2626' }}>📅</span>
                    </div>

                    <div style={{ position: 'relative', flex: '0.6' }}>
                        <input
                            type="time"
                            value={filterTime}
                            onChange={(e) => {
                                const selectedTime = e.target.value;
                                const todayStr = new Date().toISOString().split('T')[0];
                                if (filterDate === todayStr) {
                                    const nowStr = new Date().toTimeString().slice(0, 5);
                                    if (selectedTime < nowStr) {
                                        alert("You cannot select a past time for today.");
                                        setFilterTime(nowStr);
                                        return;
                                    }
                                }
                                setFilterTime(selectedTime);
                            }}
                            style={{
                                width: '100%',
                                padding: '12px 12px 12px 40px',
                                borderRadius: '12px',
                                border: '2px solid #e5e7eb',
                                outline: 'none',
                                background: '#fff',
                                fontWeight: '700',
                                color: '#111827'
                            }}
                        />
                        <span style={{ position: 'absolute', left: '14px', top: '12px', color: '#dc2626' }}>⏰</span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => {
                                setAppliedDate(filterDate);
                                setAppliedTime(filterTime);
                                setIsTimeFilterActive(true);
                            }}
                            style={{
                                padding: '12px 24px',
                                background: '#dc2626',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontWeight: '800',
                                boxShadow: '0 4px 10px rgba(220, 38, 38, 0.2)'
                            }}
                        >Apply Filter</button>

                        <button
                            onClick={() => {
                                const d = new Date().toISOString().split('T')[0];
                                const t = new Date().toTimeString().slice(0, 5);
                                setFilterDate(d);
                                setFilterTime(t);
                                setAppliedDate(d);
                                setAppliedTime(t);
                                setStatusFilter('All');
                                setTypeFilter('All');
                                setSearchQuery('');
                                setIsTimeFilterActive(false);
                            }}
                            style={{
                                padding: '12px',
                                background: '#fef2f2',
                                color: '#dc2626',
                                border: '1px solid #fee2e2',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontWeight: '800'
                            }}
                            title="Reset to Now"
                        >⚡</button>
                    </div>

                </div>

                <div className="gms-verify-quick" style={{ flex: '0 0 auto' }}>
                    <button
                        onClick={() => openVerifyModal()}
                        style={{
                            padding: '12px 24px',
                            background: '#fef2f2',
                            color: '#dc2626',
                            border: '2px solid #fee2e2',
                            borderRadius: '12px',
                            fontWeight: '800',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.1)'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        <span style={{ fontSize: '1.1rem' }}>🔍</span> Verify User
                    </button>
                </div>

                <div className="gms-filters" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {['All', 'Available', 'Running', 'Billed', 'Reserved'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            style={{
                                padding: '8px 16px', borderRadius: '10px', border: '1px solid #e5e7eb',
                                background: statusFilter === status ? '#dc2626' : '#fff',
                                color: statusFilter === status ? '#fff' : '#6b7280',
                                fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
                                fontSize: '0.85rem'
                            }}
                        >
                            {status}
                        </button>
                    ))}
                    <div style={{ width: '1px', background: '#e5e7eb', height: '24px', margin: '0 8px' }}></div>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', fontWeight: '600', outline: 'none', fontSize: '0.85rem' }}
                    >
                        <option value="All">All Types</option>
                        {tableTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
            </div >

            {/* Table Grid */}
            {
                filteredTables.length === 0 ? (
                    <div className="gms-empty">
                        <div className="empty-illustration">📭</div>
                        <p className="empty-text">No tables match your filter</p>
                    </div>
                ) : (
                    <div className="gms-grid">
                        {filteredTables.map((table) => (
                            <TableCard
                                key={table.tableId}
                                table={table}
                                formatDuration={formatDuration}
                                onMenuAction={handleMenuAction}
                                onCardClick={() => handleTableClick(table)}
                                onSendToCashier={handleSendToCashier}
                            />
                        ))}
                    </div>
                )
            }

            {/* Add Table Modal */}
            {showAddTableModal && (
                <div
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.5)', zIndex: 1000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(4px)'
                    }}
                    onClick={() => setShowAddTableModal(false)}
                >
                    <div
                        style={{
                            background: 'white', borderRadius: '16px', width: '420px', maxWidth: '92vw',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'visible'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '20px 24px', borderBottom: '1px solid #f0f0f0',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>Add New Table</h2>
                            <button
                                onClick={() => setShowAddTableModal(false)}
                                style={{
                                    background: '#f3f4f6', border: 'none', width: '32px', height: '32px',
                                    borderRadius: '8px', fontSize: '16px', cursor: 'pointer', color: '#6b7280',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#6b7280'; }}
                            >✕</button>
                        </div>

                        {/* Body */}
                        <div style={{ padding: '24px' }}>
                            {/* Table Name */}
                            <div style={{ marginBottom: '18px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.8rem', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Table Name / Number
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., T15, VIP-1"
                                    value={newTableData.tableName}
                                    onChange={e => setNewTableData({ ...newTableData, tableName: e.target.value })}
                                    style={{
                                        width: '100%', padding: '11px 14px', borderRadius: '10px',
                                        border: '1.5px solid #e5e7eb', fontSize: '0.95rem', outline: 'none',
                                        transition: 'border-color 0.2s', boxSizing: 'border-box'
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </div>

                            {/* Capacity */}
                            <div style={{ marginBottom: '18px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.8rem', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Capacity
                                </label>
                                <input
                                    type="number"
                                    placeholder="e.g., 4"
                                    min="1"
                                    value={newTableData.capacity}
                                    onChange={e => setNewTableData({ ...newTableData, capacity: e.target.value })}
                                    style={{
                                        width: '100%', padding: '11px 14px', borderRadius: '10px',
                                        border: '1.5px solid #e5e7eb', fontSize: '0.95rem', outline: 'none',
                                        transition: 'border-color 0.2s', boxSizing: 'border-box'
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </div>

                            {/* Table Type */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.8rem', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Table Type
                                </label>
                                {!isAddingTableType ? (
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                                        <div ref={typeDropdownRef} style={{ flex: 1, position: 'relative' }}>
                                            <div
                                                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                                                style={{
                                                    padding: '11px 14px', borderRadius: '10px',
                                                    border: showTypeDropdown ? '1.5px solid #3b82f6' : '1.5px solid #e5e7eb',
                                                    background: 'white', cursor: 'pointer',
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    transition: 'border-color 0.2s'
                                                }}
                                            >
                                                <span style={{ color: newTableData.type ? '#111827' : '#9ca3af', fontSize: '0.95rem' }}>
                                                    {newTableData.type || 'Select Type'}
                                                </span>
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: showTypeDropdown ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                                                    <path d="M2 4L6 8L10 4" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                            {showTypeDropdown && (
                                                <div style={{
                                                    position: 'absolute', top: 'calc(100% + 6px)',
                                                    left: 0, right: 0, background: 'white',
                                                    border: '1px solid #e5e7eb', borderRadius: '12px',
                                                    boxShadow: '0 12px 36px rgba(0,0,0,0.15)',
                                                    zIndex: 9999, maxHeight: '220px', overflowY: 'auto',
                                                    padding: '4px'
                                                }}>
                                                    {tableTypes.map(type => {
                                                        const isDefault = ['General', 'AC', 'Non-AC', 'Garden'].includes(type);
                                                        const isSelected = newTableData.type === type;
                                                        return (
                                                            <div
                                                                key={type}
                                                                style={{
                                                                    padding: '9px 12px', cursor: 'pointer',
                                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                                    borderRadius: '8px', margin: '1px 0',
                                                                    background: isSelected ? '#eff6ff' : 'transparent',
                                                                    color: isSelected ? '#2563eb' : '#374151',
                                                                    fontWeight: isSelected ? 600 : 400,
                                                                    fontSize: '0.93rem', transition: 'all 0.12s'
                                                                }}
                                                                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f9fafb'; }}
                                                                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                                                            >
                                                                <span
                                                                    style={{ flex: 1 }}
                                                                    onClick={() => { setNewTableData({ ...newTableData, type }); setShowTypeDropdown(false); }}
                                                                >
                                                                    {isSelected && <span style={{ marginRight: '6px' }}>✓</span>}
                                                                    {type}
                                                                </span>
                                                                <span
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setTableTypes(tableTypes.filter(t => t !== type));
                                                                        if (newTableData.type === type) {
                                                                            setNewTableData({ ...newTableData, type: '' });
                                                                        }
                                                                    }}
                                                                    style={{
                                                                        width: '24px', height: '24px', display: 'flex',
                                                                        alignItems: 'center', justifyContent: 'center',
                                                                        borderRadius: '6px', color: '#d1d5db',
                                                                        fontSize: '13px', cursor: 'pointer',
                                                                        transition: 'all 0.15s', flexShrink: 0
                                                                    }}
                                                                    onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; }}
                                                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#d1d5db'; }}
                                                                    title={`Delete "${type}"`}
                                                                >✕</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setIsAddingTableType(true)}
                                            style={{
                                                padding: '0 14px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                                color: 'white', border: 'none', borderRadius: '10px',
                                                cursor: 'pointer', fontSize: '18px', fontWeight: 600,
                                                transition: 'all 0.15s', boxShadow: '0 2px 8px rgba(59,130,246,0.3)'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                            title="Add New Type"
                                        >+</button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="text"
                                            placeholder="Enter new type..."
                                            value={newTableType}
                                            onChange={e => setNewTableType(e.target.value)}
                                            autoFocus
                                            style={{
                                                flex: 1, padding: '11px 14px', borderRadius: '10px',
                                                border: '1.5px solid #3b82f6', fontSize: '0.95rem', outline: 'none',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                        <button
                                            onClick={handleAddTableType}
                                            style={{
                                                padding: '0 14px', background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                                color: 'white', border: 'none', borderRadius: '10px',
                                                cursor: 'pointer', fontSize: '16px', fontWeight: 600,
                                                boxShadow: '0 2px 8px rgba(34,197,94,0.3)'
                                            }}
                                        >✓</button>
                                        <button
                                            onClick={() => setIsAddingTableType(false)}
                                            style={{
                                                padding: '0 14px', background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                                color: 'white', border: 'none', borderRadius: '10px',
                                                cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                                                boxShadow: '0 2px 8px rgba(239,68,68,0.3)'
                                            }}
                                        >✕</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{
                            padding: '16px 24px', borderTop: '1px solid #f0f0f0',
                            display: 'flex', gap: '12px'
                        }}>
                            <button
                                onClick={() => setShowAddTableModal(false)}
                                style={{
                                    flex: 1, padding: '12px', background: '#f3f4f6', color: '#374151',
                                    border: 'none', borderRadius: '10px', cursor: 'pointer',
                                    fontWeight: 600, fontSize: '0.95rem', transition: 'all 0.15s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#e5e7eb'}
                                onMouseLeave={e => e.currentTarget.style.background = '#f3f4f6'}
                            >Cancel</button>
                            <button
                                onClick={handleCreateTable}
                                style={{
                                    flex: 1, padding: '12px',
                                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                    color: 'white', border: 'none', borderRadius: '10px',
                                    cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem',
                                    boxShadow: '0 4px 12px rgba(59,130,246,0.3)', transition: 'all 0.15s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >Create Table</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Split Table Modal */}
            {
                showSplitModal && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ width: '420px', padding: '0', overflow: 'hidden' }}>
                            <div className="modal-header" style={{ padding: '20px 24px', background: '#fff', borderBottom: '1px solid #f3f4f6' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Split Table – {tables.find(t => t.tableId === splitTableId)?.tableName}</h2>
                                <button className="close-btn" onClick={() => setShowSplitModal(false)}>×</button>
                            </div>

                            <div style={{ padding: '24px' }}>
                                <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '0.9rem' }}>
                                    <span>Capacity: <strong>{tables.find(t => t.tableId === splitTableId)?.capacity}</strong></span>
                                    <span>Current Guests: <strong>{tables.find(t => t.tableId === splitTableId)?.guests || 0}</strong></span>
                                </div>

                                <div className="form-group" style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#4b5563' }}>Split Into</label>
                                    <select
                                        className="form-select"
                                        value={splitParts}
                                        onChange={handleSplitPartsChange}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                    >
                                        <option value={2}>2 Sub-tables</option>
                                        <option value={3}>3 Sub-tables</option>
                                        <option value={4}>4 Sub-tables</option>
                                    </select>
                                </div>

                                <div className="sub-tables-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {splitSubTables.map((sub, index) => (
                                        <div key={index} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.5fr', gap: '8px', alignItems: 'center' }}>
                                            <div style={{ background: '#f3f4f6', padding: '10px', borderRadius: '6px', fontWeight: '700', textAlign: 'center', fontSize: '0.9rem' }}>{sub.name}</div>
                                            <input
                                                type="number"
                                                className="form-input"
                                                value={sub.guests}
                                                min="1"
                                                onChange={(e) => handleSubTableChange(index, 'guests', parseInt(e.target.value))}
                                                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb', textAlign: 'center' }}
                                            />
                                            <select
                                                className="form-select"
                                                value={sub.waiter}
                                                onChange={(e) => handleSubTableChange(index, 'waiter', e.target.value)}
                                                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                                            >
                                                {waiters.map(w => <option key={w} value={w}>{w}</option>)}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="modal-footer" style={{ padding: '16px 24px', background: '#f9fafb', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button className="btn btn-secondary" onClick={() => setShowSplitModal(false)}>Cancel</button>
                                <button className="btn btn-primary" style={{ background: '#dc2626' }} onClick={handleSplitSubmit}>Confirm Split</button>
                            </div>
                        </div>
                    </div>
                )
            }





            {/* Move Guest Modal */}
            {
                showMoveModal && moveSourceTable && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ width: '450px', padding: '0', overflow: 'hidden' }}>
                            <div className="modal-header" style={{ padding: '20px 24px', background: '#fff', borderBottom: '1px solid #f3f4f6' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Move Guests</h2>
                                <button className="close-btn" onClick={() => setShowMoveModal(false)}>×</button>
                            </div>

                            <div style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', marginBottom: '24px' }}>
                                    <div style={{ flex: 1, textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '600' }}>From</div>
                                        <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827' }}>{moveSourceTable.tableName}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '4px' }}>{moveSourceTable.guests} Guests</div>
                                        </div>
                                    </div>

                                    <div style={{ fontSize: '1.5rem', color: '#dc2626' }}>➞</div>

                                    <div style={{ flex: 1, textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '600' }}>To</div>
                                        <div style={{ background: '#fff', padding: '0', borderRadius: '12px', border: '2px dashed #dc2626', minHeight: '82px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <select
                                                value={moveTargetTableId}
                                                onChange={(e) => setMoveTargetTableId(e.target.value)}
                                                style={{ width: '100%', border: 'none', background: 'transparent', padding: '16px', fontSize: '1.2rem', fontWeight: '800', textAlign: 'center', outline: 'none', color: '#dc2626', cursor: 'pointer' }}
                                            >
                                                <option value="">Table?</option>
                                                {getValidMoveTargets().map(t => (
                                                    <option key={t.tableId} value={t.tableId}>{t.tableName}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {moveTargetTableId && (
                                    <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '12px', borderRadius: '8px', display: 'flex', gap: '8px', alignItems: 'center', color: '#92400e', fontSize: '0.85rem' }}>
                                        <span>ℹ️</span> Moving all orders and guests to {tables.find(t => t.tableId === moveTargetTableId)?.tableName}.
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer" style={{ padding: '16px 24px', background: '#f9fafb', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button className="btn btn-secondary" onClick={() => setShowMoveModal(false)}>Cancel</button>
                                <button
                                    className="btn btn-primary"
                                    style={{ background: moveTargetTableId ? '#dc2626' : '#d1d5db', cursor: moveTargetTableId ? 'pointer' : 'not-allowed' }}
                                    disabled={!moveTargetTableId}
                                    onClick={handleMoveSubmit}
                                >
                                    Confirm Move
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Reserve Table Modal (Right Side Drawer) */}
            {
                showReserveModal && reserveTargetTable && (
                    <div className="modal-overlay" style={{ justifyContent: 'flex-end', alignItems: 'stretch' }} onClick={() => setShowReserveModal(false)}>
                        <div className="modal-content" style={{
                            width: '450px',
                            height: '100%',
                            borderRadius: '0',
                            padding: '0',
                            overflowY: 'auto',
                            animation: 'slideInRight 0.3s ease-out',
                            display: 'flex',
                            flexDirection: 'column'
                        }} onClick={e => e.stopPropagation()}>
                            <div className="modal-header" style={{ padding: '20px 24px', background: '#fff', borderBottom: '1px solid #f3f4f6' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#111827' }}>{reserveFormData.id ? 'Modify' : 'Reserve'} Table – {reserveTargetTable.tableName}</h2>
                                <button className="close-btn" onClick={() => setShowReserveModal(false)} style={{ fontSize: '1.5rem', color: '#9ca3af' }}>×</button>
                            </div>

                            <div style={{ padding: '24px' }}>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#4b5563' }}>Guest Mobile Number</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="tel" className="form-input" placeholder="Enter phone number (10 digits)"
                                            maxLength={10}
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '1rem' }}
                                            value={reserveFormData.phone}
                                            onChange={e => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                // Auto-fill name if phone exists in any table's reservations
                                                let existingName = '';
                                                tables.forEach(t => {
                                                    const res = (t.reservations || []).find(r => r.phone === val);
                                                    if (res) existingName = res.name;
                                                });
                                                setReserveFormData({ ...reserveFormData, phone: val, name: existingName || reserveFormData.name });
                                            }}
                                        />
                                        <span style={{ position: 'absolute', right: '12px', top: '10px', color: '#9ca3af' }}>🔍</span>
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#4b5563' }}>Guest Name</label>
                                    <input
                                        type="text" className="form-input" placeholder="Enter guest name (Alphabets only)"
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '1rem' }}
                                        value={reserveFormData.name}
                                        onChange={e => {
                                            if (/^[a-zA-Z\s]*$/.test(e.target.value)) {
                                                setReserveFormData({ ...reserveFormData, name: e.target.value });
                                            }
                                        }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#4b5563' }}>Date</label>
                                        <input
                                            type="date" className="form-input"
                                            min={new Date().toISOString().split('T')[0]} // Restrict past dates
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                            value={reserveFormData.date}
                                            onChange={e => setReserveFormData({ ...reserveFormData, date: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#4b5563' }}>Time (Session)</label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type="time" className="form-input"
                                                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '1rem' }}
                                                value={reserveFormData.startTime}
                                                onChange={e => {
                                                    const newStart = e.target.value;
                                                    const todayStr = new Date().toISOString().split('T')[0];
                                                    const nowStr = new Date().toTimeString().slice(0, 5);

                                                    if (reserveFormData.date === todayStr && newStart < nowStr) {
                                                        alert("You cannot book a reservation for a past time.");
                                                        return;
                                                    }

                                                    const [h, m] = newStart.split(':').map(Number);

                                                    // Morning: 04:00 - 10:59 (60 mins), Lunch: 11:00 - 16:59 (90 mins), Dinner: 17:00 onwards (120 mins)
                                                    let durationMins = 60;
                                                    if (h >= 17 || h < 4) durationMins = 120; // Dinner
                                                    else if (h >= 11) durationMins = 90; // Lunch
                                                    else durationMins = 60; // Morning

                                                    const date = new Date();
                                                    date.setHours(h, m, 0, 0);
                                                    const end = new Date(date.getTime() + durationMins * 60000);
                                                    const endTimeStr = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;

                                                    setReserveFormData({
                                                        ...reserveFormData,
                                                        startTime: newStart,
                                                        endTime: endTimeStr
                                                    });
                                                }}
                                            />
                                            {reserveFormData.endTime && (
                                                <div style={{ marginTop: '4px', fontSize: '0.75rem', color: '#10b981', fontWeight: '700' }}>
                                                    Session End: {reserveFormData.endTime}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#4b5563' }}>Guests Count</label>
                                        <input
                                            type="number" className="form-input"
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                            value={reserveFormData.guests}
                                            onChange={e => setReserveFormData({ ...reserveFormData, guests: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#4b5563' }}>Reservation Source</label>
                                        <select
                                            className="form-select"
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '1rem', background: '#fff' }}
                                            value={reserveFormData.source}
                                            onChange={e => setReserveFormData({ ...reserveFormData, source: e.target.value })}
                                        >
                                            <option value="Phone">Phone Number</option>
                                            <option value="Walk-In">Walk In</option>
                                            <option value="Online">Online</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#4b5563' }}>Special Note</label>
                                    <input
                                        type="text" className="form-input" placeholder="e.g. Birthday"
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                        value={reserveFormData.note || ''}
                                        onChange={e => setReserveFormData({ ...reserveFormData, note: e.target.value })}
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '700', color: '#111827', display: 'flex', justifyContent: 'space-between' }}>
                                        Advance Payment
                                        {reserveFormData.advancePayment > 0 && <span style={{ color: '#10b981', fontSize: '0.8rem' }}>Amount Added ✅</span>}
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#6b7280', fontSize: '1.1rem', fontWeight: '700' }}>{cs}</span>
                                        <input
                                            type="number"
                                            className="form-input"
                                            placeholder="0.00"
                                            style={{
                                                width: '100%',
                                                padding: '12px 12px 12px 32px',
                                                borderRadius: '12px',
                                                border: '2px solid #dc2626',
                                                fontSize: '1.2rem',
                                                fontWeight: '800',
                                                color: '#111827',
                                                background: '#fef2f2'
                                            }}
                                            value={reserveFormData.advancePayment || ''}
                                            onChange={e => setReserveFormData({ ...reserveFormData, advancePayment: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: '#6b7280' }}>* Enter the advance amount collected from the guest.</p>
                                </div>

                                {(() => {
                                    const conflict = checkReservationConflict(reserveTargetTable, reserveFormData);
                                    if (conflict) {
                                        return (
                                            <div style={{ marginTop: '12px', padding: '10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '0.85rem', fontWeight: '600' }}>
                                                ⚠️ Reservation Overlap Detected: <br />
                                                {conflict.startTime} - {conflict.endTime} ({conflict.name})
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>

                            <div className="modal-footer" style={{ padding: '16px 24px', background: '#f9fafb', borderTop: '1px solid #f3f4f6', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button
                                    onClick={() => setShowReserveModal(false)}
                                    style={{
                                        padding: '10px 20px', border: '1px solid #e5e7eb', borderRadius: '8px',
                                        background: '#fff', color: '#374151', fontWeight: '600', cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReserveSubmit}
                                    style={{
                                        padding: '10px 24px', border: 'none', borderRadius: '8px',
                                        background: '#dc2626', color: '#fff', fontWeight: '700', cursor: 'pointer',
                                        boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.4)'
                                    }}
                                >
                                    {reserveFormData.id ? 'Save Changes' : 'Reserve Table'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Merge Table Modal */}
            {
                showMergeModal && mergeSourceTable && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ width: '500px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                            <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Merge Multiple Tables</h2>
                                <button className="close-btn" onClick={() => setShowMergeModal(false)} style={{ fontSize: '1.5rem', color: '#9ca3af' }}>×</button>
                            </div>

                            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                                <div style={{ marginBottom: '20px', padding: '16px', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fee2e2' }}>
                                    <div style={{ fontSize: '0.9rem', color: '#991b1b', fontWeight: '600' }}>Merging into:</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#dc2626' }}>{mergeSourceTable.tableName.replace('_MERGED_', '')}</div>
                                </div>

                                <label style={{ display: 'block', marginBottom: '12px', fontSize: '1rem', fontWeight: '700', color: '#374151' }}>
                                    Select Tables to Merge:
                                </label>

                                <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '8px', marginBottom: '20px' }}>
                                    {tables
                                        .filter(t => t.tableId !== mergeSourceTable.tableId && !t.tableName.startsWith('_MERGED_'))
                                        .map(t => {
                                            const isSelected = mergeSelectedTargetIds.includes(t.tableId);
                                            return (
                                                <div
                                                    key={t.tableId}
                                                    onClick={() => {
                                                        setMergeSelectedTargetIds(prev =>
                                                            prev.includes(t.tableId)
                                                                ? prev.filter(id => id !== t.tableId)
                                                                : [...prev, t.tableId]
                                                        );
                                                    }}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '12px',
                                                        padding: '12px', borderRadius: '8px', cursor: 'pointer',
                                                        background: isSelected ? '#fff1f2' : 'transparent',
                                                        border: isSelected ? '1px solid #fecaca' : '1px solid transparent',
                                                        transition: 'all 0.2s ease',
                                                        marginBottom: '4px'
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '24px', height: '24px', borderRadius: '6px',
                                                        border: `2px solid ${isSelected ? '#dc2626' : '#d1d5db'}`,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        background: isSelected ? '#dc2626' : '#fff',
                                                        transition: 'all 0.2s ease'
                                                    }}>
                                                        {isSelected && <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 'bold' }}>✓</span>}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: '700', color: '#111827', fontSize: '1rem' }}>{t.tableName}</div>
                                                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Capacity: {t.capacity} | Status: {t.status}</div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    }
                                </div>

                                {mergeSelectedTargetIds.length > 0 && (
                                    <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
                                        <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '4px' }}>Resulting Table Name:</div>
                                        <div style={{ fontWeight: '800', color: '#111827', fontSize: '1.1rem' }}>
                                            {[mergeSourceTable, ...tables.filter(t => mergeSelectedTargetIds.includes(t.tableId))].map(t => t.tableName.replace('_MERGED_', '')).join(', ')}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', alignItems: 'center', borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
                                            <span style={{ color: '#6b7280', fontWeight: '600' }}>Total Capacity:</span>
                                            <span style={{ fontWeight: '800', color: '#dc2626', fontSize: '1.2rem' }}>
                                                {mergeSourceTable.capacity + tables.filter(t => mergeSelectedTargetIds.includes(t.tableId)).reduce((sum, t) => sum + (t.capacity || 4), 0)} Persons
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer" style={{ padding: '20px 24px', background: '#f9fafb', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button className="btn btn-secondary" onClick={() => setShowMergeModal(false)} style={{ padding: '12px 24px', fontSize: '0.95rem' }}>Cancel</button>
                                <button
                                    className="btn btn-primary"
                                    style={{
                                        background: '#dc2626',
                                        opacity: mergeSelectedTargetIds.length === 0 ? 0.5 : 1,
                                        padding: '12px 24px', fontSize: '0.95rem', fontWeight: '700'
                                    }}
                                    disabled={mergeSelectedTargetIds.length === 0}
                                    onClick={handleMergeSubmit}
                                >
                                    Merge {mergeSelectedTargetIds.length + 1} Tables
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Reservation List Modal */}
            {
                showReservationListModal && reservationListTable && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ width: '500px', padding: '0', overflow: 'hidden' }}>
                            <div className="modal-header" style={{ padding: '20px 24px', background: '#fff', borderBottom: '1px solid #f3f4f6' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827' }}>Reservations – {reservationListTable.tableName}</h2>
                                <button className="close-btn" onClick={() => setShowReservationListModal(false)} style={{ fontSize: '1.5rem' }}>×</button>
                            </div>
                            <div style={{ padding: '20px 24px', maxHeight: '450px', overflowY: 'auto' }}>
                                <div className="reservation-search" style={{ position: 'relative', marginBottom: '16px' }}>
                                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>🔍</span>
                                    <input
                                        type="text"
                                        placeholder="Search by name or phone..."
                                        value={reservationSearchQuery}
                                        onChange={(e) => setReservationSearchQuery(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px 10px 40px',
                                            borderRadius: '10px',
                                            border: '1px solid #e5e7eb',
                                            fontSize: '0.9rem',
                                            outline: 'none'
                                        }}
                                    />
                                </div>

                                {(!reservationListTable.reservations || reservationListTable.reservations.length === 0) ? (
                                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📅</div>
                                        <p>No reservations found for this table.</p>
                                    </div>
                                ) : (
                                    <div className="reservation-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {(reservationListTable.reservations || [])
                                            .filter(res => res && (
                                                (res.name || '').toLowerCase().includes((reservationSearchQuery || '').toLowerCase()) ||
                                                (res.phone || '').includes(reservationSearchQuery || '')
                                            ))
                                            .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
                                            .map((res, index) => (
                                                <div key={res.id || index} style={{
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    padding: '12px 16px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #f3f4f6'
                                                }}>
                                                    <div>
                                                        <div style={{ fontWeight: '700', color: '#111827', fontSize: '1rem' }}>{res.startTime || 'N/A'} - {res.name || 'Guest'}</div>
                                                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                                            {res.guests || 0} Guests • {res.source || 'Phone'} • {res.phone || 'No Phone'} {res.date && `• ${res.date}`}
                                                            {res.advancePayment > 0 && <span style={{ color: '#10b981', fontWeight: '800', marginLeft: '8px' }}>• Advance: {cs}{res.advancePayment}</span>}
                                                        </div>
                                                        {res.note && <div style={{ fontSize: '0.8rem', color: '#dc2626', marginTop: '4px' }}>Note: {res.note}</div>}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            className="action-btn-small"
                                                            onClick={() => openReserveModal(reservationListTable, res)}
                                                            style={{ padding: '6px', borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}
                                                        >✏️</button>
                                                        <button
                                                            className="action-btn-small"
                                                            onClick={() => handleCancelReservation(reservationListTable, res.id)}
                                                            style={{ padding: '6px', borderRadius: '6px', border: '1px solid #fee2e2', background: '#fff', color: '#dc2626', cursor: 'pointer' }}
                                                        >🗑️</button>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer" style={{ padding: '16px 24px', background: '#f9fafb', borderTop: '1px solid #f3f4f6', textAlign: 'right' }}>
                                <button className="btn btn-secondary" onClick={() => setShowReservationListModal(false)}>Close</button>
                                <button className="btn btn-primary" style={{ marginLeft: '12px', background: '#dc2626' }} onClick={() => { setShowReservationListModal(false); openReserveModal(reservationListTable); }}>Add New</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Verify User Modal (Right Side Drawer) */}
            {
                showVerifyModal && (
                    <div className="modal-overlay" style={{ justifyContent: 'flex-end', alignItems: 'stretch' }} onClick={() => setShowVerifyModal(false)}>
                        <div className="modal-content" style={{
                            width: '450px',
                            height: '100%',
                            borderRadius: '0',
                            padding: '0',
                            overflowY: 'auto',
                            animation: 'slideInRight 0.3s ease-out',
                            display: 'flex',
                            flexDirection: 'column',
                            border: 'none',
                            boxShadow: '-10px 0 30px rgba(0,0,0,0.1)'
                        }} onClick={e => e.stopPropagation()}>
                            <div className="modal-header" style={{ padding: '24px', background: '#fff', borderBottom: '1px solid #f3f4f6' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#111827', margin: 0 }}>Verify Reservation</h2>
                                <button className="close-btn" onClick={() => setShowVerifyModal(false)} style={{ fontSize: '1.8rem', color: '#9ca3af', fontWeight: '300' }}>×</button>
                            </div>

                            <div style={{ padding: '32px 24px', flex: 1 }}>
                                <div className="form-group" style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', marginBottom: '12px', fontWeight: '800', color: '#111827', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Enter Linked Phone Number</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="tel"
                                            className="form-input"
                                            placeholder="e.g. 9876543210"
                                            value={verifyPhoneInput}
                                            onChange={(e) => setVerifyPhoneInput(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '16px 20px',
                                                border: '2px solid #f3f4f6',
                                                background: '#f9fafb',
                                                borderRadius: '12px',
                                                fontSize: '1.1rem',
                                                fontWeight: '600',
                                                transition: 'all 0.2s',
                                                outline: 'none',
                                                color: '#111827'
                                            }}
                                            autoFocus
                                        />
                                        <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem', opacity: '0.4' }}>🔍</span>
                                    </div>
                                </div>

                                {(() => {
                                    if (!verifyPhoneInput || verifyPhoneInput.length < 3) return (
                                        <div style={{ textAlign: 'center', marginTop: '40px', color: '#9ca3af' }}>
                                            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📱</div>
                                            <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>Waiting for guest phone number...</div>
                                        </div>
                                    );

                                    let match = null;
                                    let matchedTableName = '';

                                    if (verifyTableId) {
                                        const table = tables.find(t => t.tableId === verifyTableId);
                                        match = (table?.reservations || []).find(r => r.phone?.includes(verifyPhoneInput) || verifyPhoneInput.includes(r.phone));
                                        matchedTableName = table?.tableName;
                                    } else {
                                        for (const t of tables) {
                                            const m = (t.reservations || []).find(r => r.phone?.includes(verifyPhoneInput) || verifyPhoneInput.includes(r.phone));
                                            if (m) {
                                                match = m;
                                                matchedTableName = t.tableName;
                                                break;
                                            }
                                        }
                                    }

                                    if (match) {
                                        return (
                                            <div style={{
                                                marginTop: '10px',
                                                padding: '24px',
                                                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                                                borderRadius: '16px',
                                                border: '1px solid #bbf7d0',
                                                boxShadow: '0 4px 12px rgba(22, 101, 52, 0.05)'
                                            }}>
                                                <div style={{ color: '#166534', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Reservation Found</div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                    <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#111827' }}>{match.name}</div>
                                                    <div style={{ padding: '6px 12px', background: '#166534', color: '#fff', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800' }}>Table {matchedTableName}</div>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                                                    <div style={{ background: 'rgba(255,255,255,0.5)', padding: '12px', borderRadius: '10px' }}>
                                                        <div style={{ fontSize: '0.7rem', color: '#166534', fontWeight: '800', textTransform: 'uppercase' }}>Date</div>
                                                        <div style={{ fontWeight: '700', color: '#111827' }}>{match.date}</div>
                                                    </div>
                                                    <div style={{ background: 'rgba(255,255,255,0.5)', padding: '12px', borderRadius: '10px' }}>
                                                        <div style={{ fontSize: '0.7rem', color: '#166534', fontWeight: '800', textTransform: 'uppercase' }}>Session</div>
                                                        <div style={{ fontWeight: '700', color: '#111827' }}>{match.startTime}</div>
                                                    </div>
                                                </div>
                                                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ fontSize: '0.9rem', color: '#4b5563', fontWeight: '600' }}>
                                                        Guests: <span style={{ color: '#111827', fontWeight: '800' }}>{match.guests} Persons</span>
                                                    </div>
                                                    {match.advancePayment > 0 && (
                                                        <div style={{ color: '#166534', fontWeight: '900', fontSize: '1rem' }}>
                                                            {cs}{match.advancePayment} <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>Paid</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    } else if (verifyPhoneInput.length >= 10) {
                                        return (
                                            <div style={{ marginTop: '20px', padding: '20px', background: '#fff', borderRadius: '16px', border: '2px dashed #fee2e2', color: '#991b1b', fontSize: '0.95rem', textAlign: 'center' }}>
                                                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>❌</div>
                                                <div style={{ fontWeight: '700' }}>No active reservation found</div>
                                                <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '4px' }}>Please double check the phone number</div>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>

                            <div className="modal-footer" style={{ padding: '24px', background: '#fff', borderTop: '1px solid #f3f4f6', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                                <button className="btn btn-secondary" style={{ borderRadius: '12px', fontWeight: '800', height: '56px', border: '2px solid #f3f4f6', background: '#fff', color: '#4b5563' }} onClick={() => setShowVerifyModal(false)}>CANCEL</button>
                                <button
                                    className="btn btn-primary"
                                    style={{
                                        background: '#dc2626',
                                        borderRadius: '12px',
                                        fontWeight: '800',
                                        height: '56px',
                                        fontSize: '1rem',
                                        letterSpacing: '0.025em',
                                        boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)',
                                        opacity: (() => {
                                            if (verifyTableId) {
                                                return tables.find(t => t.tableId === verifyTableId)?.reservations?.some(r => r.phone === verifyPhoneInput) ? 1 : 0.5;
                                            } else {
                                                return tables.some(t => (t.reservations || []).some(r => r.phone === verifyPhoneInput)) ? 1 : 0.5;
                                            }
                                        })()
                                    }}
                                    onClick={handleVerifyUser}
                                    disabled={(() => {
                                        if (verifyTableId) {
                                            return !tables.find(t => t.tableId === verifyTableId)?.reservations?.some(r => r.phone === verifyPhoneInput);
                                        } else {
                                            return !tables.some(t => (t.reservations || []).some(r => r.phone === verifyPhoneInput));
                                        }
                                    })()}
                                >
                                    VERIFY & OPEN TABLE
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Toast Notification */}
            {
                toast.show && (
                    <div style={{
                        position: 'fixed', top: '40px', left: '50%', transform: 'translateX(-50%)',
                        background: '#10b981', color: 'white', padding: '12px 24px', borderRadius: '50px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        zIndex: 9999, display: 'flex', alignItems: 'center', gap: '8px',
                        animation: 'fadeInScale 0.3s ease-out'
                    }}>
                        <span style={{ fontSize: '1.2rem' }}>✅</span>
                        <div>
                            <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{toast.message}</div>
                            {toast.subtext && <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>{toast.subtext}</div>}
                        </div>
                    </div>
                )
            }

            {/* Close Table Modal */}
            {
                showCloseModal && closeTableData && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ width: '420px', padding: '0', overflow: 'hidden' }}>
                            <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Settlement Summary</h2>
                                <button className="close-btn" onClick={() => setShowCloseModal(false)}>×</button>
                            </div>

                            <div style={{ padding: '24px' }}>
                                <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <span style={{ color: '#6b7280' }}>Table Number</span>
                                        <span style={{ fontWeight: '800', color: '#111827' }}>{closeTableData.tableName}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <span style={{ color: '#6b7280' }}>Guest Count</span>
                                        <span style={{ fontWeight: '700' }}>{closeTableData.guests} Persons</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <span style={{ color: '#6b7280' }}>Session Time</span>
                                        <span style={{ fontWeight: '700' }}>{formatDuration(closeTableData.duration)}</span>
                                    </div>
                                    <div style={{ height: '1px', background: '#e5e7eb', margin: '8px 0' }}></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', alignItems: 'center' }}>
                                        <span style={{ color: '#111827', fontWeight: '600' }}>Total Amount</span>
                                        <span style={{ fontWeight: '900', color: '#dc2626', fontSize: '1.5rem' }}>{cs}{closeTableData.amount}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', background: '#f0fdf4', padding: '10px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600' }}>
                                    <span>✅</span> Payment has been fully settled
                                </div>
                            </div>

                            <div className="modal-footer" style={{ padding: '16px 24px', background: '#f9fafb', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button className="btn btn-secondary" onClick={() => setShowCloseModal(false)}>Back</button>
                                <button className="btn btn-primary" style={{ backgroundColor: '#dc2626' }} onClick={handleCloseSubmit}>Close & Release Table</button>
                            </div>
                        </div>
                    </div>
                )
            }

        </div >
    );
};

const TableCard = ({ table, formatDuration, onMenuAction, onCardClick, onSendToCashier }) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);
    const { settings, getCurrencySymbol } = useSettings();
    const cs = getCurrencySymbol();

    // Helper logic to find nearest upcoming reservation
    const getNextReservation = () => {
        if (!table.reservations || table.reservations.length === 0) return null;

        const now = new Date();
        const currentH = now.getHours();
        const currentM = now.getMinutes();
        const currentVal = currentH * 60 + currentM;
        const todayStr = now.toISOString().split('T')[0];

        // Filter: Today, future start time
        const future = table.reservations.filter(res => {
            if (res.date && res.date !== todayStr) return false;
            const [h, m] = res.startTime.split(':').map(Number);
            const val = h * 60 + m;
            return val > currentVal;
        });

        if (future.length === 0) return null;

        // Sort by time
        future.sort((a, b) => {
            const valA = a.startTime.split(':').reduce((h, m) => h * 60 + parseInt(m));
            const valB = b.startTime.split(':').reduce((h, m) => h * 60 + parseInt(m));
            return valA - valB;
        });

        return future[0];
    };

    const nextRes = getNextReservation();

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleMenuClick = (e) => {
        e.stopPropagation();
        setShowMenu(!showMenu);
    };

    const handleAction = (action, e) => {
        e.stopPropagation();
        onMenuAction(action, table);
        setShowMenu(false);
    };

    // Table Color Logic
    const getStatusStyles = (status) => {
        switch (status) {
            case 'Available': return { badge: '#10b981', bg: '#fff', border: '#e5e7eb' };
            case 'Reserved': return { badge: '#f97316', bg: '#fff7ed', border: '#fdba74' };
            case 'Running': return { badge: '#10b981', bg: '#f0fdf4', border: '#bcfced' };
            case 'Occupied': return { badge: '#fbbf24', bg: '#fffbeb', border: '#fde68a' };
            case 'Billed': return { badge: '#ef4444', bg: '#fef2f2', border: '#fecaca' };
            default: return { badge: '#6b7280', bg: '#fff', border: '#e5e7eb' };
        }
    };

    const statusToUse = table.calculatedStatus || table.status;
    const styles = getStatusStyles(statusToUse);

    const [elapsedTime, setElapsedTime] = useState(table.duration || 0);

    useEffect(() => {
        let interval;
        if (statusToUse === 'Running' || statusToUse === 'Billed') {
            if (table.orderStartTime) {
                const startTime = new Date(table.orderStartTime).getTime();
                const now = new Date().getTime();
                setElapsedTime(Math.floor((now - startTime) / 1000));
            }

            interval = setInterval(() => {
                if (table.orderStartTime) {
                    const startTime = new Date(table.orderStartTime).getTime();
                    const now = new Date().getTime();
                    setElapsedTime(Math.floor((now - startTime) / 1000));
                } else {
                    setElapsedTime(prev => prev + 1);
                }
            }, 1000);
        } else {
            setElapsedTime(0);
        }
        return () => clearInterval(interval);
    }, [statusToUse, table.orderStartTime]);

    const formatLiveDuration = (seconds) => {
        if (!seconds) return '0m';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    // Helper for source labels
    const getSourceLabel = (src) => {
        if (src === 'Phone') return 'Phone Number';
        if (src === 'Walk-In') return 'Walk In';
        return src || 'Phone';
    };

    return (
        <div
            className={`table-item ${statusToUse.toLowerCase()}`}
            onClick={onCardClick}
            style={{
                background: styles.bg,
                border: `1px solid ${styles.border}`,
                borderRadius: '16px',
                boxShadow: showMenu ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                padding: '16px',
                position: 'relative',
                zIndex: showMenu ? 50 : 1,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                transform: showMenu ? 'translateY(-2px)' : 'none'
            }}
        >
            {statusToUse !== 'Available' && statusToUse !== 'Reserved' && table.orderStatus === 'Pending' && <div className="blink-dot blink-yellow-real" title="Order Pending"></div>}
            {statusToUse !== 'Available' && statusToUse !== 'Reserved' && (table.orderStatus === 'Preparing' || table.orderStatus === 'Ready') && <div className="blink-dot blink-red-real" title="Preparing"></div>}
            {statusToUse !== 'Available' && statusToUse !== 'Reserved' && table.orderStatus === 'Served' && <div className="blink-dot blink-green-real" title="Ready / Served"></div>}

            <div className="table-topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="table-id" style={{ fontWeight: '800', fontSize: '1.3rem', color: '#111827' }}>{table.tableName}</span>
                    <span className={`status-tag`} style={{
                        background: `${styles.badge}20`,
                        color: styles.badge,
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textTransform: 'uppercase'
                    }}>
                        {statusToUse}
                    </span>
                </div>

                <div className="menu-container" ref={menuRef} style={{ position: 'relative' }}>
                    <div className="menu-trigger" onClick={handleMenuClick} style={{
                        fontSize: '1.5rem', color: '#9ca3af', cursor: 'pointer', padding: '0 4px'
                    }}>
                        ⋮
                    </div>
                    {showMenu && (
                        <div className="context-menu" onMouseDown={(e) => e.stopPropagation()} style={{
                            position: 'absolute', top: 'calc(100% + 5px)', right: '0', zIndex: 100,
                            background: '#fff', borderRadius: '14px',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #f3f4f6', minWidth: '180px', overflow: 'hidden',
                            animation: 'fadeInScale 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}>
                            <div className="menu-group" style={{ padding: '6px' }}>
                                <MenuItem icon="📅" label="Reserve Table" onClick={(e) => handleAction('Reserve Table', e)} />
                                <MenuItem icon="📝" label="Reservation List" onClick={(e) => handleAction('Reservation List', e)} />
                            </div>

                            <div style={{ height: '1px', background: '#f3f4f6', margin: '0 6px' }}></div>

                            <div className="menu-group" style={{ padding: '6px' }}>
                                {(table.status === 'Available' || table.status === 'Reserved') && (
                                    <>
                                        <MenuItem icon="🚶" label="Walk-in" color="#10b981" weight="600" onClick={(e) => handleAction('Walk-in', e)} />
                                        {settings.billingRules?.splitBill !== false && (
                                            <MenuItem icon="✂" label="Split Table" onClick={(e) => handleAction('Split Table', e)} />
                                        )}
                                        <MenuItem icon="↔" label="Move Guests" onClick={(e) => handleAction('Move Guests', e)} />
                                        {settings.billingRules?.mergeTable !== false && (
                                            <MenuItem icon="🔗" label="Merge Table" onClick={(e) => handleAction('Merge Table', e)} />
                                        )}
                                    </>
                                )}

                                {table.status === 'Running' && (
                                    <>
                                        <MenuItem icon="↔" label="Move Guests" onClick={(e) => handleAction('Move Guests', e)} />
                                        {settings.billingRules?.mergeTable !== false && (
                                            <MenuItem icon="🔗" label="Merge Table" onClick={(e) => handleAction('Merge Table', e)} />
                                        )}
                                        {(table.amount === 0 || !table.currentOrderId) && (
                                            <MenuItem icon="↺" label="Release Table" color="#dc2626" onClick={(e) => handleAction('Release Table', e)} />
                                        )}
                                        <MenuItem icon="✓" label="Close Table" color="#dc2626" onClick={(e) => handleAction('Close Table', e)} />
                                    </>
                                )}

                                {(table.reservations && table.reservations.length > 0) && (
                                    <MenuItem icon="🔍" label="Verify User" onClick={(e) => handleAction('Verify User', e)} />
                                )}

                                {table.status === 'Billed' && (
                                    <MenuItem icon="✓" label="Close Table" color="#dc2626" onClick={(e) => handleAction('Close Table', e)} />
                                )}

                                {((table.mergedTableIds && table.mergedTableIds.length > 0) || (table.tableName && table.tableName.includes(','))) && (
                                    <MenuItem icon="🔓" label="Release Table" color="#dc2626" weight="700" onClick={(e) => handleAction('Release Table', e)} />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="table-body">
                <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>🪑</span> Seats: {table.capacity}
                </div>

                <div className="table-metrics" style={{ minHeight: '60px' }}>
                    {statusToUse === 'Available' ? (
                        <>
                            <div style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: '600', marginBottom: '4px' }}>Ready for guests</div>
                            {nextRes && (() => {
                                const now = new Date();
                                const [h, m] = nextRes.startTime.split(':').map(Number);
                                const nextVal = h * 60 + m;
                                const currVal = now.getHours() * 60 + now.getMinutes();
                                const diff = nextVal - currVal;
                                const isNear = diff > 0 && diff <= 30;

                                return (
                                    <div style={{
                                        fontSize: '0.8rem',
                                        color: isNear ? '#dc2626' : '#6b7280',
                                        marginTop: '8px',
                                        padding: '6px 10px',
                                        background: isNear ? '#fef2f2' : '#f9fafb',
                                        borderRadius: '8px',
                                        border: isNear ? '1px solid #fecaca' : '1px dashed #e5e7eb',
                                        animation: isNear ? 'pulse 2s infinite' : 'none'
                                    }}>
                                        {isNear ? '⚠️ Arriving Soon: ' : 'Next: '}
                                        <span style={{ fontWeight: '800', color: isNear ? '#b91c1c' : '#4b5563' }}>
                                            {nextRes.startTime} ({diff}m)
                                        </span>
                                        <div style={{ fontSize: '0.75rem', fontWeight: '600', opacity: 0.8 }}>{nextRes.name} ({getSourceLabel(nextRes.source)})</div>
                                    </div>
                                );
                            })()}
                        </>
                    ) : statusToUse === 'Reserved' ? (
                        <div style={{ padding: '10px', background: '#fff7ed', borderRadius: '12px', border: '1px solid #ffedd5' }}>
                            <div style={{ fontSize: '0.75rem', color: '#c2410c', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reservation Active</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#111827', marginTop: '4px' }}>
                                {table.activeReservation?.startTime} - {table.activeReservation?.endTime}
                            </div>
                            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#9a3412', marginTop: '2px' }}>
                                {table.activeReservation?.name} ({getSourceLabel(table.activeReservation?.source)})
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <div style={{ padding: '6px', background: '#fff', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                                <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Amount</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>{cs}{table.amount || table.runningOrderAmount || 0}</div>
                            </div>
                            <div style={{ padding: '6px', background: '#fff', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                                <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Time</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>{formatLiveDuration(elapsedTime)}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="table-action" style={{
                marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f3f4f6',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }} onClick={onCardClick}>
                    <span style={{ color: '#dc2626', fontWeight: '700', fontSize: '0.9rem' }}>
                        {(table.status === 'Available' || table.status === 'Occupied') ? 'Tap to Order' : 'Manage Order'}
                    </span>
                    <span style={{ fontSize: '1.2rem', color: '#dc2626', fontWeight: '800' }}>→</span>
                </div>

                {(statusToUse === 'Running') && (
                    <button
                        onClick={(e) => onSendToCashier(e, table)}
                        title="Send final bill to cashier"
                        style={{
                            padding: '8px 16px', borderRadius: '8px',
                            background: '#dc2626', color: 'white', border: 'none',
                            fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem',
                            boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)',
                            transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        Send
                    </button>
                )}
            </div>
        </div>
    );
};

export default GuestMealService;
