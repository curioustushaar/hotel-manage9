const express = require('express');
const app = express();
const guestMealRoutes = require('./routes/guestMealRoutes');

app.use('/api/guest-meal', guestMealRoutes);

console.log("Checking routes in guestMealRoutes:");
app._router.stack.forEach(function (r) {
    if (r.route && r.route.path) {
        console.log(r.route.path)
    }
});

// Since guestMealRoutes is a Router, we need to inspect that
const router = guestMealRoutes;
console.log("\nRoutes in guestMealRoutes:");
router.stack.forEach(function (r) {
    if (r.route && r.route.path) {
        console.log(`${Object.keys(r.route.methods)[0].toUpperCase()} ${r.route.path}`);
    }
});
