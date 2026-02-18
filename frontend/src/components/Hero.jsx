import { motion } from 'framer-motion';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero">
            <div className="container hero-flex">
                <motion.div
                    className="hero-text"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1>
                        Hotel Management <br />
                        <span style={{ color: '#e11d48' }}>Software made simple!</span>
                    </h1>
                    <p>
                        Manages all your hotel operations efficiently so that you can focus on growing your brand!
                    </p>
                    <motion.button
                        className="cta-btn"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Take a free demo
                    </motion.button>
                </motion.div>

                <motion.div
                    className="hero-image"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                >
                    {/* High-Quality CSS Composition for Luxury Badge Illustration */}
                    <motion.div
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        style={{ position: 'relative', width: '100%', maxWidth: '500px', aspectRatio: '1/1' }}
                    >
                        {/* Circular Foundation */}
                        <div style={{
                            position: 'absolute',
                            inset: '0',
                            borderRadius: '50%',
                            background: 'white',
                            border: '6px solid #fbbf24',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                            overflow: 'hidden'
                        }}>
                            {/* Inner Red Pattern Background */}
                            <div style={{
                                position: 'absolute',
                                inset: '0',
                                backgroundColor: '#ffffff',
                                backgroundImage: 'radial-gradient(#fecaca 1px, transparent 1px)',
                                backgroundSize: '15px 15px',
                                opacity: 0.5
                            }}></div>

                            {/* Center Shield (Background Layer) */}
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '150%',
                                height: '200px',
                                background: 'radial-gradient(circle, rgba(225,29,72,0.1) 0%, transparent 70%)'
                            }}></div>
                        </div>

                        {/* Top Shield with H */}
                        <div style={{
                            position: 'absolute',
                            top: '10%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '100px',
                            height: '110px',
                            background: '#991b1b',
                            borderRadius: '10px 10px 50px 50px',
                            border: '3px solid #fbbf24',
                            zIndex: 10,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
                        }}>
                            <span style={{ fontSize: '24px' }}>👑</span>
                            <span style={{ fontSize: '40px', fontWeight: 'bold', color: 'white', marginTop: '-5px' }}>H</span>
                        </div>

                        {/* Staff Representation (Avatar Groups) */}
                        <div style={{
                            position: 'absolute',
                            inset: '15% 10% 25% 10%',
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            gap: '0',
                            zIndex: 5
                        }}>
                            {/* Receptionist */}
                            <div style={{ textAlign: 'center', transform: 'translateY(10px) translateX(15px)' }}>
                                <div style={{ width: '100px', height: '100px', background: '#fecaca', borderRadius: '50%', border: '4px solid white', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
                                    <span style={{ fontSize: '60px' }}>👩‍💼</span>
                                </div>
                            </div>

                            {/* Manager (Center) */}
                            <div style={{ textAlign: 'center', zIndex: 2, transform: 'scale(1.15) translateY(-5px)' }}>
                                <div style={{ width: '120px', height: '120px', background: '#fecaca', borderRadius: '50%', border: '5px solid white', overflow: 'hidden', boxShadow: '0 15px 25px rgba(0,0,0,0.2)' }}>
                                    <span style={{ fontSize: '80px' }}>👩‍💻</span>
                                </div>
                            </div>

                            {/* Chef */}
                            <div style={{ textAlign: 'center', transform: 'translateY(10px) translateX(-15px)' }}>
                                <div style={{ width: '100px', height: '100px', background: '#fecaca', borderRadius: '50%', border: '4px solid white', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
                                    <span style={{ fontSize: '60px' }}>👩‍🍳</span>
                                </div>
                            </div>
                        </div>

                        {/* 5-Star Golden Banner */}
                        <div style={{
                            position: 'absolute',
                            bottom: '15%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '80%',
                            background: '#1f2937',
                            padding: '10px 20px',
                            borderRadius: '50px',
                            border: '3px solid #fbbf24',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '5px',
                            zIndex: 20,
                            boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
                        }}>
                            {[1, 2, 3, 4, 5].map(i => (
                                <span key={i} style={{ color: '#fbbf24', fontSize: '24px' }}>★</span>
                            ))}
                        </div>

                        {/* Decorative Leaves (Bottom Corners) */}
                        <div style={{ position: 'absolute', bottom: '10%', left: '-10%', fontSize: '80px', transform: 'rotate(-45deg)', opacity: 0.8 }}>🌿</div>
                        <div style={{ position: 'absolute', bottom: '10%', right: '-10%', fontSize: '80px', transform: 'rotate(45deg) scaleX(-1)', opacity: 0.8 }}>🌿</div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
