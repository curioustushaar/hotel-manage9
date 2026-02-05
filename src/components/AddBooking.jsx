import { useState, useCallback, useMemo } from 'react';
import './AddBooking.css';

const AddBooking = () => {
    // Guest Details State
    const [guestName, setGuestName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [email, setEmail] = useState('');
    const [idProofType, setIdProofType] = useState('Aadhaar');
    const [idProofNumber, setIdProofNumber] = useState('');

    // Room Details State
    const [roomType, setRoomType] = useState('Single');
    const [roomNumber, setRoomNumber] = useState('');
    const [numberOfGuests, setNumberOfGuests] = useState('1');

    // Stay Details State
    const [checkInDate, setCheckInDate] = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');

    // Pricing State
    const [advancePaid, setAdvancePaid] = useState('0');

    // Room price mapping (sample)
    const roomPrices = useMemo(() => ({
        'Single': 1500,
        'Double': 2500,
        'Deluxe': 4000,
        'Suite': 6000
    }), []);

    // Room numbers (sample)
    const availableRooms = {
        'Single': ['101', '102', '103', '104', '105'],
        'Double': ['201', '202', '203', '204'],
        'Deluxe': ['301', '302', '303'],
        'Suite': ['401', '402']
    };

    // Memoized calculations - avoid cascading renders
    const numberOfNights = useMemo(() => {
        if (checkInDate && checkOutDate) {
            const checkIn = new Date(checkInDate);
            const checkOut = new Date(checkOutDate);
            const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
            return nights > 0 ? nights : 0;
        }
        return 0;
    }, [checkInDate, checkOutDate]);

    const pricePerNight = useMemo(() => {
        return roomPrices[roomType] || 0;
    }, [roomType, roomPrices]);

    const totalAmount = useMemo(() => {
        return pricePerNight * numberOfNights;
    }, [pricePerNight, numberOfNights]);

    const handleRoomTypeChange = useCallback((e) => {
        setRoomType(e.target.value);
        setRoomNumber(''); // Reset room number when room type changes
    }, []);

    const handleSaveBooking = useCallback(async () => {
        // Validation
        if (!guestName || !mobileNumber || !roomNumber || !checkInDate || !checkOutDate) {
            alert('Please fill in all required fields');
            return;
        }

        const bookingData = {
            guestName,
            mobileNumber,
            email,
            idProofType,
            idProofNumber,
            roomType,
            roomNumber,
            numberOfGuests: parseInt(numberOfGuests),
            checkInDate,
            checkOutDate,
            numberOfNights,
            pricePerNight,
            totalAmount,
            advancePaid: parseFloat(advancePaid) || 0,
            status: 'Upcoming'
        };

        try {
            const response = await fetch('http://localhost:5000/api/bookings/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData)
            });

            const data = await response.json();

            if (data.success) {
                alert('Booking saved successfully!');
                console.log('Booking saved:', data.data);
                
                // Reset form
                setGuestName('');
                setMobileNumber('');
                setEmail('');
                setIdProofType('Aadhaar');
                setIdProofNumber('');
                setRoomType('Single');
                setRoomNumber('');
                setNumberOfGuests('1');
                setCheckInDate('');
                setCheckOutDate('');
                setAdvancePaid('0');
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Error saving booking:', error);
            alert('Failed to save booking. Please check if the server is running.');
        }
    }, [guestName, mobileNumber, email, idProofType, idProofNumber, roomType, roomNumber, numberOfGuests, checkInDate, checkOutDate, numberOfNights, pricePerNight, totalAmount, advancePaid]);

    const handleSaveAndCheckIn = useCallback(async () => {
        // Similar to save but with check-in status
        if (!guestName || !mobileNumber || !roomNumber || !checkInDate || !checkOutDate) {
            alert('Please fill in all required fields');
            return;
        }

        const bookingData = {
            guestName,
            mobileNumber,
            email,
            idProofType,
            idProofNumber,
            roomType,
            roomNumber,
            numberOfGuests: parseInt(numberOfGuests),
            checkInDate,
            checkOutDate,
            numberOfNights,
            pricePerNight,
            totalAmount,
            advancePaid: parseFloat(advancePaid) || 0,
            status: 'Checked-in'
        };

        try {
            const response = await fetch('http://localhost:5000/api/bookings/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData)
            });

            const data = await response.json();

            if (data.success) {
                alert('Booking saved and guest checked in successfully!');
                console.log('Booking saved with check-in:', data.data);
                
                // Reset form
                setGuestName('');
                setMobileNumber('');
                setEmail('');
                setIdProofType('Aadhaar');
                setIdProofNumber('');
                setRoomType('Single');
                setRoomNumber('');
                setNumberOfGuests('1');
                setCheckInDate('');
                setCheckOutDate('');
                setAdvancePaid('0');
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Error saving booking:', error);
            alert('Failed to save booking. Please check if the server is running.');
        }
    }, [guestName, mobileNumber, email, idProofType, idProofNumber, roomType, roomNumber, numberOfGuests, checkInDate, checkOutDate, numberOfNights, pricePerNight, totalAmount, advancePaid]);

    const handleCancel = useCallback(() => {
        if (window.confirm('Are you sure you want to cancel? All data will be lost.')) {
            // Reset form
            setGuestName('');
            setMobileNumber('');
            setEmail('');
            setIdProofType('Aadhaar');
            setIdProofNumber('');
            setRoomType('Single');
            setRoomNumber('');
            setNumberOfGuests('1');
            setCheckInDate('');
            setCheckOutDate('');
            setAdvancePaid('0');
        }
    }, []);

    return (
        <div className="add-booking-container">
            {/* Page Header */}
            <div className="add-booking-header">
                <h1>Add Booking</h1>
                <p>Create a new hotel booking reservation</p>
            </div>

            {/* Form Container */}
            <div className="add-booking-form">
                {/* CARD 1: Guest Details */}
                <div className="form-card">
                    <div className="card-header">
                        <h2>👤 Guest Details</h2>
                    </div>
                    <div className="card-body">
                        <div className="form-grid">
                            {/* Guest Name */}
                            <div className="form-group">
                                <label htmlFor="guestName" className="form-label">
                                    Guest Name <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="guestName"
                                    className="form-input"
                                    placeholder="Enter guest's full name"
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                />
                            </div>

                            {/* Mobile Number */}
                            <div className="form-group">
                                <label htmlFor="mobileNumber" className="form-label">
                                    Mobile Number <span className="required">*</span>
                                </label>
                                <input
                                    type="tel"
                                    id="mobileNumber"
                                    className="form-input"
                                    placeholder="10-digit mobile number"
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value)}
                                />
                            </div>

                            {/* Email */}
                            <div className="form-group">
                                <label htmlFor="email" className="form-label">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    className="form-input"
                                    placeholder="guest@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            {/* ID Proof Type */}
                            <div className="form-group">
                                <label htmlFor="idProofType" className="form-label">
                                    ID Proof Type
                                </label>
                                <select
                                    id="idProofType"
                                    className="form-input"
                                    value={idProofType}
                                    onChange={(e) => setIdProofType(e.target.value)}
                                >
                                    <option value="Aadhaar">Aadhaar</option>
                                    <option value="Passport">Passport</option>
                                    <option value="Driving License">Driving License</option>
                                    <option value="PAN Card">PAN Card</option>
                                </select>
                            </div>

                            {/* ID Proof Number */}
                            <div className="form-group">
                                <label htmlFor="idProofNumber" className="form-label">
                                    ID Proof Number
                                </label>
                                <input
                                    type="text"
                                    id="idProofNumber"
                                    className="form-input"
                                    placeholder="Enter ID proof number"
                                    value={idProofNumber}
                                    onChange={(e) => setIdProofNumber(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* CARD 2: Room Details */}
                <div className="form-card">
                    <div className="card-header">
                        <h2>🛏️ Room Details</h2>
                    </div>
                    <div className="card-body">
                        <div className="form-grid">
                            {/* Room Type */}
                            <div className="form-group">
                                <label htmlFor="roomType" className="form-label">
                                    Room Type <span className="required">*</span>
                                </label>
                                <select
                                    id="roomType"
                                    className="form-input"
                                    value={roomType}
                                    onChange={handleRoomTypeChange}
                                >
                                    <option value="Single">Single</option>
                                    <option value="Double">Double</option>
                                    <option value="Deluxe">Deluxe</option>
                                    <option value="Suite">Suite</option>
                                </select>
                            </div>

                            {/* Room Number */}
                            <div className="form-group">
                                <label htmlFor="roomNumber" className="form-label">
                                    Room Number <span className="required">*</span>
                                </label>
                                <select
                                    id="roomNumber"
                                    className="form-input"
                                    value={roomNumber}
                                    onChange={(e) => setRoomNumber(e.target.value)}
                                >
                                    <option value="">-- Select Room --</option>
                                    {availableRooms[roomType]?.map((room) => (
                                        <option key={room} value={room}>
                                            {room}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Number of Guests */}
                            <div className="form-group">
                                <label htmlFor="numberOfGuests" className="form-label">
                                    Number of Guests
                                </label>
                                <input
                                    type="number"
                                    id="numberOfGuests"
                                    className="form-input"
                                    min="1"
                                    max="6"
                                    value={numberOfGuests}
                                    onChange={(e) => setNumberOfGuests(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* CARD 3: Stay Details */}
                <div className="form-card">
                    <div className="card-header">
                        <h2>📅 Stay Details</h2>
                    </div>
                    <div className="card-body">
                        <div className="form-grid">
                            {/* Check-in Date */}
                            <div className="form-group">
                                <label htmlFor="checkInDate" className="form-label">
                                    Check-in Date <span className="required">*</span>
                                </label>
                                <input
                                    type="date"
                                    id="checkInDate"
                                    className="form-input"
                                    value={checkInDate}
                                    onChange={(e) => setCheckInDate(e.target.value)}
                                />
                            </div>

                            {/* Check-out Date */}
                            <div className="form-group">
                                <label htmlFor="checkOutDate" className="form-label">
                                    Check-out Date <span className="required">*</span>
                                </label>
                                <input
                                    type="date"
                                    id="checkOutDate"
                                    className="form-input"
                                    value={checkOutDate}
                                    onChange={(e) => setCheckOutDate(e.target.value)}
                                />
                            </div>

                            {/* Number of Nights */}
                            <div className="form-group">
                                <label htmlFor="numberOfNights" className="form-label">
                                    Number of Nights
                                </label>
                                <input
                                    type="number"
                                    id="numberOfNights"
                                    className="form-input form-input-readonly"
                                    value={numberOfNights}
                                    readOnly
                                    disabled
                                />
                                <span className="helper-text">Auto-calculated from dates</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CARD 4: Pricing Details */}
                <div className="form-card">
                    <div className="card-header">
                        <h2>💰 Pricing Details</h2>
                    </div>
                    <div className="card-body">
                        <div className="form-grid">
                            {/* Price Per Night */}
                            <div className="form-group">
                                <label htmlFor="pricePerNight" className="form-label">
                                    Price per Night
                                </label>
                                <div className="input-with-currency">
                                    <span className="currency-symbol">₹</span>
                                    <input
                                        type="number"
                                        id="pricePerNight"
                                        className="form-input form-input-readonly"
                                        value={pricePerNight}
                                        readOnly
                                        disabled
                                    />
                                </div>
                                <span className="helper-text">Based on room type</span>
                            </div>

                            {/* Total Amount */}
                            <div className="form-group">
                                <label htmlFor="totalAmount" className="form-label">
                                    Total Amount
                                </label>
                                <div className="input-with-currency">
                                    <span className="currency-symbol">₹</span>
                                    <input
                                        type="number"
                                        id="totalAmount"
                                        className="form-input form-input-readonly"
                                        value={totalAmount}
                                        readOnly
                                        disabled
                                    />
                                </div>
                                <span className="helper-text">Auto-calculated total</span>
                            </div>

                            {/* Advance Paid */}
                            <div className="form-group">
                                <label htmlFor="advancePaid" className="form-label">
                                    Advance Paid
                                </label>
                                <div className="input-with-currency">
                                    <span className="currency-symbol">₹</span>
                                    <input
                                        type="number"
                                        id="advancePaid"
                                        className="form-input"
                                        placeholder="0"
                                        value={advancePaid}
                                        onChange={(e) => setAdvancePaid(e.target.value)}
                                    />
                                </div>
                                <span className="helper-text">Optional advance payment</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="form-actions">
                    <button className="btn btn-secondary" onClick={handleCancel}>
                        Cancel
                    </button>
                    <div className="button-group">
                        <button className="btn btn-outline" onClick={handleSaveAndCheckIn}>
                            Save & Check-in
                        </button>
                        <button className="btn btn-primary" onClick={handleSaveBooking}>
                            Save Booking
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddBooking;
