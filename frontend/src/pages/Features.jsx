import React, { useState } from "react";
import "./Features.css";
import heroImage from "../assets/feature-hero.png";
import f1 from "../assets/f1.png";
import f2 from "../assets/f2.png";
import f3 from "../assets/f3.png";
import f4 from "../assets/f4.png";
import f5 from "../assets/f5.png";
import f6 from "../assets/f6.png";
import f7 from "../assets/f7.png";

const Features = () => {
    const images = [f1, f2, f3, f4, f5, f6];
    const lastImage = f7;
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const cardStyle = (index) => ({
        padding: index === 0 ? "30px" : "10px",
        borderRadius: "20px",
        cursor: "pointer",
        transition: "all 0.4s ease",
        transform: hoveredIndex === index ? "translateY(-8px)" : "translateY(0px)",
        background: index === 0 ? "rgba(255, 255, 255, 0.8)" : "transparent",
        boxShadow: index === 0
            ? "0 0 20px rgba(225, 29, 72, 0.3), inset 0 0 10px rgba(225, 29, 72, 0.1)"
            : "none",
        border: index === 0 ? "2px solid rgba(225, 29, 72, 0.5)" : "none",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
    });

    const imageStyle = (index) => ({
        width: "100%",
        maxWidth: index === 0 ? "420px" : "340px",
        height: "auto",
        objectFit: "contain",
        margin: "0 auto",
        display: "block",
        transition: "transform 0.4s ease",
        transform: hoveredIndex === index ? "translateY(-6px) scale(1.05)" : "scale(1)",
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
                    padding: "80px 0",
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
                            <div
                                key={index}
                                style={cardStyle(index)}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <img src={img} alt="" style={imageStyle(index)} />
                            </div>
                        ))}
                    </div>

                    {/* ===== LAST CENTER CARD (Wide) ===== */}
                    <div
                        style={{
                            marginTop: "20px",
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <div
                            style={cardStyle(6)}
                            onMouseEnter={() => setHoveredIndex(6)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <img
                                src={lastImage}
                                alt=""
                                style={{
                                    ...imageStyle(6),
                                    maxWidth: "700px" // Making the last one wide like in the image
                                }}
                            />
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
