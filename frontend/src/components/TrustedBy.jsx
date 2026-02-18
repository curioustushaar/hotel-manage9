import './TrustedBy.css';

const TrustedBy = () => {
    const logos = [
        "/pic section/B I R E E NA edutech.png",
        "/pic section/B I R E E NA edutech.png",
        "/pic section/B I R E E NA edutech.png",
        "/pic section/B I R E E NA edutech.png",
        "/pic section/B I R E E NA edutech.png",
        "/pic section/B I R E E NA edutech.png",
        "/pic section/B I R E E NA edutech.png",
        "/pic section/B I R E E NA edutech.png",
        "/pic section/B I R E E NA edutech.png",
        "/pic section/B I R E E NA edutech.png",
        "/pic section/B I R E E NA edutech.png",
        "/pic section/B I R E E NA edutech.png",
    ];

    return (
        <section className="trusted-section">
            <h2>
                Trusted by <span>1,00,000+</span> hotels
            </h2>

            <div className="logo-slider">
                <div className="logo-track">
                    {/* Original logos */}
                    {logos.map((logo, index) => (
                        <img key={index} src={logo} alt={`Brand ${index + 1}`} />
                    ))}
                    {/* Duplicate logos for infinite loop */}
                    {logos.map((logo, index) => (
                        <img key={`dup-${index}`} src={logo} alt={`Brand ${index + 1}`} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TrustedBy;
