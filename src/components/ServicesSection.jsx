import React, { useEffect } from 'react';
import './ServicesSection.css';

// Assets (Strict Imports as requested - using user provided s1-s6)
import s1 from '../assets/s1.png';
import s2 from '../assets/s2.png';
import s3 from '../assets/s3.png';
import s4 from '../assets/s4.png';
import s5 from '../assets/s5.png';
import s6 from '../assets/s6.png';

const ServicesSection = () => {
    useEffect(() => {
        const elements = document.querySelectorAll(".service-card");

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("show");
                    }
                });
            },
            { threshold: 0.1 }
        );

        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return (
        <section className="services-section" id="services">
            <div className="services-container">
                <h2 className="services-title">Our Services</h2>
                <p className="services-subtitle">Simplifying hotel operations with comprehensive and innovative solutions.</p>

                <div className="services-grid">

                    {/* LEFT COLUMN */}
                    <div className="services-col">
                        <div className="service-card">
                            <img src={s1} alt="Service 1" />
                        </div>
                        <div className="service-card">
                            <img src={s4} alt="Service 4" />
                        </div>
                    </div>

                    {/* CENTER COLUMN */}
                    <div className="services-col center-col">
                        <div className="service-card">
                            <img src={s2} alt="Service 2" />
                        </div>
                        <div className="service-card">
                            <img src={s5} alt="Service 5" />
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="services-col">
                        <div className="service-card">
                            <img src={s3} alt="Service 3" />
                        </div>
                        <div className="service-card">
                            <img src={s6} alt="Service 6" />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default ServicesSection;
