import React from "react";
import "../../styles/community.css";
import { useNavigate } from "react-router-dom";

const Community = () => {
  const navigate = useNavigate();

  return (
    <div className="community-premium-container">
      <h1 className="community-title">Communities</h1>
      <p className="community-subtitle">Choose how you want to start</p>

      <div className="premium-card-wrapper">

        <div className="premium-card">
          <div className="premium-card-header">JOIN COMMUNITY</div>
          <div className="premium-card-bigtext">JOIN</div>

          <ul className="premium-features">
            <li>Browse all public communities</li>
            <li>View members & info</li>
            <li>Instantly join any group</li>
            <li>Start chatting immediately</li>
          </ul>

          <button
            onClick={() => navigate("/community/join")}
            className="premium-btn"
          >
            EXPLORE
          </button>
        </div>

        <div className="premium-card highlight">
          <div className="premium-ribbon">NEW</div>

          <div className="premium-card-header">CREATE COMMUNITY</div>
          <div className="premium-card-bigtext">CREATE</div>

          <ul className="premium-features">
            <li>Create your own group</li>
            <li>Become admin automatically</li>
            <li>Invite users to join</li>
            <li>Full control of management</li>
          </ul>

          <button
            onClick={() => navigate("/community/create")}
            className="premium-btn"
          >
            CREATE
          </button>
        </div>

      </div>
    </div>
  );
};

export default Community;
