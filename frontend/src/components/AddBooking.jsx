import { useState, useCallback, useMemo, useEffect } from 'react';
import API_URL from '../config/api';
import './AddBooking.css';

const AddBooking = () => {
    // Guest Details State
    const [guestName, setGuestName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [email, setEmail] = useState('');
    const [idProofType, setIdProofType] = useState('Aadhaar');
    const [idProofNumber, setIdProofNumber] = useState('');

    // Room Details State
    const [roomType, setRoomType] = useState('');
    const [roomNumber, setRoomNumber] = useState('');
    const [numberOfGuests, setNumberOfGuests] = useState('1');

    // Stay Details State
    const [checkInDate, setCheckInDate] = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');

    // Pricing State
    const [advancePaid, setAdvancePaid] = useState('0');

    // Validation State
    const [errors, setErrors] = useState({});

    // Available rooms from database
    const [availableRooms, setAvailableRooms] = useState({});
    const [allRooms, setAllRooms] = useState([]);

    // Room Facility Types
    const [facilityTypes, setFacilityTypes] = useState([]);

    // Get today's date in YYYY-MM-DD format for min date restrictions
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Get minimum checkout date (check-in date + 1 day)
    const getMinCheckoutDate = () => {
        if (!checkInDate) return getTodayDate();
        const checkIn = new Date(checkInDate);
        checkIn.setDate(checkIn.getDate() + 1);
        const year = checkIn.getFullYear();
        const month = String(checkIn.getMonth() + 1).padStart(2, '0');
        const day = String(checkIn.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const todayDate = getTodayDate();
    const minCheckoutDate = getMinCheckoutDate();

    // Fetch available rooms from database
    useEffect(() => {
        fetchAvailableRooms();
        fetchFacilityTypes();
    }, []);

    // Clear checkout date if it becomes invalid when check-in date changes
    useEffect(() => {
        if (checkInDate && checkOutDate) {
            const checkIn = new Date(checkInDate);
            const checkOut = new Date(checkOutDate);
            if (checkOut <= checkIn) {
                setCheckOutDate('');
            }
        }
    }, [checkInDate]);

    const fetchFacilityTypes = async () => {
        try {
            const response = await fetch(`${API_URL}/api/facility-types/list`);
            const data = await response.json();
            if (data.success) {
                setFacilityTypes(data.data);
            }
        } catch (error) {
            console.error('Error fetching facility types:', error);
        }
    };

    const fetchAvailableRooms = async () => {
        try {
            const response = await fetch(`${API_URL}/api/rooms/list`);
            const data = await response.json();

            if (data.success) {
                setAllRooms(data.data);
                // Group rooms by type and filter only Available ones
                const roomsByType = {};
                data.data.forEach(room => {
                    if (room.status === 'Available') {
                        const type = room.roomType;
                        if (!roomsByType[type]) {
                            roomsByType[type] = [];
                        }
                        roomsByType[type].push(room.roomNumber);
                    }
                });
                setAvailableRooms(roomsByType);

                // Set default room type to first available type
                const firstRoomType = Object.keys(roomsByType)[0];
                if (firstRoomType && !roomType) {
                    setRoomType(firstRoomType);
                }
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    };

    // Room price mapping - get from selected room
    const roomPrices = useMemo(() => {
        const prices = {};
        allRooms.forEach(room => {
            if (!prices[room.roomType]) {
                prices[room.roomType] = room.price;
            }
        });
        return prices;
    }, [allRooms]);

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

    // Validation functions
    const validateMobileNumber = (mobile) => {
        const mobileRegex = /^[6-9]\d{9}$/;
        return mobileRegex.test(mobile);
    };

    const validateIdProof = (type, number) => {
        switch (type) {
            case 'Aadhaar':
                return /^\d{12}$/.test(number);
            case 'PAN Card':
                return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(number);
            case 'Passport':
                return /^[A-Z]{1}[0-9]{7}$/.test(number);
            case 'Driving License':
                return /^[A-Z]{2}[0-9]{13}$/.test(number);
            default:
                return true;
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!guestName.trim()) {
            newErrors.guestName = 'Guest name is required';
        }

        if (!mobileNumber) {
            newErrors.mobileNumber = 'Mobile number is required';
        } else if (!validateMobileNumber(mobileNumber)) {
            newErrors.mobileNumber = 'Invalid mobile number (10 digits, starting with 6-9)';
        }

        if (!roomType) {
            newErrors.roomType = 'Room type is required';
        }

        if (!roomNumber) {
            newErrors.roomNumber = 'Room number is required';
        }

        if (!checkInDate) {
            newErrors.checkInDate = 'Check-in date is required';
        }

        if (!checkOutDate) {
            newErrors.checkOutDate = 'Check-out date is required';
        }

        if (checkInDate && checkOutDate && new Date(checkInDate) >= new Date(checkOutDate)) {
            newErrors.checkOutDate = 'Check-out date must be after check-in date';
        }

        if (idProofNumber && !validateIdProof(idProofType, idProofNumber)) {
            const formats = {
                'Aadhaar': '12 digits',
                'PAN Card': 'ABCDE1234F format',
                'Passport': 'A1234567 format',
                'Driving License': 'AB1234567890123 format'
            };
            newErrors.idProofNumber = `Invalid ${idProofType} format (${formats[idProofType]})`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleMobileNumberChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
        setMobileNumber(value);
        if (errors.mobileNumber) {
            setErrors({ ...errors, mobileNumber: null });
        }
    };

    const handleIdProofNumberChange = (e) => {
        let value = e.target.value.toUpperCase();

        // Apply format-specific restrictions
        switch (idProofType) {
            case 'Aadhaar':
                value = value.replace(/\D/g, '').slice(0, 12);
                break;
            case 'PAN Card':
                value = value.replace(/[^A-Z0-9]/g, '').slice(0, 10);
                break;
            case 'Passport':
                value = value.replace(/[^A-Z0-9]/g, '').slice(0, 8);
                break;
            case 'Driving License':
                value = value.replace(/[^A-Z0-9]/g, '').slice(0, 15);
                break;
        }

        setIdProofNumber(value);
        if (errors.idProofNumber) {
            setErrors({ ...errors, idProofNumber: null });
        }
    };

    const handleSaveBooking = useCallback(async () => {
        // Validation
        if (!validateForm()) {
            alert('Please fix all errors before saving');
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
            const response = await fetch(`${API_URL}/api/bookings/add`, {
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

                // Reset form first
                setGuestName('');
                setMobileNumber('');
                setEmail('');
                setIdProofType('Aadhaar');
                setIdProofNumber('');
                setRoomType('');
                setRoomNumber('');
                setNumberOfGuests('1');
                setCheckInDate('');
                setCheckOutDate('');
                setAdvancePaid('0');
                setErrors({});

                // Refresh available rooms list
                await fetchAvailableRooms();
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Error saving booking:', error);
            alert('Failed to save booking. Please check if the server is running.');
        }
    }, [guestName, mobileNumber, email, idProofType, idProofNumber, roomType, roomNumber, numberOfGuests, checkInDate, checkOutDate, numberOfNights, pricePerNight, totalAmount, advancePaid, fetchAvailableRooms, availableRooms]);

    const handleSaveAndCheckIn = useCallback(async () => {
        // Validation
        if (!validateForm()) {
            alert('Please fix all errors before check-in');
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
            const response = await fetch(`${API_URL}/api/bookings/add`, {
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

                // Reset form first
                setGuestName('');
                setMobileNumber('');
                setEmail('');
                setIdProofType('Aadhaar');
                setIdProofNumber('');
                setRoomType('');
                setRoomNumber('');
                setNumberOfGuests('1');
                setCheckInDate('');
                setCheckOutDate('');
                setAdvancePaid('0');
                setErrors({});

                // Refresh available rooms list
                await fetchAvailableRooms();
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Error saving booking:', error);
            alert('Failed to save booking. Please check if the server is running.');
        }
    }, [guestName, mobileNumber, email, idProofType, idProofNumber, roomType, roomNumber, numberOfGuests, checkInDate, checkOutDate, numberOfNights, pricePerNight, totalAmount, advancePaid, fetchAvailableRooms, availableRooms]);

    const handleCancel = useCallback(() => {
        if (window.confirm('Are you sure you want to cancel? All data will be lost.')) {
            // Reset form
            setGuestName('');
            setMobileNumber('');
            setEmail('');
            setIdProofType('Aadhaar');
            setIdProofNumber('');
            setRoomType(Object.keys(availableRooms)[0] || '');
            setRoomNumber('');
            setNumberOfGuests('1');
            setCheckInDate('');
            setCheckOutDate('');
            setAdvancePaid('0');
        }
    }, [availableRooms]);

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
                                    className={`form-input ${errors.guestName ? 'input-error' : ''}`}
                                    placeholder="Enter guest's full name"
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                />
                                {errors.guestName && (
                                    <span className="error-message">{errors.guestName}</span>
                                )}
                            </div>

                            {/* Mobile Number */}
                            <div className="form-group">
                                <label htmlFor="mobileNumber" className="form-label">
                                    Mobile Number <span className="required">*</span>
                                </label>
                                <input
                                    type="tel"
                                    id="mobileNumber"
                                    className={`form-input ${errors.mobileNumber ? 'input-error' : ''}`}
                                    placeholder="10-digit mobile number"
                                    value={mobileNumber}
                                    onChange={handleMobileNumberChange}
                                    maxLength="10"
                                />
                                {errors.mobileNumber && (
                                    <span className="error-message">{errors.mobileNumber}</span>
                                )}
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
                                    className={`form-input ${errors.idProofNumber ? 'input-error' : ''}`}
                                    placeholder="Enter ID proof number"
                                    value={idProofNumber}
                                    onChange={handleIdProofNumberChange}
                                />
                                {errors.idProofNumber && (
                                    <span className="error-message">{errors.idProofNumber}</span>
                                )}
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
                                    className={`form-input ${errors.roomType ? 'input-error' : ''}`}
                                    value={roomType}
                                    onChange={handleRoomTypeChange}
                                >
                                    <option key="empty-type" value="">-- Select Room Type --</option>
                                    {facilityTypes.map((facility) => (
                                        <option key={facility._id} value={facility.name}>
                                            {facility.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.roomType && (
                                    <span className="error-message">{errors.roomType}</span>
                                )}
                            </div>

                            {/* Room Number */}
                            <div className="form-group">
                                <label htmlFor="roomNumber" className="form-label">
                                    Room Number <span className="required">*</span>
                                </label>
                                <select
                                    id="roomNumber"
                                    className={`form-input ${errors.roomNumber ? 'input-error' : ''}`}
                                    value={roomNumber}
                                    onChange={(e) => setRoomNumber(e.target.value)}
                                    disabled={!roomType || !availableRooms[roomType]?.length}
                                >
                                    <option key="empty-room" value="">
                                        {!roomType
                                            ? '-- Select Room Type First --'
                                            : availableRooms[roomType]?.length
                                                ? '-- Select Room --'
                                                : '-- No Available Rooms --'}
                                    </option>
                                    {availableRooms[roomType]?.map((room) => (
                                        <option key={`room-${room}`} value={room}>
                                            {room}
                                        </option>
                                    ))}
                                </select>
                                {errors.roomNumber && (
                                    <span className="error-message">{errors.roomNumber}</span>
                                )}
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
                                    className={`form-input ${errors.checkInDate ? 'input-error' : ''}`}
                                    value={checkInDate}
                                    onChange={(e) => setCheckInDate(e.target.value)}
                                    min={todayDate}
                                />
                                {errors.checkInDate && (
                                    <span className="error-message">{errors.checkInDate}</span>
                                )}
                            </div>

                            {/* Check-out Date */}
                            <div className="form-group">
                                <label htmlFor="checkOutDate" className="form-label">
                                    Check-out Date <span className="required">*</span>
                                </label>
                                <input
                                    type="date"
                                    id="checkOutDate"
                                    className={`form-input ${errors.checkOutDate ? 'input-error' : ''}`}
                                    value={checkOutDate}
                                    onChange={(e) => setCheckOutDate(e.target.value)}
                                    min={minCheckoutDate}
                                />
                                {errors.checkOutDate && (
                                    <span className="error-message">{errors.checkOutDate}</span>
                                )}
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
