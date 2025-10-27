import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    
    localStorage.removeItem("user");
    localStorage.removeItem("token"); 

   
    navigate("/");
  };

  return (
    <div className="sidebar">
      <h2 className="logo">CITIZEN</h2>

      <nav className="nav-menu">
        <NavLink to="/home" className="nav-item">Home</NavLink>
        <NavLink to="/post-complaint" className="nav-item">Post Complaint</NavLink>
        <NavLink to="/help" className="nav-item">Help</NavLink>
        <NavLink to="/user-dashboard" className="nav-item">User Dashboard</NavLink>
      </nav>

      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>

      <div className="sidebar-footer">
        &copy; 2025 Citizen App
      </div>
    </div>
  );
};

export default Sidebar;
