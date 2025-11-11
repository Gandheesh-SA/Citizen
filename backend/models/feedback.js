const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  complaint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Complaint",
    required: false
  },
  feedback_type: {
    type: String,
    enum: ['complaint', 'service', 'app_experience', 'suggestion', 'other'],
    default: 'complaint'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  experience_rating: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  detailed_feedback: {
    type: String,
    required: true,
    trim: true
  },
  // ✅ Allow custom “liked” service points (as from checkbox pills)
  feedback_categories: [{
    type: String,
    enum: [
      'Politeness',
      'Quick Response',
      'Clear Communication',
      'Problem Solved',
      'Transparency'
    ]
  }],
  // ✅ New field for descriptive dropdown (“Excellent”, “Average”, etc.)
  feedback_category: {
    type: String,
    enum: [
      'Excellent Service',
      'Good, But Could Improve',
      'Average Experience',
      'Below Expectations',
      'Terrible Experience'
    ],
    default: 'Average Experience'
  },
  experience_date: { type: Date, required: true },
  location: { type: String, required: true },
  follow_up: { type: Boolean, default: false },
  suggestions: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
