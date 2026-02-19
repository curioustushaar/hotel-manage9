import { Link } from 'react-router-dom';
import './CTASection.css';

const CTASection = () => {
  return (
    <section className="cta-section" id="contact">
      <div className="cta-bg-deco" aria-hidden="true">
        <img src="https://placehold.co/1200x400/fff1f2/e11d48?text=Hospitality+Illustration" alt="" className="cta-illustration-bg" />
      </div>
      <div className="container cta-inner">
        <h2 className="cta-heading">Ready to simplify your hotel management?</h2>
        <p className="cta-subheading">Try our all-in-one hotel management software and experience the difference.</p>
        <Link to="/login" className="cta-button">Get Started for Free</Link>
      </div>
    </section>
  );
};

export default CTASection;
