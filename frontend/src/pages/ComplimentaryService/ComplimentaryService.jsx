import React, { useState, useEffect } from 'react';
import './ComplimentaryService.css';
import API_URL from '../../config/api';

const ComplimentaryService = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [currentService, setCurrentService] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category: 'Food & Beverage',
        linkedWith: '',
        quantityLimit: ''
    });

    useEffect(() => { fetchServices(); }, []);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/complimentary-services/list`);
            const data = await res.json();
            if (data.success) setServices(data.data);
        } catch (err) { alert('Error fetching data'); }
        finally { setLoading(false); }
    };

    const handleOpenModal = (mode, service = null) => {
        setModalMode(mode);
        if (mode === 'edit' && service) {
            setCurrentService(service);
            setFormData({
                name: service.name,
                category: service.category,
                linkedWith: service.linkedWith,
                quantityLimit: service.quantityLimit
            });
        } else {
            setCurrentService(null);
            setFormData({ name: '', category: 'Food & Beverage', linkedWith: '', quantityLimit: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = modalMode === 'add' ? `${API_URL}/api/complimentary-services/add` : `${API_URL}/api/complimentary-services/update/${currentService._id}`;
            const method = modalMode === 'add' ? 'POST' : 'PUT';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                setIsModalOpen(false);
                fetchServices();
            } else {
                alert(data.message);
            }
        } catch (error) { alert('Error submitting'); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this service?')) {
            try {
                await fetch(`${API_URL}/api/complimentary-services/delete/${id}`, { method: 'DELETE' });
                fetchServices();
            } catch (error) { alert('Error deleting'); }
        }
    };

    return (
        <div className="complimentary-service-container">
            <header className="complimentary-service-header">
                <h2>Complimentary Services</h2>
                <button className="add-btn" onClick={() => handleOpenModal('add')}>+ Add Complimentary Service</button>
            </header>

            {loading ? <div>Loading...</div> : (
                <div className="table-container">
                    <table className="common-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Service Name</th>
                                <th>Category</th>
                                <th>Linked With</th>
                                <th>Quantity Limit</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map((service, index) => (
                                <tr key={service._id}>
                                    <td>{index + 1}</td>
                                    <td>{service.name}</td>
                                    <td>{service.category}</td>
                                    <td>{service.linkedWith}</td>
                                    <td>{service.quantityLimit}</td>
                                    <td className="text-right">
                                        <div className="action-btns">
                                            <button className="icon-btn edit-btn" onClick={() => handleOpenModal('edit', service)}>✏️</button>
                                            <button className="icon-btn delete-btn" onClick={() => handleDelete(service._id)}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="table-footer">Showing {services.length} Complimentary Services</div>
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{modalMode === 'add' ? 'Add Service' : 'Edit Service'}</h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Service Name</label>
                                <input type="text" value={formData.name} onChange={e => {
                                    const value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                                    setFormData({ ...formData, name: value });
                                }} required />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                    <option value="Food & Beverage">Food & Beverage</option>
                                    <option value="Facility">Facility</option>
                                    <option value="Room Service">Room Service</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Linked With</label>
                                <input type="text" value={formData.linkedWith} onChange={e => {
                                    const value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                                    setFormData({ ...formData, linkedWith: value });
                                }} required placeholder="e.g. All Guests, CP" />
                            </div>
                            <div className="form-group">
                                <label>Quantity Limit</label>
                                <input type="text" value={formData.quantityLimit} onChange={e => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    setFormData({ ...formData, quantityLimit: value });
                                }} required placeholder="e.g. 1 per Stay" />
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
export default ComplimentaryService;
