import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-top">
                {/* Bireena Atithi */}
                <div className="footer-col">
                    <h4>Bireena Atithi</h4>
                    <ul>
                        <li><a href="/billing">Billing</a></li>
                        <li><a href="/inventory">Inventory</a></li>
                        <li><a href="/reporting">Reporting</a></li>
                        <li><a href="/online-ordering">Online Ordering</a></li>
                        <li><a href="/crm">CRM</a></li>
                        <li><a href="/menu">Menu</a></li>
                    </ul>

                    <a href="/demo" className="footer-btn">Take a free demo</a>
                </div>

                {/* Add-ons */}
                <div className="footer-col">
                    <h4>Add-ons</h4>
                    <ul>
                        <li><a href="/marketplace">Marketplace</a></li>
                        <li><a href="/integration">Integrations</a></li>
                    </ul>
                </div>

                {/* Outlet types */}
                <div className="footer-col">
                    <h4>Outlet types</h4>
                    <ul>
                        <li><a href="/fine-dine">Fine Dine</a></li>
                        <li><a href="/qsr">QSR</a></li>
                        <li><a href="/cafe">Cafe</a></li>
                        <li><a href="/food-courts">Food Court</a></li>
                        <li><a href="/cloud-kitchen">Cloud Kitchen</a></li>
                        <li><a href="/desserts">Ice Cream</a></li>
                        <li><a href="/bakery">Bakery</a></li>
                        <li><a href="/bar-brewery">Bar & Brewery</a></li>
                        <li><a href="/pizzeria">Pizzeria</a></li>
                        <li><a href="/large-chains">Large Chains</a></li>
                    </ul>
                </div>

                {/* Resources */}
                <div className="footer-col">
                    <h4>Resources</h4>
                    <ul>
                        <li><a href="/pricing">Pricing</a></li>
                        <li><a href="/blogs">Blog</a></li>
                        <li><a href="/careers">Careers</a></li>
                        <li><a href="/support">Support</a></li>
                        <li><a href="/about-us">About Us</a></li>
                        <li><a href="/reseller">Reseller</a></li>
                        <li><a href="/magazine">Magazine</a></li>
                    </ul>
                </div>

                {/* Company */}
                <div className="footer-col footer-company">
                    <h4>Bireena Atithi</h4>
                    <p>
                        B-36, Anisabad,<br />
                        Patna, Bihar, India<br />
                        800002
                    </p>
                </div>
            </div>

            {/* SOCIAL + CONTACT */}
            <div className="footer-middle">
                <div className="footer-logo">
                    <img src="/pic section/B I R E E NA edutech.png" alt="Bireena Atithi Logo" />
                </div>

                <div className="footer-social">
                    <a href="#">Facebook</a>
                    <a href="#">Instagram</a>
                    <a href="#">Youtube</a>
                </div>

                <div className="footer-contact">
                    <a href="tel:+919135155931">+91 91351-55931</a>
                    <a href="tel:+919304942225">+91 93049-42225</a>
                    <a href="mailto:bireenainfo@gmail.com">bireenainfo@gmail.com</a>
                </div>
            </div>

            {/* BOTTOM */}
            <div className="footer-bottom">
                <p>
                    COPYRIGHT © 2026 – Bireena Atithi Food Services Pvt. Ltd., India ·
                    <a href="#">Privacy</a> ·
                    <a href="#">Compliance</a> ·
                    <a href="#">Terms</a> ·
                    <a href="#">EULA</a> ·
                    <a href="#">Cancellation & Refund</a>
                </p>
            </div>
        </footer>
    );
};

export default Footer;
