import './Hero.css';

const Hero = () => {
    return (
        <section className="hero">
            <div className="container hero-flex">
                <div className="hero-text">
                    <h1>Hotel Management Software made simple!</h1>
                    <p>
                        Manages all your hotel operations efficiently so that
                        you can focus on growing your brand.
                    </p>
                    <button className="cta-btn">Take a free demo</button>
                </div>

                <div className="hero-image">
                    <img src="/pic section/Bireena atithi.png" alt="hotel illustration" />
                </div>
            </div>
        </section>
    );
};

export default Hero;
