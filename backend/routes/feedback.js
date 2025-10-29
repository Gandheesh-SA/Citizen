const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/feedback/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed'));
    }
  }
});

// POST /api/feedback/submit - Submit feedback
router.post('/submit', upload.single('attachment'), async (req, res) => {
  try {
    console.log('Feedback submission received:', req.body);
    
    const {
      user_id,
      full_name,
      email,
      feedback_type,
      reference_id,
      rating,
      experience_rating,
      detailed_feedback,
      feedback_categories,
      experience_date,
      location,
      follow_up,
      suggestions
    } = req.body;

    // Create feedback data object
    const feedbackData = {
      user_id: user_id || 'current_user_id', // You'll need to get this from auth middleware
      full_name,
      email,
      feedback_type,
      reference_id: reference_id || '',
      rating: parseInt(rating),
      experience_rating: parseInt(experience_rating),
      detailed_feedback,
      feedback_categories: Array.isArray(feedback_categories) ? feedback_categories : 
                          (feedback_categories ? [feedback_categories] : []),
      experience_date: new Date(experience_date),
      location,
      follow_up: follow_up === 'true' || follow_up === true,
      suggestions: suggestions || ''
    };

    // Handle file upload
    if (req.file) {
      feedbackData.attachment_url = `/uploads/feedback/${req.file.filename}`;
    }

    console.log('Creating feedback with data:', feedbackData);

    const feedback = new Feedback(feedbackData);
    await feedback.save();

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedbackId: feedback._id
    });

  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback',
      error: error.message
    });
  }
});

// GET /api/feedback/user/:userId - Get user's feedback
router.get('/user/:userId', async (req, res) => {
  try {
    const feedback = await Feedback.find({ user_id: req.params.userId })
      .sort({ createdAt: -1 });
    
    res.json({ 
      success: true, 
      feedback 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// GET /api/feedback - Get all feedback (for admin)
router.get('/', async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate('user_id', 'full_name email')
      .sort({ createdAt: -1 });
    
    res.json({ 
      success: true, 
      feedback 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;