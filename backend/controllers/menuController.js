const MenuItem = require('../models/menuModel');

// @desc    Get all menu items
// @route   GET /api/menu/list
// @access  Public
const getMenuItems = async (req, res) => {
    try {
        const { category, search } = req.query;

        let query = {};

        // Filter by category if provided
        if (category && category !== 'All Categories') {
            query.category = category;
        }

        // Search by item name if provided
        if (search) {
            query.itemName = { $regex: search, $options: 'i' };
        }

        const menuItems = await MenuItem.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: menuItems.length,
            data: menuItems
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching menu items',
            error: error.message
        });
    }
};

// @desc    Add new menu item
// @route   POST /api/menu/add
// @access  Private/Admin
const addMenuItem = async (req, res) => {
    try {
        const { itemName, category, price, description, status } = req.body;

        // Validation
        if (!itemName || !category || !price) {
            return res.status(400).json({
                success: false,
                message: 'Please provide item name, category, and price'
            });
        }

        // Create new menu item
        const menuItem = await MenuItem.create({
            itemName,
            category,
            price,
            description: description || '',
            status: status || 'Active'
        });

        res.status(201).json({
            success: true,
            message: 'Menu item added successfully',
            data: menuItem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding menu item',
            error: error.message
        });
    }
};

// @desc    Update menu item
// @route   PUT /api/menu/update/:id
// @access  Private/Admin
const updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Find and update menu item
        const menuItem = await MenuItem.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Menu item updated successfully',
            data: menuItem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating menu item',
            error: error.message
        });
    }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/delete/:id
// @access  Private/Admin
const deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.params;

        const menuItem = await MenuItem.findByIdAndDelete(id);

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Menu item deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting menu item',
            error: error.message
        });
    }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
const getMenuItemById = async (req, res) => {
    try {
        const { id } = req.params;

        const menuItem = await MenuItem.findById(id);

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        res.status(200).json({
            success: true,
            data: menuItem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching menu item',
            error: error.message
        });
    }
};

// @desc    Toggle menu item status
// @route   PATCH /api/menu/toggle-status/:id
// @access  Private/Admin
const toggleMenuItemStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const menuItem = await MenuItem.findById(id);

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        // Toggle status
        menuItem.status = menuItem.status === 'Active' ? 'Inactive' : 'Active';
        await menuItem.save();

        res.status(200).json({
            success: true,
            message: 'Menu item status toggled successfully',
            data: menuItem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error toggling menu item status',
            error: error.message
        });
    }
};

module.exports = {
    getMenuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getMenuItemById,
    toggleMenuItemStatus
};
