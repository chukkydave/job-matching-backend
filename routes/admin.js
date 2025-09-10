const express = require('express');
const User = require('../models/User');
const Job = require('../models/Job');
const Matching = require('../models/Matching');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get admin dashboard statistics
router.get('/stats', auth, adminOnly, async (req, res) => {
    try {
        // Get all data in parallel for better performance
        const [jobs, users, matches] = await Promise.all([
            Job.find(),
            User.find(),
            Matching.find()
        ]);

        // Calculate statistics
        const talents = users.filter(user => user.role === 'Talent');
        const admins = users.filter(user => user.role === 'Admin');
        const verifiedUsers = users.filter(user => user.isEmailVerified);
        const activeMatches = matches.filter(match => match.status === 'Active');
        const completedMatches = matches.filter(match => match.status === 'Inactive');

        const stats = {
            totalJobs: jobs.length,
            totalUsers: users.length,
            totalTalents: talents.length,
            totalAdmins: admins.length,
            totalMatches: matches.length,
            activeMatches: activeMatches.length,
            completedMatches: completedMatches.length,
            verifiedUsers: verifiedUsers.length,
            unverifiedUsers: users.length - verifiedUsers.length,
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
