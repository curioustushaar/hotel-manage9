import React, { useState, useEffect } from 'react';
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
            } else {
                alert(data.message || 'Failed to update item');
            }
        } catch (error) {
            console.error('Error updating item:', error);
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
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

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
                    </div>
                </div>
            </div>

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
                />
            )}
        </div>
    );
};

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

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(item._id, {
            ...formData,
            quantity: parseInt(formData.quantity, 10)
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
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
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ItemStockStatus;
