import { useState } from 'react';

const RoomRow = ({ room, index, roomCategories, onUpdate, onRemove }) => {
    const handleChange = (field, value) => {
        onUpdate(index, { ...room, [field]: value });
    };

    const category = roomCategories[room.categoryId];
    const baseRate = category?.baseRate || 0;

    return (
        <div className="room-row">
            <div className="room-header">
                {/* <h4>Room {index + 1}</h4> */}
            </div>

            <div className="room-fields">
                <div className="form-row">
                    <label>Room No</label>
                    <input
                        type="text"
                        placeholder="Room #"
                        value={room.roomNumber || ''}
                        onChange={(e) => handleChange('roomNumber', e.target.value)}
                    />
                </div>

                <div className="form-row">
                    <label>Room Category</label>
                    <select
                        value={room.categoryId}
                        onChange={(e) => handleChange('categoryId', e.target.value)}
                    >
                        {Object.entries(roomCategories).map(([id, cat]) => (
                            <option key={id} value={id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <div className="form-row">
                    <label>Meal Type</label>
                    <select
                        value={room.mealPlan}
                        onChange={(e) => handleChange('mealPlan', e.target.value)}
                    >
                        <option value="Veg">Veg</option>
                        <option value="NonVeg">Non Veg</option>
                    </select>
                </div>

                <div className="form-row">
                    <label>Adults</label>
                    <input
                        type="number"
                        min="1"
                        value={room.adultsCount}
                        onChange={(e) => handleChange('adultsCount', parseInt(e.target.value) || 0)}
                    />
                </div>

                <div className="form-row">
                    <label>Children</label>
                    <input
                        type="number"
                        min="0"
                        value={room.childrenCount}
                        onChange={(e) => handleChange('childrenCount', parseInt(e.target.value) || 0)}
                    />
                </div>

                <div className="form-row">
                    <label>Rate/Night</label>
                    <input
                        type="number"
                        min="0"
                        value={room.ratePerNight}
                        onChange={(e) => handleChange('ratePerNight', parseFloat(e.target.value) || 0)}
                    />
                </div>

                <div className="form-row">
                    <label>Discount</label>
                    <input
                        type="number"
                        min="0"
                        value={room.discount}
                        onChange={(e) => handleChange('discount', parseFloat(e.target.value) || 0)}
                    />
                </div>

                <div className="form-row">
                    <label>Total</label>
                    <input
                        type="text"
                        disabled
                        value={`₹${((room.ratePerNight - room.discount) * 1).toFixed(2)}`}
                        className="total-field"
                    />
                </div>

                <div className="form-row">
                    <label>Notes</label>
                    <input
                        type="text"
                        placeholder="Special requests..."
                        value={room.notes || ''}
                        onChange={(e) => handleChange('notes', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};

export default RoomRow;
