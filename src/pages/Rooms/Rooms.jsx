import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '../../config/api';
import './Rooms.css';

const Rooms = () => {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [filteredRooms, setFilteredRooms] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Dynamic Filter State
    const [filters, setFilters] = useState({
        floor: 'All',
        roomType: 'All',
        bedType: 'All',
        status: 'All'
    });

    // Dynamic Data State
    const [roomTypes, setRoomTypes] = useState([]);
    const [bedTypes, setBedTypes] = useState([]);
    const [floors, setFloors] = useState([]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentRoom, setCurrentRoom] = useState(null);

    // Status Options (Static for now, or match RoomSetup)
    const statusOptions = ['Available', 'Booked', 'Occupied', 'Under Maintenance'];

    // Custom Room Types State (Deprecated in favor of dynamic types, but kept for modal compatibility if needed, though we will try to use dynamic)
    const [customRoomTypes, setCustomRoomTypes] = useState([]);
    const [isAddingRoomType, setIsAddingRoomType] = useState(false);
    const [newRoomType, setNewRoomType] = useState('');

    // Load rooms from MongoDB API
    useEffect(() => {
        fetchRoomsFromAPI();
    }, []);

    // Auto-refresh rooms data every 5 seconds to show real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            fetchRoomsFromAPI();
        }, 5000); // Refresh every 5 seconds

        return () => clearInterval(interval);
    }, []);

    // Refresh when page becomes visible (user switches back to tab)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchRoomsFromAPI();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    const fetchRoomsFromAPI = async () => {
        try {
            // Clear old localStorage data first
            localStorage.removeItem('hotelRooms');

            const response = await fetch(`${API_URL}/api/rooms/list`);
            const data = await response.json();
            if (data.success) {
                setRooms(data.data);
            }
        } catch (error) {
            console.error('Error fetching rooms from database:', error);
            setRooms([]);
        }
    };

    // Fetch Room Types
    const fetchRoomTypes = async () => {
        try {
            const response = await fetch(`${API_URL}/api/facility-types/list`);
            const data = await response.json();
            if (data.success) {
                setRoomTypes(data.data);
            }
        } catch (error) {
            console.error('Error fetching room types:', error);
        }
    };

    // Fetch Bed Types
    const fetchBedTypes = async () => {
        try {
            const response = await fetch(`${API_URL}/api/bed-types/list`);
            const data = await response.json();
            if (data.success) {
                setBedTypes(data.data);
            }
        } catch (error) {
            console.error('Error fetching bed types:', error);
        }
    };

    // Fetch Floors
    const fetchFloors = async () => {
        try {
            const response = await fetch(`${API_URL}/api/floors/list`);
            const data = await response.json();
            if (data.success) {
                setFloors(data.data);
            }
        } catch (error) {
            console.error('Error fetching floors:', error);
        }
    };

    useEffect(() => {
        fetchRoomTypes();
        fetchBedTypes();
        fetchFloors();
    }, []);

    // Save draft form data to localStorage whenever it changes
    useEffect(() => {
        if (showAddModal) {
            localStorage.setItem('roomFormDraft', JSON.stringify(formData));
        }
    }, [formData, showAddModal]);

    // Filter rooms based on search and filters
    useEffect(() => {
        let filtered = [...rooms];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(room =>
                room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                room.roomType.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Floor Filter
        if (filters.floor !== 'All') {
            filtered = filtered.filter(room => room.floor === filters.floor);
        }

        // Room Type Filter
        if (filters.roomType !== 'All') {
            filtered = filtered.filter(room => room.roomType === filters.roomType);
        }

        // Bed Type Filter
        if (filters.bedType !== 'All') {
            filtered = filtered.filter(room => room.bedType === filters.bedType);
        }



        // Status filter
        if (filters.status !== 'All') {
            filtered = filtered.filter(room => room.status === filters.status);
        }

        setFilteredRooms(filtered);
    }, [rooms, searchQuery, filters]);

    // Get all room types for filter dropdown
    const getAllRoomTypes = () => {
        const types = ['All Types'];
        Object.values(roomTypeCategories).forEach(category => {
            types.push(...category);
        });
        types.push(...customRoomTypes);
        return types;
    };


    const handleAddRoomType = () => {
        if (!newRoomType.trim()) return;
        const type = newRoomType.trim();
        // Check if exists in predefined or custom
        const allTypes = getAllRoomTypes();
        if (!allTypes.includes(type)) {
            setCustomRoomTypes([...customRoomTypes, type]);
            setFormData({ ...formData, roomType: type });
        } else {
            setFormData({ ...formData, roomType: type });
        }
        setIsAddingRoomType(false);
        setNewRoomType('');
    };

    const handleAddFilterType = () => {
        if (!newFilterType.trim()) return;
        const type = newFilterType.trim();
        const allTypes = getAllRoomTypes();
        if (!allTypes.includes(type)) {
            setCustomRoomTypes([...customRoomTypes, type]);
            setSelectedType(type);
        } else {
            setSelectedType(type);
        }
        setIsAddingFilterType(false);
        setNewFilterType('');
    };

    const handleAddRoom = () => {
        // Load saved draft from localStorage to preserve user's work
        const draft = loadDraftData();
        setFormData(draft);
        setErrorMessage('');
        setShowAddModal(true);
    };

    const handleEditRoom = (room) => {
        setCurrentRoom(room);
        setFormData({
            roomNumber: room.roomNumber,
            roomType: room.roomType,
            floor: room.floor || '',
            price: room.price.toString(),
            capacity: room.capacity.toString()
        });
        setErrorMessage('');
        setShowEditModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        // Validate
        if (!formData.roomNumber || !formData.roomType || !formData.price || !formData.capacity || !formData.floor) {
            setErrorMessage('All fields are required');
            return;
        }

        try {
            if (showAddModal) {
                // Add new room via API
                const newRoom = {
                    roomNumber: formData.roomNumber,
                    roomType: formData.roomType,
                    capacity: parseInt(formData.capacity),
                    price: parseInt(formData.price),
                    status: 'Available',
                    floor: formData.floor
                };

                const response = await fetch(`${API_URL}/api/rooms/add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newRoom)
                });

                const data = await response.json();

                if (!data.success) {
                    setErrorMessage(data.message || 'Failed to add room');
                    return;
                }

                await fetchRoomsFromAPI();
                setShowAddModal(false);
            } else if (showEditModal) {
                // Edit existing room via API
                const updatedRoom = {
                    roomNumber: formData.roomNumber,
                    roomType: formData.roomType,
                    capacity: parseInt(formData.capacity),
                    price: parseInt(formData.price),
                    floor: formData.floor
                };

                const response = await fetch(`${API_URL}/api/rooms/update/${currentRoom._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedRoom)
                });

                const data = await response.json();

                if (!data.success) {
                    setErrorMessage(data.message || 'Failed to update room');
                    return;
                }

                await fetchRoomsFromAPI();
                setShowEditModal(false);
            }

            // Clear form data and draft only after successful submission
            const emptyForm = { roomNumber: '', roomType: '', price: '', capacity: '', floor: '' };
            setFormData(emptyForm);
            localStorage.setItem('roomFormDraft', JSON.stringify(emptyForm));
            setCurrentRoom(null);
            setIsAddingRoomType(false);
            setNewRoomType('');
        } catch (error) {
            console.error('Error submitting room:', error);
            setErrorMessage('Failed to save room. Please try again.');
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Available':
                return 'status-available';
            case 'Booked':
                return 'status-booked';
            case 'Occupied':
                return 'status-occupied';
            case 'Under Maintenance':
                return 'status-maintenance';
            default:
                return '';
        }
    };

    const getRoomTypeShort = (roomType) => {
        return roomType.replace('Room', '').trim();
    };

    return (
        <div className="rooms-page">
            {/* Header */}
            <div className="rooms-header">
                <div className="header-left">
                    <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>
                        ←
                    </button>
                    <h1>🛏️ Rooms</h1>
                </div>
                <button className="add-room-btn" onClick={handleAddRoom}>
                    + Add Room
                </button>
            </div>

            {/* Search and Filters */}
            <div className="rooms-controls">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search room..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="filters-row" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <select className="filter-select" value={filters.floor} onChange={(e) => setFilters({ ...filters, floor: e.target.value })}>
                        <option value="All">Floor: All</option>
                        {floors.map(floor => (
                            <option key={floor._id} value={floor.name}>{floor.name}</option>
                        ))}
                    </select>

                    <select className="filter-select" value={filters.roomType} onChange={(e) => setFilters({ ...filters, roomType: e.target.value })}>
                        <option value="All">Room Type: All</option>
                        {roomTypes.map(type => (
                            <option key={type._id} value={type.name}>{type.name}</option>
                        ))}
                    </select>

                    <select className="filter-select" value={filters.bedType} onChange={(e) => setFilters({ ...filters, bedType: e.target.value })}>
                        <option value="All">Bed Type: All</option>
                        {bedTypes.map(type => (
                            <option key={type._id} value={type.name}>{type.name}</option>
                        ))}
                    </select>



                    <select className="filter-select" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                        <option value="All">Status: All</option>
                        <option value="Available">Available</option>
                        <option value="Booked">Booked</option>
                        <option value="Occupied">Occupied</option>
                        <option value="Under Maintenance">Maintenance</option>
                    </select>
                </div>
            </div>

            {/* Rooms Grid */}
            <div className="rooms-grid">
                <AnimatePresence>
                    {filteredRooms.map((room) => (
                        <motion.div
                            key={room.id}
                            className={`room-card ${getStatusClass(room.status)}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="room-card-header">
                                <h3>Room {room.roomNumber}</h3>
                            </div>
                            <div className="room-card-body">
                                <p className="room-type">{getRoomTypeShort(room.roomType)}</p>
                                <p className="room-capacity">Capacity: {room.capacity} persons</p>
                                <p className="room-price">₹{room.price}/night</p>
                            </div>
                            <div className="room-card-footer">
                                <span className={`room-status ${getStatusClass(room.status)}`}>
                                    {room.status}
                                </span>
                                {room.status === 'Available' && (
                                    <button className="edit-btn" onClick={() => handleEditRoom(room)}>
                                        ✏️ Edit
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredRooms.length === 0 && (
                <div className="no-rooms">
                    <p>No rooms found</p>
                </div>
            )}

            {/* Add Room Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <motion.div
                        className="modal-content room-modal"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="modal-header">
                            <h2>Add New Room</h2>
                            <button className="modal-close" onClick={() => setShowAddModal(false)}>
                                ✕
                            </button>
                        </div>

                        {errorMessage && (
                            <div className="error-alert">
                                ⚠️ {errorMessage}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>ROOM NUMBER *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., 101, 102"
                                    value={formData.roomNumber}
                                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>FLOOR *</label>
                                <select
                                    className="form-input"
                                    value={formData.floor || ''}
                                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                                >
                                    <option value="">-- Select Floor --</option>
                                    {floors.map(floor => (
                                        <option key={floor._id} value={floor.name}>{floor.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>ROOM TYPE *</label>
                                {!isAddingRoomType ? (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <select
                                            className="form-input"
                                            value={formData.roomType}
                                            onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                                            style={{ flex: 1 }}
                                        >
                                            <option value="">-- Select Room Type --</option>
                                            {Object.entries(roomTypeCategories).map(([category, types]) => (
                                                <optgroup key={category} label={category}>
                                                    {types.map(type => (
                                                        <option key={type} value={type}>{type}</option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                            {customRoomTypes.length > 0 && (
                                                <optgroup label="Custom Types">
                                                    {customRoomTypes.map(type => (
                                                        <option key={type} value={type}>{type}</option>
                                                    ))}
                                                </optgroup>
                                            )}
                                        </select>
                                        <button
                                            type="button"
                                            className="add-room-btn"
                                            onClick={() => setIsAddingRoomType(true)}
                                            style={{ width: '42px', padding: '0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            +
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Enter new room type..."
                                            value={newRoomType}
                                            onChange={(e) => setNewRoomType(e.target.value)}
                                            autoFocus
                                            style={{ flex: 1 }}
                                        />
                                        <button
                                            type="button"
                                            className="btn-submit"
                                            onClick={handleAddRoomType}
                                            style={{ width: '42px', padding: '0' }}
                                        >
                                            ✓
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-cancel"
                                            onClick={() => { setIsAddingRoomType(false); setNewRoomType(''); }}
                                            style={{ width: '42px', padding: '0' }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>PRICE PER NIGHT (₹) *</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="0"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>ROOM CAPACITY *</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="1"
                                    value={formData.capacity}
                                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-submit">
                                    Add Room
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Edit Room Modal */}
            {showEditModal && (
                <div className="modal-overlay">
                    <motion.div
                        className="modal-content room-modal"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="modal-header">
                            <h2>Edit Room</h2>
                            <button className="modal-close" onClick={() => setShowEditModal(false)}>
                                ✕
                            </button>
                        </div>

                        {errorMessage && (
                            <div className="error-alert">
                                ⚠️ {errorMessage}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>ROOM NUMBER *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., 101, 102"
                                    value={formData.roomNumber}
                                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>FLOOR *</label>
                                <select
                                    className="form-input"
                                    value={formData.floor || ''}
                                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                                >
                                    <option value="">-- Select Floor --</option>
                                    {floors.map(floor => (
                                        <option key={floor._id} value={floor.name}>{floor.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>ROOM TYPE *</label>
                                {!isAddingRoomType ? (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <select
                                            className="form-input"
                                            value={formData.roomType}
                                            onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                                            style={{ flex: 1 }}
                                        >
                                            <option value="">-- Select Room Type --</option>
                                            {Object.entries(roomTypeCategories).map(([category, types]) => (
                                                <optgroup key={category} label={category}>
                                                    {types.map(type => (
                                                        <option key={type} value={type}>{type}</option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                            {customRoomTypes.length > 0 && (
                                                <optgroup label="Custom Types">
                                                    {customRoomTypes.map(type => (
                                                        <option key={type} value={type}>{type}</option>
                                                    ))}
                                                </optgroup>
                                            )}
                                        </select>
                                        <button
                                            type="button"
                                            className="add-room-btn"
                                            onClick={() => setIsAddingRoomType(true)}
                                            style={{ width: '42px', padding: '0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            +
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Enter new room type..."
                                            value={newRoomType}
                                            onChange={(e) => setNewRoomType(e.target.value)}
                                            autoFocus
                                            style={{ flex: 1 }}
                                        />
                                        <button
                                            type="button"
                                            className="btn-submit"
                                            onClick={handleAddRoomType}
                                            style={{ width: '42px', padding: '0' }}
                                        >
                                            ✓
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-cancel"
                                            onClick={() => { setIsAddingRoomType(false); setNewRoomType(''); }}
                                            style={{ width: '42px', padding: '0' }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>PRICE PER NIGHT (₹) *</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="0"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>ROOM CAPACITY *</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="1"
                                    value={formData.capacity}
                                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-submit">
                                    Update Room
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Rooms;
