import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
    FaBell, 
    FaCog, 
    FaHotel, 
    FaShieldAlt, 
    FaExclamationTriangle, 
    FaClock, 
    FaPlus, 
    FaChevronRight,
    FaBars,
    FaBuilding
} from 'react-icons/fa';
import { MdDashboard, MdLogout } from 'react-icons/md';

const SuperAdminDashboard = () => {
    const { logout, user } = useAuth();
    const [activePage, setActivePage] = useState('dashboard');
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Mock statistics data
    const statistics = {
        totalHotels: 12,
        activeHotels: 9,
        suspended: 3,
        expiringSoon: 2
    };

    // Mock subscription data
    const subscriptions = [
        {
            id: 1,
            hotelName: 'Ocean View Resort',
            rating: '⭐ 5028 8** 991',
            admin: 'rohan@oceanview.com',
            expiration: 'April 21, 2024',
            daysLeft: 5,
            status: 'expiring'
        },
        {
            id: 2,
            hotelName: 'Grand Palace Hotel',
            rating: '⭐ 5028 8** 991',
            admin: 'neha@grandpalace.com',
            expiration: 'April 25, 2024',
            daysLeft: 9,
            status: 'warning'
        },
        {
            id: 3,
            hotelName: 'City Lights Inn',
            rating: '⭐ 5028 8** 506',
            admin: 'arjun@citylights.com',
            expiration: 'April 25, 2024',
            daysLeft: 9,
            status: 'warning'
        }
    ];

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    const getInitials = (name) => {
        if (!name) return 'SA';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Left Sidebar */}
            <aside className="w-56 bg-white shadow-lg flex flex-col">
                {/* Sidebar Navigation */}
                <nav className="flex-1 p-4">
                    <button
                        onClick={() => setActivePage('dashboard')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all ${
                            activePage === 'dashboard'
                                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <MdDashboard className="text-xl" />
                        <span className="font-medium">Dashboard</span>
                    </button>

                    <button
                        onClick={() => setActivePage('hotels')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all ${
                            activePage === 'hotels'
                                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <FaHotel className="text-xl" />
                        <span className="font-medium">Hotels</span>
                    </button>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all ${
                            activePage === 'create'
                                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <FaHotel className="text-xl" />
                        <span className="font-medium">Create Hotel</span>
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-all"
                    >
                        <MdLogout className="text-xl" />
                        <span className="font-medium">Logout</span>
                    </button>
                </nav>

                {/* Bottom Logout Button */}
                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg font-semibold"
                    >
                        <MdLogout className="text-lg" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Navbar */}
                <header className="bg-white shadow-sm">
                    <div className="flex items-center justify-between px-8 py-4">
                        {/* Left Side */}
                        <div className="flex items-center gap-4">
                            <button className="text-gray-600 hover:text-gray-900">
                                <FaBars className="text-xl" />
                            </button>
                            <h1 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
                                SUPER ADMIN DASHBOARD
                            </h1>
                        </div>

                        {/* Right Side */}
                        <div className="flex items-center gap-4">
                            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                                <FaCog className="text-xl" />
                            </button>

                            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                                <FaBell className="text-xl" />
                                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                                    3
                                </span>
                            </button>

                            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                                {getInitials(user?.name)}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-8">
                    {/* Page Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">
                            SUPER ADMIN DASHBOARD
                        </h2>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg font-semibold"
                        >
                            <FaPlus />
                            Create Hotel
                        </button>
                    </div>

                    {/* Hotel Statistics Section */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <h3 className="text-lg font-bold text-gray-700 uppercase mb-6 tracking-wide">
                            HOTEL STATISTICS
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Card 1: Total Hotels */}
                            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg flex items-center gap-4">
                                <div className="bg-white bg-opacity-20 rounded-full p-4">
                                    <FaBuilding className="text-3xl" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide opacity-90 mb-1">
                                        TOTAL HOTELS
                                    </p>
                                    <p className="text-5xl font-bold">{statistics.totalHotels}</p>
                                </div>
                            </div>

                            {/* Card 2: Active Hotels */}
                            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg flex items-center gap-4">
                                <div className="bg-white bg-opacity-20 rounded-full p-4">
                                    <FaShieldAlt className="text-3xl" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide opacity-90 mb-1">
                                        ACTIVE HOTELS
                                    </p>
                                    <p className="text-5xl font-bold">{statistics.activeHotels}</p>
                                </div>
                            </div>

                            {/* Card 3: Suspended Hotels */}
                            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg flex items-center gap-4">
                                <div className="bg-white bg-opacity-20 rounded-full p-4">
                                    <FaExclamationTriangle className="text-3xl" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide opacity-90 mb-1">
                                        SUSPENDED HOTELS
                                    </p>
                                    <p className="text-5xl font-bold">{statistics.suspended}</p>
                                </div>
                            </div>

                            {/* Card 4: Expiring Soon */}
                            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg flex items-center gap-4">
                                <div className="bg-white bg-opacity-20 rounded-full p-4">
                                    <FaClock className="text-3xl" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide opacity-90 mb-1">
                                        EXPIRING SOON
                                    </p>
                                    <p className="text-5xl font-bold">{statistics.expiringSoon}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Subscription Status Section */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-700 uppercase tracking-wide">
                                SUBSCRIPTION STATUS
                            </h3>
                            <button className="flex items-center gap-2 text-red-500 hover:text-red-600 font-semibold transition-all">
                                <FaChevronRight className="text-xs" />
                                <span>View All</span>
                                <FaChevronRight className="text-xs" />
                            </button>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-200">
                                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-500 uppercase tracking-wide">
                                            HOTEL
                                        </th>
                                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-500 uppercase tracking-wide">
                                            ADMIN
                                        </th>
                                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-500 uppercase tracking-wide">
                                            EXPIRATION
                                        </th>
                                        <th className="text-right py-4 px-4 text-sm font-bold text-gray-500 uppercase tracking-wide">
                                            STATUS
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subscriptions.map((sub) => (
                                        <tr 
                                            key={sub.id} 
                                            className="border-b border-gray-100 hover:bg-gray-50 transition-all cursor-pointer"
                                        >
                                            <td className="py-4 px-4">
                                                <div className="font-bold text-gray-800">{sub.hotelName}</div>
                                                <div className="text-sm text-gray-500 mt-1">{sub.rating}</div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="text-gray-700">{sub.admin}</div>
                                                <div className="text-sm text-gray-500 mt-1">{sub.admin}</div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="font-bold text-red-500">{sub.expiration}</div>
                                                <div className="flex items-center gap-1 text-sm text-red-500 mt-1">
                                                    <FaExclamationTriangle />
                                                    <span>{sub.daysLeft} days left</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <button className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-all font-semibold">
                                                    <span>{sub.daysLeft} days left</span>
                                                    <FaExclamationTriangle />
                                                    <FaChevronRight className="text-xs" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>

            {/* Create Hotel Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
                            <h3 className="text-xl font-bold">Create New Hotel</h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-3xl hover:text-red-100 transition-all leading-none"
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="p-6">
                            <form className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Hotel Name
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                                        placeholder="Enter hotel name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Admin Email
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                                        placeholder="admin@hotel.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Subscription End Date
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg font-semibold"
                                    >
                                        Create Hotel
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
