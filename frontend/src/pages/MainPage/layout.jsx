// src/layouts/Layout.jsx
import React, { useEffect, useRef, useState } from "react";
import "../../styles/layout.css";
import Sidebar from "../../components/main/side_navabar";
import { Outlet, useLocation } from "react-router-dom";
import TopHeader from "../../components/main/topheader";
import NewsFeed from "../../components/news/newsFeed";

export default function Layout() {
  const location = useLocation();
  const isHomePage = location.pathname === "/home";

  const [drawerOpen, setDrawerOpen] = useState(false);

  // ⭐ NEW: Dynamically fetched user name
  const [userName, setUserName] = useState("");

  // ――― Fetch logged in user's name ―――
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:7500/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (res.ok && data.fullName) {
          setUserName(data.fullName);
        }
      } catch (err) {
        console.error("Failed to fetch user for header", err);
      }
    };

    fetchUser();
  }, []);

  // ――― Time-based greeting ―――
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Drawer logic
  const closeBtnRef = useRef(null);
  const lastActiveRef = useRef(null);

  const toggleDrawer = () => setDrawerOpen((s) => !s);
  const closeDrawer = () => setDrawerOpen(false);

  // Handle body scroll lock & focus when drawer opens
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
      lastActiveRef.current = document.activeElement;
      setTimeout(() => closeBtnRef.current?.focus?.(), 120);
    } else {
      document.body.style.overflow = "";
      try {
        lastActiveRef.current?.focus?.();
      } catch (e) {}
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // Close drawer when route changes
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  return (
    <div className="layout-wrapper">

      {/* ⭐ Updated Top Header with dynamic greeting + user name */}
      <TopHeader
        userName={userName}
        greeting={getGreeting()}
        onInsightsToggle={toggleDrawer}
        showInsights={isHomePage}
      />

      <div className={`layout-container ${isHomePage ? "with-right" : "no-right"}`}>

        <Sidebar />

        <main
          className={`main-content ${
            location.pathname === "/post-complaint" ? "post-complaint-bg" : ""
          }`}
          onClick={() => {
            if (drawerOpen && window.innerWidth <= 1200) closeDrawer();
          }}
        >
          <Outlet />
        </main>

        {/* Right sidebar (desktop static, mobile drawer) */}
        {isHomePage && (
          <aside
            className={`right-sidebar ${drawerOpen ? "open" : ""}`}
            aria-hidden={!drawerOpen && window.innerWidth <= 1200}
          >
            <RightSidebarInner onClose={closeDrawer} />
          </aside>
        )}

        {/* Mobile overlay */}
        <div
          className={`right-drawer-overlay ${drawerOpen ? "visible" : ""}`}
          onClick={closeDrawer}
          aria-hidden={!drawerOpen}
        />
      </div>
    </div>
  );
}

// Right Sidebar Inner Component
const RightSidebarInner = ({ onClose }) => {
  return (
    <div
      className="right-sidebar__inner"
      role="region"
      aria-label="Area Insights"
    >
      <h3>Coimbatore Happenings</h3>
      <NewsFeed />
    </div>
  );
};
