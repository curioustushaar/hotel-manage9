// Simplified Food Menu Component for Dashboard Integration
import React, { useState, useEffect } from 'react';
import API_URL from '../../config/api';

const FoodMenuDashboard = () => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All Categories');

    const categories = ['All Categories', 'Starters', 'Main Course', 'Breakfast', 'Rice', 'Desserts', 'Beverages', 'Chinese', 'Continental'];

    // Category icons mapping
    const categoryIcons = {
        'Starters': '🍴',
        'Main Course': '🍛',
        'Breakfast': '☕',
        'Rice': '🍚',
        'Desserts': '🍨',
        'Beverages': '🥤',
        'Chinese': '🥡',
        'Continental': '🍝'
    };

    const getCategoryWithIcon = (categoryName) => {
        const icon = categoryIcons[categoryName] || '';
        return icon ? `${icon} ${categoryName}` : categoryName;
    };

    // Fetch menu items
    useEffect(() => {
        fetchMenuItems();
    }, []);

    const fetchMenuItems = async () => {
        try {
            const response = await fetch(`${API_URL}/api/menu/list`);
            const data = await response.json();
            if (data.success) {
                setMenuItems(data.data);
            }
        } catch (error) {
            console.error('Error fetching menu items:', error);
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newItem = {
            itemName: formData.get('itemName'),
            category: formData.get('category'),
            price: parseFloat(formData.get('price')),
            description: formData.get('description') || '',
            status: 'Active'
        };

        try {
            const response = await fetch(`${API_URL}/api/menu/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem),
            });
            const data = await response.json();
            if (data.success) {
                setMenuItems([...menuItems, data.data]);
                setShowAddForm(false);
                e.target.reset();
            }
        } catch (error) {
            console.error('Error adding item:', error);
        }
    };

    const handleEditItem = (item) => {
        setEditingItem(item);
        setShowEditModal(true);
    };

    const handleUpdateItem = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const updatedItem = {
            itemName: formData.get('itemName'),
            category: formData.get('category'),
            price: parseFloat(formData.get('price')),
            description: formData.get('description') || ''
        };

        try {
            const response = await fetch(`${API_URL}/api/menu/update/${editingItem._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedItem),
            });
            const data = await response.json();
            if (data.success) {
                setMenuItems(menuItems.map(item =>
                    item._id === editingItem._id ? data.data : item
                ));
                setShowEditModal(false);
                setEditingItem(null);
            }
        } catch (error) {
            console.error('Error updating item:', error);
        }
    };

    const handleToggleStatus = async (item) => {
        const newStatus = item.status === 'Active' ? 'Inactive' : 'Active';
        try {
            const response = await fetch(`${API_URL}/api/menu/update/${item._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await response.json();
            if (data.success) {
                setMenuItems(menuItems.map(i =>
                    i._id === item._id ? { ...i, status: newStatus } : i
                ));
            }
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    const handleDeleteItem = async (id) => {
        try {
            const response = await fetch(`${API_URL}/api/menu/delete/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setMenuItems(menuItems.filter(item => item._id !== id));
            }
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All Categories' || item.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div style={{ padding: '5px 20px 20px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <h2 style={{ margin: 0 }}>🍽️ Food Menu Management</h2>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer'
                    }}
                >
                    {showAddForm ? 'Cancel' : '+ Add Item'}
                </button>
            </div>

            {showAddForm && (
                <form onSubmit={handleAddItem} style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Item Name *</label>
                            <input name="itemName" required style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px'
                            }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Category *</label>
                            <select name="category" required style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px'
                            }}>
                                <option value="">Select category</option>
                                {categories.filter(c => c !== 'All Categories').map(cat => (
                                    <option key={cat} value={cat}>{getCategoryWithIcon(cat)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Price (₹) *</label>
                            <input name="price" type="number" required style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px'
                            }} />
                        </div>
                    </div>
                    <div style={{ marginTop: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>Description</label>
                        <textarea name="description" rows="3" style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px'
                        }} />
                    </div>
                    <button type="submit" style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: '10px 24px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        marginTop: '15px'
                    }}>
                        Add Item
                    </button>
                </form>
            )}

            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <div style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    padding: '15px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ fontWeight: 600 }}>📋 ITEMS LIST</div>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: 'none'
                        }}
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat === 'All Categories' ? '🍽️ All Categories' : getCategoryWithIcon(cat)}</option>
                        ))}
                    </select>
                </div>

                <div style={{ padding: '20px' }}>
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            marginBottom: '15px'
                        }}
                    />

                    {filteredItems.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                            <p style={{ fontSize: '18px', marginBottom: '10px' }}>📋 No items found</p>
                            <p>Click "+ Add Item" to add your first menu item</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#fef2f2', textAlign: 'left' }}>
                                    <th style={{ padding: '12px' }}>#</th>
                                    <th style={{ padding: '12px' }}>Item Name</th>
                                    <th style={{ padding: '12px' }}>Category</th>
                                    <th style={{ padding: '12px' }}>Description</th>
                                    <th style={{ padding: '12px' }}>Price</th>
                                    <th style={{ padding: '12px' }}>Status</th>
                                    <th style={{ padding: '12px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map((item, index) => (
                                    <tr key={item._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '12px' }}>{index + 1}</td>
                                        <td style={{ padding: '12px' }}>{item.itemName}</td>
                                        <td style={{ padding: '12px' }}>{getCategoryWithIcon(item.category)}</td>
                                        <td style={{ padding: '12px' }}>{item.description || '---'}</td>
                                        <td style={{ padding: '12px' }}>₹{item.price}</td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{
                                                backgroundColor: item.status === 'Active' ? '#d1fae5' : '#fee2e2',
                                                color: item.status === 'Active' ? '#065f46' : '#991b1b',
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: 600
                                            }}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => handleEditItem(item)}
                                                    title="Edit"
                                                    style={{
                                                        backgroundColor: '#fef3c7',
                                                        border: 'none',
                                                        padding: '6px 12px',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '16px'
                                                    }}
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(item)}
                                                    title={item.status === 'Active' ? 'Deactivate' : 'Activate'}
                                                    style={{
                                                        backgroundColor: item.status === 'Active' ? '#dcfce7' : '#fee2e2',
                                                        border: 'none',
                                                        padding: '6px 12px',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '16px'
                                                    }}
                                                >
                                                    {item.status === 'Active' ? '✓' : '✗'}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteItem(item._id)}
                                                    title="Delete"
                                                    style={{
                                                        backgroundColor: '#fef2f2',
                                                        border: 'none',
                                                        padding: '6px 12px',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '16px'
                                                    }}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && editingItem && (
                <div onClick={() => setShowEditModal(false)} style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div onClick={(e) => e.stopPropagation()} style={{
                        backgroundColor: '#fef9e7',
                        borderRadius: '12px',
                        padding: '30px',
                        maxWidth: '600px',
                        width: '90%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px',
                            borderBottom: '2px solid #f59e0b',
                            paddingBottom: '15px'
                        }}>
                            <h2 style={{ margin: 0, color: '#d97706', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span>✏️</span> Edit Menu Item
                            </h2>
                            <button
                                onClick={() => setShowEditModal(false)}
                                style={{
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#6b7280'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleUpdateItem}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: '#374151' }}>
                                    ITEM NAME
                                </label>
                                <input
                                    name="itemName"
                                    defaultValue={editingItem.itemName}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: '#374151' }}>
                                    CATEGORY <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <select
                                    name="category"
                                    defaultValue={editingItem.category}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        backgroundColor: 'white'
                                    }}
                                >
                                    {categories.filter(c => c !== 'All Categories').map(cat => (
                                        <option key={cat} value={cat}>{getCategoryWithIcon(cat)}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: '#374151' }}>
                                    PRICE (₹)
                                </label>
                                <input
                                    name="price"
                                    type="number"
                                    defaultValue={editingItem.price}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, color: '#374151' }}>
                                    DESCRIPTION
                                </label>
                                <textarea
                                    name="description"
                                    rows="4"
                                    defaultValue={editingItem.description}
                                    placeholder="Brief description of the item"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: '10px',
                                justifyContent: 'flex-end',
                                borderTop: '2px solid #f59e0b',
                                paddingTop: '15px'
                            }}>
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    style={{
                                        backgroundColor: 'transparent',
                                        color: '#6b7280',
                                        border: '1px solid #d1d5db',
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        backgroundColor: '#f59e0b',
                                        color: 'white',
                                        border: '1px solid #d97706',
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px'
                                    }}
                                >
                                    <span>✏️</span> Update Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FoodMenuDashboard;
