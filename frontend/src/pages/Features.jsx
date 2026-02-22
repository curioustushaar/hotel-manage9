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
