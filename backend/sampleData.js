// Sample Menu Items for Testing
// You can use these to quickly populate your database

const sampleMenuItems = [
    {
        itemName: "paneer",
        category: "Cake",
        price: 12.00,
        description: "---",
        status: "Active"
    },
    {
        itemName: "paneer Masala",
        category: "Cake",
        price: 12.00,
        description: "my masis",
        status: "Active"
    },
    {
        itemName: "paneer Masala",
        category: "Chicken",
        price: 80.00,
        description: "tasty",
        status: "Active"
    },
    {
        itemName: "Paner Masta",
        category: "Chicken",
        price: 50.00,
        description: "chicken",
        status: "Active"
    },
    {
        itemName: "romalli",
        category: "Mithai",
        price: 300.00,
        description: "---",
        status: "Active"
    },
    {
        itemName: "makalii",
        category: "Milk",
        price: 500.00,
        description: "---",
        status: "Active"
    },
    {
        itemName: "chicken full plate",
        category: "Vegetarian",
        price: 200.00,
        description: "veg",
        status: "Active"
    },
    {
        itemName: "Butter Chicken",
        category: "Chicken",
        price: 280.00,
        description: "Creamy tomato-based chicken curry",
        status: "Active"
    },
    {
        itemName: "Vanilla Cake",
        category: "Cake",
        price: 150.00,
        description: "Classic vanilla sponge cake",
        status: "Active"
    },
    {
        itemName: "Masala Dosa",
        category: "Vegetarian",
        price: 80.00,
        description: "South Indian crispy dosa with potato filling",
        status: "Active"
    },
    {
        itemName: "Mango Lassi",
        category: "Beverages",
        price: 60.00,
        description: "Refreshing mango yogurt drink",
        status: "Active"
    },
    {
        itemName: "Gulab Jamun",
        category: "Desserts",
        price: 40.00,
        description: "Sweet milk-solid balls in sugar syrup",
        status: "Active"
    },
    {
        itemName: "Paneer Tikka",
        category: "Starters",
        price: 180.00,
        description: "Grilled cottage cheese cubes with spices",
        status: "Active"
    },
    {
        itemName: "Biryani",
        category: "Chicken",
        price: 220.00,
        description: "Fragrant rice with spiced chicken",
        status: "Active"
    },
    {
        itemName: "Samosa",
        category: "Starters",
        price: 30.00,
        description: "Crispy fried pastry with potato filling",
        status: "Active"
    }
];

// To import this data, you can either:
// 1. Use the frontend form to add items manually
// 2. Use the API to bulk insert (see below)

// Bulk Insert Script (Run in Node.js or MongoDB shell)
/*
const mongoose = require('mongoose');
const MenuItem = require('./backend/models/menuModel');

if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI must be defined in .env");
    process.exit(1);
}
mongoose.connect(process.env.MONGODB_URI);

async function importSampleData() {
  try {
    await MenuItem.deleteMany({}); // Clear existing data
    await MenuItem.insertMany(sampleMenuItems);
    console.log('Sample data imported successfully!');
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
}

importSampleData();
*/

module.exports = sampleMenuItems;
