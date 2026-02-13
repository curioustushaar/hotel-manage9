import { useState, useMemo } from 'react';
import './ViewOrderPage.css';

const ViewOrderPage = () => {
    // Top Tabs State
    const [activeTab, setActiveTab] = useState('Bill View');

    // Sub Filter State
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Mock Data based on the reference image
    const mockOrders = [
        {
            id: '1',
            kotNo: '2',
            billNo: '89',
            time: '10:58 AM',
            table: 'T1',
            type: 'Dine In',
            waiter: 'N/A',
            items: [
                { name: '2 x Malai Kofta', qty: 2 }
            ],
            status: 'Pending',
            amount: 457.00,
            color: 'red' // Red header
        },
        {
            id: '2',
            kotNo: '1',
            billNo: '104',
            time: '1:50 PM',
            table: 'T1',
            type: 'Dine In',
            waiter: 'Mukesh Singh',
            items: [
                { name: '1 x Extravaganza', qty: 1 }
            ],
            status: 'Pending',
            amount: 30.00,
            color: 'red'
        },
        {
            id: '3',
            kotNo: '2',
            billNo: '107',
            time: '5:03 PM',
            table: 'T1',
            type: 'Dine In',
            waiter: 'N/A',
            items: [
                { name: '2 x Veg Kofta', qty: 2 }
            ],
            status: 'Pending',
            amount: 429.00,
            color: 'red'
        },
        {
            id: '4',
            kotNo: '3',
            billNo: '108',
            time: '6:15 PM',
            table: 'T2',
            type: 'Take Away',
            waiter: 'Rahul',
            items: [
                { name: '1 x Paneer Butter Masala', qty: 1 },
                { name: '2 x Naan', qty: 2 }
            ],
            status: 'Pending',
            amount: 350.00,
            color: 'red'
        },
        {
            id: '5',
            kotNo: '4',
            billNo: '109',
            time: '7:30 PM',
            table: 'T3',
            type: 'Delivery',
            waiter: 'Suresh',
            items: [
                { name: '1 x Chicken Biryani', qty: 1 },
                { name: '1 x Raita', qty: 1 }
            ],
            status: 'Pending',
            amount: 280.00,
            color: 'red'
        },
        {
            id: '6',
            kotNo: '5',
            billNo: '110',
            time: '8:00 PM',
            table: '101', // Room number
            type: 'Room Order',
            waiter: 'Raju',
            items: [
                { name: '2 x Coffee', qty: 2 },
                { name: '1 x Sandwich', qty: 1 }
            ],
            status: 'Pending',
            amount: 150.00,
            color: 'blue' // Blue header for Room Order
        }
    ];

    // Filter Logic
    const filteredOrders = useMemo(() => {
        return mockOrders.filter(order => {
            // 1. Text Search (Items, Waiter, Table)
            const matchesSearch = 
                searchQuery === '' || 
                order.table.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.waiter.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

            // 2. Category Filter
            let matchesFilter = true;
            if (activeFilter !== 'All') {
                if (activeFilter === 'Dine In') matchesFilter = order.type === 'Dine In';
                else if (activeFilter === 'Room Order') matchesFilter = order.type === 'Room Order';
                else if (activeFilter === 'Delivery') matchesFilter = order.type === 'Delivery';
                else if (activeFilter === 'Take Away') matchesFilter = order.type === 'Take Away';
                else if (activeFilter === 'Online Order') matchesFilter = order.type === 'Online Order';
            }

            return matchesSearch && matchesFilter;
        });
    }, [searchQuery, activeFilter, mockOrders]);

    return (
        <div className="view-order-container">
            {/* Top Button Row */}
            <div className="view-order-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'Bill View' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Bill View')}
                >
                    Bill View
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'KOT View' ? 'active' : ''}`}
                    onClick={() => setActiveTab('KOT View')}
                >
                    KOT View
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'Outlet Current Status' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Outlet Current Status')}
                >
                    Outlet Current Status
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'Item Stock Status' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Item Stock Status')}
                >
                    Item Stock Status
                </button>
            </div>

            <p className="info-text">The below Bills are pending for Tender.</p>

            {/* Sub Filter Row */}
            <div className="view-order-filters">
                <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input 
                        type="text" 
                        placeholder="Search" 
                        className="filter-search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                {['All', 'Dine In', 'Room Order', 'Delivery', 'Take Away', 'Online Order'].map(filter => (
                    <button 
                        key={filter}
                        className={`filter-pill ${activeFilter === filter ? 'active' : ''}`} // Note: In image, inactive pills are white with red border text, active is red fill white text.
                        style={activeFilter === filter ? { backgroundColor: '#dc2626', color: 'white' } : { borderColor: '#dc2626', color: '#dc2626' }}
                        onClick={() => setActiveFilter(filter)}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Cards Grid */}
            <div className="orders-grid">
                {filteredOrders.map(order => (
                    <div className="order-card" key={order.id}>
                        {/* Header */}
                        <div className={`card-header ${order.color === 'blue' ? 'blue' : 'red'}`} style={{ backgroundColor: order.type === 'Room Order' ? '#0ea5e9' : '#dc2626' }}>
                            <div className="header-left">
                                <span className="kot-no">KOT: {order.kotNo}</span>
                                <span className="bill-no">Bill: {order.billNo}</span>
                            </div>
                            <div className="header-center">
                                <div className="time-badge">
                                    <span>🕒</span> {order.time}
                                </div>
                            </div>
                            <div className="header-right">
                                {order.type === 'Room Order' ? (
                                    <span className="room-no">Room: {order.table}</span>
                                ) : (
                                    <span className="table-no">Table: {order.table}</span>
                                )}
                                <span className="order-type">{order.type.toUpperCase()}</span>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="card-body">
                            <div className="waiter-info">
                                Waiter: {order.waiter}
                            </div>
                            <div className="item-list">
                                {order.items.map((item, index) => (
                                    <div key={index} className="order-item">
                                        {item.name}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="card-footer">
                            <div className="status-actions">
                                <button className="status-btn pending" style={{ backgroundColor: '#fff7ed', color: '#f59e0b', border: '1px solid #fcd34d' }}>Pending</button>
                                <button className="status-btn preparing" style={{ backgroundColor: '#dc2626', color: 'white', border: 'none' }}>Start Preparing</button>
                                <button className="status-btn ready" style={{ backgroundColor: '#d1fae5', color: '#10b981', border: '1px solid #a7f3d0' }}>Ready</button>
                            </div>
                            <div className="amount-display">
                                ₹{order.amount.toFixed(2)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ViewOrderPage;
