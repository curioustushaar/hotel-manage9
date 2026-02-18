import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SuperAdminDashboard = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        hotelName: '',
        gstNumber: '',
        subscriptionStart: '',
        subscriptionEnd: ''
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const token = user?.token || localStorage.getItem('authToken');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const response = await axios.get(`${API_URL}/super-admin/admins`, config);
            setAdmins(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching admins:', error);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        try {
            const token = user?.token || localStorage.getItem('authToken');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            await axios.post(`${API_URL}/super-admin/create-admin`, formData, config);
            setShowModal(false);
            setFormData({
                name: '',
                email: '',
                password: '',
                phone: '',
                hotelName: '',
                gstNumber: '',
                subscriptionStart: '',
                subscriptionEnd: ''
            });
            fetchAdmins();
        } catch (error) {
            console.error('Error creating admin:', error);
            alert(error.response?.data?.message || 'Error creating admin');
        }
    };

    const toggleStatus = async (id) => {
        try {
            const token = user?.token || localStorage.getItem('authToken');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            await axios.put(`${API_URL}/super-admin/toggle-status/${id}`, {}, config);
            fetchAdmins();
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    const handleLogout = () => {
        logout();
        window.location.href = '/login'; // Force full reload to clear state
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-600 text-white p-2 rounded-lg shadow-sm">
                            <span className="text-xl font-bold tracking-tight">BA</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            Bireena Atithi <span className="text-red-600">Super Admin</span>
                        </h1>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="px-5 py-2.5 border border-red-200 text-sm font-medium rounded-lg text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Sign Out
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Hotel Management</h2>
                        <p className="mt-1 text-sm text-gray-500">Overview of all registered hotels and administrators.</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-md text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all transform hover:-translate-y-0.5"
                    >
                        + Onboard New Hotel
                    </button>
                </div>

                {/* Statistics Cards (Optional placeholder for future) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-sm font-medium text-gray-500">Total Hotels</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{admins.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-sm font-medium text-gray-500">Active Subscriptions</p>
                        <p className="text-3xl font-bold text-green-600 mt-2">{admins.filter(a => a.isActive).length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-sm font-medium text-gray-500">Pending Actions</p>
                        <p className="text-3xl font-bold text-orange-500 mt-2">0</p>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hotel Details</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Administrator</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subscription</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <div className="flex justify-center flex-col items-center">
                                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mb-4"></div>
                                                <p className="text-sm text-gray-500">Loading hotel data...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : admins.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            No hotels found. Click "Onboard New Hotel" to get started.
                                        </td>
                                    </tr>
                                ) : (
                                    admins.map((admin) => (
                                        <tr key={admin._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-lg">
                                                        {admin.hotelName ? admin.hotelName.charAt(0).toUpperCase() : 'H'}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-bold text-gray-900">{admin.hotelName || 'N/A'}</div>
                                                        <div className="text-xs text-gray-500">GST: {admin.gstNumber || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 font-medium">{admin.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{admin.username}</div>
                                                <div className="text-xs text-gray-500">{admin.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-700">
                                                    Ends: <span className="font-semibold">{admin.subscriptionEnd ? new Date(admin.subscriptionEnd).toLocaleDateString() : 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${admin.isActive
                                                        ? 'bg-green-50 text-green-700 border-green-200'
                                                        : 'bg-red-50 text-red-700 border-red-200'
                                                    }`}>
                                                    {admin.isActive ? 'Active' : 'Disabled'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => toggleStatus(admin._id)}
                                                    className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${admin.isActive
                                                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                                                            : 'border-green-200 text-green-600 hover:bg-green-50'
                                                        }`}
                                                >
                                                    {admin.isActive ? 'Disable Access' : 'Enable Access'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Modal Overlay */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
                            aria-hidden="true"
                            onClick={() => setShowModal(false)}
                        ></div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        {/* Modal Panel */}
                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-100">
                            <div className="bg-red-600 px-6 py-4 flex justify-between items-center">
                                <h3 className="text-lg leading-6 font-bold text-white flex items-center gap-2">
                                    <span className="bg-white text-red-600 rounded-full h-6 w-6 flex items-center justify-center text-sm">+</span>
                                    Onboard New Hotel
                                </h3>
                                <button onClick={() => setShowModal(false)} className="text-red-100 hover:text-white text-2xl leading-none">&times;</button>
                            </div>

                            <form onSubmit={handleCreateAdmin}>
                                <div className="px-8 py-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Hotel Info */}
                                        <div className="md:col-span-2">
                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 border-b pb-1">Hotel Details</h4>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name</label>
                                            <input type="text" name="hotelName" placeholder="e.g. Grand Plaza" value={formData.hotelName} onChange={handleInputChange} required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                                            <input type="text" name="gstNumber" placeholder="e.g. 29ABCDE1234F1Z5" value={formData.gstNumber} onChange={handleInputChange} required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" />
                                        </div>

                                        {/* Admin Info */}
                                        <div className="md:col-span-2 mt-2">
                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 border-b pb-1">Administrator Details</h4>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Name</label>
                                            <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleInputChange} required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                            <input type="text" name="phone" placeholder="+91 98765 43210" value={formData.phone} onChange={handleInputChange} required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-xs text-gray-400">(Login Username)</span></label>
                                            <input type="email" name="email" placeholder="admin@hotel.com" value={formData.email} onChange={handleInputChange} required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                            <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleInputChange} required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" />
                                        </div>

                                        {/* Subscription Info */}
                                        <div className="md:col-span-2 mt-2">
                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 border-b pb-1">Subscription Plan</h4>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                            <input type="date" name="subscriptionStart" value={formData.subscriptionStart} onChange={handleInputChange} required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                            <input type="date" name="subscriptionEnd" value={formData.subscriptionEnd} onChange={handleInputChange} required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse border-t border-gray-100">
                                    <button type="submit" className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-6 py-2.5 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-all shadow-md">
                                        Create Account
                                    </button>
                                    <button type="button" onClick={() => setShowModal(false)} className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-6 py-2.5 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-all">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminDashboard;
