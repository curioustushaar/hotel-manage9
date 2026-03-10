import React, { useState, useEffect } from 'react';
import './MealType.css';
import API_URL from '../../config/api';
import { useSettings } from '../../context/SettingsContext';

const MealType = () => {
    const { getCurrencySymbol } = useSettings();
    const cs = getCurrencySymbol();
    const [mealTypes, setMealTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentMealType, setCurrentMealType] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        shortCode: '',
        includedMeals: [],
        chargeableMeals: [],
        price: ''
    });

    const standardMeals = ['Breakfast', 'Lunch', 'Dinner'];

    useEffect(() => {
        fetchMealTypes();
    }, []);

    const fetchMealTypes = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/meal-types/list`);
            const data = await response.json();
            if (data.success) {
                setMealTypes(data.data);
            } else {
                setError('Failed to fetch meal types');
            }
        } catch (err) {
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (mode, mealType = null) => {
        setModalMode(mode);
        if (mode === 'edit' && mealType) {
            setCurrentMealType(mealType);
            setFormData({
                name: mealType.name,
                shortCode: mealType.shortCode,
                includedMeals: mealType.includedMeals || [],
                chargeableMeals: mealType.chargeableMeals || [],
                price: mealType.price || ''
            });
        } else {
            setCurrentMealType(null);
            setFormData({
                name: '',
                shortCode: '',
                includedMeals: [],
                chargeableMeals: [],
                price: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCheckboxChange = (type, meal) => {
        setFormData(prev => {
            const list = prev[type];
            if (list.includes(meal)) {
                return { ...prev, [type]: list.filter(item => item !== meal) };
            } else {
                return { ...prev, [type]: [...list, meal] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...formData,
            price: Number(formData.price) || 0
        };

        try {
            let response;
            if (modalMode === 'add') {
                response = await fetch(`${API_URL}/api/meal-types/add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                response = await fetch(`${API_URL}/api/meal-types/update/${currentMealType._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            const data = await response.json();
            if (data.success) {
                setIsModalOpen(false);
                fetchMealTypes();
            } else {
                alert(data.message || 'Operation failed');
            }
        } catch (error) {
            alert('Error submitting form');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this meal type?')) {
            try {
                const response = await fetch(`${API_URL}/api/meal-types/delete/${id}`, {
                    method: 'DELETE'
                });
                const data = await response.json();
                if (data.success) {
                    fetchMealTypes();
                } else {
                    alert('Failed to delete');
                }
            } catch (error) {
                alert('Error deleting');
            }
        }
    };

    return (
        <div className="meal-type-container">
            <header className="meal-type-header">
                <h2>Meal Type</h2>
                <button className="add-meal-btn" onClick={() => handleOpenModal('add')}>+ Add Meal Type</button>
            </header>

            <div className="meal-type-table-container">
                {loading ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
                ) : (
                    <table className="meal-type-table">
                        <thead>
                            <tr>
                                <th style={{ width: '60px' }}>ID</th>
                                <th>Meal Type</th>
                                <th>Short Code</th>
                                <th>Price</th>
                                <th>Included Meals</th>
                                <th>Chargeable</th>
                                <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mealTypes.map((meal, index) => (
                                <tr key={meal._id}>
                                    <td>{index + 1}</td>
                                    <td>{meal.name}</td>
                                    <td>{meal.shortCode}</td>
                                    <td>{cs} {meal.price || 0}</td>
                                    <td>
                                        {meal.includedMeals.length > 0 ? meal.includedMeals.map(m => (
                                            <div key={m} className="meal-tag">✓ {m}</div>
                                        )) : <span style={{ color: '#9ca3af' }}>No Meal</span>}
                                    </td>
                                    <td>
                                        {meal.chargeableMeals.length > 0 ? meal.chargeableMeals.map(m => (
                                            <div key={m} className="meal-tag">✓ {m}</div>
                                        )) : <span style={{ color: '#9ca3af' }}>No</span>}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                                            <button className="icon-button" onClick={() => handleOpenModal('edit', meal)}>✏️</button>
                                            <button className="icon-button" onClick={() => handleDelete(meal._id)}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                <div className="table-footer">
                    <span>Showing {mealTypes.length} Meal Types</span>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{modalMode === 'add' ? 'Add Meal Type' : 'Edit Meal Type'}</h3>
                            <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Meal Type Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="e.g. Continental Plan"
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Short Code</label>
                                    <input
                                        type="text"
                                        value={formData.shortCode}
                                        onChange={(e) => setFormData({ ...formData, shortCode: e.target.value })}
                                        required
                                        placeholder="e.g. CP"
                                        className="form-input"
                                        style={{ textTransform: 'uppercase' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Price</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="Enter Price"
                                        className="form-input"
                                        min="0"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Included Meals</label>
                                    <div className="checkbox-group">
                                        {standardMeals.map(meal => (
                                            <label
                                                key={meal}
                                                className={`checkbox-card ${formData.includedMeals.includes(meal) ? 'selected' : ''}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.includedMeals.includes(meal)}
                                                    onChange={() => handleCheckboxChange('includedMeals', meal)}
                                                    style={{ display: 'none' }}
                                                />
                                                <span className="checkbox-icon">{formData.includedMeals.includes(meal) ? '✓' : ''}</span>
                                                {meal}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Chargeable Meals</label>
                                    <div className="checkbox-group">
                                        {standardMeals.map(meal => (
                                            <label
                                                key={meal}
                                                className={`checkbox-card ${formData.chargeableMeals.includes(meal) ? 'selected' : ''}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.chargeableMeals.includes(meal)}
                                                    onChange={() => handleCheckboxChange('chargeableMeals', meal)}
                                                    style={{ display: 'none' }}
                                                />
                                                <span className="checkbox-icon">{formData.chargeableMeals.includes(meal) ? '✓' : ''}</span>
                                                {meal}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{modalMode === 'add' ? 'Add' : 'Update'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MealType;
