import React from "react";
import "../styles/landings.css";

import Navbars from "../components/landingpage/navbar";
import LandScreen from "../components/landingpage/home";
import aboutImg from "../assets/about.jpg";
import service1 from "../assets/service1.jpg";
import service2 from "../assets/service2.jpg";
import service3 from "../assets/service2.jpg";
import workImg from "../assets/service1.jpg";

export default function LandingPage() {
  return (
    <>
      <div className="landing-wrapper">
        <Navbars />
        <LandScreen />

        {/* ABOUT */}
        <section id="about" className="section about-section">
          <div className="about-left">
            <h2 className="section-title">About Citizen Connect</h2>
            <p className="section-text">
              Citizen Connect is a next-generation civic engagement platform built to empower 
              residents, amplify public voices, and deliver actionable insights to authorities. 
              Our mission is simple — bridge the gap between citizens and governance with 
              transparency, technology, and trust.
            </p>
            <p className="section-text">
              Whether it's reporting road issues, tracking complaint progress, joining 
              communities, or collaborating with neighbors — Citizen Connect brings the 
              entire city together on one digital platform.
            </p>
          </div>

          <div className="about-right">
            <img src={aboutImg} alt="About Us" />
          </div>
        </section>

        {/* HOW WE WORK */}
        <section id="work" className="section work-section">
          <h2 className="section-title center">How We Work</h2>
          <p className="section-sub center">
            A simple, transparent and effective 3-step process.
          </p>

          <div className="work-grid">
            <div className="work-card">
              <span className="step-number">01</span>
              <img src={workImg} alt="Report" className="work-img" />
              <h3>Report Issues Effortlessly</h3>
              <p>
                Capture details, upload photos, and instantly report civic or community 
                concerns right from your dashboard.
              </p>
            </div>

            <div className="work-card">
              <span className="step-number">02</span>
              <img src={workImg} alt="Track" className="work-img" />
              <h3>Track and Engage</h3>
              <p>
                Get real-time updates, join discussions, upvote critical issues and monitor 
                progress as departments take action.
              </p>
            </div>

            <div className="work-card">
              <span className="step-number">03</span>
              <img src={workImg} alt="Resolve" className="work-img" />
              <h3>Resolution and Feedback</h3>
              <p>
                Once resolved, submit your experience rating and help improve the quality of 
                future public services.
              </p>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="section service-section">
          <h2 className="section-title center">Our Services</h2>
          <p className="section-sub center">
            Everything you need to improve and participate in your community.
          </p>

          <div className="service-grid">
            <div className="service-card">
              <img src={service1} alt="Complaints" />
              <h3>Smart Complaint System</h3>
              <p>
                File and track civic issues with AI-based suggestions, department routing 
                and priority detection.
              </p>
            </div>

            <div className="service-card">
              <img src={service2} alt="Community" />
              <h3>Community Management</h3>
              <p>
                Discover communities, join groups, create events, and collaborate with 
                neighborhood members.
              </p>
            </div>

            <div className="service-card">
              <img src={service3} alt="Insights" />
              <h3>Live City Insights</h3>
              <p>
                Stay updated with weather alerts, traffic updates, announcements and other 
                essential city-wide notifications.
              </p>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="section contact-section">
          <div className="contact-container">
            <h2 className="section-title center">Get in Touch</h2>
            <p className="section-sub center">
              We’d love to hear from you. Drop your message and we’ll get back soon.
            </p>

            <form className="contact-form">
              <div className="form-row">
                <input type="text" placeholder="Your Name" required />
                <input type="email" placeholder="Your Email" required />
              </div>

              <div className="form-row">
                <input type="text" placeholder="Phone Number" required />
              </div>

              <textarea placeholder="Type your message..." required></textarea>

              <button type="submit" className="contact-btn">Send Message</button>
            </form>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <p>© 2025 Citizen Connect. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}
