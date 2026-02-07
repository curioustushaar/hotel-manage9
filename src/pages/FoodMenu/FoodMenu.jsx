import React, { useState, useEffect } from 'react';
import API_URL from '../../config/api';
import './FoodMenu.css';

// Food Menu Management - Updated with Icons
const FoodMenu = () => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [menuItems, setMenuItems] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All Categories');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    const categories = [
        { value: 'All Categories', label: '🍽️ All Categories', icon: '🍽️' },
        { value: 'Cake', label: '🎂 Cake', icon: '🎂' },
        { value: 'Chicken', label: '🍗 Chicken', icon: '🍗' },
        { value: 'Mithai', label: '🍬 Mithai', icon: '🍬' },
        { value: 'Milk', label: '🥛 Milk', icon: '🥛' },
        { value: 'Vegetarian', label: '🥗 Vegetarian', icon: '🥗' },
        { value: 'Beverages', label: '🥤 Beverages', icon: '🥤' },
        { value: 'Desserts', label: '🍨 Desserts', icon: '🍨' },
        { value: 'Starters', label: '🍴 Starters', icon: '🍴' }
    ];

    // Fetch menu items on component mount
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

    const handleAddItem = async (newItem) => {
        try {
            const response = await fetch(`${API_URL}/api/menu/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newItem),
            });
            const data = await response.json();
            if (data.success) {
                setMenuItems([...menuItems, data.data]);
                setShowAddForm(false);
            }
        } catch (error) {
            console.error('Error adding item:', error);
        }
    };

    const handleUpdateItem = async (id, updatedItem) => {
        try {
            const response = await fetch(`${API_URL}/api/menu/update/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedItem),
            });
            const data = await response.json();
            if (data.success) {
                setMenuItems(menuItems.map(item => item._id === id ? data.data : item));
                setEditingItem(null);
            }
        } catch (error) {
            console.error('Error updating item:', error);
        }
    };

    const handleDeleteItem = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                const response = await fetch(`${API_URL}/api/menu/delete/${id}`, {
                    method: 'DELETE',
                });
                const data = await response.json();
                if (data.success) {
                    setMenuItems(menuItems.filter(item => item._id !== id));
                }
            } catch (error) {
                console.error('Error deleting item:', error);
            }
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        try {
            const response = await fetch(`${API_URL}/api/menu/update/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await response.json();
            if (data.success) {
                setMenuItems(menuItems.map(item => item._id === id ? { ...item, status: newStatus } : item));
            }
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    // Filter and search logic
    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All Categories' || item.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    return (
        <div className="food-menu-container">
            {/* Header */}
            <div className="food-menu-header">
                <div className="header-left">
                    <span className="menu-icon">🎁</span>
                    <h1>Food Menu</h1>
                </div>
                <div className="header-right">
                    <div className="search-box">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="notification-icon">
                        <span>🔔</span>
                        <span className="badge">3</span>
                    </div>
                    <div className="mail-icon">✉️</div>
                    <div className="profile-menu">
                        <img src="/api/placeholder/40/40" alt="Profile" />
                        <span>▼</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="food-menu-content">
                <div className="content-header">
                    <h2>Food Menu</h2>
                    <div className="header-actions">
                        <button
                            className="btn-add-item"
                            onClick={() => setShowAddForm(!showAddForm)}
                        >
                            + Add Item
                        </button>
                        <button className="btn-show-menu">
                            🎁 Show Menu
                        </button>
                    </div>
                </div>

                {/* Add Item Form */}
                {showAddForm && (
                    <AddItemForm
                        onSubmit={handleAddItem}
                        onCancel={() => setShowAddForm(false)}
                    />
                )}

                {/* Items List */}
                <div className="items-list-card">
                    <div className="list-header">
                        <div className="list-title">
                            ☰ ITEMS LIST
                        </div>
                        <div className="filter-section">
                            <label>Filter by Category.</label>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="category-filter"
                            >
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="table-container">
                        <table className="items-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Item Name</th>
                                    <th>Category</th>
                                    <th>Description</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((item, index) => (
                                    <tr key={item._id}>
                                        <td>{indexOfFirstItem + index + 1}</td>
                                        <td>{item.itemName}</td>
                                        <td>{item.category}</td>
                                        <td>{item.description || '---'}</td>
                                        <td>₹{item.price.toFixed(2)}</td>
                                        <td>
                                            <span className={`status-badge ${item.status.toLowerCase()}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="action-btn edit-btn"
                                                    onClick={() => setEditingItem(item)}
                                                    title="Edit"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="action-btn link-btn"
                                                    title="Link"
                                                >
                                                    🔗
                                                </button>
                                                <button
                                                    className="action-btn copy-btn"
                                                    title="Copy"
                                                >
                                                    📋
                                                </button>
                                                <button
                                                    className="action-btn toggle-btn"
                                                    onClick={() => handleToggleStatus(item._id, item.status)}
                                                    title="Toggle Status"
                                                >
                                                    🔄
                                                </button>
                                                <button
                                                    className="action-btn delete-btn"
                                                    onClick={() => handleDeleteItem(item._id)}
                                                    title="Delete"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="pagination">
                        <div className="showing-text">
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredItems.length)} of {filteredItems.length} entries
                        </div>
                        <div className="pagination-controls">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    className={currentPage === i + 1 ? 'active' : ''}
                                    onClick={() => setCurrentPage(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editingItem && (
                <EditItemModal
                    item={editingItem}
                    onSave={handleUpdateItem}
                    onCancel={() => setEditingItem(null)}
                />
            )}
        </div>
    );
};

