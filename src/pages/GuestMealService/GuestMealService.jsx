import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './GuestMealService.css';
import API_URL from '../../config/api';

const GuestMealService = () => {
    // --- STATE MANAGEMENT ---
    const navigate = useNavigate();

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

    const [newTableData, setNewTableData] = useState({
        tableName: '',
        type: '',
        capacity: ''
    });

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
        phone: ''
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
        reserved: 0
    });

    // Fetch tables on mount
    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        try {
            const response = await fetch(`${API_URL}/api/guest-meal/tables`);
            const data = await response.json();
            if (data.success) {
                setTables(data.data);
                // Extract unique types
                const types = [...new Set(data.data.map(t => t.type))].filter(Boolean);
                // Merge with default types
                setTableTypes(prev => {
                    const merged = [...new Set([...prev, ...types])];
                    return merged;
                });
            }
        } catch (error) {
            console.error('Error fetching tables:', error);
        } finally {
            setLoading(false);
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
            handleTableClick(table);
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
    const openVerifyModal = (table) => {
        setVerifyTableId(table.tableId);
        setVerifyPhoneInput('');
        setShowVerifyModal(true);
    };

    const handleVerifyUser = async () => {
        const table = tables.find(t => t.tableId === verifyTableId);
        if (!table || !table.reservation) {
            alert("No reservation found for this table.");
            setShowVerifyModal(false);
            return;
        }

        if (table.reservation.phone === verifyPhoneInput) {
            // Verified! Open table for this guest
            setShowVerifyModal(false);

            // Proceed to open table (same logic as handleTableClick but explicit)
            try {
                const response = await fetch(`${API_URL}/api/guest-meal/tables/${table.tableId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'Running' })
                });

                const data = await response.json();
                if (!data.success) {
                    alert("Failed to update status. Please try again.");
                    return;
                }

                // Update local state
                setTables(prev => prev.map(t => t.tableId === table.tableId ? { ...t, status: 'Running' } : t));

                // Navigate with guest details
                const dummyOrderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                navigate('/admin/dashboard', {
                    state: {
                        activeMenu: 'food-order-pos',
                        room: {
                            roomNumber: table.tableName,
                            guestName: table.reservation.name,
                            guestPhone: table.reservation.phone,
                            id: table.tableId
                        }
                    }
                });

            } catch (error) {
                console.error("Error verifying user:", error);
                alert("Network error during verification.");
            }
        } else {
            alert("Phone number does not match reservation.");
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
                note: reservation.note || ''
            });
        } else {
            const now = new Date();
            const currentHour = now.getHours();
            const nextHour = currentHour + 1;

            setReserveFormData({
                name: '',
                date: new Date().toISOString().split('T')[0],
                startTime: `${String(currentHour).padStart(2, '0')}:00`,
                endTime: `${String(nextHour).padStart(2, '0')}:00`,
                guests: table.capacity, // Default to capacity
                phone: ''
            });
        }
        setShowReserveModal(true);
    };

    const handleReserveSubmit = async () => {
        if (!reserveTargetTable || !reserveFormData.name || !reserveFormData.startTime || !reserveFormData.endTime) return;

        const conflict = checkReservationConflict(reserveTargetTable, reserveFormData);
        if (conflict) {
            alert(`Conflict! Table is already reserved for ${conflict.startTime} - ${conflict.endTime} by ${conflict.name}`);
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

            const response = await fetch(`${API_URL}/api/guest-meal/tables/${reserveTargetTable.tableId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (data.success) {
                setTables(prev => prev.map(t => t.tableId === reserveTargetTable.tableId ? data.data : t));
                if (reservationListTable && reservationListTable.tableId === reserveTargetTable.tableId) {
                    setReservationListTable(data.data);
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
        // removed prompt

        try {
            const response = await fetch(`${API_URL}/api/guest-meal/tables/${table.tableId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ removeReservationId: reservationId })
            });

            const data = await response.json();
            if (data.success) {
                setTables(prev => prev.map(t => {
                    if (t.tableId === table.tableId) {
                        return {
                            ...t,
                            reservations: (t.reservations || []).filter(r => r.id !== reservationId)
                        };
                    }
                    return t;
                }));
                // Also update the local reservationListTable if it's the same table
                if (reservationListTable && reservationListTable.tableId === table.tableId) {
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
                        activeMenu: 'food-order-pos',
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
                amount: 0,
                duration: 0
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
            }
        } catch (error) {
            console.error(error);
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
        let filtered = tables.filter(t => !t.tableName.startsWith('_MERGED_'));

        // Filter by Status
        if (statusFilter !== 'All') {
            filtered = filtered.filter(table => table.status === statusFilter);
        }

        // Filter by Type
        if (typeFilter !== 'All') {
            filtered = filtered.filter(table => table.type === typeFilter);
        }

        // Search
        if (searchQuery) {
            filtered = filtered.filter(table =>
                table.tableName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        setFilteredTables(filtered);

        // Update stats
        setStats({
            total: tables.length,
            available: tables.filter(t => t.status === 'Available').length,
            running: tables.filter(t => t.status === 'Running').length,
            billed: tables.filter(t => t.status === 'Billed').length,
            reserved: tables.filter(t => t.status === 'Reserved').length
        });
    }, [statusFilter, typeFilter, searchQuery, tables]);

    const formatDuration = (minutes) => {
        if (minutes === 0) return '--';
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h${mins}m` : `${hours}h`;
    };

    const handleTableClick = async (table) => {
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

        if (table.status === 'Available' || table.status === 'Reserved') {
            try {
                // Determine if we need to call API to update status
                const response = await fetch(`${API_URL}/api/guest-meal/tables/${table.tableId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'Running' })
                });

                const data = await response.json();
                if (!data.success) {
                    console.error('Failed to update table status: ' + data.message);
                    alert("Failed to update status: " + (data.message || "Unknown error"));
                    return;
                }

                // Update local state immediately
                setTables(prev => prev.map(t => t.tableId === table.tableId ? { ...t, status: 'Running' } : t));

                // Navigate
                const dummyOrderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                navigate('/admin/dashboard', {
                    state: {
                        activeMenu: 'food-order-pos',
                        room: {
                            roomNumber: table.tableName,
                            guestName: 'Walk-in',
                            guestPhone: '',
                            id: table.tableId
                        }
                    }
                });
            } catch (error) {
                console.error("Error updating table status:", error);
                alert("Network error: Could not connect to server.");
            }
        } else {
            // Already Running or Billed -> Just navigate
            // Already Running or Billed -> Just navigate
            const dummyOrderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            // Try to find if guest details exist
            let guestName = 'Walk-in';
            let guestPhone = '';
            if (table.reservation) {
                guestName = table.reservation.name || 'Walk-in';
                guestPhone = table.reservation.phone || '';
            }

            navigate('/admin/dashboard', {
                state: {
                    activeMenu: 'food-order-pos',
                    room: {
                        roomNumber: table.tableName,
                        guestName: guestName,
                        guestPhone: guestPhone,
                        id: table.tableId
                    }
                }
            });
        }
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', color: '#111827' }}>Dining Dashboard</h1>
                        <p style={{ color: '#6b7280', margin: '4px 0 0' }}>Manage your restaurant tables and reservations</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowAddTableModal(true)} style={{ background: '#dc2626', borderRadius: '10px', padding: '12px 24px', fontWeight: '700', border: 'none', cursor: 'pointer', boxShadow: '0 4px 10px rgba(220, 38, 38, 0.2)' }}>
                        + Add Table
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
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', marginTop: '8px' }}>{stats.reserved}</div>
                    </div>
                    <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '12px', border: '1px solid #dbeafe' }}>
                        <div style={{ fontSize: '0.875rem', color: '#1e40af', fontWeight: '600' }}>Revenue Today</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', marginTop: '8px' }}>₹{tables.reduce((acc, t) => acc + (t.amount || 0), 0)}</div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="gms-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '20px' }}>
                <div className="gms-search-wrapper" style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                    <input
                        type="text"
                        placeholder="Search table number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: '12px', border: '1px solid #e5e7eb', outline: 'none', background: '#fff' }}
                    />
                    <span className="gms-search-icon" style={{ position: 'absolute', left: '14px', top: '12px', color: '#9ca3af' }}>🔍</span>
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
                            />
                        ))}
                    </div>
                )
            }

            {/* Add Table Modal */}
            {
                showAddTableModal && (
                    <div className="sidebar-overlay" style={{ opacity: 1, zIndex: 1000 }} onClick={() => setShowAddTableModal(false)}>
                        <div className="modal-content" style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: 'white',
                            padding: '24px',
                            borderRadius: '12px',
                            width: '400px',
                            maxWidth: '90%'
                        }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2 style={{ margin: 0 }}>Add New Table</h2>
                                <button onClick={() => setShowAddTableModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button>
                            </div>

                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Table Name/Number</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., T15, VIP-1"
                                    value={newTableData.tableName}
                                    onChange={e => setNewTableData({ ...newTableData, tableName: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Capacity</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="e.g., 4"
                                    value={newTableData.capacity}
                                    onChange={e => setNewTableData({ ...newTableData, capacity: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Table Type</label>
                                {!isAddingTableType ? (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <select
                                            value={newTableData.type}
                                            onChange={e => setNewTableData({ ...newTableData, type: e.target.value })}
                                            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                        >
                                            <option value="">Select Type</option>
                                            {tableTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => setIsAddingTableType(true)}
                                            style={{ padding: '0 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '18px' }}
                                            title="Add New Type"
                                        >
                                            +
                                        </button>
                                        <button
                                            style={{ padding: '0 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
                                            onClick={() => {
                                                if (newTableData.type && !['General', 'AC', 'Non-AC', 'Garden'].includes(newTableData.type)) {
                                                    setTableTypes(tableTypes.filter(t => t !== newTableData.type));
                                                    setNewTableData({ ...newTableData, type: '' });
                                                } else {
                                                    alert('Select a custom type to remove');
                                                }
                                            }}
                                            title="Remove Selected Type"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="text"
                                            placeholder="New type..."
                                            value={newTableType}
                                            onChange={e => setNewTableType(e.target.value)}
                                            autoFocus
                                            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                        />
                                        <button
                                            onClick={handleAddTableType}
                                            style={{ padding: '0 12px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                        >
                                            ✓
                                        </button>
                                        <button
                                            onClick={() => setIsAddingTableType(false)}
                                            style={{ padding: '0 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={handleCreateTable}
                                    style={{ flex: 1, padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    Create Table
                                </button>
                                <button
                                    onClick={() => setShowAddTableModal(false)}
                                    style={{ flex: 1, padding: '12px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

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

            {/* Reserve Table Modal */}
            {
                showReserveModal && reserveTargetTable && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ width: '450px', padding: '0', overflow: 'hidden' }}>
                            <div className="modal-header" style={{ padding: '20px 24px', background: '#fff', borderBottom: '1px solid #f3f4f6' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#111827' }}>{reserveFormData.id ? 'Modify' : 'Reserve'} Table – {reserveTargetTable.tableName}</h2>
                                <button className="close-btn" onClick={() => setShowReserveModal(false)} style={{ fontSize: '1.5rem', color: '#9ca3af' }}>×</button>
                            </div>

                            <div style={{ padding: '24px' }}>
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#4b5563' }}>Guest Mobile Number</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text" className="form-input" placeholder="Enter phone number"
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '1rem' }}
                                            value={reserveFormData.phone}
                                            onChange={e => {
                                                const val = e.target.value;
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
                                        type="text" className="form-input" placeholder="Enter guest name"
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '1rem' }}
                                        value={reserveFormData.name}
                                        onChange={e => setReserveFormData({ ...reserveFormData, name: e.target.value })}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#4b5563' }}>Date</label>
                                        <input
                                            type="date" className="form-input"
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                            value={reserveFormData.date}
                                            onChange={e => setReserveFormData({ ...reserveFormData, date: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#4b5563' }}>Time (Session)</label>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <input
                                                type="time" className="form-input"
                                                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.9rem' }}
                                                value={reserveFormData.startTime}
                                                onChange={e => setReserveFormData({ ...reserveFormData, startTime: e.target.value })}
                                            />
                                            <span style={{ alignSelf: 'center', color: '#9ca3af' }}>-</span>
                                            <input
                                                type="time" className="form-input"
                                                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.9rem' }}
                                                value={reserveFormData.endTime}
                                                onChange={e => setReserveFormData({ ...reserveFormData, endTime: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '8px' }}>
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
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#4b5563' }}>Special Note</label>
                                        <input
                                            type="text" className="form-input" placeholder="e.g. Birthday"
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                            value={reserveFormData.note || ''}
                                            onChange={e => setReserveFormData({ ...reserveFormData, note: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {(() => {
                                    const conflict = checkReservationConflict(reserveTargetTable, reserveFormData);
                                    if (conflict) {
                                        return (
                                            <div style={{ marginTop: '12px', padding: '10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '0.85rem', fontWeight: '600' }}>
                                                ⚠️ Reservation already exist: {conflict.startTime} - {conflict.endTime} ({conflict.name})
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
                        <div className="modal-content" style={{ width: '450px', padding: '0', overflow: 'hidden' }}>
                            <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Merge Multiple Tables</h2>
                                <button className="close-btn" onClick={() => setShowMergeModal(false)} style={{ fontSize: '1.5rem', color: '#9ca3af' }}>×</button>
                            </div>

                            <div style={{ padding: '24px' }}>
                                <div style={{ marginBottom: '20px', padding: '12px', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fee2e2' }}>
                                    <div style={{ fontSize: '0.9rem', color: '#991b1b', fontWeight: '600' }}>Merging into:</div>
                                    <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#dc2626' }}>{mergeSourceTable.tableName.replace('_MERGED_', '')}</div>
                                </div>

                                <label style={{ display: 'block', marginBottom: '12px', fontSize: '1rem', fontWeight: '700', color: '#374151' }}>
                                    Select Tables to Merge:
                                </label>

                                <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '8px' }}>
                                    {tables
                                        .filter(t => t.tableId !== mergeSourceTable.tableId && !t.tableName.startsWith('_MERGED_'))
                                        .map(t => (
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
                                                    background: mergeSelectedTargetIds.includes(t.tableId) ? '#fff1f2' : 'transparent',
                                                    transition: 'all 0.2s ease',
                                                    marginBottom: '4px'
                                                }}
                                            >
                                                <div style={{
                                                    width: '20px', height: '20px', borderRadius: '4px',
                                                    border: `2px solid ${mergeSelectedTargetIds.includes(t.tableId) ? '#dc2626' : '#d1d5db'}`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    background: mergeSelectedTargetIds.includes(t.tableId) ? '#dc2626' : '#fff'
                                                }}>
                                                    {mergeSelectedTargetIds.includes(t.tableId) && <span style={{ color: '#fff', fontSize: '0.8rem' }}>✓</span>}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: '700', color: '#111827' }}>{t.tableName}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Capacity: {t.capacity} | Status: {t.status}</div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>

                                {mergeSelectedTargetIds.length > 0 && (
                                    <div style={{ marginTop: '20px', padding: '16px', background: '#f9fafb', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '4px' }}>Resulting Table Name:</div>
                                        <div style={{ fontWeight: '800', color: '#111827' }}>
                                            {[mergeSourceTable, ...tables.filter(t => mergeSelectedTargetIds.includes(t.tableId))].map(t => t.tableName.replace('_MERGED_', '')).join(', ')}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                                            <span style={{ color: '#6b7280' }}>Total Capacity:</span>
                                            <span style={{ fontWeight: '800', color: '#dc2626' }}>
                                                {mergeSourceTable.capacity + tables.filter(t => mergeSelectedTargetIds.includes(t.tableId)).reduce((sum, t) => sum + (t.capacity || 4), 0)} Persons
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer" style={{ padding: '16px 24px', background: '#f9fafb', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button className="btn btn-secondary" onClick={() => setShowMergeModal(false)}>Cancel</button>
                                <button
                                    className="btn btn-primary"
                                    style={{ background: '#dc2626', opacity: mergeSelectedTargetIds.length === 0 ? 0.5 : 1 }}
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
                                        {[...reservationListTable.reservations]
                                            .filter(res =>
                                                res.name.toLowerCase().includes(reservationSearchQuery.toLowerCase()) ||
                                                res.phone.includes(reservationSearchQuery)
                                            )
                                            .sort((a, b) => a.startTime.localeCompare(b.startTime))
                                            .map((res, index) => (
                                                <div key={res.id || index} style={{
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    padding: '12px 16px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #f3f4f6'
                                                }}>
                                                    <div>
                                                        <div style={{ fontWeight: '700', color: '#111827', fontSize: '1rem' }}>{res.startTime} - {res.name}</div>
                                                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                                            {res.guests} Guests • {res.phone} {res.date && `• ${res.date}`}
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

            {/* Verify User Modal */}
            {
                showVerifyModal && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ width: '400px', padding: '0', overflow: 'hidden' }}>
                            <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Verify Guest</h2>
                                <button className="close-btn" onClick={() => setShowVerifyModal(false)}>×</button>
                            </div>
                            <div style={{ padding: '24px' }}>
                                <div className="form-group" style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#4b5563' }}>Registered Phone Number:</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={verifyPhoneInput}
                                        onChange={(e) => setVerifyPhoneInput(e.target.value)}
                                        placeholder="e.g. 9876543210"
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                        autoFocus
                                    />
                                    <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '8px' }}>Please double check the contact number listed for this reservation.</p>
                                </div>
                            </div>
                            <div className="modal-footer" style={{ padding: '16px 24px', background: '#f9fafb', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button className="btn btn-secondary" onClick={() => setShowVerifyModal(false)}>Cancel</button>
                                <button className="btn btn-primary" style={{ background: '#dc2626' }} onClick={handleVerifyUser}>Verify & Open Table</button>
                            </div>
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
                                        <span style={{ fontWeight: '900', color: '#dc2626', fontSize: '1.5rem' }}>₹{closeTableData.amount}</span>
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

const TableCard = ({ table, formatDuration, onMenuAction, onCardClick }) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

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
            case 'Running': return { badge: '#10b981', bg: '#f0fdf4', border: '#bcfced' }; // Light green as requested
            case 'Billed': return { badge: '#ef4444', bg: '#fef2f2', border: '#fecaca' };
            default: return { badge: '#6b7280', bg: '#fff', border: '#e5e7eb' };
        }
    };

    const styles = getStatusStyles(table.status);

    return (
        <div
            className={`table-item ${table.status.toLowerCase()}`}
            onClick={onCardClick}
            style={{
                background: styles.bg,
                border: `1px solid ${styles.border}`,
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                padding: '16px',
                position: 'relative',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
            }}
        >
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
                        {table.status}
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
                            position: 'absolute', top: '100%', right: '0', zIndex: 100,
                            background: '#fff', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #f3f4f6', minWidth: '160px', overflow: 'hidden'
                        }}>
                            <div className="menu-item" onMouseDown={(e) => handleAction('Reserve Table', e)} style={{ padding: '10px 16px', display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.9rem', cursor: 'pointer' }}>
                                <span>📅</span> Reserve Table
                            </div>
                            <div className="menu-item" onMouseDown={(e) => handleAction('Reservation List', e)} style={{ padding: '10px 16px', display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.9rem', cursor: 'pointer' }}>
                                <span>📝</span> Reservation List
                            </div>

                            <div style={{ height: '1px', background: '#f3f4f6' }}></div>

                            {(table.status === 'Available' || table.status === 'Reserved') && (
                                <>
                                    <div className="menu-item" onMouseDown={(e) => handleAction('Walk-in', e)} style={{ padding: '10px 16px', display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.9rem', cursor: 'pointer', color: '#10b981', fontWeight: '600' }}>
                                        <span>🚶</span> Walk-in
                                    </div>
                                    <div className="menu-item" onMouseDown={(e) => handleAction('Split Table', e)} style={{ padding: '10px 16px', display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.9rem', cursor: 'pointer' }}>
                                        <span>✂</span> Split Table
                                    </div>
                                    <div className="menu-item" onMouseDown={(e) => handleAction('Move Guests', e)} style={{ padding: '10px 16px', display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.9rem', cursor: 'pointer' }}>
                                        <span>↔</span> Move Guests
                                    </div>
                                    <div className="menu-item" onMouseDown={(e) => handleAction('Merge Table', e)} style={{ padding: '10px 16px', display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.9rem', cursor: 'pointer' }}>
                                        <span>🔗</span> Merge Table
                                    </div>
                                </>
                            )}

                            {table.status === 'Running' && (
                                <>
                                    <div className="menu-item" onMouseDown={(e) => handleAction('Move Guests', e)} style={{ padding: '10px 16px', display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.9rem', cursor: 'pointer' }}>
                                        <span>↔</span> Move Guests
                                    </div>
                                    <div className="menu-item" onMouseDown={(e) => handleAction('Merge Table', e)} style={{ padding: '10px 16px', display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.9rem', cursor: 'pointer' }}>
                                        <span>🔗</span> Merge Table
                                    </div>
                                    <div className="menu-item" onMouseDown={(e) => handleAction('Close Table', e)} style={{ padding: '10px 16px', display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.9rem', cursor: 'pointer', color: '#dc2626' }}>
                                        <span>✓</span> Close Table
                                    </div>
                                </>
                            )}

                            {table.status === 'Reserved' && (
                                <div className="menu-item" onMouseDown={(e) => handleAction('Verify User', e)} style={{ padding: '10px 16px', display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.9rem', cursor: 'pointer' }}>
                                    <span>🔍</span> Verify User
                                </div>
                            )}

                            {table.status === 'Billed' && (
                                <div className="menu-item" onMouseDown={(e) => handleAction('Close Table', e)} style={{ padding: '10px 16px', display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.9rem', cursor: 'pointer', color: '#dc2626' }}>
                                    <span>✓</span> Close Table
                                </div>
                            )}

                            {((table.mergedTableIds && table.mergedTableIds.length > 0) || (table.tableName && table.tableName.includes(','))) && (
                                <div className="menu-item" onMouseDown={(e) => handleAction('Release Table', e)} style={{ padding: '10px 16px', display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.9rem', cursor: 'pointer', color: '#dc2626', fontWeight: '700' }}>
                                    <span>🔓</span> Release Table
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="table-body">
                <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>🪑</span> Seats: {table.capacity}
                </div>

                <div className="table-metrics" style={{ minHeight: '60px' }}>
                    {table.status === 'Available' ? (
                        <>
                            <div style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: '600', marginBottom: '4px' }}>Ready for guests</div>
                            {nextRes && (
                                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '8px', padding: '4px 8px', background: '#f9fafb', borderRadius: '6px', border: '1px dashed #e5e7eb' }}>
                                    Next: <span style={{ fontWeight: '700', color: '#4b5563' }}>{nextRes.startTime} {nextRes.name}</span>
                                </div>
                            )}
                        </>
                    ) : table.status === 'Reserved' ? (
                        <div style={{ padding: '8px', background: '#fff7ed', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.8rem', color: '#c2410c', fontWeight: '700' }}>Active Reservation</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#111827', marginTop: '2px' }}>
                                {table.reservation?.startTime} - {table.reservation?.name}
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <div style={{ padding: '6px', background: '#fff', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                                <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Amount</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>₹{table.amount || 0}</div>
                            </div>
                            <div style={{ padding: '6px', background: '#fff', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                                <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Time</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>{formatDuration ? formatDuration(table.duration) : '0m'}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="table-action" style={{
                marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f3f4f6',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                color: '#dc2626', fontWeight: '700', fontSize: '0.9rem'
            }}>
                <span>{table.status === 'Available' ? 'Tap to Order' : 'Manage Order'}</span>
                <span style={{ fontSize: '1.2rem' }}>→</span>
            </div>
        </div>
    );
};

export default GuestMealService;
