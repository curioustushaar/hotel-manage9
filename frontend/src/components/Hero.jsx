import { Link } from 'react-router-dom';
import HeroImage from '../assets/Hero Image 3.png';
import './Hero.css';
import ParticlesBackground from './ParticlesBackground';
import AdvikaAI from './AdvikaAI';

const Hero = () => {
    return (
        <section className="hero landing-hero">
            <ParticlesBackground />
            <div className="container hero-flex">

                <div className="hero-text">
                    <h1 className="hero-title">
                        <span className="line line-1">
                            Smart Hotel Management Software
                        </span>{' '}
                        <span className="hero-accent line line-2">
                            with KOT
                        </span>
                    </h1>

                    <p className="hero-description hero-animate" style={{ fontSize: "20px", lineHeight: "1.4" }}>
                        Simplify your hotel operations with our powerful and easy-to-use software.
                        Manage reservations, room services, billing, and KOT efficiently. <br />
                        Streamline daily tasks, track bookings in real-time, and enhance guest experience.
                    </p>

                    <div>
                        <Link to="/login" className="cta-btn hero-cta">
                            Get Started
                        </Link>
                    </div>
                </div>

                <div className="hero-img-container hero-img-animate">
                    <img src={HeroImage} alt="Hotel Management Dashboard" className="hero-banner-img" />
                </div>
                <AdvikaAI />

            </div>
        </section>
    );
};

export default Hero;
