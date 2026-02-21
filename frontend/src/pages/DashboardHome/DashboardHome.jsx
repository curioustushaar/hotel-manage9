import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API_URL from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import './DashboardHome.css';

const DashboardHome = () => {
    const { user } = useAuth();
    const isStaff = user?.role === 'staff';
    const [roomStats, setRoomStats] = useState({
        total: 0,
        occupied: 0,
        booked: 0,
        available: 0
    });

    const [guestStats, setGuestStats] = useState({
        currentGuests: 0,
        todayCheckIns: 0,
        todayCheckOuts: 0,
        upcomingBookings: 0
    });

    const [occupancyRate, setOccupancyRate] = useState(0);

    // New state for advanced dashboard metrics
    const [arrivalStats, setArrivalStats] = useState({
        total: 4,
        pending: 3,
        arrived: 1
    });

    const [departureStats, setDepartureStats] = useState({
        total: 3,
        pending: 2,
        checkOut: 1
    });

    const [guestInHouse, setGuestInHouse] = useState({
        total: 3,
        adults: 2,
        children: 1
    });

    const [advancedOccupancy, setAdvancedOccupancy] = useState({
        today: 75,
        tomorrow: 0,
        thisMonth: 12.5,
        todayOccupied: 9,
        todayBooked: 9,
        tomorrowBooked: 1,
        monthBooked: 2,
        monthAvailable: 2
    });

    const [upcomingReservations, setUpcomingReservations] = useState({
        today: 1,
        tomorrow: 0,
        next7Days: 0
    });

    const [revenue, setRevenue] = useState({
        total: 6250,
        today: 6250,
        yesterday: 0,
        avgDailyRate: 1604.51,
        yesterdayAvgRate: 6097.56,
        receipts: {
            cash: 6250,
            card: 0,
            diCard: 0,
            bank: 0
        }
    });

    useEffect(() => {
        // Initial load
        calculateStatistics();

        // Auto-refresh every 60 seconds to show real-time updates
        const interval = setInterval(() => {
            calculateStatistics();
        }, 60000);

        // Cleanup interval on unmount
        return () => clearInterval(interval);
    }, []);

    const calculateStatistics = async () => {
        try {
            // Fetch rooms from MongoDB API
            const roomsResponse = await fetch(`${API_URL}/api/rooms/list`);
            const roomsData = await roomsResponse.json();
            const rooms = roomsData.success ? roomsData.data : [];

            // Fetch bookings from MongoDB API
            const bookingsResponse = await fetch(`${API_URL}/api/bookings/list`);
            const bookingsData = await bookingsResponse.json();
            const bookings = bookingsData.success ? bookingsData.data : [];

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

            // Calculate guest statistics from bookings
            const today = new Date().toISOString().split('T')[0];

            // Current guests (Checked-in bookings)
            const currentGuests = bookings.filter(booking => booking.status === 'Checked-in').length;

            // Today's check-ins (bookings with check-in date today)
            const todayCheckIns = bookings.filter(booking => {
                const checkInDate = new Date(booking.checkInDate).toISOString().split('T')[0];
                return checkInDate === today;
            }).length;

            // Today's check-outs (bookings with check-out date today)
            const todayCheckOuts = bookings.filter(booking => {
                const checkOutDate = new Date(booking.checkOutDate).toISOString().split('T')[0];
                return checkOutDate === today;
            }).length;

            // Upcoming bookings (status = Upcoming)
            const upcomingBookings = bookings.filter(booking => booking.status === 'Upcoming').length;

            setGuestStats({
                currentGuests,
                todayCheckIns,
                todayCheckOuts,
                upcomingBookings
            });
        } catch (error) {
            console.error('Error fetching statistics:', error);
            // Set default values on error
            setRoomStats({ total: 0, occupied: 0, booked: 0, available: 0 });
            setGuestStats({ currentGuests: 0, todayCheckIns: 0, todayCheckOuts: 0, upcomingBookings: 0 });
            setOccupancyRate(0);
        }
    };

    // Calculate angle for circular progress
    const getCircleProgress = (percentage) => {
        const radius = 70;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;
        return { circumference, offset };
    };

    const circleProgress = getCircleProgress(occupancyRate);

    // Calculate donut chart segments
    const getDonutSegments = (values) => {
        const total = values.reduce((sum, val) => sum + val, 0);
        if (total === 0) return [];

        let currentAngle = -90;
        return values.map((value, index) => {
            const percentage = (value / total) * 100;
            const angle = (percentage / 100) * 360;
            const segment = {
                percentage,
                startAngle: currentAngle,
                endAngle: currentAngle + angle,
                value
            };
            currentAngle += angle;
            return segment;
        });
    };

    // Calculate gauge progress
    const getGaugeProgress = (percentage) => {
        const radius = 60;
        const circumference = Math.PI * radius; // Semi-circle
        const offset = circumference - (percentage / 100) * circumference;
        return { circumference, offset };
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="dashboard-home"
        >
            {/* Room Statistics Section */}
            <div className="statistics-section">
                <h2 className="section-title">Room Statistics</h2>
                <div className="stats-grid">
                    {/* Total Rooms */}
                    <div className="stat-card stat-card-total">
                        <div className="stat-icon">
                            <span className="icon-bed"></span>
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Total Rooms</div>
                            <div className="stat-value">{roomStats.total}</div>
                        </div>
                    </div>

                    {/* Occupied Rooms */}
                    <div className="stat-card stat-card-occupied">
                        <div className="stat-icon">
                            <span className="icon-bed"></span>
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Occupied Rooms</div>
                            <div className="stat-value">{roomStats.occupied}</div>
                        </div>
                    </div>

                    {/* Booked Rooms */}
                    <div className="stat-card stat-card-booked">
                        <div className="stat-icon">
                            <span className="icon-calendar"></span>
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Booked Rooms</div>
                            <div className="stat-value">{roomStats.booked}</div>
                        </div>
                    </div>

                    {/* Available Rooms */}
                    <div className="stat-card stat-card-available">
                        <div className="stat-icon">
                            <span className="icon-check"></span>
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
                <h2 className="section-title">Booking Statistics</h2>
                <div className="stats-grid">
                    {/* Current Guests */}
                    <div className="stat-card stat-card-current-guests">
                        <div className="stat-icon">
                            <span className="icon-person"></span>
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Current Guests</div>
                            <div className="stat-value">{guestStats.currentGuests}</div>
                        </div>
                    </div>

                    {/* Today's Check-ins */}
                    <div className="stat-card stat-card-checkin">
                        <div className="stat-icon">
                            <span className="icon-calendar"></span>
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Today's Check-ins</div>
                            <div className="stat-value">{guestStats.todayCheckIns}</div>
                        </div>
                    </div>

                    {/* Today's Check-outs */}
                    <div className="stat-card stat-card-checkout">
                        <div className="stat-icon">
                            <span className="icon-exit"></span>
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Today's Check-outs</div>
                            <div className="stat-value">{guestStats.todayCheckOuts}</div>
                        </div>
                    </div>

                    {/* Upcoming Bookings */}
                    <div className="stat-card stat-card-upcoming">
                        <div className="stat-icon">
                            <span className="icon-clock"></span>
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Upcoming Bookings</div>
                            <div className="stat-value">{guestStats.upcomingBookings}</div>
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
                                {/* Progress circle - Red */}
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

            {/* ========== SEPARATOR ========== */}
            <div className="dashboard-separator">
                <div className="separator-line"></div>
                <div className="separator-line"></div>
            </div>

            {/* ========== NEW ZOTAKI STYLE DASHBOARD ========== */}
            <div className="zotaki-dashboard-wrapper">

                {/* Top Stats Cards with Donut Charts */}
                <div className="donut-stats-grid">
                    {/* Arrival Card */}
                    <div className="donut-stat-card arrival-card">
                        <div className="donut-card-header">
                            <h3>Arrival</h3>
                        </div>
                        <div className="donut-chart-wrapper">
                            <svg width="140" height="140" viewBox="0 0 140 140">
                                <circle cx="70" cy="70" r="50" fill="none" stroke="#f3f4f6" strokeWidth="16" />
                                {/* Pending segment (75%) */}
                                <circle
                                    cx="70"
                                    cy="70"
                                    r="50"
                                    fill="none"
                                    stroke="#fb923c"
                                    strokeWidth="16"
                                    strokeDasharray={`${(arrivalStats.pending / arrivalStats.total) * 314} 314`}
                                    strokeDashoffset="0"
                                    transform="rotate(-90 70 70)"
                                />
                                {/* Arrived segment (25%) */}
                                <circle
                                    cx="70"
                                    cy="70"
                                    r="50"
                                    fill="none"
                                    stroke="#86efac"
                                    strokeWidth="16"
                                    strokeDasharray={`${(arrivalStats.arrived / arrivalStats.total) * 314} 314`}
                                    strokeDashoffset={-((arrivalStats.pending / arrivalStats.total) * 314)}
                                    transform="rotate(-90 70 70)"
                                />
                            </svg>
                            <div className="donut-center-value">{arrivalStats.total}</div>
                        </div>
                        <div className="donut-legend">
                            <div className="donut-legend-item">
                                <span className="dot" style={{ background: '#fb923c' }}></span>
                                <span>Pending ({arrivalStats.pending})</span>
                            </div>
                            <div className="donut-legend-item">
                                <span className="dot" style={{ background: '#86efac' }}></span>
                                <span>Arrived ({arrivalStats.arrived})</span>
                            </div>
                        </div>
                    </div>

                    {/* Departure Card */}
                    <div className="donut-stat-card departure-card">
                        <div className="donut-card-header">
                            <h3>Departure</h3>
                        </div>
                        <div className="donut-chart-wrapper">
                            <svg width="140" height="140" viewBox="0 0 140 140">
                                <circle cx="70" cy="70" r="50" fill="none" stroke="#f3f4f6" strokeWidth="16" />
                                {/* Pending segment */}
                                <circle
                                    cx="70"
                                    cy="70"
                                    r="50"
                                    fill="none"
                                    stroke="#fb923c"
                                    strokeWidth="16"
                                    strokeDasharray={`${(departureStats.pending / departureStats.total) * 314} 314`}
                                    strokeDashoffset="0"
                                    transform="rotate(-90 70 70)"
                                />
                                {/* Check Out segment */}
                                <circle
                                    cx="70"
                                    cy="70"
                                    r="50"
                                    fill="none"
                                    stroke="#ef4444"
                                    strokeWidth="16"
                                    strokeDasharray={`${(departureStats.checkOut / departureStats.total) * 314} 314`}
                                    strokeDashoffset={-((departureStats.pending / departureStats.total) * 314)}
                                    transform="rotate(-90 70 70)"
                                />
                            </svg>
                            <div className="donut-center-value">{departureStats.total}</div>
                        </div>
                        <div className="donut-legend">
                            <div className="donut-legend-item">
                                <span className="dot" style={{ background: '#fb923c' }}></span>
                                <span>Pending ({departureStats.pending})</span>
                            </div>
                            <div className="donut-legend-item">
                                <span className="dot" style={{ background: '#ef4444' }}></span>
                                <span>Check Out ({departureStats.checkOut})</span>
                            </div>
                        </div>
                    </div>

                    {/* Guest In House Card */}
                    <div className="donut-stat-card guest-house-card">
                        <div className="donut-card-header">
                            <h3>Guest In House</h3>
                        </div>
                        <div className="donut-chart-wrapper">
                            <svg width="140" height="140" viewBox="0 0 140 140">
                                <circle cx="70" cy="70" r="50" fill="none" stroke="#f3f4f6" strokeWidth="16" />
                                {/* Adults segment */}
                                <circle
                                    cx="70"
                                    cy="70"
                                    r="50"
                                    fill="none"
                                    stroke="#ef4444"
                                    strokeWidth="16"
                                    strokeDasharray={`${(guestInHouse.adults / guestInHouse.total) * 314} 314`}
                                    strokeDashoffset="0"
                                    transform="rotate(-90 70 70)"
                                />
                                {/* Children segment */}
                                <circle
                                    cx="70"
                                    cy="70"
                                    r="50"
                                    fill="none"
                                    stroke="#7c3aed"
                                    strokeWidth="16"
                                    strokeDasharray={`${(guestInHouse.children / guestInHouse.total) * 314} 314`}
                                    strokeDashoffset={-((guestInHouse.adults / guestInHouse.total) * 314)}
                                    transform="rotate(-90 70 70)"
                                />
                            </svg>
                            <div className="donut-center-value">{guestInHouse.total}</div>
                        </div>
                        <div className="donut-legend">
                            <div className="donut-legend-item">
                                <span className="dot" style={{ background: '#ef4444' }}></span>
                                <span>Adults ({guestInHouse.adults})</span>
                            </div>
                            <div className="donut-legend-item">
                                <span className="dot" style={{ background: '#7c3aed' }}></span>
                                <span>Children ({guestInHouse.children})</span>
                            </div>
                        </div>
                    </div>

                    {/* Room Status Card */}
                    <div className="donut-stat-card room-status-card">
                        <div className="donut-card-header">
                            <h3>Room Status</h3>
                        </div>
                        <div className="donut-chart-wrapper">
                            <svg width="140" height="140" viewBox="0 0 140 140">
                                <circle cx="70" cy="70" r="50" fill="none" stroke="#f3f4f6" strokeWidth="16" />
                                {/* Vacant segment */}
                                <circle
                                    cx="70"
                                    cy="70"
                                    r="50"
                                    fill="none"
                                    stroke="#ef4444"
                                    strokeWidth="16"
                                    strokeDasharray={`${(1 / roomStats.total) * 314} 314`}
                                    strokeDashoffset="0"
                                    transform="rotate(-90 70 70)"
                                />
                                {/* Booked segment */}
                                <circle
                                    cx="70"
                                    cy="70"
                                    r="50"
                                    fill="none"
                                    stroke="#10b981"
                                    strokeWidth="16"
                                    strokeDasharray={`${(roomStats.booked / roomStats.total) * 314} 314`}
                                    strokeDashoffset={-((1 / roomStats.total) * 314)}
                                    transform="rotate(-90 70 70)"
                                />
                            </svg>
                            <div className="donut-center-value">{roomStats.total}</div>
                        </div>
                        <div className="donut-legend">
                            <div className="donut-legend-item">
                                <span className="dot" style={{ background: '#ef4444' }}></span>
                                <span>Vacant ({roomStats.available})</span>
                            </div>
                            <div className="donut-legend-item">
                                <span className="dot" style={{ background: '#10b981' }}></span>
                                <span>Booked ({roomStats.booked})</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle Section - Occupancy Rate & Upcoming Reservations */}
                <div className="middle-section-grid">
                    {/* Occupancy Rate Gauges */}
                    <div className="occupancy-gauges-card">
                        <div className="gauge-card-header">
                            <h3>Occupancy Rate</h3>
                        </div>
                        <div className="gauges-container">
                            {/* Today Gauge */}
                            <div className="gauge-item">
                                <div className="gauge-chart">
                                    <svg width="220" height="138" viewBox="0 0 220 138">
                                        {/* Background arc */}
                                        <path
                                            d="M 27.5 110 A 82.5 82.5 0 0 1 192.5 110"
                                            fill="none"
                                            stroke="#f3f4f6"
                                            strokeWidth="22"
                                        />
                                        {/* Progress arc - Orange/Yellow */}
                                        <path
                                            d="M 27.5 110 A 82.5 82.5 0 0 1 192.5 110"
                                            fill="none"
                                            stroke="#fb923c"
                                            strokeWidth="22"
                                            strokeDasharray={`${259 * (advancedOccupancy.today / 100)} 259`}
                                            strokeDashoffset="0"
                                        />
                                        {/* Percentage text */}
                                        <text x="110" y="89" textAnchor="middle" fontSize="38" fontWeight="bold" fill="#1f2937">
                                            {advancedOccupancy.today}%
                                        </text>
                                    </svg>
                                </div>
                                <div className="gauge-footer">
                                    <div className="gauge-label">Today</div>
                                    <div className="gauge-stats">
                                        <span className="gauge-stat"><span className="dot" style={{ background: '#ef4444' }}></span> {advancedOccupancy.todayOccupied}</span>
                                        <span className="gauge-stat"><span className="dot" style={{ background: '#fb923c' }}></span> {advancedOccupancy.todayBooked} Booked</span>
                                    </div>
                                </div>
                            </div>

                            {/* Tomorrow Gauge */}
                            <div className="gauge-item">
                                <div className="gauge-chart">
                                    <svg width="220" height="138" viewBox="0 0 220 138">
                                        {/* Background arc */}
                                        <path
                                            d="M 27.5 110 A 82.5 82.5 0 0 1 192.5 110"
                                            fill="none"
                                            stroke="#f3f4f6"
                                            strokeWidth="22"
                                        />
                                        {/* Progress arc - Orange */}
                                        <path
                                            d="M 27.5 110 A 82.5 82.5 0 0 1 192.5 110"
                                            fill="none"
                                            stroke="#fb923c"
                                            strokeWidth="22"
                                            strokeDasharray={`${259 * (advancedOccupancy.tomorrow / 100)} 259`}
                                            strokeDashoffset="0"
                                        />
                                        {/* Percentage text */}
                                        <text x="110" y="89" textAnchor="middle" fontSize="38" fontWeight="bold" fill="#1f2937">
                                            {advancedOccupancy.tomorrow}%
                                        </text>
                                    </svg>
                                </div>
                                <div className="gauge-footer">
                                    <div className="gauge-label">Tomorrow</div>
                                    <div className="gauge-stats">
                                        <span className="gauge-stat"><span className="dot" style={{ background: '#fb923c' }}></span> {advancedOccupancy.tomorrowBooked} Booked</span>
                                        <span className="gauge-stat"><span className="dot" style={{ background: '#10b981' }}></span> Booked</span>
                                    </div>
                                </div>
                            </div>

                            {/* This Month Gauge */}
                            <div className="gauge-item">
                                <div className="gauge-chart">
                                    <svg width="220" height="138" viewBox="0 0 220 138">
                                        {/* Background arc */}
                                        <path
                                            d="M 27.5 110 A 82.5 82.5 0 0 1 192.5 110"
                                            fill="none"
                                            stroke="#f3f4f6"
                                            strokeWidth="22"
                                        />
                                        {/* Progress arc - Green */}
                                        <path
                                            d="M 27.5 110 A 82.5 82.5 0 0 1 192.5 110"
                                            fill="none"
                                            stroke="#10b981"
                                            strokeWidth="22"
                                            strokeDasharray={`${259 * (advancedOccupancy.thisMonth / 100)} 259`}
                                            strokeDashoffset="0"
                                        />
                                        {/* Percentage text */}
                                        <text x="110" y="89" textAnchor="middle" fontSize="38" fontWeight="bold" fill="#1f2937">
                                            {advancedOccupancy.thisMonth}%
                                        </text>
                                    </svg>
                                </div>
                                <div className="gauge-footer">
                                    <div className="gauge-label">This Month</div>
                                    <div className="gauge-stats">
                                        <span className="gauge-stat"><span className="dot" style={{ background: '#ef4444' }}></span> {advancedOccupancy.monthBooked} Available</span>
                                        <span className="gauge-stat"><span className="dot" style={{ background: '#10b981' }}></span> Booked</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Reservations */}
                    <div className="upcoming-reservations-card">
                        <div className="reservations-header">
                            <h3>Upcoming Reservations</h3>
                        </div>
                        <div className="reservations-grid">
                            <div className="reservation-item today-item">
                                <div className="reservation-label">Today</div>
                                <div className="reservation-value">{upcomingReservations.today}</div>
                                <div className="reservation-icon"></div>
                            </div>
                            <div className="reservation-item tomorrow-item">
                                <div className="reservation-label">Tomorrow</div>
                                <div className="reservation-value">{upcomingReservations.tomorrow}</div>
                                <div className="reservation-icon"></div>
                            </div>
                            <div className="reservation-item week-item">
                                <div className="reservation-label">Next 7 Days</div>
                                <div className="reservation-value">{upcomingReservations.next7Days}</div>
                                <div className="reservation-icon"></div>
                            </div>
                            <div className="reservation-item total-item">
                                <div className="reservation-label"></div>
                                <div className="reservation-value">{upcomingReservations.next7Days}</div>
                                <div className="reservation-icon"></div>
                            </div>
                        </div>
                        <div className="payment-methods">
                            <div className="payment-item">
                                <span className="dot" style={{ background: '#ef4444' }}></span>
                                <span>Cash</span>
                            </div>
                            <div className="payment-item">
                                <span className="dot" style={{ background: '#fb923c' }}></span>
                                <span>Ode</span>
                            </div>
                            <div className="payment-item">
                                <span className="dot" style={{ background: '#10b981' }}></span>
                                <span>Di Card</span>
                            </div>
                            <div className="payment-item">
                                <span className="dot" style={{ background: '#22d3ee' }}></span>
                                <span>Bank</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Revenue and Analytics Section - Hidden for Staff */}
                {!isStaff && (
                    <div className="revenue-analytics-section">
                        {/* Revenue Cards Row */}
                        <div className="revenue-stats-grid">
                            {/* Total Revenue Card */}
                            <div className="revenue-stat-card total-revenue-card">
                                <h3>Total Revenue</h3>
                                <div className="revenue-main-value">6250</div>
                                <div className="revenue-sub-text">Today: 0</div>
                                <div className="revenue-percentage">
                                    <span className="percentage-badge">-61%</span>
                                </div>
                            </div>

                            {/* Revenue Breakup Card */}
                            <div className="revenue-stat-card breakup-card">
                                <h3>Revenue Breakup</h3>
                                <div className="revenue-main-value">RS 6250</div>
                                <div className="breakup-grid">
                                    <div className="breakup-item">
                                        <span className="breakup-label">Rooms</span>
                                        <span className="breakup-value">6S250</span>
                                    </div>
                                    <div className="breakup-item">
                                        <span className="breakup-label">Restaurant</span>
                                        <span className="breakup-value">0</span>
                                        <span className="breakup-icon"></span>
                                    </div>
                                    <div className="breakup-item">
                                        <span className="breakup-label">Fragoas</span>
                                        <span className="breakup-value">0</span>
                                        <span className="breakup-icon"></span>
                                    </div>
                                    <div className="breakup-item">
                                        <span className="breakup-label">Other</span>
                                        <span className="breakup-value">0.0</span>
                                        <span className="breakup-icon"></span>
                                    </div>
                                </div>
                            </div>

                            {/* Average Daily Room Rate Card */}
                            <div className="revenue-stat-card avg-rate-card">
                                <h3>Average Daily Room Rate</h3>
                                <div className="revenue-main-value">1604.51</div>
                                <div className="revenue-sub-text">Yesterday: RS 6097.56</div>
                                <div className="revenue-percentage negative">
                                    <span className="percentage-badge">📉 -73.6%</span>
                                </div>
                            </div>

                            {/* Total Receipts Card */}
                            <div className="revenue-stat-card receipts-card">
                                <h3>Total Receipts</h3>
                                <div className="revenue-main-value">RS 6250</div>
                                <div className="receipts-detail">
                                    <div className="receipt-row">
                                        <span>Cash</span>
                                        <span className="receipt-amount">RS 6250</span>
                                    </div>
                                    <div className="receipt-row">
                                        <span>💳 0</span>
                                    </div>
                                    <div className="receipt-row">
                                        <span>Orline</span>
                                        <span className="receipt-amount">0</span>
                                    </div>
                                    <div className="receipt-row">
                                        <span>🚫 0</span>
                                        <span>💵 0</span>
                                    </div>
                                    <div className="receipt-legend">
                                        <span><span className="dot" style={{ background: '#ef4444' }}></span> Cams</span>
                                        <span><span className="dot" style={{ background: '#fb923c' }}></span> Onae</span>
                                        <span><span className="dot" style={{ background: '#10b981' }}></span> -23.5%</span>
                                        <span><span className="dot" style={{ background: '#9ca3af' }}></span> Bank</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Charts Row */}
                        <div className="analytics-charts-row">
                            {/* Housekeeping Status Chart */}
                            <div className="chart-card-analytics housekeeping-chart">
                                <h3>Housekeeping Status</h3>
                                <div className="bar-chart-container">
                                    <svg width="100%" height="300" viewBox="0 0 600 300">
                                        {/* Grid lines */}
                                        <line x1="50" y1="250" x2="550" y2="250" stroke="#e5e7eb" strokeWidth="1" />
                                        <line x1="50" y1="200" x2="550" y2="200" stroke="#e5e7eb" strokeWidth="1" />
                                        <line x1="50" y1="150" x2="550" y2="150" stroke="#e5e7eb" strokeWidth="1" />
                                        <line x1="50" y1="100" x2="550" y2="100" stroke="#e5e7eb" strokeWidth="1" />
                                        <line x1="50" y1="50" x2="550" y2="50" stroke="#e5e7eb" strokeWidth="1" />

                                        {/* Y-axis labels */}
                                        <text x="30" y="255" fontSize="12" fill="#6b7280">0</text>
                                        <text x="30" y="205" fontSize="12" fill="#6b7280">4</text>
                                        <text x="30" y="155" fontSize="12" fill="#6b7280">6</text>
                                        <text x="30" y="105" fontSize="12" fill="#6b7280">12</text>
                                        <text x="30" y="55" fontSize="12" fill="#6b7280">10</text>

                                        {/* Bars */}
                                        <rect x="70" y="100" width="30" height="150" fill="#ef4444" rx="4" />
                                        <rect x="130" y="240" width="30" height="10" fill="#ef4444" rx="4" />
                                        <rect x="190" y="240" width="30" height="10" fill="#ef4444" rx="4" />
                                        <rect x="250" y="240" width="30" height="10" fill="#ef4444" rx="4" />
                                        <rect x="310" y="240" width="30" height="10" fill="#ef4444" rx="4" />
                                        <rect x="370" y="240" width="30" height="10" fill="#ef4444" rx="4" />
                                        <rect x="430" y="240" width="30" height="10" fill="#ef4444" rx="4" />
                                        <rect x="490" y="240" width="30" height="10" fill="#ef4444" rx="4" />

                                        {/* X-axis labels */}
                                        <text x="75" y="270" fontSize="12" fill="#6b7280">1</text>
                                        <text x="135" y="270" fontSize="12" fill="#6b7280">2</text>
                                        <text x="195" y="270" fontSize="12" fill="#6b7280">3</text>
                                        <text x="255" y="270" fontSize="12" fill="#6b7280">6</text>
                                        <text x="315" y="270" fontSize="12" fill="#6b7280">6</text>
                                        <text x="375" y="270" fontSize="12" fill="#6b7280">17</text>
                                        <text x="435" y="270" fontSize="12" fill="#6b7280">12</text>
                                        <text x="495" y="270" fontSize="12" fill="#6b7280">12</text>

                                        <text x="560" y="270" fontSize="12" fill="#6b7280">13</text>
                                        <text x="600" y="270" fontSize="12" fill="#6b7280">14</text>
                                    </svg>
                                </div>
                            </div>

                            {/* Rooms Availability Chart */}
                            <div className="chart-card-analytics availability-chart">
                                <div className="chart-header-row">
                                    <h3>Rooms Availability</h3>
                                    <div className="date-range">From: 01-02-2028 <span className="next-days">+Next 14 Days</span></div>
                                </div>
                                <div className="bar-chart-container">
                                    <svg width="100%" height="300" viewBox="0 0 700 300">
                                        {/* Grid lines */}
                                        <line x1="50" y1="250" x2="650" y2="250" stroke="#e5e7eb" strokeWidth="1" />
                                        <line x1="50" y1="200" x2="650" y2="200" stroke="#e5e7eb" strokeWidth="1" />
                                        <line x1="50" y1="150" x2="650" y2="150" stroke="#e5e7eb" strokeWidth="1" />
                                        <line x1="50" y1="100" x2="650" y2="100" stroke="#e5e7eb" strokeWidth="1" />
                                        <line x1="50" y1="50" x2="650" y2="50" stroke="#e5e7eb" strokeWidth="1" />

                                        {/* Y-axis labels */}
                                        <text x="30" y="255" fontSize="12" fill="#6b7280">0</text>
                                        <text x="30" y="205" fontSize="12" fill="#6b7280">2</text>
                                        <text x="30" y="155" fontSize="12" fill="#6b7280">4</text>
                                        <text x="30" y="105" fontSize="12" fill="#6b7280">6</text>
                                        <text x="30" y="55" fontSize="12" fill="#6b7280">10</text>

                                        {/* Bars - Availability Chart */}
                                        <rect x="70" y="210" width="35" height="40" fill="#10b981" rx="4" />
                                        <rect x="115" y="200" width="35" height="50" fill="#10b981" rx="4" />
                                        <rect x="160" y="190" width="35" height="60" fill="#10b981" rx="4" />
                                        <rect x="205" y="180" width="35" height="70" fill="#10b981" rx="4" />
                                        <rect x="250" y="170" width="35" height="80" fill="#10b981" rx="4" />
                                        <rect x="295" y="160" width="35" height="90" fill="#10b981" rx="4" />
                                        <rect x="340" y="150" width="35" height="100" fill="#10b981" rx="4" />
                                        <rect x="385" y="140" width="35" height="110" fill="#10b981" rx="4" />
                                        <rect x="430" y="130" width="35" height="120" fill="#10b981" rx="4" />
                                        <rect x="475" y="120" width="35" height="130" fill="#10b981" rx="4" />
                                        <rect x="520" y="110" width="35" height="140" fill="#10b981" rx="4" />
                                        <rect x="565" y="100" width="35" height="150" fill="#10b981" rx="4" />

                                        {/* X-axis labels */}
                                        <text x="72" y="270" fontSize="11" fill="#6b7280">Day</text>
                                        <text x="115" y="270" fontSize="11" fill="#6b7280">Tun</text>
                                        <text x="160" y="270" fontSize="11" fill="#6b7280">Way</text>
                                        <text x="205" y="270" fontSize="11" fill="#6b7280">Tho</text>
                                        <text x="250" y="270" fontSize="11" fill="#6b7280">Thu</text>
                                        <text x="297" y="270" fontSize="11" fill="#6b7280">Jat</text>
                                        <text x="342" y="270" fontSize="11" fill="#6b7280">Day</text>
                                        <text x="387" y="270" fontSize="11" fill="#6b7280">Thu</text>
                                        <text x="432" y="270" fontSize="11" fill="#6b7280">Thu</text>
                                        <text x="477" y="270" fontSize="11" fill="#6b7280">Jao</text>
                                        <text x="522" y="270" fontSize="11" fill="#6b7280">Jaf</text>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* End of Zotaki Dashboard */}
        </motion.div>
    );
};

export default DashboardHome;
