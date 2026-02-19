<<<<<<< HEAD
import { Star, Cloud, Globe, Box, Hexagon } from 'lucide-react';
import './TrustedBy.css';

const PARTNERS = [
  { name: 'TrustPilot', icon: <Star size={24} fill="currentColor" />, color: '#00b67a' },
  { name: 'DasHost', icon: <Cloud size={24} />, color: '#3b82f6' },
  { name: 'Cloudsail', icon: <Globe size={24} />, color: '#f59e0b' },
  { name: 'Webbsift', icon: <Box size={24} />, color: '#ef4444' },
  { name: 'Neo Software', icon: <Hexagon size={24} />, color: '#10b981' },
];

const TrustedBy = () => {
  return (
    <section className="trusted-by-section">
      <div className="container trusted-by-container">
        <h3 className="trusted-by-title">Trusted by:</h3>
        <div className="trusted-by-grid">
          {PARTNERS.map((partner, i) => (
            <div key={i} className="trusted-brand" title={partner.name}>
              <span className="brand-icon" style={{ color: partner.color }}>{partner.icon}</span>
              <span className="brand-name">{partner.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
=======
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
>>>>>>> main
};

export default TrustedBy;
