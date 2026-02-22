import React, { useState } from "react";
import "./Features.css";
import heroImage from "../assets/feature-hero.png";
import f1 from "../assets/f1.png";
import f2 from "../assets/f2.png";
import f3 from "../assets/f3.png";

const Features = () => {
    const images = [f1, f2, f3];
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const cardStyle = (index) => ({
        padding: "10px",
        borderRadius: "20px",
        cursor: "pointer",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: hoveredIndex === index ? "translateY(-10px) scale(1.02)" : "translateY(0px) scale(1)",
        background: "transparent",
        boxShadow: hoveredIndex === index ? "0 15px 30px rgba(225, 29, 72, 0.1)" : "none",
        border: "none",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
    });

    const imageStyle = (index) => ({
        width: "100%",
        maxWidth: index < 6 ? "340px" : "700px",
        height: "auto",
        objectFit: "contain",
        margin: "0 auto",
        display: "block",
        transition: "transform 0.4s ease",
        transform: hoveredIndex === index ? "translateY(-6px) scale(1.05)" : "scale(1)",
        // Sharpen second image if it looks blurred
        filter: index === 1
            ? "contrast(1.1) saturate(1.1) brightness(1.02) drop-shadow(0 5px 15px rgba(0,0,0,0.05))"
            : "none",
        imageRendering: index === 1 ? "auto" : "auto", // Re-evaluating, browser defaults often best for PNGs
    });

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

            {/* OUR FEATURES SECTION - REACT IMPLEMENTATION */}
            <section
                style={{
                    padding: "40px 0",
                    background: "linear-gradient(135deg,#fff6f7,#ffe6ea)",
                }}
            >
                <div
                    style={{
                        width: "90%",
                        maxWidth: "1200px",
                        margin: "auto",
                        textAlign: "center",
                    }}
                >
                    <h2 style={{ fontSize: "38px", fontWeight: "700", color: "#451a1a" }}>
                        Our Features
                    </h2>
                    <p style={{ marginBottom: "60px", color: "#666" }}>
                        Comprehensive Smart Features for Complete Hotel Management
                    </p>

                    {/* ===== 6 GRID CARDS ===== */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                            gap: "20px",
                        }}
                    >
                        {images.map((img, index) => (
                            <img
                                key={index}
                                src={img}
                                alt=""
                                style={imageStyle(index)}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            />
                        ))}
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
