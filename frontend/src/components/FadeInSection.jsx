import React from 'react';
import { motion } from 'framer-motion';

const FadeInSection = ({ children, delay = 0, className = "" }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: "easeInOut", delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default FadeInSection;
