import './Ratings.css';

const Ratings = () => {
    return (
        <section className="ratings-section">
            <div className="ratings-grid">
                {/* Capterra */}
                <div className="rating-card">
                    <p className="rating-text">
                        Rated as the best and most popular<br />
                        hotel billing solution
                    </p>
                    <img src="/pic section/Capterra.png" alt="Capterra" className="rating-logo" />
                    <div className="stars-wrapper"></div>
                </div>

                {/* Software Suggest */}
                <div className="rating-card">
                    <p className="rating-text">
                        Rated as the most user-friendly<br />
                        hotel management software
                    </p>
                    <img src="/pic section/Softwaree suggest.png" alt="Software Suggest" className="rating-logo" />
                    <div className="stars-wrapper"></div>
                </div>

                {/* Google */}
                <div className="rating-card">
                    <p className="rating-text">
                        Hoteliers rated us the most recommended<br />
                        hotel software provider
                    </p>
                    <img src="/pic section/Google.png" alt="Google" className="rating-logo" />
                </div>
            </div>
        </section>
    );
};

export default Ratings;
