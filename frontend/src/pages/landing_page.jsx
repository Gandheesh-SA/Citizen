import { Menu, X, CheckCircle, Users, BarChart3, MessageSquare, Shield, Zap, ArrowRight, Star } from 'lucide-react';
import { useState } from 'react';
import '../styles/landing.css';
import { useNavigate } from 'react-router-dom';
function LandingPage() {

  const navigate = useNavigate();

  const goToLogin = () => {
    navigate("/signin");
  };
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="landing-page">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <Shield className="logo-icon" />
            <span className="logo-text">Citizen</span>
          </div>

          <div className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
            <button onClick={() => scrollToSection('about')} className="nav-link">About</button>
            <button onClick={() => scrollToSection('services')} className="nav-link">Services</button>
            <button onClick={() => scrollToSection('how-it-works')} className="nav-link">How It Works</button>
            <button onClick={() => scrollToSection('features')} className="nav-link">Features</button>
            <button className="btn-get-started" onClick={goToLogin}>Get Started</button>
          </div>

          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <Star size={16} />
              <span>Smart Grievance Management</span>
            </div>
            <h1 className="hero-title">
              Your Voice, <span className="highlight">Heard</span> and <span className="highlight">Acted Upon</span>
            </h1>
            <p className="hero-description">
              Citizen empowers communities to report, track, and resolve civic issues efficiently.
              Bridge the gap between citizens and authorities with our transparent, digital platform.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary"  onClick={goToLogin}>
                Get Started
                <ArrowRight size={20} />
              </button>
              <button onClick={() => scrollToSection('about')} className="btn-secondary">
                Know More
              </button>
            </div>
          
          </div>
          <div className="hero-visual">
            <div className="visual-card card-1">
              <CheckCircle size={32} />
              <div className="card-content">
                <h4>Report Issues</h4>
                <p>Submit complaints instantly</p>
              </div>
            </div>
            <div className="visual-card card-2">
              <BarChart3 size={32} />
              <div className="card-content">
                <h4>Track Progress</h4>
                <p>Real-time status updates</p>
              </div>
            </div>
            <div className="visual-card card-3">
              <Users size={32} />
              <div className="card-content">
                <h4>Community Voice</h4>
                <p>Upvote important issues</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="about-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">About Citizen</span>
            <h2 className="section-title">Transforming Public Service Management</h2>
            <p className="section-description">
              A modern platform designed to bridge the communication gap between citizens and government authorities
            </p>
          </div>
          <div className="about-content">
            <div className="about-text">
              <h3>Our Mission</h3>
              <p>
                Citizen is a smart, easy-to-use online grievance management system that modernizes how community
                issues are reported and resolved. We eliminate the need for long queues and repeated office visits,
                bringing transparency and efficiency to public service delivery.
              </p>
              <p>
                Our platform integrates citizens, administrators, and government departments on a single digital
                platform, ensuring every complaint is heard, tracked, and resolved with accountability.
              </p>
              <div className="about-features">
                <div className="feature-point">
                  <CheckCircle size={20} />
                  <span>100% Digital & Paperless</span>
                </div>
                <div className="feature-point">
                  <CheckCircle size={20} />
                  <span>Real-time Tracking</span>
                </div>
                <div className="feature-point">
                  <CheckCircle size={20} />
                  <span>Complete Transparency</span>
                </div>
                <div className="feature-point">
                  <CheckCircle size={20} />
                  <span>Fast Resolution</span>
                </div>
              </div>
            </div>
            <div className="about-image">
              <div className="image-placeholder">
                <Shield size={120} />
                <p>Empowering Communities</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="services-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Our Services</span>
            <h2 className="section-title">Comprehensive Grievance Solutions</h2>
            <p className="section-description">
              Everything you need to manage and resolve community issues effectively
            </p>
          </div>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">
                <MessageSquare size={32} />
              </div>
              <h3>Complaint Submission</h3>
              <p>
                Report issues related to garbage collection, water supply, infrastructure,
                pollution, and more with just a few clicks.
              </p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <BarChart3 size={32} />
              </div>
              <h3>Real-time Tracking</h3>
              <p>
                Monitor your complaint status from submission to resolution with live updates
                and notifications.
              </p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <Users size={32} />
              </div>
              <h3>Community Engagement</h3>
              <p>
                Upvote issues affecting your community and add comments to help authorities
                prioritize urgent problems.
              </p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <Shield size={32} />
              </div>
              <h3>Department Management</h3>
              <p>
                Dedicated portals for 5 departments to review, validate, and resolve complaints
                efficiently.
              </p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <Zap size={32} />
              </div>
              <h3>Admin Dashboard</h3>
              <p>
                Comprehensive analytics showing complaint types, locations, department performance,
                and resolution rates.
              </p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <MessageSquare size={32} />
              </div>
              <h3>Support & Help</h3>
              <p>
                Access chatbot assistance and contact forms for immediate support and guidance
                throughout the process.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="how-it-works-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">How It Works</span>
            <h2 className="section-title">Simple, Transparent, Effective</h2>
            <p className="section-description">
              From complaint submission to resolution in four easy steps
            </p>
          </div>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">01</div>
              <div className="step-content">
                <h3>Register & Login</h3>
                <p>
                  Create your account with basic details. New users can sign up in minutes,
                  while existing users can simply sign in to access their dashboard.
                </p>
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step">
              <div className="step-number">02</div>
              <div className="step-content">
                <h3>Submit Complaint</h3>
                <p>
                  Post your grievance with relevant details, upload supporting documents or images,
                  and select the appropriate category for faster processing.
                </p>
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step">
              <div className="step-number">03</div>
              <div className="step-content">
                <h3>Track & Engage</h3>
                <p>
                  Monitor real-time status updates, upvote similar issues in your community,
                  and add comments for additional context or follow-ups.
                </p>
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step">
              <div className="step-number">04</div>
              <div className="step-content">
                <h3>Resolution & Feedback</h3>
                <p>
                  Once resolved, receive notifications and provide feedback. Your input helps
                  improve service quality and department performance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="features-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Platform Features</span>
            <h2 className="section-title">Built for Everyone</h2>
            <p className="section-description">
              Role-specific features for citizens, administrators, and departments
            </p>
          </div>
          <div className="features-tabs">
            <div className="feature-panel">
              <div className="panel-header">
                <Users size={28} />
                <h3>For Citizens</h3>
              </div>
              <ul className="feature-list">
                <li><CheckCircle size={18} /> Submit complaints with image/document uploads</li>
                <li><CheckCircle size={18} /> Track complaint status in real-time</li>
                <li><CheckCircle size={18} /> Upvote community issues to increase priority</li>
                <li><CheckCircle size={18} /> Comment and engage with ongoing complaints</li>
                <li><CheckCircle size={18} /> View resolved and pending complaints</li>
                <li><CheckCircle size={18} /> Provide feedback after resolution</li>
                <li><CheckCircle size={18} /> Access chatbot and contact support</li>
              </ul>
            </div>
            <div className="feature-panel">
              <div className="panel-header">
                <Shield size={28} />
                <h3>For Administrators</h3>
              </div>
              <ul className="feature-list">
                <li><CheckCircle size={18} /> Review all incoming complaints</li>
                <li><CheckCircle size={18} /> Assign complaints to departments</li>
                <li><CheckCircle size={18} /> Analytics dashboard with insights</li>
                <li><CheckCircle size={18} /> View complaints by type and location</li>
                <li><CheckCircle size={18} /> Monitor department performance</li>
                <li><CheckCircle size={18} /> Manage user accounts and permissions</li>
                <li><CheckCircle size={18} /> Track resolution timelines</li>
              </ul>
            </div>
            <div className="feature-panel">
              <div className="panel-header">
                <Zap size={28} />
                <h3>For Departments</h3>
              </div>
              <ul className="feature-list">
                <li><CheckCircle size={18} /> Receive assigned complaints</li>
                <li><CheckCircle size={18} /> Validate complaint authenticity</li>
                <li><CheckCircle size={18} /> Update complaint status (pending/in progress/resolved)</li>
                <li><CheckCircle size={18} /> Add internal notes and updates</li>
                <li><CheckCircle size={18} /> View department performance metrics</li>
                <li><CheckCircle size={18} /> Manage complaint resolution workflow</li>
                <li><CheckCircle size={18} /> Access historical complaint data</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2>Ready to Make a Difference?</h2>
            <p>
              Join thousands of citizens making their communities better. Start reporting
              and resolving issues today.
            </p>
            <button className="btn-cta"  onClick={goToLogin}>
              Get Started Now
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-section">
            <div className="footer-logo">
              <Shield size={32} />
              <span>Citizen</span>
            </div>
            <p>
              Empowering communities through transparent and efficient grievance management.
            </p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <button onClick={() => scrollToSection('about')}>About</button>
            <button onClick={() => scrollToSection('services')}>Services</button>
            <button onClick={() => scrollToSection('how-it-works')}>How It Works</button>
            <button onClick={() => scrollToSection('features')}>Features</button>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <button>Help Center</button>
            <button>Contact Us</button>
            <button>Privacy Policy</button>
            <button>Terms of Service</button>
          </div>
          <div className="footer-section">
            <h4>Connect</h4>
            <p>Have questions? Reach out to us.</p>
            <p className="contact-info">support@citizen.gov</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Citizen. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;