// Add Item Form Component
const AddItemForm = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        itemName: '',
        category: '',
        price: '',
        description: '',
        status: 'Active'
    });

    const categories = [
        { value: 'Cake', label: '🎂 Cake', icon: '🎂' },
        { value: 'Chicken', label: '🍗 Chicken', icon: '🍗' },
        { value: 'Mithai', label: '🍬 Mithai', icon: '🍬' },
        { value: 'Milk', label: '🥛 Milk', icon: '🥛' },
        { value: 'Vegetarian', label: '🥗 Vegetarian', icon: '🥗' },
        { value: 'Beverages', label: '🥤 Beverages', icon: '🥤' },
        { value: 'Desserts', label: '🍨 Desserts', icon: '🍨' },
        { value: 'Starters', label: '🍴 Starters', icon: '🍴' }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.itemName && formData.category && formData.price) {
            onSubmit({
                ...formData,
                price: parseFloat(formData.price)
            });
            setFormData({
                itemName: '',
                category: '',
                price: '',
                description: '',
                status: 'Active'
            });
        }
    };

    return (
        <div className="add-item-form-card">
            <div className="form-header">
                <span className="form-icon">➕</span>
                <h3>Add New Item</h3>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group">
                        <label>ITEM NAME <span className="required">*</span></label>
                        <input
                            type="text"
                            placeholder="e.g. Paneer Butter Masala"
                            value={formData.itemName}
                            onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>CATEGORY <span className="required">*</span></label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            required
                        >
                            <option value="">🎁 Select category</option>
                            {categories.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>PRICE (₹)</label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                        />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group full-width">
                        <label>DESCRIPTION</label>
                        <textarea
                            rows="4"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>
                <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={onCancel}>
                        Cancel
                    </button>
                    <button type="submit" className="btn-submit">
                        ➕ Add Item
                    </button>
                </div>
            </form>
        </div>
    );
};

// Edit Item Modal Component
const EditItemModal = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        itemName: item.itemName,
        category: item.category,
        price: item.price,
        description: item.description || '',
        status: item.status
    });

    const categories = [
        { value: 'Cake', label: '🎂 Cake', icon: '🎂' },
        { value: 'Chicken', label: '🍗 Chicken', icon: '🍗' },
        { value: 'Mithai', label: '🍬 Mithai', icon: '🍬' },
        { value: 'Milk', label: '🥛 Milk', icon: '🥛' },
        { value: 'Vegetarian', label: '🥗 Vegetarian', icon: '🥗' },
        { value: 'Beverages', label: '🥤 Beverages', icon: '🥤' },
        { value: 'Desserts', label: '🍨 Desserts', icon: '🍨' },
        { value: 'Starters', label: '🍴 Starters', icon: '🍴' }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(item._id, {
            ...formData,
            price: parseFloat(formData.price)
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>✏️ Edit Item</h3>
                    <button className="modal-close" onClick={onCancel}>✕</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>ITEM NAME <span className="required">*</span></label>
                        <input
                            type="text"
                            value={formData.itemName}
                            onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>CATEGORY <span className="required">*</span></label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            required
                        >
                            {categories.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>PRICE (₹)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>DESCRIPTION</label>
                        <textarea
                            rows="4"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>STATUS</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={onCancel}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-submit">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FoodMenu;
