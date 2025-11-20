import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
// 1. Import necessary icons
import { 
  FaHome, 
  FaPencilAlt, 
  FaBullhorn, 
  FaQuestionCircle, 
  FaTachometerAlt, 
  FaSignOutAlt 
} from 'react-icons/fa';
import "../../styles/sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="sidebar">
      {/* Main content (logo + nav) */}
      <div className="sidebar-main">
        <h2 className="logo">CITIZEN</h2>
        <nav className="nav-menu">
          <NavLink to="/home" className="nav-item">
            <FaHome className="nav-icon" /> Home
          </NavLink>
          <NavLink to="/post-complaint" className="nav-item">
            <FaPencilAlt className="nav-icon" /> Post Complaint
          </NavLink>
          <NavLink to="/post-announcement" className="nav-item">
            <FaBullhorn className="nav-icon" /> Announcement
          </NavLink>
          <NavLink to="/help" className="nav-item">
            <FaQuestionCircle className="nav-icon" /> Help
          </NavLink>
          <NavLink to="/user-dashboard" className="nav-item">
            <FaTachometerAlt className="nav-icon" /> Dashboard
          </NavLink>
        </nav>
      </div>

      {/* Bottom (logout + footer) */}
      <div className="sidebar-bottom">
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt className="logout-icon" /> Logout
        </button>
        <div className="sidebar-footer">© 2025 Citizen App</div>
      </div>
    </div>
  );
};

export default Sidebar;