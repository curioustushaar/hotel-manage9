import React, { useState, useEffect } from 'react';
import './MaintenanceBlock.css';
import API_URL from '../../config/api';

const MaintenanceBlock = () => {
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentBlock, setCurrentBlock] = useState(null);
    const [formData, setFormData] = useState({
        room: '',
        blockType: '',
        startDate: '',
        endDate: '',
        reason: '',
        status: 'Blocked'
    });

    useEffect(() => {
        fetchBlocks();
    }, []);

    const fetchBlocks = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/maintenance-blocks/list`);
            const data = await res.json();
            if (data.success) {
                // Ensure dates are parsed
                const parsed = data.data.map(b => ({
                    ...b,
                    startDate: new Date(b.startDate).toISOString().split('T')[0],
                    endDate: new Date(b.endDate).toISOString().split('T')[0]
                }));
                setBlocks(parsed);
            }
        } catch (err) { alert('Error fetching data'); }
        finally { setLoading(false); }
    };

    const handleOpenModal = (mode, block = null) => {
        setModalMode(mode);
        if (mode === 'edit' && block) {
            setCurrentBlock(block);
            setFormData({
                room: block.room,
                blockType: block.blockType,
                startDate: block.startDate,
                endDate: block.endDate,
                reason: block.reason || '',
                status: block.status
            });
        } else {
            setCurrentBlock(null);
            setFormData({
                room: '', blockType: '', startDate: '', endDate: '', reason: '', status: 'Blocked'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = modalMode === 'add' ? `${API_URL}/api/maintenance-blocks/add` : `${API_URL}/api/maintenance-blocks/update/${currentBlock._id}`;
            const method = modalMode === 'add' ? 'POST' : 'PUT';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (data.success) {
                setIsModalOpen(false);
                fetchBlocks();
            } else {
                alert(data.message);
            }
        } catch (error) { alert('Error submitting'); }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const res = await fetch(`${API_URL}/api/maintenance-blocks/update/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) fetchBlocks();
        } catch (error) { alert('Error updating status'); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this maintenance block?')) {
            try {
                await fetch(`${API_URL}/api/maintenance-blocks/delete/${id}`, { method: 'DELETE' });
                fetchBlocks();
            } catch (error) { alert('Error deleting'); }
        }
    };

    // Filters
    const filteredBlocks = blocks.filter(b => {
        const matchesSearch = b.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.blockType.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'All' || b.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusClass = (status) => {
        if (status === 'In Progress') return 'status-badge in-progress';
        if (status === 'Blocked') return 'status-badge blocked';
        if (status === 'Completed') return 'status-badge completed';
        return 'status-badge';
    };

    return (
        <div className="maintenance-block-container">
            <header className="maintenance-header">
                <h2>Maintenance Block</h2>
                <button className="add-btn" onClick={() => handleOpenModal('add')}>+ Add Maintenance Block</button>
            </header>

            <div className="filter-bar">
                <select
                    className="status-filter"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="All">All Status</option>
                    <option value="Blocked">Blocked</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                </select>

                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search here..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <span className="search-icon">🔍</span>
                </div>
            </div>

            {loading ? <div>Loading...</div> : (
                <div className="table-container">
                    <table className="common-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Room</th>
                                <th>Block Type</th>
                                <th>Block Duration</th>
                                <th>Status</th>
                                <th>Reason</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBlocks.map((block, index) => (
                                <tr key={block._id}>
                                    <td>{index + 1}</td>
                                    <td>{block.room}</td>
                                    <td>{block.blockType}</td>
                                    <td>
                                        {block.startDate} - {block.endDate}
                                    </td>
                                    <td>
                                        <span className={getStatusClass(block.status)}>
                                            {block.status === 'In Progress' && '🟠 '}
                                            {block.status === 'Blocked' && '🔴 '}
                                            {block.status === 'Completed' && '🟢 '}
                                            {block.status}
                                        </span>
                                    </td>
                                    <td className="reason-cell">{block.reason}</td>
                                    <td className="text-right">
                                        <div className="action-btns">
                                            {/* Status Actions */}
                                            {block.status === 'Blocked' && (
                                                <button className="icon-btn action-start" title="Start Progress" onClick={() => handleStatusUpdate(block._id, 'In Progress')}>🔧</button>
                                            )}
                                            {block.status === 'In Progress' && (
                                                <button className="icon-btn action-complete" title="Mark Completed" onClick={() => handleStatusUpdate(block._id, 'Completed')}>✅</button>
                                            )}

                                            <button className="icon-btn edit-btn" onClick={() => handleOpenModal('edit', block)}>✏️</button>
                                            <button className="icon-btn delete-btn" onClick={() => handleDelete(block._id)}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="table-footer">Showing {filteredBlocks.length} Maintenance Blocks</div>
                </div>
            )
            }

            {/* Premium Modal */}
            {isModalOpen && (
                <div className="add-payment-overlay">
                    <div className="add-payment-modal add-maintenance-premium">
                        <div className="premium-payment-header">
                            <div className="header-icon-wrap">
                                <span style={{ fontSize: '20px' }}>🔧</span>
                            </div>
                            <div className="header-text">
                                <h3>{modalMode === 'add' ? 'Add Maintenance Block' : 'Edit Maintenance Block'}</h3>
                                <span>ROOM MAINTENANCE</span>
                            </div>
                            <button className="premium-close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                            <div className="add-payment-body scrollable-modal-body">
                                <div className="premium-form-row">
                                    <div className="payment-field-group flex-1">
                                        <label className="field-label-premium">ROOM NUMBER</label>
                                        <div className="premium-input-wrap">
                                            <input
                                                type="text"
                                                value={formData.room}
                                                onChange={e => {
                                                    const value = e.target.value.replace(/\D/g, '');
                                                    setFormData({ ...formData, room: value });
                                                }}
                                                required
                                                placeholder="e.g. 102"
                                                className="premium-input"
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                    <div className="payment-field-group flex-1">
                                        <label className="field-label-premium">BLOCK TYPE</label>
                                        <div className="premium-input-wrap">
                                            <input
                                                type="text"
                                                value={formData.blockType}
                                                onChange={e => {
                                                    const value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                                                    setFormData({ ...formData, blockType: value });
                                                }}
                                                required
                                                placeholder="e.g. Painting"
                                                className="premium-input"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="premium-form-row">
                                    <div className="payment-field-group flex-1">
                                        <label className="field-label-premium">START DATE</label>
                                        <div className="premium-input-wrap">
                                            <input
                                                type="date"
                                                value={formData.startDate}
                                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                                required
                                                className="premium-input"
                                            />
                                        </div>
                                    </div>
                                    <div className="payment-field-group flex-1">
                                        <label className="field-label-premium">END DATE</label>
                                        <div className="premium-input-wrap">
                                            <input
                                                type="date"
                                                value={formData.endDate}
                                                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                                required
                                                className="premium-input"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="payment-field-group">
                                    <label className="field-label-premium">STATUS</label>
                                    <div className="premium-input-wrap">
                                        <select
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                                            className="premium-input"
                                        >
                                            <option value="Blocked">Blocked</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="payment-field-group">
                                    <label className="field-label-premium">REASON/NOTES</label>
                                    <div className="premium-input-wrap">
                                        <textarea
                                            value={formData.reason}
                                            onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                            rows="3"
                                            placeholder="Enter details..."
                                            className="premium-input premium-textarea"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            <div className="payment-modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                                    CANCEL
                                </button>
                                <button type="submit" className="btn-primary">
                                    {modalMode === 'add' ? 'ADD BLOCK' : 'UPDATE BLOCK'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div >
    );
};
export default MaintenanceBlock;
