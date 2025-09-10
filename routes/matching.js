const express = require('express');
const Matching = require('../models/Matching');
const Job = require('../models/Job');
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Match user to job (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
    try {
        const { jobId, userId } = req.body;

        if (!jobId || !userId) {
            return res.status(400).json({ message: 'Please provide jobId and userId' });
        }

        const job = await Job.findById(jobId);
        const user = await User.findById(userId);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role !== 'Talent') {
            return res.status(400).json({ message: 'User must be a Talent to be matched' });
        }

        const existingMatch = await Matching.findOne({ jobId, userId });
        if (existingMatch) {
            return res.status(400).json({ message: 'User is already matched to this job' });
        }

        const matching = new Matching({
            jobId,
            userId,
            matchedBy: req.user._id
        });

        await matching.save();
        await matching.populate([
            { path: 'jobId', populate: { path: 'createdBy', select: 'name email' } },
            { path: 'userId', select: 'name email skills location' },
            { path: 'matchedBy', select: 'name email' }
        ]);

        res.status(201).json(matching);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all jobs matched to current user (talent only)
router.get('/my-jobs', auth, async (req, res) => {
    try {
        if (req.user.role !== 'Talent') {
            return res.status(403).json({ message: 'Access denied. Talent role required.' });
        }

        const matchings = await Matching.find({ userId: req.user._id, status: 'Active' })
            .populate([
                { path: 'jobId', populate: { path: 'createdBy', select: 'name email' } },
                { path: 'matchedBy', select: 'name email' }
            ]);

        res.json(matchings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all matchings (admin only)
router.get('/', auth, adminOnly, async (req, res) => {
    try {
        const matchings = await Matching.find()
            .populate([
                { path: 'jobId', populate: { path: 'createdBy', select: 'name email' } },
                { path: 'userId', select: 'name email skills location' },
                { path: 'matchedBy', select: 'name email' }
            ]);

        res.json(matchings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
