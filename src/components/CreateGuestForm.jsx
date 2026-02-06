import { useState } from 'react';

const CreateGuestForm = ({ onSave, onCancel, existingGuests = [] }) => {
    const [activeSection, setActiveSection] = useState('basic'); // basic, address, kyc, optional
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    const [formData, setFormData] = useState({
        // Basic Information
        fullName: '',
        mobile: '',
        email: '',
        gender: 'Male',
        nationality: 'Indian',

        // Address Details
        address: '',
        city: '',
        state: '',
        country: 'India',
        pinCode: '',

        // ID Proof / KYC
        idType: '', // Aadhaar, Passport, Driving License, Voter ID
        idNumber: '',
        idFrontFile: null,
        idBackFile: null,

        // Optional Details
        dob: '',
        anniversary: '',
        photoFile: null,
        companyName: '',
        gstNumber: ''
    });

    // Dummy guest history data
    const [showHistory, setShowHistory] = useState(false);
    const bookingHistory = [
        {
            id: 'RES-001',
            roomCategory: 'Deluxe Double',
            checkIn: '2025-10-15',
            checkOut: '2025-10-18',
            amount: '₹9,500'
        },
        {
            id: 'RES-002',
            roomCategory: 'Club AC Single',
            checkIn: '2024-08-20',
            checkOut: '2024-08-23',
            amount: '₹7,200'
        },
        {
            id: 'RES-003',
            roomCategory: 'Suite Double',
            checkIn: '2024-05-10',
            checkOut: '2024-05-13',
            amount: '₹15,000'
        },
        {
            id: 'RES-004',
            roomCategory: 'Club AC Double',
            checkIn: '2024-03-05',
            checkOut: '2024-03-08',
            amount: '₹12,000'
        },
        {
            id: 'RES-005',
            roomCategory: 'Deluxe AC Single',
            checkIn: '2023-12-20',
            checkOut: '2023-12-23',
            amount: '₹6,500'
        },
        {
            id: 'RES-006',
            roomCategory: 'Executive Suite',
            checkIn: '2023-10-10',
            checkOut: '2023-10-15',
            amount: '₹27,500'
        },
        {
            id: 'RES-007',
            roomCategory: 'Club Non-AC Double',
            checkIn: '2023-07-22',
            checkOut: '2023-07-25',
            amount: '₹8,700'
        },
        {
            id: 'RES-008',
            roomCategory: 'Deluxe Non-AC',
            checkIn: '2023-05-05',
            checkOut: '2023-05-10',
            amount: '₹7,500'
        },
        {
            id: 'RES-009',
            roomCategory: 'Suite Double',
            checkIn: '2023-02-14',
            checkOut: '2023-02-17',
            amount: '₹16,500'
        },
        {
            id: 'RES-010',
            roomCategory: 'Club AC Single',
            checkIn: '2022-11-28',
            checkOut: '2022-12-01',
            amount: '₹8,400'
        }
    ];

    // Validation Rules
    const validateField = (fieldName, value) => {
        let error = '';

        switch (fieldName) {
            case 'fullName':
                if (!value.trim()) error = 'Full Name is required';
                else if (value.trim().length < 3) error = 'Full Name must be at least 3 characters';
                break;

            case 'mobile':
                if (!value.trim()) error = 'Mobile Number is required';
                else if (!/^[0-9]{10}$/.test(value.replace(/\s+/g, ''))) error = 'Mobile must be 10 digits';
                else if (existingGuests.some(g => g.mobile === value)) error = 'This mobile number already exists';
                break;

            case 'email':
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
                break;

            case 'idNumber':
                if (formData.idType && !value.trim()) error = 'ID Number is required when ID Type is selected';
                break;

            case 'dob':
            case 'anniversary':
                if (value && new Date(value) > new Date()) error = `${fieldName === 'dob' ? 'DOB' : 'Anniversary'} cannot be a future date`;
                break;

            case 'pinCode':
                if (value && !/^[0-9]{6}$/.test(value)) error = 'PIN Code must be 6 digits';
                break;

            default:
                break;
        }

        return error;
    };

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === 'file') {
            setFormData(prev => ({
                ...prev,
                [name]: files[0]
            }));
        } else {
            const error = validateField(name, value);
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));

            if (error) {
                setErrors(prev => ({
                    ...prev,
                    [name]: error
                }));
            } else {
                setErrors(prev => ({
                    ...prev,
                    [name]: ''
                }));
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Basic validation
        if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
        if (!formData.mobile.trim()) newErrors.mobile = 'Mobile Number is required';
        else if (!/^[0-9]{10}$/.test(formData.mobile.replace(/\s+/g, ''))) newErrors.mobile = 'Mobile must be 10 digits';
        else if (existingGuests.some(g => g.mobile === formData.mobile)) newErrors.mobile = 'This mobile number already exists';

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (formData.idType && !formData.idNumber.trim()) {
            newErrors.idNumber = 'ID Number is required when ID Type is selected';
        }

        if (formData.dob && new Date(formData.dob) > new Date()) {
            newErrors.dob = 'DOB cannot be a future date';
        }

        if (formData.anniversary && new Date(formData.anniversary) > new Date()) {
            newErrors.anniversary = 'Anniversary cannot be a future date';
        }

        if (formData.pinCode && !/^[0-9]{6}$/.test(formData.pinCode)) {
            newErrors.pinCode = 'PIN Code must be 6 digits';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            setSuccessMessage('');
            return;
        }

        const newGuest = {
            guestId: 'G-' + Date.now(),
            fullName: formData.fullName,
            mobile: formData.mobile,
            email: formData.email,
            gender: formData.gender,
            nationality: formData.nationality,
            address: {
                line: formData.address,
                city: formData.city,
                state: formData.state,
                country: formData.country,
                pinCode: formData.pinCode
            },
            idProof: {
                type: formData.idType,
                number: formData.idNumber,
                frontFile: formData.idFrontFile,
                backFile: formData.idBackFile
            },
            dob: formData.dob,
            anniversary: formData.anniversary,
            photoFile: formData.photoFile,
            companyName: formData.companyName,
            gstNumber: formData.gstNumber,
            createdAt: new Date().toISOString(),
            totalStays: 1,
            lastStayDate: null,
            bookingCount: 0
        };

        setSuccessMessage('Guest created successfully! ✓');
        setTimeout(() => {
            onSave(newGuest);
        }, 1500);
    };

    const sections = [
        { id: 'basic', label: 'Basic Info', icon: '👤' },
        { id: 'address', label: 'Address', icon: '📍' },
        { id: 'kyc', label: 'ID Proof', icon: '🪪' },
        { id: 'optional', label: 'More Info', icon: '📋' }
    ];

    return (
        <div className="create-guest-form">
            {/* Header */}
            <div className="form-header-section">
                <h3 className="form-title">🆕 Create New Guest Profile</h3>
                <p className="form-subtitle">Fill in the guest details to create a new profile</p>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="success-alert" style={{ marginBottom: '1rem' }}>
                    {successMessage}
                </div>
            )}

            {/* Section Tabs */}
            <div className="form-section-tabs">
                {sections.map(section => (
                    <button
                        key={section.id}
                        className={`section-tab ${activeSection === section.id ? 'active' : ''}`}
                        onClick={() => setActiveSection(section.id)}
                    >
                        <span className="tab-icon">{section.icon}</span>
                        <span className="tab-label">{section.label}</span>
                    </button>
                ))}
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="guest-form-content">
                {/* BASIC INFORMATION SECTION */}
                {activeSection === 'basic' && (
                    <div className="form-section">
                        <h4 className="section-title">Basic Information</h4>
                        <p className="section-subtitle">* Required fields</p>

                        <div className="form-group">
                            <label>Full Name *</label>
                            <input
                                type="text"
                                name="fullName"
                                placeholder="e.g., John Doe"
                                value={formData.fullName}
                                onChange={handleChange}
                                className={errors.fullName ? 'input-error' : ''}
                            />
                            {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                        </div>

                        <div className="form-row-2">
                            <div className="form-group">
                                <label>Mobile Number *</label>
                                <input
                                    type="tel"
                                    name="mobile"
                                    placeholder="10 digit number"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    maxLength="10"
                                    className={errors.mobile ? 'input-error' : ''}
                                />
                                {errors.mobile && <span className="error-text">{errors.mobile}</span>}
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="guest@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={errors.email ? 'input-error' : ''}
                                />
                                {errors.email && <span className="error-text">{errors.email}</span>}
                            </div>
                        </div>

                        <div className="form-row-2">
                            <div className="form-group">
                                <label>Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleChange}>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Nationality</label>
                                <select name="nationality" value={formData.nationality} onChange={handleChange}>
                                    <option value="Indian">Indian</option>
                                    <option value="US">US</option>
                                    <option value="UK">UK</option>
                                    <option value="Australia">Australia</option>
                                    <option value="Others">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* ADDRESS SECTION */}
                {activeSection === 'address' && (
                    <div className="form-section">
                        <h4 className="section-title">Address Details</h4>
                        <p className="section-subtitle">Recommended for KYC completion</p>

                        <div className="form-group">
                            <label>Address Line</label>
                            <input
                                type="text"
                                name="address"
                                placeholder="Street address"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-row-3">
                            <div className="form-group">
                                <label>City</label>
                                <input
                                    type="text"
                                    name="city"
                                    placeholder="City"
                                    value={formData.city}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>State</label>
                                <input
                                    type="text"
                                    name="state"
                                    placeholder="State"
                                    value={formData.state}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>PIN Code</label>
                                <input
                                    type="text"
                                    name="pinCode"
                                    placeholder="6 digits"
                                    value={formData.pinCode}
                                    onChange={handleChange}
                                    maxLength="6"
                                    className={errors.pinCode ? 'input-error' : ''}
                                />
                                {errors.pinCode && <span className="error-text">{errors.pinCode}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Country</label>
                            <select name="country" value={formData.country} onChange={handleChange}>
                                <option value="India">India</option>
                                <option value="US">United States</option>
                                <option value="UK">United Kingdom</option>
                                <option value="Australia">Australia</option>
                                <option value="Others">Other</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* KYC / ID PROOF SECTION */}
                {activeSection === 'kyc' && (
                    <div className="form-section">
                        <h4 className="section-title">ID Proof / KYC Verification</h4>
                        <p className="section-subtitle">Required at check-in. Upload clear images.</p>

                        <div className="form-row-2">
                            <div className="form-group">
                                <label>ID Type</label>
                                <select name="idType" value={formData.idType} onChange={handleChange}>
                                    <option value="">-- Select ID Type --</option>
                                    <option value="Aadhaar">Aadhaar</option>
                                    <option value="Passport">Passport</option>
                                    <option value="Driving License">Driving License</option>
                                    <option value="Voter ID">Voter ID</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>ID Number {formData.idType && '*'}</label>
                                <input
                                    type="text"
                                    name="idNumber"
                                    placeholder="ID number"
                                    value={formData.idNumber}
                                    onChange={handleChange}
                                    className={errors.idNumber ? 'input-error' : ''}
                                />
                                {errors.idNumber && <span className="error-text">{errors.idNumber}</span>}
                            </div>
                        </div>

                        <div className="form-row-2">
                            <div className="form-group">
                                <label>ID Front (Upload)</label>
                                <div className="file-input-wrapper">
                                    <input
                                        type="file"
                                        name="idFrontFile"
                                        accept="image/*"
                                        onChange={handleChange}
                                    />
                                    <span className="file-label">
                                        {formData.idFrontFile ? '✓ ' + formData.idFrontFile.name : 'Click to upload front page'}
                                    </span>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>ID Back (Upload)</label>
                                <div className="file-input-wrapper">
                                    <input
                                        type="file"
                                        name="idBackFile"
                                        accept="image/*"
                                        onChange={handleChange}
                                    />
                                    <span className="file-label">
                                        {formData.idBackFile ? '✓ ' + formData.idBackFile.name : 'Click to upload back page'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="kyc-info-box">
                            <span className="info-icon">ℹ️</span>
                            <div className="info-content">
                                <p><strong>KYC Information</strong></p>
                                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
                                    Upload clear, readable images of ID documents. Ensure all details are visible. Required for check-in completion.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* OPTIONAL INFORMATION SECTION */}
                {activeSection === 'optional' && (
                    <div className="form-section">
                        <h4 className="section-title">Optional Details</h4>
                        <p className="section-subtitle">Additional information for guest profile</p>

                        <div className="form-row-2">
                            <div className="form-group">
                                <label>Date of Birth</label>
                                <input
                                    type="date"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleChange}
                                    className={errors.dob ? 'input-error' : ''}
                                />
                                {errors.dob && <span className="error-text">{errors.dob}</span>}
                            </div>

                            <div className="form-group">
                                <label>Anniversary</label>
                                <input
                                    type="date"
                                    name="anniversary"
                                    value={formData.anniversary}
                                    onChange={handleChange}
                                    className={errors.anniversary ? 'input-error' : ''}
                                />
                                {errors.anniversary && <span className="error-text">{errors.anniversary}</span>}
                            </div>
                        </div>

                        <div className="form-row-2">
                            <div className="form-group">
                                <label>Company Name</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    placeholder="For corporate guests"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>GST Number</label>
                                <input
                                    type="text"
                                    name="gstNumber"
                                    placeholder="If applicable"
                                    value={formData.gstNumber}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Guest Photo (Upload)</label>
                            <div className="file-input-wrapper">
                                <input
                                    type="file"
                                    name="photoFile"
                                    accept="image/*"
                                    onChange={handleChange}
                                />
                                <span className="file-label">
                                    {formData.photoFile ? '✓ ' + formData.photoFile.name : 'Click to upload profile photo'}
                                </span>
                            </div>
                        </div>

                        {/* Guest History Section (Mock Data) */}
                        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
                            <button
                                type="button"
                                className="history-toggle-btn"
                                onClick={() => setShowHistory(!showHistory)}
                            >
                                <span>{showHistory ? '▼' : '▶'}</span> Previous Booking History (if returning guest)
                            </button>

                            {showHistory && (
                                <div className="history-section" style={{ marginTop: '1rem' }}>
                                    <table className="history-table">
                                        <thead>
                                            <tr>
                                                <th>Reservation ID</th>
                                                <th>Room Category</th>
                                                <th>Stay Dates</th>
                                                <th>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bookingHistory.map(booking => (
                                                <tr key={booking.id}>
                                                    <td>{booking.id}</td>
                                                    <td>{booking.roomCategory}</td>
                                                    <td>{booking.checkIn} to {booking.checkOut}</td>
                                                    <td className="amount">{booking.amount}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Form Actions */}
                <div className="form-actions-guest">
                    <button type="button" className="btn-cancel" onClick={onCancel}>
                        Cancel
                    </button>
                    <button type="submit" className="btn-submit">
                        Create Guest Profile
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateGuestForm;
