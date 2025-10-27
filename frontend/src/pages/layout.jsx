import React from "react";
import "../styles/layout.css";
import Sidebar from "../components/side_navabar";
import { Outlet } from "react-router-dom";  // ✅ import Outlet

const Layout = () => {
  return (
    <div className="layout-container">
      <Sidebar />
      <div className="main-content">
        <Outlet />  {/* ✅ This is where each page will load */}
      </div>
    </div>
  );
};

export default Layout;
