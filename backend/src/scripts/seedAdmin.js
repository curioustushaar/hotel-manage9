const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * Seeds a user (admin or staff) into the database
 * - If user does not exist: creates from ENV credentials
 * - If user exists but password changed in ENV: updates the password
 */
const seedUser = async (email, password, role, name) => {
    if (!email || !password) {
        return;
    }

    try {
        const existingUser = await User.findOne({ username: email });

        if (!existingUser) {
            // User does not exist — create from ENV
            // Don't hash here - let the model's pre-save hook handle it
            await User.create({
                username: email,
                password: password, // Pass plain password, pre-save hook will hash it
                name: name,
                role: role,
                isActive: true
            });
            console.log(`[${role.toUpperCase()} Seed] User created: ${email}`);
        } else {
            // User exists — verify password matches ENV, update if different
            const passwordMatches = await bcrypt.compare(password, existingUser.password);
            if (!passwordMatches) {
                const hashedPassword = await bcrypt.hash(password, 10);
                // Use updateOne to bypass pre-save hook (which would double-hash)
                await User.updateOne(
                    { username: email },
                    { $set: { password: hashedPassword, isActive: true } }
                );
                console.log(`[${role.toUpperCase()} Seed] Password updated: ${email}`);
            } else {
                console.log(`[${role.toUpperCase()} Seed] User verified OK: ${email}`);
            }
        }
    } catch (error) {
        console.error(`[${role.toUpperCase()} Seed] Error seeding user:`, error.message);
    }
};

/**
 * Ensures the super admin, admin and staff users always exist in the database.
 * Runs automatically on every server start.
 */
const seedAdmin = async () => {
    // Seed Super Admin User
    const superAdminEmail = process.env.BIREENA_SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.BIREENA_SUPER_ADMIN_PASSWORD;
    
    if (superAdminEmail && superAdminPassword) {
        await seedUser(superAdminEmail, superAdminPassword, 'super_admin', 'Super Admin');
    } else {
        console.warn('[Super Admin Seed] BIREENA_SUPER_ADMIN_EMAIL or BIREENA_SUPER_ADMIN_PASSWORD not set in .env — skipping super admin seed.');
    }

    // Seed Admin User
    const adminEmail = process.env.BIREENA_ADMIN_EMAIL || process.env.ADMIN_EMAIL;
    const adminPassword = process.env.BIREENA_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;

    
    if (adminEmail && adminPassword) {
        await seedUser(adminEmail, adminPassword, 'admin', 'Admin User');
    } else {
        console.warn('[Admin Seed] BIREENA_ADMIN_EMAIL or BIREENA_ADMIN_PASSWORD not set in .env — skipping admin seed.');
    }

    // Seed Staff User
    const staffEmail = process.env.BIREENA_STAFF_EMAIL;
    const staffPassword = process.env.BIREENA_STAFF_PASSWORD;
    
    if (staffEmail && staffPassword) {
        await seedUser(staffEmail, staffPassword, 'staff', 'Staff User');
    } else {
        console.warn('[Staff Seed] BIREENA_STAFF_EMAIL or BIREENA_STAFF_PASSWORD not set in .env — skipping staff seed.');
    }
};

module.exports = seedAdmin;
