// routes/feedbackRoutes.js - FIXED VERSION
const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/feedback/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// POST /api/feedback/submit - FIXED
router.post('/submit', upload.single('attachment'), async (req, res) => {
  try {
    console.log('Received feedback submission');
    
    const {
      full_name,
      email,
      feedback_type,
      reference_id,
      rating,
      experience_rating,
      detailed_feedback,
      experience_date,
      location,
      follow_up,
      suggestions
    } = req.body;

    // Handle feedback_categories
    let feedback_categories = [];
    if (req.body.feedback_categories) {
      if (Array.isArray(req.body.feedback_categories)) {
        feedback_categories = req.body.feedback_categories;
      } else if (typeof req.body.feedback_categories === 'string') {
        feedback_categories = [req.body.feedback_categories];
      }
    }

    // FIX: Generate a valid MongoDB ObjectId instead of using "temp_user_id"
    const user_id = new mongoose.Types.ObjectId();

    // Create feedback data object
    const feedbackData = {
      user_id: user_id, // Now it's a valid ObjectId
      full_name: full_name || 'Unknown User',
      email: email || 'unknown@example.com',
      feedback_type: feedback_type || 'general',
      reference_id: reference_id || '',
      rating: parseInt(rating) || 3,
      experience_rating: parseInt(experience_rating) || 50,
      detailed_feedback: detailed_feedback || 'No feedback provided',
      feedback_categories: feedback_categories,
      experience_date: experience_date ? new Date(experience_date) : new Date(),
      location: location || 'Unknown',
      follow_up: follow_up === 'true' || follow_up === true,
      suggestions: suggestions || ''
    };

    // Handle file upload
    if (req.file) {
      feedbackData.attachment_url = `/uploads/feedback/${req.file.filename}`;
    }

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
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;