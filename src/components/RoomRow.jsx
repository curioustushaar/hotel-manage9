import { useState, useEffect, useRef } from 'react';
import API_URL from '../config/api';

const RoomRow = ({ room, index, roomCategories, onUpdate, onRemove, mealTypes = [], readOnly = false, checkInDate = new Date().toISOString().split('T')[0] }) => {
    const prevCategoryId = useRef(room.categoryId);

    const handleChange = (field, value) => {
        onUpdate(index, { ...room, [field]: value });
    };

    // Auto-fetch dynamic price when category changes
    useEffect(() => {
        const fetchPrice = async () => {
            const categoryChanged = room.categoryId !== prevCategoryId.current;

            // Only fetch if category changed to prevent overwriting existing prices on load
            if (room.categoryId && categoryChanged) {
                try {
                    const res = await fetch(`${API_URL}/api/pricing/calculate/${room.categoryId}?date=${checkInDate}`);
                    const data = await res.json();
                    if (data.success && data.price) {
                        const basePrice = data.price;
                        // Calculate total with current meal plan
                        const currentMeal = mealTypes.find(m => m.shortCode === room.mealPlan);
                        const mealPrice = currentMeal ? (currentMeal.price || 0) : 0;

                        onUpdate(index, {
                            ...room,
                            baseRate: basePrice,
                            ratePerNight: basePrice + mealPrice
                        });
                    }
                } catch (err) {
                    console.error('Dynamic pricing fetch error:', err);
                }
            }
            prevCategoryId.current = room.categoryId;
        };
        fetchPrice();
    }, [room.categoryId, checkInDate, mealTypes]);

    const category = roomCategories[room.categoryId];
    const baseRate = category?.baseRate || 0;

    return (
        <div className="room-row">
            <div className="room-header">
                <h4>Room {index + 1}</h4>
                {index > 0 && (
                    <button
                        className="btn btn-sm btn-danger"
                        onClick={() => onRemove(index)}
                    >
                        ✕ Remove
                    </button>
                )}
            </div>

            <div className="room-fields">
                <div className="form-row">
                    <label>Room Category</label>
                    <select
                        value={room.categoryId}
                        onChange={(e) => handleChange('categoryId', e.target.value)}
                        disabled={readOnly}
                    >
                        <option value="">Select Room Category</option>
                        {Object.entries(roomCategories).map(([id, cat]) => (
                            <option key={id} value={id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <div className="form-row">
                    <label>Room Number</label>
                    <input
                        type="text"
                        placeholder="e.g., 101, A1"
                        value={room.roomNumber || ''}
                        onChange={(e) => handleChange('roomNumber', e.target.value)}
                        readOnly={readOnly}
                    />
                </div>

                <div className="form-row">
                    <label>Meal Plan</label>
                    <select
                        value={room.mealPlan}
                        onChange={(e) => {
                            const newPlan = e.target.value;

                            // Find prices
                            const oldMeal = mealTypes.find(m => m.shortCode === room.mealPlan);
                            const newMeal = mealTypes.find(m => m.shortCode === newPlan);

                            const oldMealPrice = oldMeal ? (oldMeal.price || 0) : 0;
                            const newMealPrice = newMeal ? (newMeal.price || 0) : 0;

                            // Calculate Base Rate (use stored or derive)
                            let currentBase = room.baseRate;
                            if (currentBase === undefined) {
                                currentBase = (room.ratePerNight || 0) - oldMealPrice;
                                if (currentBase < 0) currentBase = 0;
                            }

                            onUpdate(index, {
                                ...room,
                                mealPlan: newPlan,
                                baseRate: currentBase,
                                ratePerNight: currentBase + newMealPrice
                            });
                        }}
                    >
                        <option value="">Select Plan</option>
                        {mealTypes && mealTypes.length > 0 ? (
                            mealTypes.map(mt => (
                                <option key={mt._id} value={mt.shortCode}>
                                    {mt.shortCode} ({mt.name}) - ₹{mt.price}
                                </option>
                            ))
                        ) : (
                            // Fallback
                            <>
                                <option value="CP">CP (Room Only)</option>
                                <option value="MAP">MAP (B + D)</option>
                                <option value="AP">AP (All Meals)</option>
                            </>
                        )}
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
                        onChange={(e) => {
                            const newRate = parseFloat(e.target.value) || 0;
                            // Update baseRate based on current meal plan
                            const currentMeal = mealTypes.find(m => m.shortCode === room.mealPlan);
                            const mealPrice = currentMeal ? (currentMeal.price || 0) : 0;

                            onUpdate(index, {
                                ...room,
                                ratePerNight: newRate,
                                baseRate: newRate - mealPrice
                            });
                        }}
                        readOnly={readOnly}
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
