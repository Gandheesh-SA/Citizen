import React from "react";
import "../styles/layout.css";
import Sidebar from "../../components/main/side_navabar";
import { Outlet, useLocation } from "react-router-dom";

const RightSidebar = () => {
  return (
    <div className="right-sidebar">
      <h3>Area Insights</h3>
      <p>Display insights, plots and stats for users about problems in the area.</p>
    </div>
  );
};

const Layout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/home"; // ✅ only for /home

  return (
    <div className="layout-wrapper">
      <div className={`layout-container ${isHomePage ? "with-right" : "no-right"}`}>
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div
          className={`main-content ${
            location.pathname === "/post-complaint" ? "post-complaint-bg" : ""
          }`}
        >
          <Outlet />
        </div>

        {/* ✅ Right Sidebar only for home */}
        {isHomePage && <RightSidebar />}
      </div>
    </div>
  );
};

export default Layout;
