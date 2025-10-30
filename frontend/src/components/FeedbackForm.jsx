import React, { useState } from 'react';
import axios from 'axios';
import './styles/FeedbackForm.css';

const FeedbackForm = ({ user, complaint, onClose, editMode = false, existingFeedback = null }) => {
  const API_BASE_URL = 'http://localhost:7500';

  const [formData, setFormData] = useState({
    full_name: user?.full_name || user?.fullName || '',
    email: user?.email || '',
    feedback_type: editMode ? existingFeedback?.feedback_type : '',
    reference_id: editMode ? existingFeedback?.reference_id : (complaint?._id || ''),
    rating: editMode ? existingFeedback?.rating : 0,
    experience_rating: editMode ? existingFeedback?.experience_rating : 50,
    detailed_feedback: editMode ? existingFeedback?.detailed_feedback : '',
    feedback_categories: editMode ? existingFeedback?.feedback_categories || [] : [],
    attachment: null,
    experience_date: editMode ? new Date(existingFeedback?.experience_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    location: editMode ? existingFeedback?.location : '',
    follow_up: editMode ? existingFeedback?.follow_up : false,
    suggestions: editMode ? existingFeedback?.suggestions || '' : ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const feedbackTypes = [
    { value: 'complaint', label: 'Complaint' },
    { value: 'service', label: 'Service' },
    { value: 'app_experience', label: 'App Experience' },
    { value: 'suggestion', label: 'Suggestion' },
    { value: 'other', label: 'Other' }
  ];

  const locations = [
    { value: 'ward_12', label: 'Ward 12 - Indiranagar' },
    { value: 'ward_13', label: 'Ward 13 - Koramangala' },
    { value: 'ward_14', label: 'Ward 14 - HSR Layout' },
    { value: 'ward_15', label: 'Ward 15 - BTM Layout' },
    { value: 'ward_16', label: 'Ward 16 - JP Nagar' }
  ];

  const categories = [
    { value: 'timeliness', label: 'Timeliness' },
    { value: 'staff_behavior', label: 'Staff Behavior' },
    { value: 'cleanliness', label: 'Cleanliness' },
    { value: 'response_quality', label: 'Response Quality' },
    { value: 'ease_of_use', label: 'Ease of Use' },
    { value: 'communication', label: 'Communication' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'feedback_categories') {
        const updatedCategories = checked
          ? [...formData.feedback_categories, value]
          : formData.feedback_categories.filter(cat => cat !== value);
        setFormData(prev => ({ ...prev, feedback_categories: updatedCategories }));
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }));
      }
    } else if (type === 'file') {
      setFormData(prev => ({ ...prev, attachment: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const submitData = new FormData();
      
      // Append all form data - MAKE SURE reference_id is included
      submitData.append('full_name', formData.full_name);
      submitData.append('email', formData.email);
      submitData.append('feedback_type', formData.feedback_type);
      submitData.append('reference_id', formData.reference_id); // This is the complaint ID
      submitData.append('rating', formData.rating.toString());
      submitData.append('experience_rating', formData.experience_rating.toString());
      submitData.append('detailed_feedback', formData.detailed_feedback);
      submitData.append('experience_date', formData.experience_date);
      submitData.append('location', formData.location);
      submitData.append('follow_up', formData.follow_up.toString());
      submitData.append('suggestions', formData.suggestions || '');

      // Append categories individually
      formData.feedback_categories.forEach(category => {
        submitData.append('feedback_categories[]', category);
      });

      // Append file if exists
      if (formData.attachment) {
        submitData.append('attachment', formData.attachment);
      }

      console.log('Submitting feedback with complaint ID:', formData.reference_id);

      let response;
      if (editMode && existingFeedback) {
        response = await axios.put(`${API_BASE_URL}/api/feedback/${existingFeedback._id}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        response = await axios.post(`${API_BASE_URL}/api/feedback/submit`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      if (response.data.success) {
        setMessage(editMode ? 'Feedback updated successfully!' : 'Thank you for your feedback! We appreciate your input.');
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        throw new Error('Failed to submit feedback');
      }
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setMessage('Sorry, there was an error submitting your feedback. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      full_name: user?.full_name || user?.fullName || '',
      email: user?.email || '',
      feedback_type: editMode ? existingFeedback?.feedback_type : '',
      reference_id: editMode ? existingFeedback?.reference_id : (complaint?._id || ''),
      rating: editMode ? existingFeedback?.rating : 0,
      experience_rating: editMode ? existingFeedback?.experience_rating : 50,
      detailed_feedback: editMode ? existingFeedback?.detailed_feedback : '',
      feedback_categories: editMode ? existingFeedback?.feedback_categories || [] : [],
      attachment: null,
      experience_date: editMode ? new Date(existingFeedback?.experience_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      location: editMode ? existingFeedback?.location : '',
      follow_up: editMode ? existingFeedback?.follow_up : false,
      suggestions: editMode ? existingFeedback?.suggestions || '' : ''
    });
    setMessage('');
  };

  return (
    <div className="feedback-modal">
      <div className="feedback-container">
        <div className="feedback-header">
          <h2>{editMode ? 'Edit Feedback' : 'Feedback Form'}</h2>
          <p>{editMode ? 'Update your feedback below' : 'Help us improve CITIZEN by sharing your experience'}</p>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="feedback-form">
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="full_name" className="required">Full Name</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              required
              placeholder="Enter your full name"
              disabled={isSubmitting}
            />
          </div>

          {/* Email Address */}
          <div className="form-group">
            <label htmlFor="email" className="required">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter your email"
              disabled={isSubmitting}
            />
          </div>

          {/* Feedback Type */}
          <div className="form-group">
            <label htmlFor="feedback_type" className="required">Feedback Type</label>
            <select
              id="feedback_type"
              name="feedback_type"
              value={formData.feedback_type}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
            >
              <option value="">Select feedback type</option>
              {feedbackTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reference ID - Show complaint ID if available */}
          <div className="form-group">
            <label htmlFor="reference_id">Reference ID</label>
            <input
              type="text"
              id="reference_id"
              name="reference_id"
              value={formData.reference_id}
              onChange={handleInputChange}
              placeholder="Complaint ID will be auto-filled"
              disabled={true} // Make it read-only when complaint is provided
              style={{background: '#f5f5f5'}}
            />
            {complaint && (
              <small style={{color: '#666', fontSize: '12px'}}>
                This feedback is linked to complaint: {complaint.title}
              </small>
            )}
          </div>

          {/* Rating (1-5) */}
          <div className="form-group">
            <label className="required">Rating</label>
            <div className="rating-group">
              {[1, 2, 3, 4, 5].map(num => (
                <button
                  key={num}
                  type="button"
                  className={`rating-btn ${formData.rating === num ? 'active' : ''}`}
                  onClick={() => handleRatingClick(num)}
                  disabled={isSubmitting}
                >
                  {num} ⭐
                </button>
              ))}
            </div>
          </div>

          {/* Experience Rating Slider */}
          <div className="form-group">
            <label htmlFor="experience_rating" className="required">
              Experience Rating: {formData.experience_rating}%
            </label>
            <input
              type="range"
              id="experience_rating"
              name="experience_rating"
              min="0"
              max="100"
              value={formData.experience_rating}
              onChange={handleInputChange}
              className="slider"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Detailed Feedback */}
          <div className="form-group">
            <label htmlFor="detailed_feedback" className="required">
              Detailed Feedback / Comments
            </label>
            <textarea
              id="detailed_feedback"
              name="detailed_feedback"
              value={formData.detailed_feedback}
              onChange={handleInputChange}
              rows="4"
              placeholder="Please describe your experience in detail..."
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Feedback Categories */}
          <div className="form-group">
            <label>Feedback Categories (Select all that apply)</label>
            <div className="checkbox-group">
              {categories.map(category => (
                <div key={category.value} className="checkbox-option">
                  <input
                    type="checkbox"
                    id={category.value}
                    name="feedback_categories"
                    value={category.value}
                    checked={formData.feedback_categories.includes(category.value)}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                  <label htmlFor={category.value}>{category.label}</label>
                </div>
              ))}
            </div>
          </div>

          {/* File Upload */}
          <div className="form-group">
            <label htmlFor="attachment">Attach Screenshot / Photo (Optional)</label>
            <input
              type="file"
              id="attachment"
              name="attachment"
              onChange={handleInputChange}
              accept="image/*,.pdf"
              disabled={isSubmitting}
            />
          </div>

          {/* Date of Experience */}
          <div className="form-group">
            <label htmlFor="experience_date" className="required">Date of Experience</label>
            <input
              type="date"
              id="experience_date"
              name="experience_date"
              value={formData.experience_date}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Location */}
          <div className="form-group">
            <label htmlFor="location" className="required">Location / Ward</label>
            <select
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
            >
              <option value="">Select your ward</option>
              {locations.map(loc => (
                <option key={loc.value} value={loc.value}>
                  {loc.label}
                </option>
              ))}
            </select>
          </div>

          {/* Follow-up Toggle */}
          <div className="form-group">
            <label htmlFor="follow_up" className="toggle-label">
              Would you like a follow-up?
              <div className="toggle-container">
                <input
                  type="checkbox"
                  id="follow_up"
                  name="follow_up"
                  checked={formData.follow_up}
                  onChange={handleInputChange}
                  className="toggle-input"
                  disabled={isSubmitting}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-text">
                  {formData.follow_up ? 'Yes' : 'No'}
                </span>
              </div>
            </label>
          </div>

          {/* Suggestions */}
          <div className="form-group">
            <label htmlFor="suggestions">Suggestions for Improvement (Optional)</label>
            <textarea
              id="suggestions"
              name="suggestions"
              value={formData.suggestions}
              onChange={handleInputChange}
              rows="3"
              placeholder="Any suggestions to improve our service..."
              disabled={isSubmitting}
            />
          </div>

          {/* Message Display */}
          {message && (
            <div className={`message ${message.includes('error') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-reset"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              Reset Form
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : (editMode ? 'Update Feedback' : 'Submit Feedback')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;