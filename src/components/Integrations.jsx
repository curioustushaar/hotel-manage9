import './Integrations.css';

const Integrations = () => {
    const integrationImages = [
        "/pic section/Swigy.png",
        "/pic section/Zomoto.png",
        "/pic section/Urban.png",
        "/pic section/Ola.png",
        "/pic section/Rozapay.png",
        "/pic section/Watssap.png",
        "/pic section/Tally.png",
        "/pic section/Sap.png",
        "/pic section/Paytm.png",
        "/pic section/Google pay.png",
    ];

    return (
        <section className="integrations-section">
            <div className="integrations-top">
                {/* LEFT CONTENT */}
                <div className="integrations-content">
                    <p className="integrations-tag">INTEGRATIONS</p>

                    <h2 className="integrations-title">
                        Multiple integrations – single<br />
                        dashboard
                    </h2>

                    <p className="integrations-desc">
                        Manage 150+ third-party integrations and services directly
                        from your hotel management software
                    </p>

                    <a href="#" className="integrations-btn">
                        See all integrations →
                    </a>
                </div>

                {/* RIGHT ILLUSTRATION */}
                <div className="integrations-visual">
                    <img src="/pic section/imgs.png" alt="Integrations Illustration" />
                </div>
            </div>

            {/* INTEGRATIONS GRID */}
            <div className="integrations-grid">
                {/* Row 1 */}
                {integrationImages.map((img, index) => (
                    <div key={`row1-${index}`} className="integration-card">
                        <img src={img} alt={`Integration ${index + 1}`} />
                    </div>
                ))}

                {/* Row 2 (text cards) */}
                <div className="integration-text">Online ordering</div>
                <div className="integration-card">
                    <img src="/pic section/Google pay.png" alt="Google Pay" />
                </div>
                <div className="integration-text">Loyalty</div>
                <div className="integration-card">
                    <img src="/pic section/Tally.png" alt="Tally" />
                </div>
                <div className="integration-text wide">Customer satisfaction</div>
                <div className="integration-card">
                    <img src="/pic section/Watssap.png" alt="WhatsApp" />
                </div>
                <div className="integration-text wide">Payments & accounting</div>

                {/* Row 3 */}
                {[...integrationImages.slice(0, 2), ...integrationImages.slice(6, 10), ...integrationImages.slice(8, 10)].map((img, index) => (
                    <div key={`row3-${index}`} className="integration-card">
                        <img src={img} alt={`Integration ${index + 1}`} />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Integrations;
