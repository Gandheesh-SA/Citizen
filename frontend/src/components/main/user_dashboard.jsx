import React, { useState, useEffect, useRef } from "react";
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

  // Feedback form fields
  const [feedbackForm, setFeedbackForm] = useState({
    _id: null,
    rating: "5",
    experience_rating: 5,
    detailed_feedback: "",
    experience_date: "",
    location: "",
    feedback_category: "Excellent Service",
    feedback_categories: [],
  });

  const dialRef = useRef(null);

  // ======= Fetch Data =======
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

  useEffect(() => {
    if (!dialRef.current) return;
    const circle = dialRef.current.querySelector(".dial-progress");
    if (!circle) return;
    const value = Math.max(0, Math.min(10, feedbackForm.experience_rating));
    const pct = value / 10;
    const radius = 44;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - pct);
    circle.style.transition = "stroke-dashoffset 450ms ease";
    circle.style.strokeDashoffset = offset;
  }, [feedbackForm.experience_rating]);

  // ======= Profile Edit Handlers =======
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

  // ======= Delete Handler =======
const handleDeleteSubmission = async (id, type) => {
  const endpoint = type === "complaint" ? "complaints" : "feedback";
  if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:7500/api/${endpoint}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json(); // ✅ add this
    if (!res.ok) throw new Error(data.message || "Delete failed");
    alert(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully.`);
    await Promise.all([fetchUserFeedbacks(), fetchUserComplaints()]);
  } catch (err) {
    console.error(`Error deleting ${type}:`, err);
    alert(err.message);
  }
};


  const handleEditSubmission = (item, type) => {
    if (type === "complaint") navigate("/post-complaint", { state: { [type]: item } });
  };

  // ======= Feedback Form Logic =======
  const openFeedbackForm = (complaintOrFeedback) => {
    const complaint = complaintOrFeedback.complaint || complaintOrFeedback;
    const existingFeedback = feedbacks.find((f) => f.complaint?._id === complaint._id);
    if (existingFeedback) {
      setFeedbackForm({
        _id: existingFeedback._id,
        rating: existingFeedback.rating || "",
        experience_rating: existingFeedback.experience_rating
          ? Math.round(existingFeedback.experience_rating / 10)
          : 5,
        detailed_feedback: existingFeedback.detailed_feedback || "",
        experience_date: existingFeedback.experience_date
          ? existingFeedback.experience_date.split("T")[0]
          : "",
        location: existingFeedback.location || "",
        feedback_category: existingFeedback.feedback_category || "Excellent Service",
        feedback_categories: existingFeedback.feedback_categories || [],
      });
    } else {
      setFeedbackForm({
        _id: null,
        rating: "",
        experience_rating: 5,
        detailed_feedback: "",
        experience_date: "",
        location: "",
        feedback_category: "Excellent Service",
        feedback_categories: [],
      });
    }
    setSelectedComplaint(complaint);
    setShowFeedbackForm(true);
  };

  const closeFeedbackForm = () => {
    setSelectedComplaint(null);
    setShowFeedbackForm(false);
    setFeedbackForm({
      _id: null,
      rating: "",
      experience_rating: 5,
      detailed_feedback: "",
      experience_date: "",
      location: "",
      feedback_category: "Excellent Service",
      feedback_categories: [],
    });
  };

  const handleFeedbackChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFeedbackForm((prev) => {
        const updated = checked
          ? [...prev.feedback_categories, value]
          : prev.feedback_categories.filter((v) => v !== value);
        return { ...prev, feedback_categories: updated };
      });
      return;
    }
    if (name === "experience_rating") {
      const num = Number(value);
      setFeedbackForm((prev) => ({
        ...prev,
        experience_rating: isNaN(num) ? 0 : num,
      }));
      return;
    }
    setFeedbackForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitFeedback = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Login required.");

      const payload = {
        complaint: selectedComplaint._id,
        rating: feedbackForm.rating,
        experience_rating: feedbackForm.experience_rating * 10,
        detailed_feedback: feedbackForm.detailed_feedback,
        feedback_type: "complaint",
        feedback_categories: feedbackForm.feedback_categories,
        experience_date: feedbackForm.experience_date,
        location: feedbackForm.location,
        feedback_category: feedbackForm.feedback_category,
      };

      const method = feedbackForm._id ? "PUT" : "POST";
      const url = feedbackForm._id
        ? `http://localhost:7500/api/feedback/${feedbackForm._id}`
        : `http://localhost:7500/api/feedback`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to submit feedback");

      alert(feedbackForm._id ? "Feedback updated successfully!" : "Feedback submitted successfully!");
      await Promise.all([fetchUserFeedbacks(), fetchUserComplaints()]);
      closeFeedbackForm();
    } catch (err) {
      console.error("Feedback submission error:", err);
      alert(err.message || "Failed to submit feedback.");
    }
  };

  if (!user)
    return (
      <div className="stunning-loading">
        <MdDashboard /> Awaiting Data Feed...
      </div>
    );

  // ======= Table =======
  const SubmissionTable = ({ data, type, title }) => (
    <section className="dashboard-module submissions-module-stunning">
      <div className="module-header-stunning">
        <h2 className="module-title-stunning">
          <MdOutlineReceipt /> {title} LOG
        </h2>
        <span className="count-display">TOTAL: {data.length}</span>
      </div>

      {data.length === 0 ? (
        <p className="empty-state-stunning">NO {type.toUpperCase()} DATA FOUND.</p>
      ) : (
        <div className="table-wrapper-stunning">
          <table className="data-table-stunning">
            <thead>
              <tr>
                <th>#</th>
                <th>COMPLAINT ID</th>
                <th>TITLE</th>
                <th>{type === "complaint" ? "CATEGORY" : "FEEDBACK CATEGORIES"}</th>
                {type === "complaint" && <th>STATUS</th>}
                <th>DATE</th>
                <th>CONTROLS</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, i) =>
                type === "complaint" ? (
                  <tr key={item._id}>
                    <td>{i + 1}</td>
                    <td>{item.complaintId || "N/A"}</td>
                    <td>{item.title}</td>
                    <td>{item.category}</td>
                    <td>
                      <span className={`status-tag status-${(item.status || "").toLowerCase().replace(" ", "-")}`}>
                        {item.status || "—"}
                      </span>
                    </td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="action-column-stunning">
                      <button className="action-btn edit" onClick={() => handleEditSubmission(item, "complaint")}>
                        <MdEdit /> Edit
                      </button>
                      <button className="action-btn delete" onClick={() => handleDeleteSubmission(item._id, "complaint")}>
                        <MdDelete /> Delete
                      </button>
{item.status?.toLowerCase() === "resolved" ? (
  !feedbacks.some((f) => f.complaint?._id === item._id) ? (
    <button className="action-btn feedback" onClick={() => openFeedbackForm(item)}>
      <MdFeedback /> Feedback
    </button>
  ) : (
    <button className="action-btn feedback disabled" disabled>
      <MdFeedback /> Feedback Given
    </button>
  )
) : (
  <button className="action-btn feedback disabled" disabled title="Feedback available only for resolved complaints">
    <MdFeedback /> Feedback (Pending)
  </button>
)}

                    </td>
                  </tr>
                ) : (
                  <tr key={item._id}>
                    <td>{i + 1}</td>
                    <td>{item.complaint?.complaintId || "N/A"}</td>
                    <td>{item.complaint?.title || "N/A"}</td>
                    <td>
                      {Array.isArray(item.feedback_categories)
                        ? item.feedback_categories.join(", ")
                        : item.feedback_categories || "—"}
                    </td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="action-column-stunning">
                      <button className="action-btn edit" onClick={() => openFeedbackForm(item)}>
                        <MdEdit /> Edit
                      </button>
                      <button className="action-btn delete" onClick={() => handleDeleteSubmission(item._id, "feedback")}>
                        <MdDelete /> Delete
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );

  // ======= Overview Section =======
  const renderOverview = () => (
    <section className="dashboard-module overview-module-stunning">
      <div className="overview-header">
        <h2 className="module-title-stunning">
          <MdViewAgenda /> DASHBOARD OVERVIEW
        </h2>
        <p className="overview-welcome">
          Welcome back, <strong>{user.fullName}</strong> 👋  
          Here’s a quick summary of your citizen activity.
        </p>
      </div>

      <div className="overview-stats-grid">
        <div className="stat-card">
          <h3>Total Complaints</h3>
          <p>{complaints.length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Feedbacks</h3>
          <p>{feedbacks.length}</p>
        </div>
        <div className="stat-card">
          <h3>Resolved Complaints</h3>
          <p>{complaints.filter((c) => c.status?.toLowerCase() === "resolved").length}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Complaints</h3>
          <p>{complaints.filter((c) => c.status?.toLowerCase() === "pending").length}</p>
        </div>
      </div>
    </section>
  );

  // ======= Render Sections =======
  const renderContent = () => {
    switch (currentView) {
      case "OVERVIEW":
        return renderOverview();
      case "PROFILE":
        return (
          <section className="dashboard-module profile-module-stunning">
            <div className="module-header-stunning">
              <h2 className="module-title-stunning">
                <MdAccountCircle /> PROFILE DATA STREAM
              </h2>
              <button
                className={`control-button ${editMode ? "btn-cancel-stunning" : "btn-edit-stunning"}`}
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
              {Object.entries(formUser)
                .filter(([key]) => key !== "_id")
                .map(([key, value]) => (
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
                <button className="control-button btn-save-stunning" onClick={handleSaveProfile}>
                  <MdSave /> SAVE CHANGES
                </button>
              </div>
            )}
          </section>
        );
      case "COMPLAINTS":
        return <SubmissionTable data={complaints} type="complaint" title="COMPLAINT HISTORY" />;
      case "FEEDBACKS":
        return <SubmissionTable data={feedbacks} type="feedback" title="FEEDBACK HISTORY" />;
      default:
        return null;
    }
  };

  // ======= Main Layout =======
  return (
    <div className="stunning-dashboard-container">
      <header className="stunning-header">
        <MdDashboard className="header-icon" />
        <div className="header-content">
          <h1 className="header-title-stunning">{user.fullName.toUpperCase()} CITIZEN DASHBOARD</h1>
          <p className="header-subtitle-stunning">
            ACCESS LEVEL: <span className="highlight-text">{user.role.toUpperCase()}</span>
          </p>
        </div>
      </header>

      <nav className="dashboard-navbar">
        <button className={`nav-link ${currentView === "OVERVIEW" ? "active-nav-link" : ""}`} onClick={() => setCurrentView("OVERVIEW")}>
          <MdViewAgenda /> OVERVIEW
        </button>
        <button className={`nav-link ${currentView === "PROFILE" ? "active-nav-link" : ""}`} onClick={() => setCurrentView("PROFILE")}>
          <MdAccountCircle /> PROFILE
        </button>
        <button className={`nav-link ${currentView === "COMPLAINTS" ? "active-nav-link" : ""}`} onClick={() => setCurrentView("COMPLAINTS")}>
          <MdOutlineReceipt /> COMPLAINTS
        </button>
        <button className={`nav-link ${currentView === "FEEDBACKS" ? "active-nav-link" : ""}`} onClick={() => setCurrentView("FEEDBACKS")}>
          <MdFeedback /> FEEDBACKS
        </button>
      </nav>

      <div className="dashboard-content-area">{renderContent()}</div>
    </div>
  );
}
