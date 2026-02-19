import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import API_URL_CONFIG from '../config/api';
import './ItemStockStatus.css';

const ItemStockStatus = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL_CONFIG}/api/menu/list`);
            const data = await response.json();
            if (data.success) {
                // Determine stock status and availability
                const processedItems = data.data.map(item => {
                    const qty = item.quantity !== undefined ? item.quantity : 0;
                    const stockStatus = qty === 0 ? 'Out of Stock' : (qty <= 20 ? 'Low Stock' : 'Available');
                    return {
                        ...item,
                        quantity: qty,
                        unit: item.unit || 'PCS',
                        stockStatus
                    };
                });
                setItems(processedItems);
            }
        } catch (error) {
            console.error('Error fetching stock items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async (newItem) => {
        try {
            const response = await fetch(`${API_URL_CONFIG}/api/menu/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem)
            });
            const data = await response.json();
            if (data.success) {
                fetchItems(); // Refresh list
                setShowAddModal(false);
            } else {
                alert(data.message || 'Failed to add item');
            }
        } catch (error) {
            console.error('Error adding item:', error);
            alert('Error adding item');
        }
    };

    const handleUpdateItem = async (id, updates) => {
        try {
            const response = await fetch(`${API_URL_CONFIG}/api/menu/update/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            const data = await response.json();
            if (data.success) {
                fetchItems();
                setEditingItem(null);
=======
import API_URL from '../config/api';
import '../pages/FoodMenu/FoodMenu.css'; // Import FoodMenu styles

// Replaced ItemStockStatus with Food Menu Management features
const ItemStockStatus = () => {

    const [menuItems, setMenuItems] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All Categories');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    const categories = [
        { value: 'All Categories', label: '🍽️ All Categories', icon: '🍽️' },
        { value: 'Starters', label: '🍴 Starters', icon: '🍴' },
        { value: 'Main Course', label: '🍛 Main Course', icon: '🍛' },
        { value: 'Breakfast', label: '☕ Breakfast', icon: '☕' },
        { value: 'Rice', label: '🍚 Rice', icon: '🍚' },
        { value: 'Desserts', label: '🍨 Desserts', icon: '🍨' },
        { value: 'Beverages', label: '🥤 Beverages', icon: '🥤' },
        { value: 'Chinese', label: '🥡 Chinese', icon: '🥡' },
        { value: 'Continental', label: '🍝 Continental', icon: '🍝' }
    ];

    // Get category with icon
    const getCategoryWithIcon = (categoryName) => {
        const category = categories.find(cat => cat.value === categoryName);
        return category ? category.label : categoryName;
    };

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
                alert('Item updated successfully!');
>>>>>>> main
            } else {
                alert(data.message || 'Failed to update item');
            }
        } catch (error) {
            console.error('Error updating item:', error);
<<<<<<< HEAD
            alert('Error updating item');
        }
    };

    const handleToggleStatus = async (item) => {
        const newStatus = item.status === 'Active' ? 'Inactive' : 'Active';
        handleUpdateItem(item._id, { status: newStatus });
    };

    // Filter Logic
    const filteredItems = items.filter(item =>
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
=======
            alert('Error updating item. Please try again.');
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
                    alert('Item deleted successfully!');
                } else {
                    alert(data.message || 'Failed to delete item');
                }
            } catch (error) {
                console.error('Error deleting item:', error);
                alert('Error deleting item. Please try again.');
            }
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        try {
            const response = await fetch(`${API_URL}/api/menu/toggle-status/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            if (data.success) {
                setMenuItems(menuItems.map(item => item._id === id ? { ...item, status: newStatus } : item));
            } else {
                alert(data.message || 'Failed to toggle status');
            }
        } catch (error) {
            console.error('Error toggling status:', error);
            alert('Error toggling status. Please try again.');
        }
    };

    // Filter and search logic
    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All Categories' || item.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    // Pagination logic
>>>>>>> main
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

<<<<<<< HEAD
    // Stats
    const totalItems = items.length;
    const availableItems = items.filter(i => i.stockStatus === 'Available' && i.status === 'Active').length;
    const lowStockItems = items.filter(i => i.stockStatus === 'Low Stock' && i.status === 'Active').length;
    const outOfStockItems = items.filter(i => i.stockStatus === 'Out of Stock' || i.status === 'Inactive').length;

    // Time Formatter
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);

        if (diffMins < 60) return `${diffMins} mins ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="item-stock-status-container">
            {/* Stats Cards */}
            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-icon red-bg">📦</div>
                    <div className="stat-info">
                        <h2>{totalItems}</h2>
                        <p>Total Items</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green-bg">✔</div>
                    <div className="stat-info">
                        <h2>{availableItems}</h2>
                        <p>Available</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon orange-bg">⚠️</div>
                    <div className="stat-info">
                        <h2>{lowStockItems}</h2>
                        <p>Low Stock</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon red-bg">❗</div>
                    <div className="stat-info">
                        <h2>{outOfStockItems}</h2>
                        <p>Out of Stock</p>
=======
    return (
        <div className="food-menu-container">
            {/* Header - Compact */}
            <div className="food-menu-header" style={{ padding: '10px 20px', marginBottom: '10px' }}>
                <div className="header-left">
                    <span className="menu-icon" style={{ fontSize: '1.2rem' }}>🎁</span>
                    <h1 style={{ fontSize: '1.2rem' }}>Current Item Stock</h1>
                </div>
                <div className="header-right" style={{ gap: '10px' }}>
                    <div className="search-box" style={{ padding: '4px 8px' }}>
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ fontSize: '0.9rem' }}
                        />
                    </div>

                </div>
            </div>

            {/* Main Content - Compact */}
            <div className="food-menu-content" style={{ padding: '0 20px' }}>
                {/* Removed separate content-header with "Item Stock List" text */}



                {/* Items List */}
                {/* Items List - Compact */}
                <div className="items-list-card" style={{ padding: '0', borderRadius: '8px', overflow: 'hidden' }}>
                    <div className="list-header" style={{ padding: '8px 15px', justifyContent: 'flex-end', background: '#f8f9fa' }}>
                        <div className="filter-section">
                            <label style={{ fontSize: '0.85rem', marginRight: '8px' }}>Filter by Category:</label>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="category-filter"
                                style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                            >
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="table-container">
                        <table className="items-table" style={{ fontSize: '0.85rem', width: '100%' }}>
                            <thead>
                                <tr style={{ background: '#f1f1f1' }}>
                                    <th style={{ padding: '8px' }}>#</th>
                                    <th style={{ padding: '8px' }}>Code</th>
                                    <th style={{ padding: '8px' }}>Item Name</th>
                                    <th style={{ padding: '8px' }}>Category</th>
                                    <th style={{ padding: '8px' }}>Description</th>
                                    <th style={{ padding: '8px' }}>Price</th>
                                    <th style={{ padding: '8px' }}>Status</th>
                                    <th style={{ padding: '8px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((item, index) => (
                                    <tr key={item._id}>
                                        <td>{indexOfFirstItem + index + 1}</td>
                                        <td><span className="code-badge">{item.foodCode || '-'}</span></td>
                                        <td>{item.itemName}</td>
                                        <td>{getCategoryWithIcon(item.category)}</td>
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
>>>>>>> main
                    </div>
                </div>
            </div>

<<<<<<< HEAD
            {/* Actions Bar */}
            <div className="actions-bar">
                <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search item..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="btn-add-item" onClick={() => setShowAddModal(true)}>
                    + Add New Item
                </button>
            </div>

            {/* Table */}
            <div className="stock-table-wrapper">
                <table className="stock-table">
                    <thead>
                        <tr>
                            <th>Item Name</th>
                            <th>Category</th>
                            <th>Available Qty</th>
                            <th>Unit</th>
                            <th>Status</th>
                            <th>Last Updated</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map(item => (
                            <tr key={item._id}>
                                <td className="fw-bold">{item.itemName}</td>
                                <td>{item.category}</td>
                                <td className="fw-bold">{item.quantity} {item.unit}</td>
                                <td>{item.unit}</td>
                                <td>
                                    <span className={`status-badge ${item.stockStatus === 'Available' ? 'status-available' : item.stockStatus === 'Low Stock' ? 'status-low' : 'status-out'}`}>
                                        {item.stockStatus === 'Available' ? (item.status === 'Inactive' ? 'Inactive' : 'Available') : item.stockStatus}
                                    </span>
                                </td>
                                <td>{formatTime(item.updatedAt)}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="btn-icon edit" onClick={() => setEditingItem(item)}>✏️</button>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={item.status === 'Active'}
                                                onChange={() => handleToggleStatus(item)}
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination settings */}
            <div className="pagination-footer">
                <div className="prev-next">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                    >
                        Previous
                    </button>
                    <span className="page-num">{currentPage}</span>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Modals */}
            {showAddModal && (
                <AddItemModal
                    onClose={() => setShowAddModal(false)}
                    onSave={handleAddItem}
                />
            )}

            {editingItem && (
                <EditItemModal
                    item={editingItem}
                    onClose={() => setEditingItem(null)}
                    onSave={handleUpdateItem}
=======
            {/* Edit Modal */}
            {editingItem && (
                <EditItemModal
                    item={editingItem}
                    onSave={handleUpdateItem}
                    onCancel={() => setEditingItem(null)}
>>>>>>> main
                />
            )}
        </div>
    );
};
<<<<<<< HEAD

const AddItemModal = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
        itemName: '',
        foodCode: '',
        category: '',
        price: '',
        quantity: 0,
        unit: 'PCS',
        description: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            price: parseFloat(formData.price),
            quantity: parseInt(formData.quantity, 10)
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Add New Item</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Item Name</label>
                        <input type="text" required value={formData.itemName} onChange={e => setFormData({ ...formData, itemName: e.target.value })} />
                    </div>
                    <div className="row">
                        <div className="form-group half">
                            <label>Food Code</label>
                            <input type="text" required value={formData.foodCode} onChange={e => setFormData({ ...formData, foodCode: e.target.value })} />
                        </div>
                        <div className="form-group half">
                            <label>Category</label>
                            <select required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                <option value="">Select</option>
                                <option value="Starters">Starters</option>
                                <option value="Main Course">Main Course</option>
                                <option value="Desserts">Desserts</option>
                                <option value="Beverages">Beverages</option>
                            </select>
                        </div>
                    </div>
                    <div className="row">
                        <div className="form-group third">
                            <label>Price</label>
                            <input type="number" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                        </div>
                        <div className="form-group third">
                            <label>Qty</label>
                            <input type="number" required value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
                        </div>
                        <div className="form-group third">
                            <label>Unit</label>
                            <select value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })}>
                                <option value="PCS">PCS</option>
                                <option value="KG">KG</option>
                                <option value="LTR">LTR</option>
                            </select>
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
                        <button type="submit" className="btn-save">Add Item</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EditItemModal = ({ item, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        itemName: item.itemName,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit
    });

=======
// Edit Item Modal Component
const EditItemModal = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        itemName: item.itemName,
        foodCode: item.foodCode || '',
        category: item.category,
        price: item.price,
        description: item.description || '',
        status: item.status
    });

    const categories = [
        { value: 'Starters', label: '🍴 Starters', icon: '🍴' },
        { value: 'Main Course', label: '🍛 Main Course', icon: '🍛' },
        { value: 'Breakfast', label: '☕ Breakfast', icon: '☕' },
        { value: 'Rice', label: '🍚 Rice', icon: '🍚' },
        { value: 'Desserts', label: '🍨 Desserts', icon: '🍨' },
        { value: 'Beverages', label: '🥤 Beverages', icon: '🥤' },
        { value: 'Chinese', label: '🥡 Chinese', icon: '🥡' },
        { value: 'Continental', label: '🍝 Continental', icon: '🍝' }
    ];

>>>>>>> main
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(item._id, {
            ...formData,
<<<<<<< HEAD
            quantity: parseInt(formData.quantity, 10)
=======
            price: parseFloat(formData.price)
>>>>>>> main
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
<<<<<<< HEAD
                <h3>Edit Stock</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Item Name</label>
                        <input type="text" disabled value={formData.itemName} />
                    </div>
                    <div className="row">
                        <div className="form-group half">
                            <label>Quantity</label>
                            <input type="number" required value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
                        </div>
                        <div className="form-group half">
                            <label>Unit</label>
                            <select value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })}>
                                <option value="PCS">PCS</option>
                                <option value="KG">KG</option>
                                <option value="LTR">LTR</option>
                            </select>
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
                        <button type="submit" className="btn-save">Update Stock</button>
=======
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
                        <label>FOOD CODE <span className="required">*</span></label>
                        <input
                            type="text"
                            value={formData.foodCode}
                            onChange={(e) => setFormData({ ...formData, foodCode: e.target.value })}
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
>>>>>>> main
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ItemStockStatus;
