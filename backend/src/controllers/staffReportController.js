const User = require('../models/User');
const Order = require('../models/Order');

// @desc    Get staff report data (summary + per-staff details)
// @route   GET /api/staff-report
// @access  Private (Admin)
const getStaffReport = async (req, res) => {
    try {
        const { department, role, shift } = req.query;

        const query = { role: { $ne: 'super_admin' } };

        if (req.user.role !== 'super_admin') {
            if (!req.user.hotelId) {
                return res.status(403).json({ message: 'No hotel assigned' });
            }
            query.hotelId = req.user.hotelId;
        }

        if (department && department !== 'All') {
            query.outlet = department;
        }
        if (role && role !== 'All') {
            query.role = { $eq: role, $ne: 'super_admin' };
        }
        if (shift && shift !== 'All') {
            query.shift = shift;
        }

        const staff = await User.find(query).select('-password').lean();

        // Summary calculations
        const totalStaff = staff.length;
        const activeStaff = staff.filter(s => s.isActive).length;
        const presentToday = staff.filter(s => s.attendanceStatus === 'Present').length;
        const onLeave = staff.filter(s => s.attendanceStatus === 'On Leave').length;
        const absent = staff.filter(s => s.attendanceStatus === 'Absent').length;
        const avgPerformance = totalStaff > 0
            ? (staff.reduce((sum, s) => sum + (s.performance || 0), 0) / totalStaff).toFixed(1)
            : 0;
        const totalSalary = staff.reduce((sum, s) => sum + (s.salary || 0), 0);

        // Top performer
        const topPerformer = staff.reduce((best, s) => {
            if (!best || (s.performance || 0) > (best.performance || 0)) return s;
            return best;
        }, null);

        // Role distribution
        const roleDistribution = {};
        staff.forEach(s => {
            const r = s.role || 'staff';
            roleDistribution[r] = (roleDistribution[r] || 0) + 1;
        });

        // Department/outlet distribution
        const departmentDistribution = {};
        staff.forEach(s => {
            const d = s.outlet || 'General';
            departmentDistribution[d] = (departmentDistribution[d] || 0) + 1;
        });

        // Shift distribution
        const shiftDistribution = { Morning: 0, Evening: 0, Night: 0 };
        staff.forEach(s => {
            const sh = s.shift || 'Morning';
            shiftDistribution[sh] = (shiftDistribution[sh] || 0) + 1;
        });

        // Attendance distribution
        const attendanceDistribution = { Present: presentToday, Absent: absent, 'On Leave': onLeave };

        // Staff details formatted for table
        const staffDetails = staff.map(s => ({
            _id: s._id,
            name: s.name || s.username,
            role: s.role || 'staff',
            outlet: s.outlet || 'General',
            shift: s.shift || 'Morning',
            attendance: s.attendanceStatus || 'Present',
            performance: s.performance || 0,
            salary: s.salary || 0,
            isActive: s.isActive !== false,
            phone: s.phone || '-',
            joinDate: s.createdAt,
            image: s.image || ''
        }));

        res.json({
            success: true,
            summary: {
                totalStaff,
                activeStaff,
                presentToday,
                onLeave,
                absent,
                avgPerformance: Number(avgPerformance),
                totalSalary,
                topPerformer: topPerformer ? {
                    name: topPerformer.name || topPerformer.username,
                    performance: topPerformer.performance || 0,
                    role: topPerformer.role || 'staff'
                } : null
            },
            distributions: {
                role: roleDistribution,
                department: departmentDistribution,
                shift: shiftDistribution,
                attendance: attendanceDistribution
            },
            staffDetails
        });
    } catch (error) {
        console.error('[StaffReport] Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getStaffReport };
