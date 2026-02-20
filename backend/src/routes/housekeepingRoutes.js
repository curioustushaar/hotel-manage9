const express = require('express');
const router = express.Router();
const HousekeepingTask = require('../models/HousekeepingTask');
const Room = require('../models/Room');

// GET all pending housekeeping tasks
router.get('/list', async (req, res) => {
    try {
        const tasks = await HousekeepingTask.find({ status: 'pending' }).sort({ createdAt: -1 });
        res.json({
            success: true,
            data: tasks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching housekeeping tasks',
            error: error.message
        });
    }
});

// POST mark room as clean
router.post('/mark-clean', async (req, res) => {
    try {
        const { taskId, roomNumber } = req.body;

        if (!taskId && !roomNumber) {
            return res.status(400).json({ success: false, message: ' taskId or roomNumber is required' });
        }

        let task;
        if (taskId) {
            task = await HousekeepingTask.findById(taskId);
        } else {
            task = await HousekeepingTask.findOne({ roomNumber, status: 'pending' });
        }

        if (!task) {
            return res.status(404).json({ success: false, message: 'Pending task not found' });
        }

        // 1. Update Room
        await Room.findOneAndUpdate(
            { roomNumber: task.roomNumber },
            { housekeepingStatus: 'clean' }
        );

        // 2. Update Task
        task.status = 'completed';
        await task.save();

        res.json({
            success: true,
            message: `Room ${task.roomNumber} marked as clean`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating housekeeping status',
            error: error.message
        });
    }
});

module.exports = router;
