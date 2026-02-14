const guestMealController = require('./controllers/guestMealController');

console.log("Checking guestMealController exports:");
Object.keys(guestMealController).forEach(key => {
    console.log(`- ${key}`);
});

if (guestMealController.updateOrderStatus) {
    console.log("\n✅ updateOrderStatus function IS exported.");
} else {
    console.error("\n❌ updateOrderStatus function IS NOT exported.");
}
