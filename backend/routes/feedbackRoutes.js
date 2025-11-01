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
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// POST /api/feedback/submit - Submit feedback
router.post('/submit', upload.single('attachment'), async (req, res) => {
  try {
    console.log('Received feedback submission:', req.body);
    
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

    let feedback_categories = [];
    if (req.body.feedback_categories) {
      if (Array.isArray(req.body.feedback_categories)) {
        feedback_categories = req.body.feedback_categories;
      } else if (typeof req.body.feedback_categories === 'string') {
        feedback_categories = [req.body.feedback_categories];
      }
    }

    const user_id = 'temp_user_id';

    const feedbackData = {
      user_id: user_id,
      complaint_id: reference_id,
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

    if (req.file) {
      feedbackData.attachment_url = `/uploads/feedback/${req.file.filename}`;
    }

    console.log('Creating feedback with data:', feedbackData);

    const feedback = new Feedback(feedbackData);
    await feedback.save();

    console.log('Feedback saved successfully:', feedback._id);

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

// ✅ ADD THIS ROUTE - Get feedback by complaint ID
router.get('/complaint/:complaintId', async (req, res) => {
  try {
    console.log('Fetching feedback for complaint:', req.params.complaintId);
    
    const feedback = await Feedback.find({ 
      $or: [
        { reference_id: req.params.complaintId },
        { complaint_id: req.params.complaintId }
      ]
    }).sort({ createdAt: -1 });

    console.log(`Found ${feedback.length} feedback entries for complaint ${req.params.complaintId}`);
    
    res.json({ 
      success: true, 
      feedback: feedback.length > 0 ? feedback[0] : null 
    });
  } catch (error) {
    console.error('Error fetching complaint feedback:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// GET /api/feedback/user/:userId - Get user's feedback
router.get('/user/:userId', async (req, res) => {
  try {
    console.log('Fetching feedback for user:', req.params.userId);
    
    const feedback = await Feedback.find({ 
      user_id: req.params.userId 
    }).sort({ createdAt: -1 });

    console.log(`Found ${feedback.length} feedback entries for user ${req.params.userId}`);
    
    res.json({ 
      success: true, 
      feedback 
    });
  } catch (error) {
    console.error('Error fetching user feedback:', error);
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

// GET /api/feedback/:id - Get specific feedback by ID
router.get('/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
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

// PUT /api/feedback/:id - Update feedback
router.put('/:id', upload.single('attachment'), async (req, res) => {
  try {
    console.log('Updating feedback:', req.params.id);
    
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

    let feedback_categories = [];
    if (req.body.feedback_categories) {
      if (Array.isArray(req.body.feedback_categories)) {
        feedback_categories = req.body.feedback_categories;
      } else if (typeof req.body.feedback_categories === 'string') {
        feedback_categories = [req.body.feedback_categories];
      }
    }

    const updateData = {
      full_name,
      email,
      feedback_type,
      reference_id,
      rating: parseInt(rating),
      experience_rating: parseInt(experience_rating),
      detailed_feedback,
      feedback_categories,
      experience_date: new Date(experience_date),
      location,
      follow_up: follow_up === 'true' || follow_up === true,
      suggestions,
      updatedAt: new Date()
    };

    if (req.file) {
      updateData.attachment_url = `/uploads/feedback/${req.file.filename}`;
    }

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    console.log('Feedback updated successfully:', feedback._id);

    res.json({
      success: true,
      message: 'Feedback updated successfully',
      feedback
    });

  } catch (error) {
    console.error('Feedback update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// DELETE /api/feedback/:id - Delete feedback
router.delete('/:id', async (req, res) => {
  try {
    console.log('Deleting feedback:', req.params.id);
    
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    console.log('Feedback deleted successfully:', req.params.id);

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });

  } catch (error) {
    console.error('Feedback deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;