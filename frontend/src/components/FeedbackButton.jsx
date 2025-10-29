import React, { useState } from 'react';
import FeedbackForm from './FeedbackForm';
import './styles/FeedbackButton.css';

const FeedbackButton = ({ user }) => {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  const handleOpenFeedback = () => {
    setShowFeedbackForm(true);
  };

  const handleCloseFeedback = () => {
    setShowFeedbackForm(false);
  };

  return (
    <>
      <button 
        className="btn-feedback"
        onClick={handleOpenFeedback}
      >
        Give Feedback
      </button>

      {showFeedbackForm && (
        <FeedbackForm 
          user={user}
          onClose={handleCloseFeedback}
        />
      )}
    </>
  );
};

export default FeedbackButton;