import './Features.css';

const Features = () => {
    return (
        <>
            <section className="pos-features">
                <p className="pos-tag">SMART FEATURES</p>
                <h2 className="pos-title">
                    A hotel management software made for<br />
                    all your needs
                </h2>
                <p className="pos-desc">
                    A quick and easy-to-use hotel billing software that makes<br />
                    managing high order volumes butter smooth
                </p>
            </section>

            {/* Billing Section */}
            <section className="billing-section">
                <div className="billing-container">
                    <div className="billing-image">
                        <div className="image-bg">
                            <img src="/pic section/billing-software_lg.avif" alt="Hotel Billing Software UI" />
                        </div>
                    </div>

                    <div className="billing-content">
                        <h3>
                            A quick 3-click hotel <span>billing</span> software
                        </h3>
                        <p>
                            Take orders, punch bills and generate KOT. Accept payments either by
                            splitting bill or merging tables. Easily apply discounts and coupons.
                            All of this, and more, is easy and quick with Bireena Atithi.
                        </p>
                        <a href="#" className="billing-link">
                            Explore all features →
                        </a>
                    </div>
                </div>
            </section>

            {/* Inventory Section */}
            <section className="inventory-section">
                <div className="inventory-container">
                    <div className="inventory-image">
                        <div className="inventory-bg">
                            <img src="/pic section/Inventory.png" alt="Hotel Inventory Management UI" />
                        </div>
                    </div>

                    <div className="inventory-content">
                        <h3>
                            Hotel <span>Inventory</span> management made easier
                        </h3>
                        <p>
                            Do inventory management the smart way. Put your inventory on the item-wise
                            auto deduction, get low-stock alerts, day-end inventory reports and more
                            with Bireena Atithi.
                        </p>
                        <a href="#" className="inventory-link">
                            Explore all features →
                        </a>
                    </div>
                </div>
            </section>

            {/* Reports Section */}
            <section className="reports-section">
                <div className="reports-container">
                    <div className="reports-image">
                        <div className="reports-bg">
                            <img src="/pic section/Report & Analysis.png" alt="Hotel Reports & Analytics UI" />
                        </div>
                    </div>

                    <div className="reports-content">
                        <h3>
                            Get real-time hotel <span>Reports</span>
                        </h3>
                        <p>
                            Automate your hotel reports and go paper free! Track your business
                            activities and get error-free reports on day-end sales, online orders,
                            staff actions, inventory consumption, and many more with
                            Bireena Atithi.
                        </p>
                        <a href="#" className="reports-link">
                            Explore all features →
                        </a>
                    </div>
                </div>
            </section>

            {/* Online Ordering Section */}
            <section className="ordering-section">
                <div className="ordering-container">
                    <div className="ordering-image">
                        <div className="ordering-bg">
                            <img src="/pic section/Online Ordering.png" alt="Online Ordering Management UI" />
                        </div>
                    </div>

                    <div className="ordering-content">
                        <h3>
                            A single <span>Online Ordering System</span> to manage all your orders
                        </h3>
                        <p>
                            Accept online orders, manage online menu, mark food ready, collect
                            payment and check revenue without shuffling between multiple screens.
                        </p>
                        <a href="#" className="ordering-link">
                            Explore all features →
                        </a>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Features;
