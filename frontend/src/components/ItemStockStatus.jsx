import React, { useState, useEffect } from 'react';
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
            } else {
                alert(data.message || 'Failed to update item');
            }
        } catch (error) {
            console.error('Error updating item:', error);
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
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

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
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ItemStockStatus;
