const express = require('express');
const Job = require('../models/Job');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get all jobs (public)
router.get('/', async (req, res) => {
    try {
        const jobs = await Job.find().populate('createdBy', 'name email');
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get job by ID (public)
router.get('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate('createdBy', 'name email');
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.json(job);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create job (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
    try {
        const { title, description, requiredSkills, location } = req.body;

        if (!title || !description || !location) {
            return res.status(400).json({ message: 'Please provide title, description, and location' });
        }

        const job = new Job({
            title,
            description,
            requiredSkills: requiredSkills || [],
            location,
            createdBy: req.user._id
        });

        await job.save();
        await job.populate('createdBy', 'name email');

        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update job (admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
    try {
        const { title, description, requiredSkills, location } = req.body;

        if (!title || !description || !location) {
            return res.status(400).json({ message: 'Please provide title, description, and location' });
        }

        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        job.title = title;
        job.description = description;
        job.requiredSkills = requiredSkills || [];
        job.location = location;

        await job.save();
        await job.populate('createdBy', 'name email');

        res.json(job);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete job (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        await Job.findByIdAndDelete(req.params.id);
        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
