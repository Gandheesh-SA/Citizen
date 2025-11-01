import React, { useState, useEffect } from "react";
import { FaUserCircle, FaEdit, FaTrash } from "react-icons/fa";
import { MdEdit, MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import "../styles/user_dashboard.css";
import FeedbackButton from "./FeedbackButton";
import FeedbackForm from "./FeedbackForm";

const UserDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    fullName: "John Doe",
    email: "john@example.com",
    phone: "9876543210",
    location: "Chennai",
    work: "Software Engineer",
    gender: "Male",
    age: 26,
    preferredContact: "Email",
    volunteering: "Yes",
    volunteeringTypes: ["Teaching", "Fundraising"],
    volunteeringDays: "Weekend",
  });

  const [complaints, setComplaints] = useState([]);
  const [userFeedback, setUserFeedback] = useState([]);
  const [searchCategory, setSearchCategory] = useState("");
  const [activeTab, setActiveTab] = useState("complaints");
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState(null);

  const fetchComplaints = async (category = "") => {
    try {
      const url = category
        ? `http://localhost:7500/api/complaints?category=${category}`
        : "http://localhost:7500/api/complaints";

      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setComplaints(data);
      } else {
        console.error("Error fetching complaints:", data.message);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const fetchUserFeedback = async () => {
    try {
      const userId = "temp_user_id";
      const res = await fetch(`http://localhost:7500/api/feedback/user/${userId}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setUserFeedback(data.feedback);
      } else {
        console.error("Error fetching feedback:", data.message);
      }
    } catch (err) {
      console.error("Error fetching feedback:", err);
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchUserFeedback();
  }, []);

  const handleSearchChange = (e) => {
    setSearchCategory(e.target.value.toLowerCase());
  };

  const handleSearchClick = () => {
    fetchComplaints(searchCategory.trim());
  };

  const handleDeleteComplaint = async (id) => {
    if (!window.confirm("Are you sure you want to delete this complaint?")) return;
    try {
      const res = await fetch(`http://localhost:7500/api/complaints/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setComplaints((prev) => prev.filter((c) => c._id !== id));
        alert("Complaint deleted successfully.");
      } else {
        alert("Failed to delete complaint.");
      }
    } catch (err) {
      console.error("Error deleting complaint:", err);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;
    try {
      const res = await fetch(`http://localhost:7500/api/feedback/${feedbackId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setUserFeedback((prev) => prev.filter((f) => f._id !== feedbackId));
        alert("Feedback deleted successfully.");
        fetchUserFeedback();
      } else {
        alert("Failed to delete feedback.");
      }
    } catch (err) {
      console.error("Error deleting feedback:", err);
    }
  };

  const handleEditComplaint = (complaint) => {
    navigate("/post-complaint", { state: { complaint } });
  };

  const handleEditFeedback = (feedback) => {
    setShowEditForm(true);
    setEditingFeedback(feedback);
  };

  // ✅ SIMPLE VERSION - No API calls
  const getFeedbackForComplaint = (complaintId) => {
    return userFeedback.find(f => f.reference_id === complaintId);
  };

  const handleFeedbackSubmitted = () => {
    fetchUserFeedback();
  };

  const handleCloseEditForm = () => {
    setShowEditForm(false);
    setEditingFeedback(null);
    handleFeedbackSubmitted();
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <FaUserCircle className="avatar-large" />
        <div className="header-text">
          <h1>Hi, {user.fullName} 👋</h1>
          <p>Welcome to your dashboard</p>
        </div>
      </header>

      <section className="user-section">
        <div className="section-header">
          <h2>USER DETAILS</h2>
        </div>
        <div className="user-details">
          {Object.entries(user).map(([key, value]) => (
            <div className="detail-row" key={key}>
              <label>{key.replace(/([A-Z])/g, " $1").toUpperCase()}</label>
              {Array.isArray(value) ? (
                <input type="text" name={key} value={value.join(", ")} readOnly className="read-only" />
              ) : (
                <input type={typeof value === "number" ? "number" : "text"} name={key} value={value} readOnly className="read-only" />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-tabs">
          <button className={`tab-button ${activeTab === "complaints" ? "active" : ""}`} onClick={() => setActiveTab("complaints")}>
            Your Complaints ({complaints.length})
          </button>
          <button className={`tab-button ${activeTab === "feedback" ? "active" : ""}`} onClick={() => setActiveTab("feedback")}>
            Your Feedback ({userFeedback.length})
          </button>
        </div>

        {activeTab === "complaints" && (
          <div className="tab-content">
            <div className="search-bar">
              <input type="text" placeholder="Search by category" value={searchCategory} onChange={handleSearchChange} className="search-input" />
              <button className="search-button" onClick={handleSearchClick}>Search</button>
            </div>

            {complaints.length === 0 ? (
              <p className="no-data">No complaints found.</p>
            ) : (
              <table className="complaints-table">
                <thead>
                  <tr>
                    <th>#</th><th>Complaint</th><th>Category</th><th>Date</th><th>Status</th><th>Actions</th><th>Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c, i) => {
                    const complaintFeedback = getFeedbackForComplaint(c._id);
                    return (
                      <tr key={c._id}>
                        <td>{i + 1}</td>
                        <td>{c.title}</td>
                        <td>{Array.isArray(c.category) ? c.category.join(", ") : c.category}</td>
                        <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td className={`status ${c.status?.toLowerCase().replace(" ", "-")}`}>{c.status || "Pending"}</td>
                        <td className="action-buttons">
                          <button className="edit-btn" onClick={() => handleEditComplaint(c)}><MdEdit /> Edit</button>
                          <button className="delete-btn" onClick={() => handleDeleteComplaint(c._id)}><MdDelete /> Delete</button>
                        </td>
                        <td className="feedback-cell">
                          {complaintFeedback ? (
                            <div className="feedback-actions-row">
                              <button className="view-feedback-btn" onClick={() => handleEditFeedback(complaintFeedback)}>👁️ View/Edit</button>
                              <button className="delete-feedback-btn" onClick={() => handleDeleteFeedback(complaintFeedback._id)}><FaTrash /> Delete</button>
                            </div>
                          ) : (
                            <FeedbackButton user={user} complaint={c} compact={true} onFeedbackSubmitted={handleFeedbackSubmitted} />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "feedback" && (
          <div className="tab-content">
            <div className="feedback-header-actions">
              <h3>Your Submitted Feedback</h3>
              <p className="feedback-help">Manage your submitted feedback here</p>
            </div>
            {userFeedback.length === 0 ? (
              <div className="no-feedback">
                <p>You haven't submitted any feedback yet.</p>
                <p>Submit feedback for your complaints to see them here.</p>
              </div>
            ) : (
              <div className="feedback-list">
                {userFeedback.map((feedback) => (
                  <div key={feedback._id} className="feedback-card">
                    <div className="feedback-header">
                      <div className="feedback-title">
                        <h4>{feedback.feedback_type.replace(/_/g, ' ').toUpperCase()} Feedback</h4>
                        <span className="feedback-date">{new Date(feedback.createdAt).toLocaleDateString()}</span>
                        {feedback.reference_id && <span className="feedback-reference">Complaint ID: {feedback.reference_id}</span>}
                      </div>
                      <div className="feedback-rating">
                        <span className="rating-stars">{"⭐".repeat(feedback.rating)}</span>
                        <span className="rating-text">({feedback.rating}/5)</span>
                      </div>
                    </div>
                    <div className="feedback-content">
                      <p className="feedback-message">{feedback.detailed_feedback}</p>
                      {feedback.feedback_categories && feedback.feedback_categories.length > 0 && (
                        <div className="feedback-categories"><strong>Categories:</strong> {feedback.feedback_categories.map(cat => cat.replace(/_/g, ' ')).join(', ')}</div>
                      )}
                      {feedback.suggestions && <div className="feedback-suggestions"><strong>Suggestions:</strong> {feedback.suggestions}</div>}
                    </div>
                    <div className="feedback-actions">
                      <button className="edit-feedback-btn" onClick={() => handleEditFeedback(feedback)}><FaEdit /> Edit</button>
                      <button className="delete-feedback-btn" onClick={() => handleDeleteFeedback(feedback._id)}><FaTrash /> Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {showEditForm && <FeedbackForm user={user} complaint={null} onClose={handleCloseEditForm} editMode={true} existingFeedback={editingFeedback} />}
    </div>
  );
};

export default UserDashboard;