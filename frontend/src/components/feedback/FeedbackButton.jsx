import React, { useState } from 'react';
import FeedbackForm from './FeedbackForm';

const FeedbackButton = ({ user, complaint, compact = false, onFeedbackSubmitted }) => {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  const handleOpenFeedback = () => {
    setShowFeedbackForm(true);
  };

  const handleCloseFeedback = () => {
    setShowFeedbackForm(false);
    if (onFeedbackSubmitted) {
      onFeedbackSubmitted();
    }
  };

  if (compact) {
    return (
      <>
        <button 
          className="btn-feedback-compact"
          onClick={handleOpenFeedback}
          title="Give Feedback"
        >
          💬 Feedback
        </button>

        {showFeedbackForm && (
          <FeedbackForm 
            user={user}
            complaint={complaint}
            onClose={handleCloseFeedback}
          />
        )}
      </>
    );
  }

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
          complaint={complaint}
          onClose={handleCloseFeedback}
        />
      )}
    </>
  );
};

export default FeedbackButton;