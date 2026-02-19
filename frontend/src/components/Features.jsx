<<<<<<< HEAD
import { CalendarDays, UtensilsCrossed, Receipt } from 'lucide-react';
import './Features.css';

const FEATURES = [
  {
    title: 'Reservation Management',
    description: 'Streamline bookings and manage check-ins and check-outs with ease.',
    icon: <CalendarDays strokeWidth={1.5} size={32} />,
    color: '#e11d48', // Red
    bg: '#ffe5e8', // Soft red
  },
  {
    title: 'KOT & Room Service',
    description: 'Handle kitchen order tickets and room service orders efficiently from one place.',
    icon: <UtensilsCrossed strokeWidth={1.5} size={32} />,
    color: '#f97316', // Orange
    bg: '#ffmVcc', // Soft orange/peach - fix hex below
    bg: '#ffedd5',
  },
  {
    title: 'Billing & Invoicing',
    description: 'Generate bills, apply discounts, and manage payments with a few clicks.',
    icon: <Receipt strokeWidth={1.5} size={32} />,
    color: '#0fb981', // Green
    bg: '#d1fae5', // Soft green
  },
];

const Features = () => {
  return (
    <section className="features-section landing-features" id="features">
      <div className="container">
        <h2 className="features-heading">All-in-One Solution for Seamless Hotel Operations</h2>
        <p className="features-subheading">Bireena Atithi provides everything you need to streamline your hotel management.</p>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card">
              <div
                className="feature-icon-wrap"
                style={{ backgroundColor: f.bg, color: f.color }}
              >
                <span className="feature-icon" aria-hidden="true">{f.icon}</span>
              </div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
=======
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
>>>>>>> main
};

export default Features;
