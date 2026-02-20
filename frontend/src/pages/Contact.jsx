import React from "react";
import Reveal from "../components/Reveal";

const Contact = () => {
    return (
        <div style={{ paddingTop: "120px", paddingBottom: "100px", minHeight: "100vh", background: "#fff6f7" }}>
            <div className="container" style={{ maxWidth: "1200px" }}>
                <Reveal width="100%">
                    <h1 style={{ fontSize: "42px", fontWeight: "700", marginBottom: "20px", textAlign: "center" }}>
                        Get in <span style={{ color: "#e11d48" }}>Touch</span>
                    </h1>
                </Reveal>
                <Reveal delay={0.1} width="100%">
                    <p style={{ fontSize: "18px", color: "#666", marginBottom: "60px", textAlign: "center", maxWidth: "800px", margin: "0 auto 60px" }}>
                        Have questions about our hotel management system? We're here to help you grow your business.
                    </p>
                </Reveal>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                    gap: "50px",
                    alignItems: "start"
                }}>
                    <Reveal delay={0.2} width="100%">
                        <div style={{ background: "#fff", padding: "40px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                            <h3 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "30px" }}>Send us a Message</h3>
                            <form onSubmit={(e) => e.preventDefault()}>
                                <div style={{ marginBottom: "20px" }}>
                                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Your Name</label>
                                    <input type="text" placeholder="John Doe" style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #eee", background: "#f9f9f9" }} />
                                </div>
                                <div style={{ marginBottom: "20px" }}>
                                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Work Email</label>
                                    <input type="email" placeholder="john@company.com" style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #eee", background: "#f9f9f9" }} />
                                </div>
                                <div style={{ marginBottom: "20px" }}>
                                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Phone Number</label>
                                    <input type="tel" placeholder="+91 98765-43210" style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #eee", background: "#f9f9f9" }} />
                                </div>
                                <div style={{ marginBottom: "30px" }}>
                                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Message</label>
                                    <textarea placeholder="How can we help your hotel?" rows="4" style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #eee", background: "#f9f9f9" }}></textarea>
                                </div>
                                <button style={{
                                    width: "100%",
                                    background: "#e11d48",
                                    color: "#fff",
                                    border: "none",
                                    padding: "15px",
                                    borderRadius: "10px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                    boxShadow: "0 5px 15px rgba(225, 29, 72, 0.3)"
                                }}>
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </Reveal>

                    <Reveal delay={0.3} width="100%">
                        <div style={{ background: "#fff", padding: "40px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                            <h3 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "30px" }}>Contact Information</h3>

                            <div style={{ marginBottom: "30px" }}>
                                <p style={{ fontWeight: "600", color: "#e11d48", marginBottom: "5px" }}>Email Us</p>
                                <p style={{ color: "#4b5563" }}>support@bireenaatithi.com</p>
                            </div>

                            <div style={{ marginBottom: "30px" }}>
                                <p style={{ fontWeight: "600", color: "#e11d48", marginBottom: "5px" }}>Call Us</p>
                                <p style={{ color: "#4b5563" }}>+91 98765 43210</p>
                            </div>

                            <div style={{ marginBottom: "30px" }}>
                                <p style={{ fontWeight: "600", color: "#e11d48", marginBottom: "5px" }}>Office Address</p>
                                <p style={{ color: "#4b5563" }}>
                                    B36, Mitra Mandal Colony, Vashist Colony,<br />
                                    Anisabad, Patna, Bihar 800002
                                </p>
                            </div>

                            <div style={{ marginTop: "40px", borderTop: "1px solid #eee", paddingTop: "30px" }}>
                                <p style={{ fontWeight: "600", marginBottom: "15px" }}>Follow Us</p>
                                <div style={{ display: "flex", gap: "15px" }}>
                                    {['FB', 'IG', 'LN', 'TW'].map(social => (
                                        <div key={social} style={{
                                            width: "40px",
                                            height: "40px",
                                            borderRadius: "50%",
                                            background: "#fef2f2",
                                            color: "#e11d48",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontWeight: "700",
                                            fontSize: "12px",
                                            cursor: "pointer"
                                        }}>
                                            {social}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>

                {/* GOOGLE MAP SECTION */}
                <Reveal delay={0.4} width="100%">
                    <div style={{ marginTop: "60px", borderRadius: "20px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", border: "4px solid #fff" }}>
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3598.6793616254!2d85.09919037539077!3d25.58280627746401!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ed579f18074697%3A0xc3f92e42f6233486!2sBireena%20Info%20Tech!5e0!3m2!1sen!2sin!4v1708433360000!5m2!1sen!2sin"
                            width="100%"
                            height="450"
                            style={{ border: 0, display: "block" }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Bireena Info Tech Location"
                        ></iframe>
                    </div>
                </Reveal>
            </div>
        </div>
    );
};

export default Contact;
