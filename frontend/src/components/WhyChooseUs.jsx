import React from 'react';
import './WhyChooseUs.css';

// Import Assets
import c1 from '../assets/c1.png';
import c2 from '../assets/c2.png';
import c3 from '../assets/c3.png';
import c4 from '../assets/c4.png';
import c5 from '../assets/c5.png';
import cCenter from '../assets/cCenter.png';

const WhyChooseUs = () => {
    return (
        <section className="why-section">

            {/* HEADER STYLE */}
            <h2>Why Choose <span>Bireena Atithi?</span></h2>
            <p className="subtitle">Experience the smartest hotel management solution built for modern hotels.</p>

            {/* MAIN LAYOUT GRID */}
            <div className="why-layout">

                {/* C CENTER (BIGGER NOW) */}
                <div className="c-center-wrap">
                    <img src={cCenter} alt="Center Dashboard" className="c-center" />
                </div>

                {/* LEFT SIDE CARDS */}
                <div className="why-card card-top-left">
                    <img src={c1} alt="Feature 1" />
                </div>

                <div className="why-card card-bottom-left">
                    <img src={c2} alt="Feature 2" />
                </div>

                {/* BOTTOM CENTER CARD */}
                <div className="why-card card-bottom-center">
                    <img src={c3} alt="Feature 3" />
                </div>

                {/* RIGHT SIDE CARDS */}
                <div className="why-card card-top-right">
                    <img src={c4} alt="Feature 4" />
                </div>

                <div className="why-card card-bottom-right">
                    <img src={c5} alt="Feature 5" />
                </div>

            </div>

        </section>
    );
};

export default WhyChooseUs;
