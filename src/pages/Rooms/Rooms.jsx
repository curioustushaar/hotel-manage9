import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Rooms.css';

const Rooms = () => {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [filteredRooms, setFilteredRooms] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('All Types');
    const [selectedStatus, setSelectedStatus] = useState('All Status');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [formData, setFormData] = useState({
        roomNumber: '',
        roomType: '',
        price: '',
        capacity: ''
    });
    const [errorMessage, setErrorMessage] = useState('');

    // Room type categories
    const roomTypeCategories = {
        'Club Rooms': [
            'Club AC Single Room',
            'Club AC Double Room',
            'Club Non-AC Single Room',
            'Club Non-AC Double Room'
        ],
        'Deluxe Rooms': [
            'Deluxe AC Single Room',
            'Deluxe AC Double Room',
            'Deluxe Non-AC Single Room',
            'Deluxe Non-AC Double Room'
        ],
        'Suite Rooms': [
            'Suite Single Room',
            'Suite Double Room',
            'Family Suite'
        ]
    };

    const statusOptions = ['All Status', 'Available', 'Booked', 'Occupied', 'Under Maintenance'];

    // Load rooms from localStorage
    useEffect(() => {
        const storedRooms = localStorage.getItem('hotelRooms');
        if (storedRooms) {
            setRooms(JSON.parse(storedRooms));
        } else {
            // Initialize with sample data
            const sampleRooms = [
                { id: 1, roomNumber: '01', roomType: 'Club AC Single Room', capacity: 1, price: 1500, status: 'Booked' },
                { id: 2, roomNumber: '02', roomType: 'Club AC Double Room', capacity: 2, price: 2500, status: 'Occupied' },
                { id: 3, roomNumber: '1011', roomType: 'Family Suite', capacity: 4, price: 5000, status: 'Available' },
                { id: 4, roomNumber: '1002', roomType: 'Family Suite', capacity: 4, price: 5000, status: 'Occupied' }
            ];
            setRooms(sampleRooms);
            localStorage.setItem('hotelRooms', JSON.stringify(sampleRooms));
        }
    }, []);

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

        // Type filter
        if (selectedType !== 'All Types') {
            filtered = filtered.filter(room => room.roomType === selectedType);
        }

        // Status filter
        if (selectedStatus !== 'All Status') {
            filtered = filtered.filter(room => room.status === selectedStatus);
        }

        setFilteredRooms(filtered);
    }, [rooms, searchQuery, selectedType, selectedStatus]);

    // Get all room types for filter dropdown
    const getAllRoomTypes = () => {
        const types = ['All Types'];
        Object.values(roomTypeCategories).forEach(category => {
            types.push(...category);
        });
        return types;
    };

    const handleAddRoom = () => {
        setFormData({ roomNumber: '', roomType: '', price: '', capacity: '' });
        setErrorMessage('');
        setShowAddModal(true);
    };

    const handleEditRoom = (room) => {
        setCurrentRoom(room);
        setFormData({
            roomNumber: room.roomNumber,
            roomType: room.roomType,
            price: room.price.toString(),
            capacity: room.capacity.toString()
        });
        setErrorMessage('');
        setShowEditModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMessage('');

        // Validate
        if (!formData.roomNumber || !formData.roomType || !formData.price || !formData.capacity) {
            setErrorMessage('All fields are required');
            return;
        }

        // Check if room number already exists (for add or edit)
        const existingRoom = rooms.find(r =>
            r.roomNumber === formData.roomNumber &&
            (!currentRoom || r.id !== currentRoom.id)
        );

        if (existingRoom) {
            setErrorMessage('Room number already exists');
            return;
        }

        if (showAddModal) {
            // Add new room
            const newRoom = {
                id: Date.now(),
                roomNumber: formData.roomNumber,
                roomType: formData.roomType,
                capacity: parseInt(formData.capacity),
                price: parseInt(formData.price),
                status: 'Available'
            };
            const updatedRooms = [...rooms, newRoom];
            setRooms(updatedRooms);
            localStorage.setItem('hotelRooms', JSON.stringify(updatedRooms));
            setShowAddModal(false);
        } else if (showEditModal) {
            // Edit existing room
            const updatedRooms = rooms.map(room =>
                room.id === currentRoom.id
                    ? {
                        ...room,
                        roomNumber: formData.roomNumber,
                        roomType: formData.roomType,
                        capacity: parseInt(formData.capacity),
                        price: parseInt(formData.price)
                    }
                    : room
            );
            setRooms(updatedRooms);
            localStorage.setItem('hotelRooms', JSON.stringify(updatedRooms));
            setShowEditModal(false);
        }

        setFormData({ roomNumber: '', roomType: '', price: '', capacity: '' });
        setCurrentRoom(null);
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
                <select
                    className="filter-select"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                >
                    {getAllRoomTypes().map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
                <select
                    className="filter-select"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                >
                    {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
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
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <motion.div
                        className="modal-content room-modal"
                        onClick={(e) => e.stopPropagation()}
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
                                <label>ROOM TYPE *</label>
                                <select
                                    className="form-input"
                                    value={formData.roomType}
                                    onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                                >
                                    <option value="">-- Select Room Type --</option>
                                    {Object.entries(roomTypeCategories).map(([category, types]) => (
                                        <optgroup key={category} label={category}>
                                            {types.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
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
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <motion.div
                        className="modal-content room-modal"
                        onClick={(e) => e.stopPropagation()}
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
                                <label>ROOM TYPE *</label>
                                <select
                                    className="form-input"
                                    value={formData.roomType}
                                    onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                                >
                                    <option value="">-- Select Room Type --</option>
                                    {Object.entries(roomTypeCategories).map(([category, types]) => (
                                        <optgroup key={category} label={category}>
                                            {types.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
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
