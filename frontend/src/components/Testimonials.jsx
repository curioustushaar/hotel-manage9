import { useState, useEffect } from 'react';
import './Testimonials.css';

const Testimonials = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const testimonials = [
        {
            name: 'Deepika Sharma',
            role: 'Owner, Hotel Raj Palace',
            image: '/pic section/deepika.jpg',
            quote: '"Bireena Atithi has completely transformed how we manage our hotel. The integrated billing system saved us hours of manual work every day. The Zomato and Swiggy integration is seamless - we can manage all online orders from a single dashboard. Their 24/7 support team is always ready to help!"',
            logo: '/pic section/B I R E E NA edutech.png'
        },
        {
            name: 'Rajesh Kumar',
            role: 'Manager, Spice Garden Restaurant',
            image: '/pic section/deepika.jpg',
            quote: '"Before Bireena Atithi, managing inventory was a nightmare. Now with automatic stock deduction and low-stock alerts, we never run out of ingredients. The real-time reports help us make better business decisions. Best investment we made!"',
            logo: '/pic section/B I R E E NA edutech.png'
        },
        {
            name: 'Amit Verma',
            role: 'Owner, Foodie\'s Paradise',
            image: '/pic section/deepika.jpg',
            quote: '"The software is so easy to use that even our staff learned it within a day. The billing is super fast and the reports are very detailed. Customer support is excellent - they helped us set up everything smoothly. Highly recommended for any restaurant!"',
            logo: '/pic section/B I R E E NA edutech.png'
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % testimonials.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [testimonials.length]);

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    // Counter animation
    useEffect(() => {
        const animateCounter = (element, target, suffix = '') => {
            if (!element) return;

            const duration = 2000;
            const start = 0;
            const increment = target / (duration / 16);
            let current = start;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    element.textContent = target + suffix;
                    clearInterval(timer);
                } else {
                    element.textContent = Math.floor(current) + suffix;
                }
            }, 16);
        };

        const customers = document.querySelector('[data-count="100"]');
        const bills = document.querySelector('[data-count="60"]');
        const errors = document.querySelector('[data-count="0"]');

        if (customers) animateCounter(customers, 100, 'K+');
        if (bills) animateCounter(bills, 60, 'L');
        if (errors) animateCounter(errors, 0, '%');
    }, []);

    return (
        <section className="testimonial-section">
            <div className="container">
                {/* Testimonial Slider */}
                <div className="testimonial-slider">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className={`testimonial-slide ${currentSlide === index ? 'active' : ''}`}
                        >
                            <div className="testimonial-card">
                                <div className="testimonial-image">
                                    <img src={testimonial.image} alt={testimonial.name} />
                                </div>

                                <div className="testimonial-content">
                                    <p className="testimonial-quote">{testimonial.quote}</p>
                                    <p className="testimonial-author">{testimonial.name},</p>
                                    <p className="testimonial-role">{testimonial.role}</p>

                                    <div className="testimonial-brand-logo">
                                        <img src={testimonial.logo} alt={testimonial.role} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Slider Dots */}
                    <div className="testimonial-dots">
                        {testimonials.map((_, index) => (
                            <span
                                key={index}
                                className={`dot ${currentSlide === index ? 'active' : ''}`}
                                onClick={() => goToSlide(index)}
                            ></span>
                        ))}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid-horizontal">
                    <div className="stat-card-horizontal">
                        <div className="stat-icon-svg">
                            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="40" cy="45" r="22" stroke="#1f2937" strokeWidth="2.5" fill="none" />
                                <circle cx="33" cy="40" r="2.5" fill="#1f2937" />
                                <circle cx="47" cy="40" r="2.5" fill="#1f2937" />
                                <path d="M32 52 Q40 60 48 52" stroke="#1f2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                                <circle cx="18" cy="25" r="6" stroke="#1f2937" strokeWidth="1.5" fill="none" />
                                <circle cx="16" cy="24" r="1" fill="#1f2937" />
                                <circle cx="20" cy="24" r="1" fill="#1f2937" />
                                <path d="M15 27 Q18 30 21 27" stroke="#1f2937" strokeWidth="1" fill="none" />
                                <path d="M62 20 L62 28 M58 24 L66 24" stroke="#1f2937" strokeWidth="1.5" strokeLinecap="round" />
                                <circle cx="15" cy="55" r="2" fill="#1f2937" />
                                <circle cx="65" cy="55" r="1.5" fill="#1f2937" />
                            </svg>
                        </div>
                        <div className="stat-info">
                            <div className="stat-number" data-count="100" data-suffix="K+">0</div>
                            <div className="stat-label">Happy customers</div>
                        </div>
                    </div>

                    <div className="stat-card-horizontal">
                        <div className="stat-icon-svg">
                            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="18" y="10" width="38" height="55" rx="4" stroke="#1f2937" strokeWidth="2.5" fill="none" />
                                <path d="M56 18 L65 18 L65 60 C65 63 62 66 59 66 L30 66" stroke="#1f2937" strokeWidth="2.5" fill="none" />
                                <path d="M25 25 Q30 22 35 25 Q40 28 45 25 Q50 22 55 25" stroke="#1f2937" strokeWidth="2" />
                                <path d="M25 35 Q30 32 35 35 Q40 38 45 35 Q50 32 55 35" stroke="#1f2937" strokeWidth="2" />
                                <circle cx="37" cy="50" r="10" stroke="#1f2937" strokeWidth="2" fill="#fecdd3" />
                                <text x="37" y="55" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1f2937">₹</text>
                            </svg>
                        </div>
                        <div className="stat-info">
                            <div className="stat-number" data-count="60" data-suffix="L">0</div>
                            <div className="stat-label">Bills processed everyday</div>
                        </div>
                    </div>

                    <div className="stat-card-horizontal">
                        <div className="stat-icon-svg">
                            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="20" y="10" width="40" height="6" rx="2" fill="#1f2937" />
                                <rect x="20" y="64" width="40" height="6" rx="2" fill="#1f2937" />
                                <path d="M24 16 L24 28 Q24 40 40 40 Q56 40 56 28 L56 16" stroke="#1f2937" strokeWidth="2.5" fill="none" />
                                <path d="M24 64 L24 52 Q24 40 40 40 Q56 40 56 52 L56 64" stroke="#1f2937" strokeWidth="2.5" fill="none" />
                                <path d="M30 64 L30 56 Q30 48 40 48 Q50 48 50 56 L50 64" fill="#fecdd3" />
                                <circle cx="55" cy="52" r="10" fill="#fff" stroke="#1f2937" strokeWidth="2" />
                                <path d="M50 52 L54 56 L60 48" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="stat-info">
                            <div className="stat-number" data-count="0" data-suffix="%">0%</div>
                            <div className="stat-label">Processing errors</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
