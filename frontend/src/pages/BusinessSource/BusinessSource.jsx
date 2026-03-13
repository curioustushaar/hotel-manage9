import React, { useState, useEffect } from 'react';
import './BusinessSource.css';
import API_URL from '../../config/api';

const BusinessSource = () => {
    const [sources, setSources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentSource, setCurrentSource] = useState(null);
    const [formData, setFormData] = useState({ name: '' });

    useEffect(() => { fetchSources(); }, []);

    const fetchSources = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/business-sources/list`);
            const data = await res.json();
            if (data.success) setSources(data.data);
        } catch (err) { alert('Error fetching data'); }
        finally { setLoading(false); }
    };

    const handleOpenModal = (mode, source = null) => {
        setModalMode(mode);
        if (mode === 'edit' && source) {
            setCurrentSource(source);
            setFormData({ name: source.name });
        } else {
            setCurrentSource(null);
            setFormData({ name: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = modalMode === 'add' ? `${API_URL}/api/business-sources/add` : `${API_URL}/api/business-sources/update/${currentSource._id}`;
            const method = modalMode === 'add' ? 'POST' : 'PUT';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                setIsModalOpen(false);
                fetchSources();
            } else {
                alert(data.message);
            }
        } catch (error) { alert('Error submitting'); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this business source?')) {
            try {
                await fetch(`${API_URL}/api/business-sources/delete/${id}`, { method: 'DELETE' });
                fetchSources();
            } catch (error) { alert('Error deleting'); }
        }
    };

    return (
        <div className="business-source-container">
            <header className="business-source-header">
                <h2>Business Source</h2>
                <button className="add-btn" onClick={() => handleOpenModal('add')}>+ Add Business Source</button>
            </header>

            {loading ? <div>Loading...</div> : (
                <div className="table-container">
                    <table className="common-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Business Source</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sources.map((source, index) => (
                                <tr key={source._id}>
                                    <td>{index + 1}</td>
                                    <td>{source.name}</td>
                                    <td className="text-right">
                                        <div className="action-btns">
                                            <button className="icon-btn edit-btn" onClick={() => handleOpenModal('edit', source)}>✏️</button>
                                            <button className="icon-btn delete-btn" onClick={() => handleDelete(source._id)}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="table-footer">Showing {sources.length} Business Sources</div>
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{modalMode === 'add' ? 'Add Business Source' : 'Edit Business Source'}</h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Business Source</label>
                                <input type="text" value={formData.name} onChange={e => {
                                    const value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                                    setFormData({ ...formData, name: value });
                                }} required />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">{modalMode === 'add' ? 'Add' : 'Update'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default BusinessSource;
