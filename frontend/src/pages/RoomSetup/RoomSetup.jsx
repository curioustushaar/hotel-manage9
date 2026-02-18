import React, { useState, useEffect } from 'react';
import './RoomSetup.css';
import API_URL from '../../config/api';

const RoomSetup = () => {
    const [rooms, setRooms] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]); // State for dynamic room types
    const [bedTypes, setBedTypes] = useState([]); // State for dynamic bed types
    const [floors, setFloors] = useState([]); // State for dynamic floors
    const [taxOptions, setTaxOptions] = useState([]); // State for dynamic tax options
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [currentRoom, setCurrentRoom] = useState(null);
    const [formData, setFormData] = useState({
        roomNumber: '',
        floor: '',
        roomType: '',
        bedType: '',
        capacity: 2,
        basePrice: '',
        status: 'Available',
        // PHASE 2 UPGRADE: Enterprise-level fields
        roomViewType: 'City View',
        smokingPolicy: 'Non-Smoking',
        roomSize: 0,
        isSmartRoom: false,
        dynamicRateEnabled: false
    });

    // Filters State
    const [filters, setFilters] = useState({
        floor: 'All',
        roomType: 'All',
        bedType: 'All',
        taxMapping: 'All',
        status: 'All'
    });

    // Fetch Room Types (Facility Types)
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

    // Fetch Tax Options from LocalStorage
    const fetchTaxOptions = () => {
        try {
            const storedMappings = localStorage.getItem('taxMappings');
            const storedTaxes = localStorage.getItem('taxes');

            if (storedMappings && storedTaxes) {
                const mappings = JSON.parse(storedMappings);
                const taxes = JSON.parse(storedTaxes);

                // Filter for 'Room Charges' (usually ROOM service type) and ACTIVE status
                const activeRoomMappings = mappings.filter(m =>
                    (m.serviceType === 'ROOM' || m.serviceType === 'Room Charges') &&
                    m.status === 'ACTIVE'
                );

                const options = activeRoomMappings.map(mapping => {
                    const taxNames = mapping.taxIds.map(id => {
                        const tax = taxes.find(t => t.id === id);
                        return tax ? tax.name : '';
                    }).filter(name => name !== '').join(', ');

                    return {
                        id: mapping.id,
                        label: taxNames || 'No Taxes'
                    };
                });

                setTaxOptions(options);
            }
        } catch (error) {
            console.error('Error fetching tax options:', error);
        }
    };

    // Fetch Rooms
    const fetchRooms = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/rooms/list`);
            const data = await response.json();
            if (data.success) {
                // Transform data if necessary to match UI structure
                const transformedRooms = data.data.map(room => ({
                    ...room,
                    id: room._id,
                    floor: room.floor || 'Ground Floor',
                    bedType: room.bedType || 'Double',
                    basePrice: `₹ ${room.price}`,
                    capacity: { adults: room.capacity, children: 0 }
                }));
                setRooms(transformedRooms);
            } else {
                setError('Failed to fetch rooms');
            }
        } catch (err) {
            setError('Error connecting to server');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
        fetchRoomTypes();
        fetchBedTypes();
        fetchFloors();
        fetchTaxOptions();
    }, []);

    // Filter Logic
    const filteredRooms = rooms.filter(room => {
        return (
            (filters.floor === 'All' || room.floor === filters.floor) &&
            (filters.roomType === 'All' || room.roomType === filters.roomType) &&
            (filters.bedType === 'All' || room.bedType === filters.bedType) &&
            (filters.status === 'All' || room.status === filters.status)
        );
    });

    // Handle Form Input Change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Open Modal
    const openModal = (mode, room = null) => {
        setModalMode(mode);
        if (mode === 'edit' && room) {
            setCurrentRoom(room);
            setFormData({
                roomNumber: room.roomNumber,
                floor: room.floor,
                roomType: room.roomType,
                bedType: room.bedType,
                capacity: room.capacity.adults, // extract number
                basePrice: room.price || room.basePrice.replace('₹ ', '').replace(',', ''),
                status: room.status,
                // PHASE 2 UPGRADE: Populate enterprise fields (with fallback for backward compatibility)
                roomViewType: room.roomViewType || 'City View',
                smokingPolicy: room.smokingPolicy || 'Non-Smoking',
                roomSize: room.roomSize || 0,
                isSmartRoom: room.isSmartRoom || false,
                dynamicRateEnabled: room.dynamicRateEnabled || false
            });
        } else {
            // Find first available floor
            let defaultFloor = '';
            if (floors.length > 0) {
                const availableFloor = floors.find(floor => {
                    const currentCount = rooms.filter(r => r.floor === floor.name).length;
                    return currentCount < floor.roomCount;
                });
                defaultFloor = availableFloor ? availableFloor.name : '';
            }

            setFormData({
                roomNumber: '',
                floor: defaultFloor,
                roomType: roomTypes.length > 0 ? roomTypes[0].name : '',
                bedType: bedTypes.length > 0 ? bedTypes[0].name : '',
                capacity: 2,
                basePrice: '',
                status: 'Available',
                // PHASE 2 UPGRADE: Default values for enterprise fields
                roomViewType: 'City View',
                smokingPolicy: 'Non-Smoking',
                roomSize: 0,
                isSmartRoom: false,
                dynamicRateEnabled: false
            });
        }
        setIsModalOpen(true);
    };

    // Handle Submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            roomNumber: formData.roomNumber,
            roomType: formData.roomType,
            price: Number(formData.basePrice),
            capacity: Number(formData.capacity),
            status: formData.status,
            // PHASE 2 UPGRADE: Include enterprise fields in payload
            roomViewType: formData.roomViewType,
            smokingPolicy: formData.smokingPolicy,
            roomSize: Number(formData.roomSize),
            isSmartRoom: formData.isSmartRoom,
            dynamicRateEnabled: formData.dynamicRateEnabled
        };

        try {
            let response;
            if (modalMode === 'add') {
                response = await fetch(`${API_URL}/api/rooms/add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                response = await fetch(`${API_URL}/api/rooms/update/${currentRoom.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            const data = await response.json();
            if (data.success) {
                setIsModalOpen(false);
                fetchRooms(); // Refresh list
            } else {
                alert(data.message || 'Operation failed');
            }
        } catch (error) {
            alert('Error submitting form');
            console.error(error);
        }
    };

    // Handle Delete
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this room?')) {
            try {
                const response = await fetch(`${API_URL}/api/rooms/delete/${id}`, {
                    method: 'DELETE'
                });
                const data = await response.json();
                if (data.success) {
                    fetchRooms();
                } else {
                    alert('Failed to delete room');
                }
            } catch (error) {
                alert('Error deleting room');
            }
        }
    };

    return (
        <div className="room-setup-container">
            {/* Header Section */}
            <header className="room-setup-header">
                <h2>Room Setup</h2>
                <button className="add-room-btn" onClick={() => openModal('add')}>Add New Room</button>
            </header>

            {/* Controls Section */}
            <div className="room-setup-controls">
                <div className="filter-row">
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

                    <select className="filter-select" value={filters.taxMapping} onChange={(e) => setFilters({ ...filters, taxMapping: e.target.value })}>
                        <option value="All">Tax Mapping: All</option>
                        {taxOptions.map(option => (
                            <option key={option.id} value={option.label}>{option.label}</option>
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

                <div className="filter-progress-row">
                    <span>Filter Progress</span>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${(filteredRooms.length / (rooms.length || 1)) * 100}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="room-setup-table-container">
                {loading ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>Loading rooms...</div>
                ) : error ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>{error}</div>
                ) : (
                    <table className="room-table">
                        <thead>
                            <tr>
                                <th>Room No</th>
                                <th>Floor</th>
                                <th>Room Type</th>
                                <th>Bed Type</th>
                                <th>Capacity</th>
                                <th>Base Price</th>
                                <th>Status</th>
                                <th>QR Code</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRooms.length > 0 ? (
                                filteredRooms.map((room) => (
                                    <tr key={room.id}>
                                        <td>{room.roomNumber}</td>
                                        <td>{room.floor}</td>
                                        <td>{room.roomType}</td>
                                        <td>{room.bedType}</td>
                                        <td>
                                            <div className="capacity-icons">
                                                <span className="capacity-item">
                                                    {room.capacity.adults} 👤
                                                </span>
                                                {/* Backend doesn't store children capacity yet, so just showing placeholders or implied data */}
                                            </div>
                                        </td>
                                        <td>{room.basePrice}</td>
                                        <td>
                                            <span className={`status-badge ${room.status?.toLowerCase().replace(' ', '-') || 'available'}`}>
                                                {room.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="qr-codes">
                                                <div className="qr-mini">QR</div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="edit-btn" onClick={() => openModal('edit', room)}>✏️</button>
                                                <button className="delete-btn" onClick={() => handleDelete(room.id)}>🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>No rooms found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}

                {/* Pagination - Placeholder for now */}
                <div className="table-pagination">
                    <span>Rows per page: </span>
                    <select className="rows-select">
                        <option>10</option>
                        <option>20</option>
                    </select>
                    <span>1-{filteredRooms.length} of {filteredRooms.length}</span>
                    <div className="pagination-controls">
                        <button className="page-btn">{'<'}</button>
                        <button className="page-btn active">1</button>
                        <button className="page-btn">{'>'}</button>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{modalMode === 'add' ? 'Add New Room' : 'Edit Room'}</h3>
                            <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Room Number</label>
                                    <input
                                        type="text"
                                        name="roomNumber"
                                        value={formData.roomNumber}
                                        onChange={handleInputChange}
                                        required
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Floor</label>
                                    <select name="floor" value={formData.floor} onChange={handleInputChange} className="form-input">
                                        <option value="">Select Floor</option>
                                        {floors.map(floor => {
                                            const currentCount = rooms.filter(r => r.floor === floor.name).length;
                                            const isFull = currentCount >= floor.roomCount;
                                            // Disable if full, UNLESS we are in edit mode and this is the room's current floor
                                            const isDisabled = isFull && !(modalMode === 'edit' && currentRoom?.floor === floor.name);

                                            return (
                                                <option key={floor._id} value={floor.name} disabled={isDisabled}>
                                                    {floor.name} {isDisabled ? '(Full)' : `(${currentCount}/${floor.roomCount})`}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Room Type</label>
                                    <select name="roomType" value={formData.roomType} onChange={handleInputChange} className="form-input">
                                        <option value="">Select Room Type</option>
                                        {roomTypes.map(type => (
                                            <option key={type._id} value={type.name}>{type.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Bed Type</label>
                                    <select name="bedType" value={formData.bedType} onChange={handleInputChange} className="form-input">
                                        <option value="">Select Bed Type</option>
                                        {bedTypes.map(type => (
                                            <option key={type._id} value={type.name}>{type.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Capacity</label>
                                    <input
                                        type="number"
                                        name="capacity"
                                        value={formData.capacity}
                                        onChange={handleInputChange}
                                        required
                                        min="1"
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Base Price</label>
                                    <input
                                        type="number"
                                        name="basePrice"
                                        value={formData.basePrice}
                                        onChange={handleInputChange}
                                        required
                                        className="form-input"
                                    />
                                </div>

                                {/* PHASE 2 UPGRADE: Enterprise-level fields */}
                                <div className="enterprise-fields-section">
                                    <div className="section-divider">
                                        <span className="section-title">Room Details</span>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Room View Type</label>
                                            <select
                                                name="roomViewType"
                                                value={formData.roomViewType}
                                                onChange={handleInputChange}
                                                className="form-input"
                                            >
                                                <option value="Sea View">Sea View</option>
                                                <option value="City View">City View</option>
                                                <option value="Garden View">Garden View</option>
                                                <option value="Pool View">Pool View</option>
                                                <option value="Mountain View">Mountain View</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Smoking Policy</label>
                                            <select
                                                name="smokingPolicy"
                                                value={formData.smokingPolicy}
                                                onChange={handleInputChange}
                                                className="form-input"
                                            >
                                                <option value="Non-Smoking">Non-Smoking</option>
                                                <option value="Smoking">Smoking</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Room Size</label>
                                            <div className="input-with-suffix">
                                                <input
                                                    type="number"
                                                    name="roomSize"
                                                    value={formData.roomSize}
                                                    onChange={handleInputChange}
                                                    min="0"
                                                    className="form-input"
                                                />
                                                <span className="input-suffix">sq ft</span>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Smart Features</label>
                                            <div className="toggle-row">
                                                <div className="toggle-item">
                                                    <label className="toggle-switch">
                                                        <input
                                                            type="checkbox"
                                                            name="isSmartRoom"
                                                            checked={formData.isSmartRoom}
                                                            onChange={(e) => setFormData({ ...formData, isSmartRoom: e.target.checked })}
                                                        />
                                                        <span className="toggle-slider"></span>
                                                    </label>
                                                    <span className="toggle-label">Smart Room</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Pricing Options</label>
                                            <div className="toggle-item">
                                                <label className="toggle-switch">
                                                    <input
                                                        type="checkbox"
                                                        name="dynamicRateEnabled"
                                                        checked={formData.dynamicRateEnabled}
                                                        onChange={(e) => setFormData({ ...formData, dynamicRateEnabled: e.target.checked })}
                                                    />
                                                    <span className="toggle-slider"></span>
                                                </label>
                                                <span className="toggle-label">Dynamic Rate Enabled</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>







                                <div className="form-group">
                                    <label>Status</label>
                                    <select name="status" value={formData.status} onChange={handleInputChange} className="form-input">
                                        <option value="Available">Available</option>
                                        <option value="Booked">Booked</option>
                                        <option value="Occupied">Occupied</option>
                                        <option value="Under Maintenance">Under Maintenance</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{modalMode === 'add' ? 'Add Room' : 'Update Room'}</button>
                            </div>
                        </form>
                    </div >
                </div >
            )}
        </div >
    );
};

export default RoomSetup;
