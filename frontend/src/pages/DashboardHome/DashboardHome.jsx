import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    BedDouble,
    CalendarCheck,
    CheckCircle,
    Users,
    Clock,
    LogIn,
    LogOut
} from 'lucide-react';
import API_URL from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import './DashboardHome.css';

const DashboardHome = () => {
    const navigate = useNavigate();
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
        total: 0,
        today: 0,
        yesterday: 0,
        avgDailyRate: 0,
        yesterdayAvgRate: 0,
        receipts: {
            cash: 0,
            card: 0,
            diCard: 0,
            bank: 0
        }
    });

    const [housekeepingStats, setHousekeepingStats] = useState({
        clean: 0,
        dirty: 0,
        inspection: 0
    });

    const [roomAvailability, setRoomAvailability] = useState([]);
    const [revenueBreakup, setRevenueBreakup] = useState({
        rooms: 0,
        restaurant: 0,
        other: 0
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

    // Helper: normalize booking statuses
    const isCheckedIn = (status) => ['Checked-in', 'CheckedIn', 'IN_HOUSE'].includes(status);
    const isCheckedOut = (status) => ['Checked-out', 'CheckedOut', 'CHECKED_OUT'].includes(status);
    const isUpcoming = (status) => ['Upcoming', 'Confirmed', 'Pending', 'RESERVED'].includes(status);

    const calculateStatistics = async () => {
        try {
            // 1. Fetch all required data in parallel
            const [roomsRes, bookingsRes, reportRes, ordersRes] = await Promise.all([
                fetch(`${API_URL}/api/rooms/list`),
                fetch(`${API_URL}/api/bookings/list`),
                fetch(`${API_URL}/api/cashier/report`),
                fetch(`${API_URL}/api/guest-meal/orders`)
            ]);

            const [roomsData, bookingsData, reportData, ordersData] = await Promise.all([
                roomsRes.json(),
                bookingsRes.json(),
                reportRes.json(),
                ordersRes.json()
            ]);

            const rooms = roomsData.success ? roomsData.data : [];
            const bookings = bookingsData.success ? bookingsData.data : [];
            const report = reportData.success ? reportData.data : null;
            const allOrders = ordersData.success ? ordersData.data : [];

            // ---- Date helpers ----
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];
            const nextWeek = new Date(now);
            nextWeek.setDate(nextWeek.getDate() + 7);
            const nextWeekStr = nextWeek.toISOString().split('T')[0];
            const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

            // ---- 2. Room Statistics ----
            const total = rooms.length;
            const occupied = rooms.filter(r => r.status === 'Occupied').length;
            const booked = rooms.filter(r => r.status === 'Booked' || r.status === 'Reserved').length;
            const maintenance = rooms.filter(r => r.status === 'Maintenance' || r.status === 'Under Maintenance').length;
            const cleaning = rooms.filter(r => r.status === 'Cleaning').length;
            const available = rooms.filter(r => r.status === 'Available' || r.status === 'Vacant').length;

            setRoomStats({ total, occupied, booked, available });

            // ---- 3. Occupancy Rate ----
            const rate = total > 0 ? Math.round((occupied / total) * 100) : 0;
            setOccupancyRate(rate);

            // ---- 4. Guest & Booking Statistics ----
            const checkedInBookings = bookings.filter(b => isCheckedIn(b.status));
            const currentGuests = checkedInBookings.length;

            const todayCheckIns = bookings.filter(b => {
                const cin = b.checkInDate?.split('T')[0];
                return cin === todayStr;
            }).length;

            const todayCheckOuts = bookings.filter(b => {
                const cout = b.checkOutDate?.split('T')[0];
                return cout === todayStr;
            }).length;

            const upcomingBookings = bookings.filter(b => isUpcoming(b.status)).length;

            setGuestStats({ currentGuests, todayCheckIns, todayCheckOuts, upcomingBookings });

            // ---- 5. Housekeeping Stats ----
            const cleanRooms = rooms.filter(r => r.housekeepingStatus === 'clean' || r.housekeepingStatus === 'Clean').length;
            const dirtyRooms = rooms.filter(r => r.housekeepingStatus === 'dirty' || r.housekeepingStatus === 'Dirty').length;
            const inspectionRooms = rooms.filter(r =>
                r.housekeepingStatus === 'inspection' || r.housekeepingStatus === 'Inspection' ||
                r.housekeepingStatus === 'pending' || r.housekeepingStatus === 'Pending'
            ).length;
            // Rooms without a housekeeping status assigned
            const unassigned = total - cleanRooms - dirtyRooms - inspectionRooms;

            setHousekeepingStats({
                clean: cleanRooms,
                dirty: dirtyRooms,
                inspection: inspectionRooms + (unassigned > 0 ? unassigned : 0)
            });

            // ---- 6. Arrival & Departure Split ----
            const arrivedToday = bookings.filter(b =>
                b.checkInDate?.split('T')[0] === todayStr && isCheckedIn(b.status)
            ).length;
            setArrivalStats({
                total: todayCheckIns,
                pending: Math.max(0, todayCheckIns - arrivedToday),
                arrived: arrivedToday
            });

            const departedToday = bookings.filter(b =>
                b.checkOutDate?.split('T')[0] === todayStr && isCheckedOut(b.status)
            ).length;
            setDepartureStats({
                total: todayCheckOuts,
                pending: Math.max(0, todayCheckOuts - departedToday),
                checkOut: departedToday
            });

            // ---- 7. Guest In House ----
            const adultsInHouse = checkedInBookings.reduce((sum, b) => {
                if (b.duration?.adults) return sum + parseInt(b.duration.adults);
                if (b.adults) return sum + parseInt(b.adults);
                // Check multi-room bookings
                if (b.rooms?.length) return sum + b.rooms.reduce((s, r) => s + (parseInt(r.adults) || 1), 0);
                return sum + 1;
            }, 0);
            const childrenInHouse = checkedInBookings.reduce((sum, b) => {
                if (b.duration?.children) return sum + parseInt(b.duration.children);
                if (b.children) return sum + parseInt(b.children);
                if (b.rooms?.length) return sum + b.rooms.reduce((s, r) => s + (parseInt(r.children) || 0), 0);
                return sum;
            }, 0);
            setGuestInHouse({
                total: adultsInHouse + childrenInHouse,
                adults: adultsInHouse,
                children: childrenInHouse
            });

            // ---- 8. Advanced Occupancy (Today, Tomorrow, Month) ----
            // Tomorrow: count bookings whose stay period includes tomorrow
            const tomorrowOccupied = bookings.filter(b => {
                if (isCheckedOut(b.status) || b.status === 'Cancelled' || b.status === 'NoShow') return false;
                const cin = b.checkInDate?.split('T')[0];
                const cout = b.checkOutDate?.split('T')[0];
                return cin && cout && tomorrowStr >= cin && tomorrowStr < cout;
            }).length;

            // Month: count unique room-nights booked this month
            const monthRoomNights = bookings.reduce((count, b) => {
                if (b.status === 'Cancelled' || b.status === 'NoShow') return count;
                const cin = b.checkInDate?.split('T')[0];
                const cout = b.checkOutDate?.split('T')[0];
                if (!cin || !cout) return count;
                // Count overlapping nights in this month
                const stayStart = cin > thisMonthStart ? cin : thisMonthStart;
                const stayEnd = cout < thisMonthEnd ? cout : thisMonthEnd;
                if (stayStart < stayEnd) {
                    const nights = Math.ceil((new Date(stayEnd) - new Date(stayStart)) / (1000 * 60 * 60 * 24));
                    return count + nights;
                }
                return count;
            }, 0);

            const monthOccupancyRate = total > 0 ? Math.round((monthRoomNights / (total * daysInMonth)) * 100) : 0;
            const tomorrowRate = total > 0 ? Math.round((tomorrowOccupied / total) * 100) : 0;

            setAdvancedOccupancy({
                today: rate,
                tomorrow: tomorrowRate,
                thisMonth: Math.min(monthOccupancyRate, 100),
                todayOccupied: occupied,
                todayBooked: booked,
                tomorrowBooked: tomorrowOccupied,
                monthBooked: monthRoomNights,
                monthAvailable: total * daysInMonth - monthRoomNights
            });

            // ---- 9. Upcoming Reservations ----
            const todayArrivals = bookings.filter(b =>
                b.checkInDate?.split('T')[0] === todayStr && isUpcoming(b.status)
            ).length;
            const tomorrowArrivals = bookings.filter(b =>
                b.checkInDate?.split('T')[0] === tomorrowStr
            ).length;
            const next7Arrivals = bookings.filter(b => {
                const cin = b.checkInDate?.split('T')[0];
                return cin > todayStr && cin <= nextWeekStr;
            }).length;

            setUpcomingReservations({
                today: todayArrivals || todayCheckIns,
                tomorrow: tomorrowArrivals,
                next7Days: next7Arrivals
            });

            // ---- 10. Revenue Data ----
            // Room revenue from bookings
            const roomRevenue = bookings.reduce((sum, b) => {
                if (b.status === 'Cancelled' || b.status === 'NoShow') return sum;
                // Use billing.totalAmount or billing.paidAmount
                const paid = b.billing?.paidAmount || b.billing?.totalAmount || 0;
                return sum + paid;
            }, 0);

            // Restaurant revenue from orders
            const restaurantRevenue = allOrders.reduce((sum, o) => {
                if (o.status === 'Cancelled') return sum;
                return sum + (o.finalAmount || o.totalAmount || 0);
            }, 0);

            // Cashier report data
            const totalCashierRevenue = report ? (report.totalCollections || 0) : 0;
            const yesterdayCashierRevenue = report ? (report.openingBalance || 0) : 0;

            // Use the higher of cashier or calculated
            const totalRev = Math.max(totalCashierRevenue, roomRevenue + restaurantRevenue);

            setRevenueBreakup({
                rooms: roomRevenue,
                restaurant: restaurantRevenue,
                other: Math.max(0, totalRev - roomRevenue - restaurantRevenue)
            });

            setRevenue({
                total: totalRev,
                today: totalCashierRevenue,
                yesterday: yesterdayCashierRevenue,
                avgDailyRate: occupied > 0 ? Math.round((roomRevenue / occupied) * 100) / 100 : 0,
                yesterdayAvgRate: report ? Math.round(((report.openingBalance || 0) / Math.max(occupied, 1)) * 100) / 100 : 0,
                receipts: {
                    cash: report?.paymentsReceived?.cash || 0,
                    card: report?.paymentsReceived?.card || 0,
                    diCard: report?.paymentsReceived?.upi || 0,
                    bank: report?.paymentsReceived?.bankTransfer || 0
                }
            });

            // ---- 11. Rooms Availability for next 14 days ----
            const availabilityData = [];
            for (let i = 0; i < 14; i++) {
                const date = new Date(now);
                date.setDate(date.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                const dayDate = date.getDate();

                // Count rooms booked on this date
                const bookedOnDate = bookings.filter(b => {
                    if (b.status === 'Cancelled' || b.status === 'NoShow') return false;
                    if (isCheckedOut(b.status)) return false;
                    const cin = b.checkInDate?.split('T')[0];
                    const cout = b.checkOutDate?.split('T')[0];
                    return cin && cout && dateStr >= cin && dateStr < cout;
                }).length;

                availabilityData.push({
                    label: `${dayName} ${dayDate}`,
                    available: Math.max(0, total - bookedOnDate),
                    booked: Math.min(bookedOnDate, total),
                    total
                });
            }
            setRoomAvailability(availabilityData);

        } catch (error) {
            console.error('Error fetching statistics:', error);
            // Set default values on error
            setRoomStats({ total: 0, occupied: 0, booked: 0, available: 0 });
            setGuestStats({ currentGuests: 0, todayCheckIns: 0, todayCheckOuts: 0, upcomingBookings: 0 });
            setOccupancyRate(0);
            setArrivalStats({ total: 0, pending: 0, arrived: 0 });
            setDepartureStats({ total: 0, pending: 0, checkOut: 0 });
            setGuestInHouse({ total: 0, adults: 0, children: 0 });
            setAdvancedOccupancy({ today: 0, tomorrow: 0, thisMonth: 0, todayOccupied: 0, todayBooked: 0, tomorrowBooked: 0, monthBooked: 0, monthAvailable: 0 });
            setUpcomingReservations({ today: 0, tomorrow: 0, next7Days: 0 });
            setRevenue({ total: 0, today: 0, yesterday: 0, avgDailyRate: 0, yesterdayAvgRate: 0, receipts: { cash: 0, card: 0, diCard: 0, bank: 0 } });
            setRevenueBreakup({ rooms: 0, restaurant: 0, other: 0 });
            setRoomAvailability([]);
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
                            <BedDouble size={28} strokeWidth={2.5} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Total Rooms</div>
                            <div className="stat-value">{roomStats.total}</div>
                        </div>
                    </div>

                    {/* Occupied Rooms */}
                    <div className="stat-card stat-card-occupied">
                        <div className="stat-icon">
                            <Users size={28} strokeWidth={2.5} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Occupied Rooms</div>
                            <div className="stat-value">{roomStats.occupied}</div>
                        </div>
                    </div>

                    {/* Booked Rooms */}
                    <div className="stat-card stat-card-booked">
                        <div className="stat-icon">
                            <CalendarCheck size={28} strokeWidth={2.5} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Booked Rooms</div>
                            <div className="stat-value">{roomStats.booked}</div>
                        </div>
                    </div>

                    {/* Available Rooms */}
                    <div className="stat-card stat-card-available">
                        <div className="stat-icon">
                            <CheckCircle size={28} strokeWidth={2.5} />
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
                            <Users size={28} strokeWidth={2.5} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Current Guests</div>
                            <div className="stat-value">{guestStats.currentGuests}</div>
                        </div>
                    </div>

                    {/* Today's Check-ins */}
                    <div className="stat-card stat-card-checkin">
                        <div className="stat-icon">
                            <LogIn size={28} strokeWidth={2.5} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Today's Check-ins</div>
                            <div className="stat-value">{guestStats.todayCheckIns}</div>
                        </div>
                    </div>

                    {/* Today's Check-outs */}
                    <div className="stat-card stat-card-checkout">
                        <div className="stat-icon">
                            <LogOut size={28} strokeWidth={2.5} />
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Today's Check-outs</div>
                            <div className="stat-value">{guestStats.todayCheckOuts}</div>
                        </div>
                    </div>

                    {/* Upcoming Bookings */}
                    <div className="stat-card stat-card-upcoming">
                        <div className="stat-icon">
                            <Clock size={28} strokeWidth={2.5} />
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
                                    stroke="#E31E24"
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
                                    strokeDasharray={`${(arrivalStats.pending / (arrivalStats.total || 1)) * 314} 314`}
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
                                    strokeDasharray={`${(arrivalStats.arrived / (arrivalStats.total || 1)) * 314} 314`}
                                    strokeDashoffset={-((arrivalStats.pending / (arrivalStats.total || 1)) * 314)}
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
                                    strokeDasharray={`${(departureStats.pending / (departureStats.total || 1)) * 314} 314`}
                                    strokeDashoffset="0"
                                    transform="rotate(-90 70 70)"
                                />
                                {/* Check Out segment */}
                                <circle
                                    cx="70"
                                    cy="70"
                                    r="50"
                                    fill="none"
                                    stroke="#E31E24"
                                    strokeWidth="16"
                                    strokeDasharray={`${(departureStats.checkOut / (departureStats.total || 1)) * 314} 314`}
                                    strokeDashoffset={-((departureStats.pending / (departureStats.total || 1)) * 314)}
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
                                <span className="dot" style={{ background: '#E31E24' }}></span>
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
                                    stroke="#E31E24"
                                    strokeWidth="16"
                                    strokeDasharray={`${(guestInHouse.adults / (guestInHouse.total || 1)) * 314} 314`}
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
                                    strokeDasharray={`${(guestInHouse.children / (guestInHouse.total || 1)) * 314} 314`}
                                    strokeDashoffset={-((guestInHouse.adults / (guestInHouse.total || 1)) * 314)}
                                    transform="rotate(-90 70 70)"
                                />
                            </svg>
                            <div className="donut-center-value">{guestInHouse.total}</div>
                        </div>
                        <div className="donut-legend">
                            <div className="donut-legend-item">
                                <span className="dot" style={{ background: '#E31E24' }}></span>
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
                                    stroke="#E31E24"
                                    strokeWidth="16"
                                    strokeDasharray={`${(roomStats.available / (roomStats.total || 1)) * 314} 314`}
                                    strokeDashoffset="0"
                                    transform="rotate(-90 70 70)"
                                />
                                {/* Occupied segment */}
                                <circle
                                    cx="70"
                                    cy="70"
                                    r="50"
                                    fill="none"
                                    stroke="#fb923c"
                                    strokeWidth="16"
                                    strokeDasharray={`${(roomStats.occupied / (roomStats.total || 1)) * 314} 314`}
                                    strokeDashoffset={-((roomStats.available / (roomStats.total || 1)) * 314)}
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
                                    strokeDasharray={`${(roomStats.booked / (roomStats.total || 1)) * 314} 314`}
                                    strokeDashoffset={-(((roomStats.available + roomStats.occupied) / (roomStats.total || 1)) * 314)}
                                    transform="rotate(-90 70 70)"
                                />
                            </svg>
                            <div className="donut-center-value">{roomStats.total}</div>
                        </div>
                        <div className="donut-legend">
                            <div className="donut-legend-item">
                                <span className="dot" style={{ background: '#E31E24' }}></span>
                                <span>Vacant ({roomStats.available})</span>
                            </div>
                            <div className="donut-legend-item">
                                <span className="dot" style={{ background: '#fb923c' }}></span>
                                <span>Occupied ({roomStats.occupied})</span>
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
                                        <span className="gauge-stat"><span className="dot" style={{ background: '#E31E24' }}></span> {advancedOccupancy.todayOccupied} Occupied</span>
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
                                        <span className="gauge-stat"><span className="dot" style={{ background: '#10b981' }}></span> {roomStats.total - advancedOccupancy.tomorrowBooked} Available</span>
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
                                        <span className="gauge-stat"><span className="dot" style={{ background: '#E31E24' }}></span> {advancedOccupancy.monthAvailable} Available</span>
                                        <span className="gauge-stat"><span className="dot" style={{ background: '#10b981' }}></span> {advancedOccupancy.monthBooked} Booked</span>
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
                            </div>
                            <div className="reservation-item tomorrow-item">
                                <div className="reservation-label">Tomorrow</div>
                                <div className="reservation-value">{upcomingReservations.tomorrow}</div>
                            </div>
                            <div className="reservation-item week-item">
                                <div className="reservation-label">Next 7 Days</div>
                                <div className="reservation-value">{upcomingReservations.next7Days}</div>
                            </div>
                            <div className="reservation-item total-item">
                                <div className="reservation-label">Total</div>
                                <div className="reservation-value">{upcomingReservations.today + upcomingReservations.tomorrow + upcomingReservations.next7Days}</div>
                            </div>
                        </div>
                        <div className="payment-methods">
                            <div className="payment-item">
                                <span className="dot" style={{ background: '#E31E24' }}></span>
                                <span>Cash</span>
                            </div>
                            <div className="payment-item">
                                <span className="dot" style={{ background: '#fb923c' }}></span>
                                <span>Online</span>
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
                                <div className="revenue-main-value">{revenue.total.toLocaleString()}</div>
                                <div className="revenue-sub-text">Today: {revenue.today.toLocaleString()}</div>
                                <div className="revenue-percentage">
                                    <span className={`percentage-badge ${revenue.today >= revenue.yesterday ? 'up' : 'down'}`}>
                                        {revenue.today >= revenue.yesterday ? '+' : '-'}{Math.abs(Math.round(((revenue.today - revenue.yesterday) / (revenue.yesterday || 1)) * 100))}%
                                    </span>
                                </div>
                            </div>

                            {/* Revenue Breakup Card */}
                            <div className="revenue-stat-card breakup-card">
                                <h3>Revenue Breakup</h3>
                                <div className="revenue-main-value">RS {revenue.total.toLocaleString()}</div>
                                <div className="breakup-grid">
                                    <div className="breakup-item">
                                        <span className="breakup-label">Rooms</span>
                                        <span className="breakup-value">{revenueBreakup.rooms.toLocaleString()}</span>
                                    </div>
                                    <div
                                        className="breakup-item"
                                        onClick={() => navigate('/admin/food-order')}
                                        style={{ cursor: 'pointer' }}
                                        title="Go to Food Order"
                                    >
                                        <span className="breakup-label">Restaurant</span>
                                        <span className="breakup-value">{revenueBreakup.restaurant.toLocaleString()}</span>
                                    </div>
                                    <div className="breakup-item">
                                        <span className="breakup-label">Fragments</span>
                                        <span className="breakup-value">{revenueBreakup.other.toLocaleString()}</span>
                                    </div>
                                    <div className="breakup-item">
                                        <span className="breakup-label">Other</span>
                                        <span className="breakup-value">0</span>
                                    </div>
                                </div>
                            </div>

                            {/* ADR Card */}
                            <div className="revenue-stat-card adr-card">
                                <h3>Average Daily Room Rate</h3>
                                <div className="revenue-main-value">{revenue.avgDailyRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                <div className="revenue-sub-text">Yesterday: RS {revenue.yesterdayAvgRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                <div className="revenue-percentage">
                                    <span className={`percentage-badge ${revenue.avgDailyRate >= revenue.yesterdayAvgRate ? 'up' : 'down'}`}>
                                        {revenue.avgDailyRate >= revenue.yesterdayAvgRate ? '+' : '-'}{Math.abs(Math.round(((revenue.avgDailyRate - revenue.yesterdayAvgRate) / (revenue.yesterdayAvgRate || 1)) * 100))}%
                                    </span>
                                </div>
                            </div>

                            {/* Total Receipts Card */}
                            <div className="revenue-stat-card receipts-card">
                                <h3>Total Receipts</h3>
                                <div className="revenue-main-value">RS {revenue.total.toLocaleString()}</div>
                                <div className="receipts-breakdown">
                                    <div className="receipt-item">
                                        <span className="receipt-label">Cash</span>
                                        <span className="receipt-value">RS {revenue.receipts.cash.toLocaleString()}</span>
                                    </div>
                                    <div className="receipt-item">
                                        <span className="receipt-label">Card</span>
                                        <span className="receipt-value">RS {revenue.receipts.card.toLocaleString()}</span>
                                    </div>
                                    <div className="receipt-item">
                                        <span className="receipt-label">Online/UPI</span>
                                        <span className="receipt-value">RS {revenue.receipts.diCard.toLocaleString()}</span>
                                    </div>
                                    <div className="receipt-item">
                                        <span className="receipt-label">Bank</span>
                                        <span className="receipt-value">RS {revenue.receipts.bank.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="payment-icons">
                                    <div className="payment-item"><span className="dot" style={{ background: '#E31E24' }}></span><span>Cash</span></div>
                                    <div className="payment-item"><span className="dot" style={{ background: '#fb923c' }}></span><span>Online</span></div>
                                    <div className="payment-item"><span className="dot" style={{ background: '#10b981' }}></span><span>{revenue.total > 0 ? ((((revenue.receipts.diCard + revenue.receipts.bank + revenue.receipts.card) / revenue.total) * 100).toFixed(1) + '%') : '0%'}</span></div>
                                    <div className="payment-item"><span className="dot" style={{ background: '#6b7280' }}></span><span>Bank</span></div>
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
                                        <line x1="50" y1="150" x2="550" y2="150" stroke="#f3f4f6" strokeWidth="1" />
                                        <line x1="50" y1="50" x2="550" y2="50" stroke="#e5e7eb" strokeWidth="1" />

                                        {/* Y-axis labels */}
                                        <text x="35" y="255" fontSize="12" fill="#6b7280" textAnchor="end">0</text>
                                        <text x="35" y="155" fontSize="12" fill="#6b7280" textAnchor="end">{Math.round(roomStats.total / 2)}</text>
                                        <text x="35" y="55" fontSize="12" fill="#6b7280" textAnchor="end">{roomStats.total}</text>

                                        {/* Clean */}
                                        {(() => {
                                            const h = Math.max((housekeepingStats.clean / (roomStats.total || 1)) * 200, 2); return (
                                                <><rect x="100" y={250 - h} width="80" height={h} fill="#10b981" rx="6" />
                                                    <text x="140" y={244 - h} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#10b981">{housekeepingStats.clean}</text>
                                                    <text x="140" y="275" textAnchor="middle" fontSize="12" fill="#6b7280">Clean</text></>
                                            );
                                        })()}

                                        {/* Dirty */}
                                        {(() => {
                                            const h = Math.max((housekeepingStats.dirty / (roomStats.total || 1)) * 200, 2); return (
                                                <><rect x="250" y={250 - h} width="80" height={h} fill="#E31E24" rx="6" />
                                                    <text x="290" y={244 - h} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#E31E24">{housekeepingStats.dirty}</text>
                                                    <text x="290" y="275" textAnchor="middle" fontSize="12" fill="#6b7280">Dirty</text></>
                                            );
                                        })()}

                                        {/* Pending/Inspection */}
                                        {(() => {
                                            const h = Math.max((housekeepingStats.inspection / (roomStats.total || 1)) * 200, 2); return (
                                                <><rect x="400" y={250 - h} width="80" height={h} fill="#f59e0b" rx="6" />
                                                    <text x="440" y={244 - h} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#f59e0b">{housekeepingStats.inspection}</text>
                                                    <text x="440" y="275" textAnchor="middle" fontSize="12" fill="#6b7280">Pending</text></>
                                            );
                                        })()}
                                    </svg>
                                </div>
                            </div>

                            {/* Rooms Availability Chart */}
                            <div className="chart-card-analytics availability-chart">
                                <div className="chart-header-row">
                                    <h3>Rooms Availability</h3>
                                    <div className="date-range">From: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })} <span className="next-days">+Next 14 Days</span></div>
                                </div>
                                <div className="bar-chart-container">
                                    <svg width="100%" height="300" viewBox="0 0 700 300">
                                        {/* Grid lines */}
                                        <line x1="30" y1="250" x2="680" y2="250" stroke="#e5e7eb" strokeWidth="1" />
                                        <line x1="30" y1="150" x2="680" y2="150" stroke="#f3f4f6" strokeWidth="1" />
                                        <line x1="30" y1="50" x2="680" y2="50" stroke="#e5e7eb" strokeWidth="1" />

                                        {/* Y-axis labels */}
                                        <text x="18" y="255" fontSize="11" fill="#6b7280" textAnchor="end">0</text>
                                        <text x="18" y="155" fontSize="11" fill="#6b7280" textAnchor="end">{Math.round(roomStats.total / 2)}</text>
                                        <text x="18" y="55" fontSize="11" fill="#6b7280" textAnchor="end">{roomStats.total}</text>

                                        {/* Availability Bars - 14 days */}
                                        {roomAvailability.map((day, i) => {
                                            const barHeight = (day.available / (day.total || 1)) * 200;
                                            return (
                                                <g key={i}>
                                                    <rect
                                                        x={38 + (i * 46)}
                                                        y={250 - barHeight}
                                                        width="32"
                                                        height={Math.max(barHeight, 2)}
                                                        fill="#10b981"
                                                        rx="4"
                                                    />
                                                    <text x={54 + (i * 46)} y="268" textAnchor="middle" fontSize="9" fill="#6b7280">
                                                        {day.label}
                                                    </text>
                                                </g>
                                            );
                                        })}
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
