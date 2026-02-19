import React from "react";
import "./Features.css";
import heroImage from "../assets/feature-hero.png";

const Features = () => {
    return (
        <div className="features-page">

            {/* HERO SECTION */}
            <section className="features-hero">
                <div className="features-hero-left">
                    <h1>
                        Smart Hotel Management <br />
                        <span>with KOT Automation</span>
                    </h1>

                    <p>
                        Manage reservations, billing, inventory, housekeeping and KOT
                        seamlessly with powerful real-time automation built for modern hotels.
                    </p>

                    <div className="hero-buttons">
                        <button className="btn-primary">Get Started</button>
                        <button className="btn-secondary">See Pricing</button>
                    </div>
                </div>

                <div className="features-hero-image-wrapper">
                    <img
                        src={heroImage}
                        alt="Bireena Atithi Feature Hero"
                        className="features-hero-image"
                        draggable="false"
                    />
                </div>
            </section>

            {/* FEATURES GRID */}
            <section className="features-grid-section">
                <h2>Our Features</h2>
                <p className="subtitle">
                    Comprehensive Smart Features for Complete Hotel Management
                </p>

                <div className="features-grid">

                    <div className="feature-card">
                        <div className="icon-circle">📅</div>
                        <h3>Reservation Intelligence</h3>
                        <p>
                            Smart room allocation, booking tracking and real-time guest
                            management.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="icon-circle">🍽</div>
                        <h3>KOT Automation</h3>
                        <p>
                            Instant kitchen order tokens with real-time updates and error-free
                            processing.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="icon-circle">💳</div>
                        <h3>Real-time Billing</h3>
                        <p>
                            Automated billing system with instant invoice generation.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="icon-circle">📦</div>
                        <h3>Inventory & Stock</h3>
                        <p>
                            Monitor stock levels and auto-replenish supplies with smart alerts.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="icon-circle">🧹</div>
                        <h3>Housekeeping Management</h3>
                        <p>
                            Track room cleaning schedules and real-time room status.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="icon-circle">📊</div>
                        <h3>Analytics & Reports</h3>
                        <p>
                            Advanced reports and business insights to grow hotel revenue.
                        </p>
                    </div>

                    {/* 24/7 Support Wide Cards */}
                    <div className="feature-card wide-card">
                        <div className="wide-card-content">
                            <div className="icon-circle">🎧</div>
                            <div>
                                <h3>24/7 Support</h3>
                                <p>Get round-the-clock assistance from our expert support team.</p>
                            </div>
                        </div>
                    </div>

                    <div className="feature-card wide-card">
                        <div className="wide-card-content">
                            <div className="icon-circle">📞</div>
                            <div>
                                <h3>24/7 Support</h3>
                                <p>Get round-the-clock assistance from our expert support team.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* CTA BANNER */}
            <section className="features-cta">
                <h2>Empower Your Hotel with Real-Time KOT Intelligence</h2>
                <p>
                    Streamline your kitchen operations, reduce order delays, and deliver
                    a seamless guest experience with our advanced automation.
                </p>
                <button className="cta-btn">Book a Free Demo</button>
            </section>

        </div>
    );
};

export default Features;
