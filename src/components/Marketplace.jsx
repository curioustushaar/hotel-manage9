import { useState } from 'react';
import './Marketplace.css';

const Marketplace = () => {
    const [activeTab, setActiveTab] = useState(2); // Customer service is active by default

    const tabs = [
        { id: 0, name: 'CRM', description: null },
        { id: 1, name: 'Analytics', description: null },
        {
            id: 2,
            name: 'Customer service',
            description: 'Use smart and easy-to-use technology that helps you offer premium service and the best hospitality to make your customers\' experiences memorable',
            link: '#'
        },
        { id: 3, name: 'Operations', description: null },
    ];

    return (
        <section className="marketplace-section">
            <p className="marketplace-tag">APP MARKETPLACE</p>

            <h2 className="marketplace-title">
                Add-ons to supercharge<br />
                your Hotel Software
            </h2>

            <div className="marketplace-container">
                {/* LEFT MENU */}
                <div className="marketplace-menu">
                    <ul>
                        {tabs.map((tab) => (
                            <li
                                key={tab.id}
                                className={activeTab === tab.id ? 'active' : ''}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.name}
                                {activeTab === tab.id && tab.description && (
                                    <>
                                        <p>{tab.description}</p>
                                        <a href={tab.link}>Learn more</a>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* RIGHT VISUAL */}
                <div className="marketplace-visual">
                    <div className="visual-bg">
                        <img src="/pic section/Add ons Market place.png" alt="Hotel Software Add-ons UI" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Marketplace;
