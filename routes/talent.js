const express = require('express');
const Matching = require('../models/Matching');
const Job = require('../models/Job');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get talent dashboard statistics
router.get('/stats', auth, async (req, res) => {
    try {
        if (req.user.role !== 'Talent') {
            return res.status(403).json({ message: 'Access denied. Talent role required.' });
        }

        const userId = req.user._id;

        // Get all matches for this talent (both active and inactive)
        const allMatches = await Matching.find({ userId })
            .populate([
                { path: 'jobId', populate: { path: 'createdBy', select: 'name email' } },
                { path: 'matchedBy', select: 'name email' }
            ]);

        // Get active matches only
        const activeMatches = allMatches.filter(match => match.status === 'Active');
        
        // Get completed matches
        const completedMatches = allMatches.filter(match => match.status === 'Inactive');

        // Get total jobs available
        const totalJobs = await Job.countDocuments();

        // Get jobs that match user's skills
        const user = await User.findById(userId);
        const userSkills = user.skills || [];
        
        let matchingJobs = 0;
        if (userSkills.length > 0) {
            matchingJobs = await Job.countDocuments({
                requiredSkills: { $in: userSkills }
            });
        }

        // Get jobs in user's location
        const jobsInLocation = await Job.countDocuments({
            location: { $regex: user.location, $options: 'i' }
        });

        // Get recent matches (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentMatches = allMatches.filter(match => 
            new Date(match.createdAt) >= sevenDaysAgo
        );

        // Calculate match success rate (if they have any matches)
        const matchSuccessRate = allMatches.length > 0 
            ? Math.round((completedMatches.length / allMatches.length) * 100)
            : 0;

        res.json({
            totalMatches: allMatches.length,
            activeMatches: activeMatches.length,
            completedMatches: completedMatches.length,
            recentMatches: recentMatches.length,
            totalJobs: totalJobs,
            matchingJobs: matchingJobs,
            jobsInLocation: jobsInLocation,
            matchSuccessRate: matchSuccessRate,
            profileCompleteness: calculateProfileCompleteness(user)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all matches for talent (including inactive)
router.get('/matches', auth, async (req, res) => {
    try {
        if (req.user.role !== 'Talent') {
            return res.status(403).json({ message: 'Access denied. Talent role required.' });
        }

        const matchings = await Matching.find({ userId: req.user._id })
            .populate([
                { path: 'jobId', populate: { path: 'createdBy', select: 'name email' } },
                { path: 'matchedBy', select: 'name email' }
            ])
            .sort({ createdAt: -1 });

        res.json(matchings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Helper function to calculate profile completeness
function calculateProfileCompleteness(user) {
    let score = 0;
    const maxScore = 5;

    if (user.name && user.name.trim()) score++;
    if (user.email && user.email.trim()) score++;
    if (user.location && user.location.trim()) score++;
    if (user.skills && user.skills.length > 0) score++;
    if (user.isEmailVerified) score++;

    return Math.round((score / maxScore) * 100);
}

module.exports = router;
