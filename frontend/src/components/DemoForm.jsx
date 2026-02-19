import { useState } from 'react';
import './DemoForm.css';

const DemoForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        city: '',
        hotelName: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        // Add your form submission logic here
    };

    return (
        <section className="demo-section">
            <div className="demo-container">
                {/* LEFT FORM */}
                <div className="demo-form">
                    <h2>Schedule a free demo</h2>
                    <p className="demo-subtitle">
                        Get in touch with our team to clarify your queries
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Name<span>*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Email<span>*</span></label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Phone number<span>*</span></label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>City<span>*</span></label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Hotel Name<span>*</span></label>
                                <input
                                    type="text"
                                    name="hotelName"
                                    value={formData.hotelName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className="submit-btn">
                            Submit
                        </button>
                    </form>
                </div>

                {/* RIGHT ILLUSTRATION */}
                <div className="demo-illustration">
                    <img src="/pic section/Coustomer.png" alt="Demo Illustration" />
                </div>
            </div>
        </section>
    );
};

export default DemoForm;
