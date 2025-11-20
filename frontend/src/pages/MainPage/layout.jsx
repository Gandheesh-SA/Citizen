// src/layouts/Layout.jsx
import React, { useEffect, useRef, useState } from "react";
import "../../styles/layout.css";
import Sidebar from "../../components/main/side_navabar";
import { Outlet, useLocation } from "react-router-dom";
import TopHeader from "../../components/main/topheader";
import NewsFeed from "../../components/news/newsFeed";

const MOCK_USER_NAME = "Test1";

const RightSidebarInner = ({ onClose }) => {
  return (
    <div className="right-sidebar__inner" role="region" aria-label="Area Insights">
      <h3>Coimbatore Happenings</h3>

      <NewsFeed />

      <div style={{ marginTop: 18 }}>
        
      </div>
    </div>
  );
};

export default function Layout() {
  const location = useLocation();
  const isHomePage = location.pathname === "/home";
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeBtnRef = useRef(null);
  const lastActiveRef = useRef(null);

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);
  const toggleDrawer = () => setDrawerOpen((s) => !s);

  // lock body scroll when drawer is open and restore when closed
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
      lastActiveRef.current = document.activeElement;
      // focus the close button when drawer opens (we'll focus after small delay to ensure render)
      setTimeout(() => closeBtnRef.current?.focus?.(), 120);
    } else {
      document.body.style.overflow = "";
      // restore focus to previously focused element
      try {
        lastActiveRef.current?.focus?.();
      } catch (e) {}
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // close drawer when route changes (optional)
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  return (
    <div className="layout-wrapper">
      <TopHeader 
  userName={MOCK_USER_NAME} 
  onInsightsToggle={toggleDrawer}
  showInsights={isHomePage}
/>

      <div className={`layout-container ${isHomePage ? "with-right" : "no-right"}`}>
        <Sidebar />

        <main
          className={`main-content ${location.pathname === "/post-complaint" ? "post-complaint-bg" : ""}`}
          onClick={() => {
            // clicking main content closes drawer on small screens
            if (drawerOpen && window.innerWidth <= 1200) closeDrawer();
          }}
        >
          <Outlet />
        </main>

        { /* Desktop: static right column; Mobile: off-canvas drawer (controlled via .open) */ }
        {isHomePage && (
          <aside
            className={`right-sidebar ${drawerOpen ? "open" : ""}`}
            aria-hidden={!drawerOpen && window.innerWidth <= 1200}
          >
            <RightSidebarInner onClose={closeDrawer} />
          </aside>
        )}

        { /* Overlay only used for small screens when drawer is open */ }
        <div
          className={`right-drawer-overlay ${drawerOpen ? "visible" : ""}`}
          onClick={closeDrawer}
          aria-hidden={!drawerOpen}
        />
      </div>
    </div>
  );
}
