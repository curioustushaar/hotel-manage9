import React from 'react';
import { motion } from 'framer-motion';

const features = [
    {
        number: '1',
        title: 'Smart Reservation System',
        description: 'Manage bookings, check-ins, room status, and guest profiles efficiently from a single, powerful interface. Optimize occupancy and enhance guest experiences.'
    },
    {
        number: '2',
        title: 'Integrated Kitchen Order Tickets (KOT)',
        description: 'Streamline kitchen operations with digital KOTs. Orders travel instantly from the table to the chef, reducing errors, speeding up service, and tracking preparation times.'
    },
    {
        number: '3',
        title: 'Complete Hotel Billing & Reports',
        description: 'Generate accurate invoices and bills. Access real-time reports on revenue, sales, occupancy, and staff performance for informed business decisions.'
    }
];

const WhyChoose = () => {
    return (
        <section className="relative py-24 bg-gradient-to-b from-white to-rose-50 overflow-hidden">
            {/* Background blurred glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-300 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

            <motion.div
                className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10"
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >

                {/* Heading Area */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
                        Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-red-600">Bireena Atithi?</span>
                    </h2>
                    <p className="text-gray-500 text-lg mt-4 max-w-2xl mx-auto">
                        Experience the simplified future of hospitality management with our comprehensive features designed for efficiency.
                    </p>
                </div>

                {/* Feature Cards Grid */}
                <div className="grid md:grid-cols-3 gap-10">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="bg-white rounded-2xl shadow-xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col justify-between group h-full"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2, duration: 0.6, ease: "easeOut" }}
                        >
                            <div className="flex items-start gap-4">
                                {/* Number Circle */}
                                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full border border-rose-600 bg-white text-black font-bold text-lg transition-all duration-300 group-hover:bg-rose-600 group-hover:text-white group-hover:scale-110 shadow-sm">
                                    {feature.number}
                                </div>

                                {/* Content */}
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </motion.div>
        </section>
    );
};

export default WhyChoose;
