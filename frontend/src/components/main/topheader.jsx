// src/components/main/topheader.jsx
import React from "react";
import { FaBell, FaCog, FaChartBar } from "react-icons/fa";
import "../../styles/layout.css";

const TopHeader = ({ userName, onInsightsToggle, showInsights }) => {
  return (
    <header className="top-header-block">
      

      <div className="header-greeting">
        <div className="welcome-text1">Good evening, {userName}!</div>
      </div>

      <div className="header-actions">
        {showInsights && (
          <button
            className="header-icon insights-btn"
            aria-label="Open insights"
            onClick={(e) => {
              e.stopPropagation();
              if (typeof onInsightsToggle === "function") onInsightsToggle();
            }}
            title="Insights"
          >
            <FaChartBar />
          </button>
        )}

        <button className="header-icon" aria-label="Notifications" title="Notifications">
          <FaBell />
        </button>

        <button className="header-icon" aria-label="Settings" title="Settings">
          <FaCog />
        </button>
      </div>
    </header>
  );
};

export default TopHeader;
