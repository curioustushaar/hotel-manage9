import React, { useState, useEffect } from 'react';
import './DashboardHome.css';

const DashboardHome = () => {
    const [roomStats, setRoomStats] = useState({
        total: 0,
        occupied: 0,
        booked: 0,
        available: 0
    });

    const [guestStats, setGuestStats] = useState({
        currentGuests: 0,
        todayCheckIns: 0,
        todayCheckOuts: 0
    });

    const [occupancyRate, setOccupancyRate] = useState(0);

    useEffect(() => {
        calculateStatistics();
    }, []);

    const calculateStatistics = () => {
        // Load rooms from localStorage
        const storedRooms = localStorage.getItem('hotelRooms');
        const rooms = storedRooms ? JSON.parse(storedRooms) : [];

        // Load customers from localStorage
        const storedCustomers = localStorage.getItem('customers');
        const customers = storedCustomers ? JSON.parse(storedCustomers) : [];

        // Calculate room statistics
        const total = rooms.length;
        const occupied = rooms.filter(room => room.status === 'Occupied').length;
        const booked = rooms.filter(room => room.status === 'Booked').length;
        const available = rooms.filter(room => room.status === 'Available').length;

        setRoomStats({
            total,
            occupied,
            booked,
            available
        });

        // Calculate occupancy rate
        const rate = total > 0 ? Math.round((occupied / total) * 100) : 0;
        setOccupancyRate(rate);

        // Calculate guest statistics
        const currentGuests = customers.filter(customer => customer.status === 'Checked In' || customer.isCurrent).length;

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];

        const todayCheckIns = customers.filter(customer => customer.checkIn === today).length;
        const todayCheckOuts = customers.filter(customer => customer.checkOut === today).length;

        setGuestStats({
            currentGuests,
            todayCheckIns,
            todayCheckOuts
        });
    };

    // Calculate angle for circular progress
    const getCircleProgress = (percentage) => {
        const radius = 70;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;
        return { circumference, offset };
    };

    const circleProgress = getCircleProgress(occupancyRate);

    return (
        <div className="dashboard-home">
            {/* Room Statistics Section */}
            <div className="statistics-section">
                <h2 className="section-title">Room Statistics</h2>
                <div className="stats-grid">
                    {/* Total Rooms */}
                    <div className="stat-card stat-card-total">
                        <div className="stat-icon">
                            <span className="icon-bed">🛏️</span>
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Total Rooms</div>
                            <div className="stat-value">{roomStats.total}</div>
                        </div>
                    </div>

                    {/* Occupied Rooms */}
                    <div className="stat-card stat-card-occupied">
                        <div className="stat-icon">
                            <span className="icon-bed">🛏️</span>
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Occupied Rooms</div>
                            <div className="stat-value">{roomStats.occupied}</div>
                        </div>
                    </div>

                    {/* Booked Rooms */}
                    <div className="stat-card stat-card-booked">
                        <div className="stat-icon">
                            <span className="icon-calendar">📅</span>
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Booked Rooms</div>
                            <div className="stat-value">{roomStats.booked}</div>
                        </div>
                    </div>

                    {/* Available Rooms */}
                    <div className="stat-card stat-card-available">
                        <div className="stat-icon">
                            <span className="icon-check">✓</span>
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Available Rooms</div>
                            <div className="stat-value">{roomStats.available}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Guest Statistics Section */}
            <div className="statistics-section">
                <h2 className="section-title">Guest Statistics</h2>
                <div className="stats-grid stats-grid-three">
                    {/* Current Guests */}
                    <div className="stat-card stat-card-current-guests">
                        <div className="stat-icon">
                            <span className="icon-person">👤</span>
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Current Guests</div>
                            <div className="stat-value">{guestStats.currentGuests}</div>
                        </div>
                    </div>

                    {/* Today's Check-ins */}
                    <div className="stat-card stat-card-checkin">
                        <div className="stat-icon">
                            <span className="icon-calendar">📅</span>
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Today's Check-ins</div>
                            <div className="stat-value">{guestStats.todayCheckIns}</div>
                        </div>
                    </div>

                    {/* Today's Check-outs */}
                    <div className="stat-card stat-card-checkout">
                        <div className="stat-icon">
                            <span className="icon-exit">🚪</span>
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Today's Check-outs</div>
                            <div className="stat-value">{guestStats.todayCheckOuts}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-container">
                {/* Occupancy Rate Chart */}
                <div className="chart-card">
                    <h3 className="chart-title">Occupancy Rate</h3>
                    <div className="circular-chart-container">
                        <div className="circular-chart">
                            <svg width="200" height="200" viewBox="0 0 200 200">
                                {/* Background circle */}
                                <circle
                                    cx="100"
                                    cy="100"
                                    r="70"
                                    fill="none"
                                    stroke="#f3f4f6"
                                    strokeWidth="20"
                                />
                                {/* Progress circle */}
                                <circle
                                    cx="100"
                                    cy="100"
                                    r="70"
                                    fill="none"
                                    stroke="#ef4444"
                                    strokeWidth="20"
                                    strokeDasharray={circleProgress.circumference}
                                    strokeDashoffset={circleProgress.offset}
                                    strokeLinecap="round"
                                    transform="rotate(-90 100 100)"
                                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                                />
                            </svg>
                            <div className="chart-center-text">
                                <div className="chart-percentage">{occupancyRate}%</div>
                                <div className="chart-label">Occupied</div>
                            </div>
                        </div>
                        <div className="chart-legend">
                            <div className="legend-item">
                                <span className="legend-color legend-occupied"></span>
                                <span className="legend-label">Occupied</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-color legend-booked"></span>
                                <span className="legend-label">Booked</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-color legend-available-chart"></span>
                                <span className="legend-label">Available</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Room Status Distribution Chart */}
                <div className="chart-card">
                    <h3 className="chart-title">Room Status Distribution</h3>
                    <div className="distribution-chart-container">
                        <div className="horizontal-bar">
                            {roomStats.occupied > 0 && (
                                <div 
                                    className="bar-segment bar-occupied" 
                                    style={{ width: `${(roomStats.occupied / roomStats.total) * 100}%` }}
                                >
                                    <span className="bar-value">{roomStats.occupied}</span>
                                    <span className="bar-label">Occupied</span>
                                </div>
                            )}
                            {roomStats.booked > 0 && (
                                <div 
                                    className="bar-segment bar-booked" 
                                    style={{ width: `${(roomStats.booked / roomStats.total) * 100}%` }}
                                >
                                    <span className="bar-value">{roomStats.booked}</span>
                                </div>
                            )}
                            {roomStats.available > 0 && (
                                <div 
                                    className="bar-segment bar-available" 
                                    style={{ width: `${(roomStats.available / roomStats.total) * 100}%` }}
                                >
                                    <span className="bar-value">{roomStats.available}</span>
                                </div>
                            )}
                        </div>
                        <div className="distribution-legend">
                            <div className="legend-row">
                                <div className="legend-item">
                                    <span className="legend-color legend-occupied"></span>
                                    <span className="legend-label">Occupied</span>
                                </div>
                                <div className="legend-item">
                                    <span className="legend-color legend-booked"></span>
                                    <span className="legend-label">Booked</span>
                                </div>
                                <div className="legend-item">
                                    <span className="legend-color legend-available-chart"></span>
                                    <span className="legend-label">Available</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
