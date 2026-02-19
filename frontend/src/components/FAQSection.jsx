import React, { useState, useEffect, useRef } from 'react';
import './FAQSection.css';

const faqData = [
    {
        question: "What is Bireena Atithi?",
        answer: "Bireena Atithi is a smart hotel management solution that simplifies reservations, billing, reporting, and operations in one unified platform."
    },
    {
        question: "Can I manage multiple hotel properties?",
        answer: "Yes, the system supports multi-property management with centralized control and reporting."
    },
    {
        question: "Does it support Kitchen Order Tickets (KOT)?",
        answer: "Absolutely. KOT integration helps streamline kitchen workflows and reduce manual errors."
    },
    {
        question: "Is the system cloud-based?",
        answer: "Yes, it is fully cloud-based and accessible from anywhere."
    },
    {
        question: "How secure is the platform?",
        answer: "We use encrypted data storage and secure authentication systems to ensure maximum safety."
    },
    {
        question: "Do you provide customer support?",
        answer: "Yes, 24/7 expert support is available via chat, email, and phone."
    }
];

const FAQSection = () => {
    const [activeIndex, setActiveIndex] = useState(null);
    const sectionRef = useRef(null);

    const toggleFAQ = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    useEffect(() => {
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

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <section className="faq-section" ref={sectionRef}>
            <div className="faq-container">
                <h2 className="faq-title">Frequently Asked Questions</h2>
                <p className="faq-subtitle">Everything you need to know about Bireena Atithi.</p>

                <div className="faq-list">
                    {faqData.map((item, index) => (
                        <div
                            key={index}
                            className={`faq-item ${activeIndex === index ? "active" : ""}`}
                        >
                            <div className="faq-question" onClick={() => toggleFAQ(index)}>
                                {item.question}
                                <span className="faq-icon">
                                    {activeIndex === index ? (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M6 12H18" stroke="#d61c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    ) : (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 6V18M6 12H18" stroke="#d61c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </span>
                            </div>
                            <div className="faq-answer">
                                <p>{item.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
