import React from "react";
import Reveal from "../components/Reveal";

const Pricing = () => {
    const plans = [
        {
            name: "Basic",
            price: "₹1,999/mo",
            features: [
                "Single Hotel Management",
                "Basic Reservation System",
                "KOT Automation (Limited)",
                "Standard Billing",
                "Email Support"
            ],
            recommended: false
        },
        {
            name: "Professional",
            price: "₹4,999/mo",
            features: [
                "Up to 3 Hotels",
                "Advanced Reservation Intelligence",
                "Full KOT Automation",
                "Inventory Management",
                "Priority 24/7 Support"
            ],
            recommended: true
        },
        {
            name: "Enterprise",
            price: "Custom",
            features: [
                "Unlimited Hotels",
                "Full Customization",
                "Advanced Analytics & Reports",
                "Dedicated Account Manager",
                "Custom API Integration"
            ],
            recommended: false
        }
    ];

    return (
        <div style={{ paddingTop: "20px", paddingBottom: "100px", minHeight: "100vh", background: "#fff6f7" }}>
            <div className="container" style={{ textAlign: "center" }}>
                <Reveal width="100%">
                    <h1 style={{ fontSize: "42px", fontWeight: "700", marginBottom: "20px" }}>
                        Simple, Transparent <span style={{ color: "#e11d48" }}>Pricing</span>
                    </h1>
                </Reveal>
                <Reveal delay={0.1} width="100%">
                    <p style={{ fontSize: "18px", color: "#666", marginBottom: "60px", maxWidth: "800px", margin: "0 auto 60px" }}>
                        Choose the perfect plan for your hotel. No hidden fees, no surprises.
                    </p>
                </Reveal>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "30px",
                    marginTop: "20px"
                }}>
                    {plans.map((plan, index) => (
                        <Reveal key={index} delay={index * 0.1} width="100%">
                            <div style={{
                                background: "#fff",
                                padding: "40px",
                                borderRadius: "20px",
                                border: plan.recommended ? "2px solid #e11d48" : "1px solid #eee",
                                position: "relative",
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
                            }}>
                                {plan.recommended && (
                                    <div style={{
                                        position: "absolute",
                                        top: "-15px",
                                        left: "50%",
                                        transform: "translateX(-50%)",
                                        background: "#e11d48",
                                        color: "#fff",
                                        padding: "5px 20px",
                                        borderRadius: "20px",
                                        fontSize: "14px",
                                        fontWeight: "600"
                                    }}>
                                        Most Popular
                                    </div>
                                )}
                                <h3 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "10px" }}>{plan.name}</h3>
                                <div style={{ fontSize: "36px", fontWeight: "800", color: "#e11d48", marginBottom: "30px" }}>
                                    {plan.price}
                                </div>
                                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 40px 0", textAlign: "left", flex: 1 }}>
                                    {plan.features.map((feature, fIndex) => (
                                        <li key={fIndex} style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px", color: "#4b5563" }}>
                                            <span style={{ color: "#e11d48", fontWeight: "bold" }}>✓</span> {feature}
                                        </li>
                                    ))}
                                </ul>
                                <button style={{
                                    background: plan.recommended ? "#e11d48" : "#fef2f2",
                                    color: plan.recommended ? "#fff" : "#e11d48",
                                    border: "none",
                                    padding: "15px",
                                    borderRadius: "10px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease"
                                }}>
                                    Get Started
                                </button>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Pricing;
