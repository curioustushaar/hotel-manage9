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
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 13.87C4.31 13.12 3.25 11.53 3.5 9.77C3.76 7.91 5.38 6.54 7.26 6.54C7.54 6.54 7.82 6.57 8.08 6.63C8.62 3.96 11.08 2 14 2C17.31 2 20 4.69 20 8C20 8.35 19.96 8.69 19.89 9.03C21.43 9.94 22.34 11.64 22.09 13.43C21.82 15.35 20.15 16.71 18.23 16.71H17V19C17 20.66 15.66 22 14 22H9C7.34 22 6 20.66 6 19V17H5.77C5.83 15.89 5.86 14.86 6 13.87ZM8 17H15V19C15 19.55 14.55 20 14 20H9C8.45 20 8 19.55 8 19V17Z" fill="white" />
                    </svg>
                    BIREENA ATITHI
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
