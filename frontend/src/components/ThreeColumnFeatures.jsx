import './ThreeColumnFeatures.css';

const ThreeColumnFeatures = () => {
    return (
        <section className="three-col-features">
            <div className="three-col-container">

                {/* Column 1 */}
                <div className="feature-col">
                    <div className="feature-header">
                        <div className="feature-number">1</div>
                        <h3 className="feature-heading">Smart Reservation System</h3>
                    </div>
                    <p className="feature-desc">
                        Manage bookings, check-ins, room status, and guest profiles efficiently from a single, powerful interface. Optimize occupancy and enhance guest experiences.
                    </p>
                </div>

                {/* Column 2 */}
                <div className="feature-col">
                    <div className="feature-header">
                        <div className="feature-number">2</div>
                        <h3 className="feature-heading">Integrated KOT System</h3>
                    </div>
                    <p className="feature-desc">
                        Streamline kitchen operations with digital KOTs. Orders travel instantly from the table to the chef, reducing errors, speeding up service, and tracking preparation times.
                    </p>
                </div>

                {/* Column 3 */}
                <div className="feature-col">
                    <div className="feature-header">
                        <div className="feature-number">3</div>
                        <h3 className="feature-heading">Complete Billing & Reports</h3>
                    </div>
                    <p className="feature-desc">
                        Generate accurate invoices and bills. Access real-time reports on revenue, sales, occupancy, and staff performance for informed business decisions.
                    </p>
                </div>

            </div>
        </section>
    );
};

export default ThreeColumnFeatures;
