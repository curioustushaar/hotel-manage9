import React from "react";
import "./testimonial.css";

const testimonials = [
    {
        name: "Rahul Sharma",
        hotel: "Royal Palace Hotel",
        image: "https://i.pravatar.cc/100?img=12",
        review:
            "Bireena Atithi completely transformed our reservation and billing process. KOT automation saved us hours daily!",
    },
    {
        name: "Priya Mehta",
        hotel: "Sunrise Inn",
        image: "https://i.pravatar.cc/100?img=32",
        review:
            "Super smooth interface and excellent customer support. Our operations are now faster and error-free.",
    },
    {
        name: "Amit Verma",
        hotel: "Grand Stay Resort",
        image: "https://i.pravatar.cc/100?img=45",
        review:
            "The reporting and analytics feature gives us powerful insights to grow revenue confidently.",
    },
];

const TestimonialSection = () => {
    return (
        <section className="testimonial-section">
            <div className="testimonial-container">
                <h2 className="testimonial-title">
                    What Our <span>Clients</span> Say
                </h2>
                <p className="testimonial-subtitle">
                    Trusted by modern hotels across India.
                </p>

                <div className="testimonial-grid">
                    {testimonials.map((item, index) => (
                        <div className="testimonial-card" key={index}>
                            <div className="card-header">
                                <div className="client-info">
                                    <img src={item.image} alt={item.name} />
                                    <div>
                                        <h4 className="client-name">{item.name}</h4>
                                        <p>{item.hotel}</p>
                                    </div>
                                </div>
                                <div className="stars">★★★★★</div>
                            </div>

                            <p className="review-text">{item.review}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialSection;
