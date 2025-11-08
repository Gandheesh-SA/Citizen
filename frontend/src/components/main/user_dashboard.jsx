import React, { useState, useEffect } from "react";
import {
  MdEdit,
  MdDelete,
  MdSave,
  MdCancel,
  MdAccountCircle,
  MdOutlineReceipt,
  MdDashboard,
  MdFeedback,
  MdViewAgenda,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import "../../styles/user_dashboard.css";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formUser, setFormUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [currentView, setCurrentView] = useState("OVERVIEW");

  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({
    rating: "",
    detailed_feedback: "",
    experience_date: "",
    location: "",
  });

  // --- Fetch User Profile ---
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const res = await fetch("http://localhost:7500/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        setFormUser(data);
      } else console.error("Failed to load user:", data.message);
    } catch (err) {
      console.error("User fetch error:", err);
    }
  };

  // --- Fetch Complaints ---
  const fetchUserComplaints = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("http://localhost:7500/api/complaints/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setComplaints(data);
    } catch (err) {
      console.error("Complaint fetch error:", err);
    }
  };

  // --- Fetch Feedbacks ---
  const fetchUserFeedbacks = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("http://localhost:7500/api/feedback/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setFeedbacks(data);
    } catch (err) {
      console.error("Feedback fetch error:", err);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchUserComplaints();
    fetchUserFeedbacks();
  }, []);

  // --- Profile Edit Handlers ---
  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setFormUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Login required.");
      const res = await fetch(`http://localhost:7500/api/users/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formUser),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        setEditMode(false);
        alert("Profile updated!");
      } else alert(data.message || "Update failed.");
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  // --- Complaint Actions ---
  const handleDeleteSubmission = async (id, type) => {
    const endpoint = type === "complaint" ? "complaints" : "feedback";
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:7500/api/${endpoint}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        if (type === "complaint") setComplaints((p) => p.filter((c) => c._id !== id));
        else setFeedbacks((p) => p.filter((f) => f._id !== id));
        alert(`${type} deleted successfully.`);
      }
    } catch (err) {
      console.error(`Error deleting ${type}:`, err);
    }
  };

  const handleEditSubmission = (item, type) => {
    navigate("/post-complaint", { state: { [type]: item } });
  };

  // --- Feedback Form Logic ---
  const openFeedbackForm = (complaint) => {
    setSelectedComplaint(complaint);
    setShowFeedbackForm(true);
  };

  const closeFeedbackForm = () => {
    setSelectedComplaint(null);
    setShowFeedbackForm(false);
    setFeedbackForm({
      rating: "",
      detailed_feedback: "",
      experience_date: "",
      location: "",
    });
  };

  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    setFeedbackForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitFeedback = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Login required.");

      const payload = {
        complaint: selectedComplaint._id,
        rating: feedbackForm.rating,
        detailed_feedback: feedbackForm.detailed_feedback,
        experience_date: feedbackForm.experience_date,
        location: feedbackForm.location,
        feedback_type: "complaint",
      };

      const res = await fetch("http://localhost:7500/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Feedback submitted successfully!");
        closeFeedbackForm();
        fetchUserFeedbacks(); // refresh immediately
      } else alert(data.message || "Failed to submit feedback.");
    } catch (err) {
      console.error("Feedback submission error:", err);
    }
  };

  if (!user)
    return (
      <div className="stunning-loading">
        <MdDashboard /> Awaiting Data Feed...
      </div>
    );

  // --- Table Component ---
  const SubmissionTable = ({ data, type, title }) => (
    <section className="dashboard-module submissions-module-stunning">
      <div className="module-header-stunning">
        <h2 className="module-title-stunning">
          <MdOutlineReceipt /> {title} LOG
        </h2>
        <span className="count-display">TOTAL: {data.length}</span>
      </div>
      {data.length === 0 ? (
        <p className="empty-state-stunning">
          NO {type.toUpperCase()} DATA FOUND.
        </p>
      ) : (
        <div className="table-wrapper-stunning">
          <table className="data-table-stunning">
            <thead>
              <tr>
                <th>#</th>
                <th>Complaint ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Date</th>
                <th>Controls</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, i) => (
                <tr key={item._id}>
                  <td>{i + 1}</td>
                  <td>{item.complaintId || "N/A"}</td>
                  <td>{item.title}</td>
                  <td>
                    {Array.isArray(item.category)
                      ? item.category.join(", ")
                      : item.category}
                  </td>
                  <td>
                    <span
                      className={`status-tag status-${item.status
                        ?.toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td className="action-column-stunning">
                    <button
                      className="action-btn edit"
                      onClick={() => handleEditSubmission(item, type)}
                    >
                      <MdEdit /> Edit
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDeleteSubmission(item._id, type)}
                    >
                      <MdDelete /> Delete
                    </button>
                    <button
                      className="action-btn feedback"
                      onClick={() => openFeedbackForm(item)}
                    >
                      <MdFeedback /> Feedback
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );

  const renderContent = () => {
    switch (currentView) {
      case "OVERVIEW":
        return (
          <div className="dashboard-module profile-module-stunning overview-content">
            <h2 className="module-title-stunning">
              <MdViewAgenda /> DASHBOARD OVERVIEW
            </h2>
            <p className="empty-state-stunning" style={{ border: "none" }}>
              Welcome, {user.fullName}! Here's a quick summary of your activity.
            </p>
            <ul className="overview-stats">
              <li>Total Complaints: {complaints.length}</li>
              <li>Total Feedbacks: {feedbacks.length}</li>
            </ul>
          </div>
        );
      case "PROFILE":
        return (
          <section className="dashboard-module profile-module-stunning">
            <div className="module-header-stunning">
              <h2 className="module-title-stunning">
                <MdAccountCircle /> PROFILE DATA STREAM
              </h2>
              <button
                className={`control-button ${
                  editMode ? "btn-cancel-stunning" : "btn-edit-stunning"
                }`}
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? (
                  <>
                    <MdCancel /> ABORT
                  </>
                ) : (
                  <>
                    <MdEdit /> EDIT MODE
                  </>
                )}
              </button>
            </div>
            <div className="profile-data-grid">
              {Object.entries(formUser).map(([key, value]) => (
                <div key={key} className="data-field-group">
                  <label className="field-label-stunning">
                    {key.replace(/([A-Z])/g, " $1").toUpperCase()}
                  </label>
                  {editMode && !["userId", "email", "role"].includes(key) ? (
                    <input
                      type="text"
                      name={key}
                      value={value || ""}
                      onChange={handleUserChange}
                      className="data-input-stunning editable-input"
                    />
                  ) : (
                    <input
                      type="text"
                      value={Array.isArray(value) ? value.join(", ") : value || ""}
                      readOnly
                      className="data-input-stunning"
                    />
                  )}
                </div>
              ))}
            </div>
            {editMode && (
              <div className="save-footer-stunning">
                <button
                  className="control-button btn-save-stunning"
                  onClick={handleSaveProfile}
                >
                  <MdSave /> SAVE CHANGES
                </button>
              </div>
            )}
          </section>
        );
      case "COMPLAINTS":
        return (
          <SubmissionTable
            data={complaints}
            type="complaint"
            title="COMPLAINT HISTORY"
          />
        );
      case "FEEDBACKS":
        return (
          <SubmissionTable
            data={feedbacks}
            type="feedback"
            title="FEEDBACK HISTORY"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="stunning-dashboard-container">
      <header className="stunning-header">
        <MdDashboard className="header-icon" />
        <div className="header-content">
          <h1 className="header-title-stunning">
            {user.fullName.toUpperCase()} CITIZEN DASHBOARD
          </h1>
          <p className="header-subtitle-stunning">
            ACCESS LEVEL:{" "}
            <span className="highlight-text">{user.role.toUpperCase()}</span>
          </p>
        </div>
      </header>

      <nav className="dashboard-navbar">
        <button
          className={`nav-link ${
            currentView === "OVERVIEW" ? "active-nav-link" : ""
          }`}
          onClick={() => setCurrentView("OVERVIEW")}
        >
          <MdViewAgenda /> OVERVIEW
        </button>
        <button
          className={`nav-link ${
            currentView === "PROFILE" ? "active-nav-link" : ""
          }`}
          onClick={() => setCurrentView("PROFILE")}
        >
          <MdAccountCircle /> PROFILE
        </button>
        <button
          className={`nav-link ${
            currentView === "COMPLAINTS" ? "active-nav-link" : ""
          }`}
          onClick={() => setCurrentView("COMPLAINTS")}
        >
          <MdOutlineReceipt /> COMPLAINTS
        </button>
        <button
          className={`nav-link ${
            currentView === "FEEDBACKS" ? "active-nav-link" : ""
          }`}
          onClick={() => setCurrentView("FEEDBACKS")}
        >
          <MdFeedback /> FEEDBACKS
        </button>
      </nav>

      <div className="dashboard-content-area">{renderContent()}</div>

      {showFeedbackForm && (
        <div className="feedback-modal-overlay">
          <div className="feedback-modal">
            <h2>
              <MdFeedback /> GIVE FEEDBACK
            </h2>
            <p>
              Complaint: <strong>{selectedComplaint?.title}</strong>
              <br />
              Complaint ID: {selectedComplaint?.complaintId}
            </p>

            <div className="modal-form-group">
              <label>Rating (1–5)</label>
              <input
                type="number"
                name="rating"
                min="1"
                max="5"
                value={feedbackForm.rating}
                onChange={handleFeedbackChange}
              />
            </div>

            <div className="modal-form-group">
              <label>Experience Date</label>
              <input
                type="date"
                name="experience_date"
                value={feedbackForm.experience_date}
                onChange={handleFeedbackChange}
              />
            </div>

            <div className="modal-form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={feedbackForm.location}
                onChange={handleFeedbackChange}
              />
            </div>

            <div className="modal-form-group">
              <label>Detailed Feedback</label>
              <textarea
                name="detailed_feedback"
                rows="4"
                value={feedbackForm.detailed_feedback}
                onChange={handleFeedbackChange}
                placeholder="Write your experience..."
              />
            </div>

            <div className="modal-actions">
              <button onClick={submitFeedback} className="btn-submit-feedback">
                <MdSave /> SUBMIT
              </button>
              <button onClick={closeFeedbackForm} className="btn-cancel-feedback">
                <MdCancel /> CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
