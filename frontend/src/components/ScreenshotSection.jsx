import Logo from '../assets/logo.jpeg';
import './ScreenshotSection.css';

const ScreenshotSection = () => {
  return (
    <section className="screenshot-section" id="pricing">
      <div className="container">
        <h2 className="screenshot-heading">Powerful Features to Boost Your Hotel Operations</h2>
        <div className="screenshot-grid">

          {/* Reservation Mockup */}
          <div className="screenshot-card">
            <div className="screenshot-frame mockup-container">
              <div className="mockup-sidebar">
                <img src={Logo} alt="Logo" className="mockup-logo-img" />
              </div>
              <div className="mockup-content">
                <div className="mockup-header">
                  <div className="mockup-title-bar"></div>
                  <div className="mockup-btn red">Reservation</div>
                </div>
                <div className="mockup-table">
                  <div className="mockup-row header">
                    <span style={{ width: '15%' }}></span>
                    <span style={{ width: '35%' }}></span>
                    <span style={{ width: '25%' }}></span>
                    <span style={{ width: '15%' }}></span>
                  </div>
                  <div className="mockup-row">
                    <span style={{ width: '15%' }}>101</span>
                    <span style={{ width: '35%' }}>John Doe</span>
                    <span style={{ width: '25%' }}>Oct 12-14</span>
                    <span className="mockup-badge green">Active</span>
                  </div>
                  <div className="mockup-row">
                    <span style={{ width: '15%' }}>102</span>
                    <span style={{ width: '35%' }}>Sarah Smith</span>
                    <span style={{ width: '25%' }}>Oct 12-15</span>
                    <span className="mockup-badge yellow">Pending</span>
                  </div>
                  <div className="mockup-row">
                    <span style={{ width: '15%' }}>104</span>
                    <span style={{ width: '35%' }}>Robert Fox</span>
                    <span style={{ width: '25%' }}>Oct 13-14</span>
                    <span className="mockup-badge green">Active</span>
                  </div>
                </div>
              </div>
            </div>
            <h3 className="mockup-label">Reservation Management</h3>
          </div>

          {/* KOT Mockup */}
          <div className="screenshot-card">
            <div className="screenshot-frame mockup-container">
              <div className="mockup-sidebar">
                <img src={Logo} alt="Logo" className="mockup-logo-img" />
              </div>
              <div className="mockup-content">
                <div className="mockup-header">
                  <div className="mockup-title-bar" style={{ width: '40%' }}></div>
                </div>
                <div className="kot-grid">
                  <div className="kot-ticket">
                    <div className="kot-header">
                      <span className="kot-table">Table 05</span>
                      <span className="mockup-badge orange">Prep</span>
                    </div>
                    <div className="kot-divider"></div>
                    <div className="kot-items">
                      <div className="kot-item"><span>1x</span> <span>Paneer Tikka</span></div>
                      <div className="kot-item"><span>2x</span> <span>Butter Naan</span></div>
                    </div>
                    <div className="kot-footer">
                      <div className="mockup-btn-sm red">Ready to Serve</div>
                    </div>
                  </div>
                  <div className="kot-ticket">
                    <div className="kot-header">
                      <span className="kot-table">Room 201</span>
                      <span className="mockup-badge green">Ready</span>
                    </div>
                    <div className="kot-divider"></div>
                    <div className="kot-items">
                      <div className="kot-item"><span>1x</span> <span>Veg Pizza</span></div>
                      <div className="kot-item"><span>1x</span> <span>Coke (L)</span></div>
                    </div>
                    <div className="kot-footer">
                      <div className="mockup-btn-sm gray">Completed</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <h3 className="mockup-label">KOT & Room Service</h3>
          </div>

          {/* Billing Mockup */}
          <div className="screenshot-card">
            <div className="screenshot-frame mockup-container">
              <div className="mockup-sidebar">
                <img src={Logo} alt="Logo" className="mockup-logo-img" />
              </div>
              <div className="mockup-content">
                <div className="mockup-header">
                  <div className="mockup-title-bar"></div>
                </div>
                <div className="mockup-invoice">
                  <div className="invoice-header">
                    <img src={Logo} alt="Logo" className="mockup-logo-img-sm" />
                    <div className="invoice-info"></div>
                  </div>
                  <div className="billing-list">
                    <div className="billing-row header">
                      <span>Item</span>
                      <span>Qty</span>
                      <span>Amt</span>
                    </div>
                    <div className="billing-row">
                      <span>Room Charges (3N)</span>
                      <span>1</span>
                      <span>3000</span>
                    </div>
                    <div className="billing-row">
                      <span>Restaurant Bill</span>
                      <span>2</span>
                      <span>450</span>
                    </div>
                    <div className="billing-row">
                      <span>GST (12%)</span>
                      <span>-</span>
                      <span>414</span>
                    </div>
                  </div>
                  <div className="invoice-total">
                    <span>Total Payable</span>
                    <span className="text-red">$3,864.00</span>
                  </div>
                  <div className="invoice-actions">
                    <div className="mockup-btn red block">Confirm Payment</div>
                  </div>
                </div>
              </div>
            </div>
            <h3 className="mockup-label">Billing & Invoicing</h3>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ScreenshotSection;
