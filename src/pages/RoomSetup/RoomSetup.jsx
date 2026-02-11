import React, { useState, useEffect } from 'react';
import './RoomSetup.css';
import API_URL from '../../config/api';

const RoomSetup = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [currentRoom, setCurrentRoom] = useState(null);
    const [formData, setFormData] = useState({
        roomNumber: '',
        floor: 'Ground Floor',
        roomType: 'Deluxe',
        bedType: 'Double',
        capacity: 2,
        basePrice: '',
        status: 'Available'
    });

    // Filters State
    const [filters, setFilters] = useState({
        floor: 'All',
        roomType: 'All',
        bedType: 'All',
        taxMapping: 'All',
        status: 'All'
    });

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
                status: room.status
            });
        } else {
            setFormData({
                roomNumber: '',
                floor: 'Ground Floor',
                roomType: 'Deluxe',
                bedType: 'Double',
                capacity: 2,
                basePrice: '',
                status: 'Available'
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
            status: formData.status
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
                        <option value="Ground">Ground Floor</option>
                        <option value="First">First Floor</option>
                        <option value="Second">Second Floor</option>
                    </select>

                    <select className="filter-select" value={filters.roomType} onChange={(e) => setFilters({ ...filters, roomType: e.target.value })}>
                        <option value="All">Room Type: All</option>
                        <option value="Deluxe">Deluxe</option>
                        <option value="Suite">Suite</option>
                        <option value="Standard">Standard</option>
                    </select>

                    <select className="filter-select" value={filters.bedType} onChange={(e) => setFilters({ ...filters, bedType: e.target.value })}>
                        <option value="All">Bed Type: All</option>
                        <option value="Single">Single</option>
                        <option value="Double">Double</option>
                        <option value="King">King</option>
                    </select>

                    <select className="filter-select" value={filters.taxMapping} onChange={(e) => setFilters({ ...filters, taxMapping: e.target.value })}>
                        <option value="All">Tax Mapping: All</option>
                        <option value="standard">Standard Tax</option>
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
                                        <option value="Ground Floor">Ground Floor</option>
                                        <option value="First Floor">First Floor</option>
                                        <option value="Second Floor">Second Floor</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Room Type</label>
                                    <select name="roomType" value={formData.roomType} onChange={handleInputChange} className="form-input">
                                        <option value="Deluxe">Deluxe</option>
                                        <option value="Suite">Suite</option>
                                        <option value="Standard">Standard</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Bed Type</label>
                                    <select name="bedType" value={formData.bedType} onChange={handleInputChange} className="form-input">
                                        <option value="Single">Single</option>
                                        <option value="Double">Double</option>
                                        <option value="King">King</option>
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
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomSetup;
