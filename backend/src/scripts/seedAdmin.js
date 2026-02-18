const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * Ensures the admin user always exists in the database.
 * - If admin does not exist: creates from ENV credentials.
 * - If admin exists but password changed in ENV: updates the password.
 * - Runs automatically on every server start.
 */
const seedAdmin = async () => {
    const email = process.env.BIREENA_ADMIN_EMAIL || process.env.ADMIN_EMAIL;
    const password = process.env.BIREENA_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;

    if (!email || !password) {
        console.warn('[Admin Seed] BIREENA_ADMIN_EMAIL or BIREENA_ADMIN_PASSWORD not set in .env — skipping admin seed.');
        return;
    }

    try {
        const existingAdmin = await User.findOne({ username: email });

        if (!existingAdmin) {
            // Admin does not exist — create from ENV
            const hashedPassword = await bcrypt.hash(password, 10);
            await User.create({
                username: email,
                password: hashedPassword,
                name: 'Admin User',
                role: 'admin',
                isActive: true
            });
            console.log(`[Admin Seed] Admin user created: ${email}`);
        } else {
            // Admin exists — verify password matches ENV, update if different
            const passwordMatches = await bcrypt.compare(password, existingAdmin.password);
            if (!passwordMatches) {
                const hashedPassword = await bcrypt.hash(password, 10);
                existingAdmin.password = hashedPassword;
                existingAdmin.isActive = true;
                // Use updateOne to bypass pre-save hook (which would double-hash)
                await User.updateOne(
                    { username: email },
                    { $set: { password: hashedPassword, isActive: true } }
                );
                console.log(`[Admin Seed] Admin password updated to match ENV: ${email}`);
            } else {
                console.log(`[Admin Seed] Admin user verified OK: ${email}`);
            }
        }
    } catch (error) {
        console.error('[Admin Seed] Error seeding admin user:', error.message);
    }
};

module.exports = seedAdmin;
