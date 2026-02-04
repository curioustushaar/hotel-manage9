import './OutletTypes.css';

const OutletTypes = () => {
    const outlets = [
        { name: 'Food courts &\ncanteens', icon: '🍽️', link: '/food-courts' },
        { name: 'Cafe', icon: '☕', link: '/cafe' },
        { name: 'Fine dine', icon: '🍷', link: '/fine-dine' },
        { name: 'Bar & brewery', icon: '🍺', link: '/bar-brewery' },
        { name: 'Pizzeria', icon: '🍕', link: '/pizzeria' },
        { name: 'QSR', icon: '🍔', link: '/qsr' },
        { name: 'Desserts', icon: '🍨', link: '/desserts' },
        { name: 'Large chains', icon: '🏢', link: '/large-chains' },
        { name: 'Bakery', image: '/pic section/Bakery.png', link: '#' },
        { name: 'Cloud kitchen', image: '/pic section/Cloud Kitchen.png', link: '#' },
    ];

    return (
        <section className="outlet-section">
            <p className="outlet-tag">OUTLET TYPES</p>

            <h2 className="outlet-title">
                Built for all types of food business
            </h2>

            <p className="outlet-subtitle">
                The all-in-one Hotel Management System for all types of hotel
                formats and hospitality outlets
            </p>

            <div className="outlet-grid">
                {outlets.map((outlet, index) => (
                    <div key={index} className="outlet-card">
                        <a href={outlet.link} style={{ textDecoration: 'none' }}>
                            {outlet.image ? (
                                <img src={outlet.image} alt={outlet.name} />
                            ) : (
                                <img
                                    src={`https://placehold.co/80x80/f3f4f6/e11d48?text=${outlet.icon}`}
                                    alt={outlet.name}
                                />
                            )}
                            <p>{outlet.name}</p>
                        </a>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default OutletTypes;
