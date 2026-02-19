import React from "react";
import "./about.css";

const About = () => {
    return (
        <>
            <div className="about-page">

                {/* HERO */}
                <section className="about-hero">
                    <div className="about-container">
                        <h1>
                            Empowering Modern Hotels <br />
                            <span>With Smart Digital Intelligence</span>
                        </h1>
                        <p>
                            At Bireena Atithi, we help hotels simplify operations,
                            improve guest experience, and increase revenue using
                            powerful smart automation.
                        </p>
                    </div>
                </section>

                {/* STORY */}
                <section className="about-story">
                    <h2 className="our-story-heading">Our Story</h2>

                    <div className="timeline-container">
                        <div className="timeline-content">
                            <div className="timeline-item left item-1">
                                <span className="timeline-dot"></span>
                                <div className="timeline-card">
                                    <h3>Idea Born</h3>
                                    <p>
                                        Our journey began with a simple vision to transform hotel
                                        operations through digital intelligence.
                                    </p>
                                </div>
                            </div>

                            <div className="timeline-item right item-2">
                                <span className="timeline-dot"></span>
                                <div className="timeline-card">
                                    <h3>Identified Hotel Pain Points</h3>
                                    <p>
                                        We researched booking delays, billing errors,
                                        and operational bottlenecks.
                                    </p>
                                </div>
                            </div>

                            <div className="timeline-item left item-3">
                                <span className="timeline-dot"></span>
                                <div className="timeline-card">
                                    <h3>Built Smart Reservation + KOT</h3>
                                    <p>
                                        Developed intuitive reservation and kitchen automation
                                        systems.
                                    </p>
                                </div>
                            </div>

                            <div className="timeline-item right item-4">
                                <span className="timeline-dot"></span>
                                <div className="timeline-card">
                                    <h3>Now Powering Growing Hotels</h3>
                                    <p>
                                        Today we empower hotels to scale operations and deliver
                                        exceptional guest experiences.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* WHY */}
                <section className="about-why">
                    <h2>Why We're Different</h2>
                    <p>Built by hospitality experts, for hospitality experts.</p>
                    <div className="why-cards">
                        <div>Reservation <br /> Intelligence</div>
                        <div>Real-time <br /> Billing</div>
                        <div>KOT <br /> Automation</div>
                        <div>24/7 Support</div>
                    </div>
                </section>

                {/* CTA */}
                <section className="about-cta">
                    <h2>Transform Your Hotel with Smart Digital Intelligence</h2>
                    <p>Elevate your service, automate your KOT, and grow your revenue with Bireena Atithi's smart ecosystem.</p>
                    <button onClick={() => window.location.href = '/login'}>Book a Free Demo</button>
                </section>

            </div>
        </>
    );
};

export default About;
