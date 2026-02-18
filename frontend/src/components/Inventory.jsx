function Inventory() {
    return (
        <section className="inventory-section">
            <div className="inventory-container">
                <div className="inventory-image">
                    <div className="inventory-bg">
                        <img src="/images/Inventory.png" alt="Hotel Inventory Management UI" />
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
    );
}

export default Inventory;
