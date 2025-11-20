// src/pages/user/UserDashboard.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);


const normalizeUserPayload = (data) => {
  if (!data) return null;
  const safe = (v) => (v === null || v === undefined ? "" : v);
  return {
    mongoId: data._id || "",
    userId: safe(data.userId),
    fullName: safe(data.fullName),
    email: safe(data.email),
    phone: safe(data.phone),
    age: safe(data.age),
    gender: safe(data.gender),
    work: safe(data.work),
    location: safe(data.location || "Coimbatore"),
    area: safe(data.area),
    role: safe(data.role),
    badge: safe(data.badge),
    volunteeringTypes: Array.isArray(data.volunteeringTypes) ? data.volunteeringTypes : [],
    volunteeringDays: safe(data.volunteeringDays),
    createdAt: safe(data.createdAt),
    updatedAt: safe(data.updatedAt),
    _raw: data,
  };
};

export default function UserDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [formUser, setFormUser] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [complaints, setComplaints] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [announcements, setAnnouncements] = useState([]); // all announcements (server)
  const [myAnnouncements, setMyAnnouncements] = useState([]); // filtered for user

  const [currentView, setCurrentView] = useState("OVERVIEW");
const [activity, setActivity] = useState({ comments: 0, upvotes: 0 });

  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
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

  const VOLUNTEERING_OPTIONS = [
    "Awareness Campaigns",
    "Community Cleaning Drives",
    "Event Management",
    "Digital Reporting Assistance",
  ];

  const AREA_OPTIONS = [
    "Gandhipuram",
    "RS Puram",
    "Peelamedu",
    "Ettimadai",
    "Singanallur",
  ];

  // -------------------------
  // Fetch helpers
  // -------------------------
  const fetchUserProfile = useCallback(async () => {
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
        setFormUser(normalizeUserPayload(data));
      } else {
        console.error("Failed to get user:", data);
      }
    } catch (err) {
      console.error("User fetch error", err);
    }
  }, [navigate]);

  const fetchUserComplaints = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("http://localhost:7500/api/complaints/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setComplaints(data || []);
    } catch (err) {
      console.error("Complaint fetch error", err);
    }
  }, []);

  const fetchUserFeedbacks = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("http://localhost:7500/api/feedback/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setFeedbacks(data || []);
    } catch (err) {
      console.error("Feedback fetch error", err);
    }
  }, []);

  // Fetch announcements (server returns all), then filter client-side to announcements created by current user
  const fetchAnnouncements = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:7500/api/announcements", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      const list = Array.isArray(data) ? data : Array.isArray(data.announcements) ? data.announcements : [];
      setAnnouncements(list);
      // filter if user available
      if (user) {
        const mine = list.filter((a) => {
          const emailMatch = a.contactEmail && user.email && a.contactEmail.toLowerCase() === user.email.toLowerCase();
          const nameMatch = a.senderName && user.fullName && a.senderName.trim().toLowerCase() === user.fullName.trim().toLowerCase();
          return emailMatch || nameMatch;
        });
        setMyAnnouncements(mine);
      }
    } catch (err) {
      console.error("Announcements fetch error", err);
      setAnnouncements([]);
      setMyAnnouncements([]);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    fetchUserProfile();
    fetchUserComplaints();
    fetchUserFeedbacks();
    fetchAnnouncements();
    // eslint-disable-next-line
  }, []);

  
  // Recompute myAnnouncements whenever announcements or user change
  useEffect(() => {
    if (!user) return;
    const mine = announcements.filter((a) => {
      const emailMatch = a.contactEmail && user.email && a.contactEmail.trim().toLowerCase() === user.email.trim().toLowerCase();
      const nameMatch = a.senderName && user.fullName && a.senderName.trim().toLowerCase() === user.fullName.trim().toLowerCase();
      return emailMatch || nameMatch;
    });
    setMyAnnouncements(mine);
  }, [announcements, user]);

  // -------------------------
  // Profile editing helpers
  // -------------------------
  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setFormUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleVolunteeringToggle = (label) => {
    setFormUser((prev) => {
      const list = Array.isArray(prev.volunteeringTypes) ? [...prev.volunteeringTypes] : [];
      const idx = list.indexOf(label);
      if (idx === -1) list.push(label);
      else list.splice(idx, 1);
      return { ...prev, volunteeringTypes: list };
    });
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Login required.");
      if (!formUser || !formUser.mongoId) return alert("No user id to update.");

      const payload = {
        fullName: formUser.fullName,
        email: formUser.email,
        phone: formUser.phone,
        age: formUser.age === "" ? null : Number(formUser.age),
        gender: formUser.gender,
        work: formUser.work,
        area: formUser.area,
        volunteeringTypes: Array.isArray(formUser.volunteeringTypes) ? formUser.volunteeringTypes : [],
        volunteeringDays: formUser.volunteeringDays || "",
        location: formUser.location,
        role: formUser.role,
        badge: formUser.badge,
      };

      const res = await fetch(`http://localhost:7500/api/users/${formUser.mongoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message || "Update failed");
      await fetchUserProfile();
      setEditMode(false);
      alert("Profile updated.");
    } catch (err) {
      console.error("Profile save error", err);
      alert("Save failed.");
    }
  };


  const handleEditAnnouncement = (announcement) => {
    // navigate to announcement post form with announcement state (edit mode)
    navigate("/post-announcement", { state: { announcement } });
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Login required.");
      const res = await fetch(`http://localhost:7500/api/announcements/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Delete failed");
      alert("Announcement deleted.");
      await fetchAnnouncements();
    } catch (err) {
      console.error("Delete announcement error", err);
      alert(err.message || "Delete failed.");
    }
  };

 
  const handleDeleteSubmission = async (id, type) => {
    const endpoint = type === "complaint" ? "complaints" : "feedback";
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Login required.");
      const res = await fetch(`http://localhost:7500/api/${endpoint}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");
      alert(`${type} deleted.`);
      await Promise.all([fetchUserComplaints(), fetchUserFeedbacks(), fetchAnnouncements()]);
    } catch (err) {
      console.error("Delete error", err);
      alert(err.message || "Delete failed");
    }
  };

  const handleEditSubmission = (item, type) => {
    if (type === "complaint") navigate("/post-complaint", { state: { complaint: item } });
    if (type === "announcement") handleEditAnnouncement(item);
  };

  // -------------------------
  // Feedback helpers (same as earlier)
  // -------------------------
  const openFeedbackForm = (complaintOrFeedback) => {
    const complaint = complaintOrFeedback.complaint || complaintOrFeedback;
    const existingFeedback = feedbacks.find((f) => f.complaint?._id === complaint._id);
    if (existingFeedback) {
      setFeedbackForm({
        _id: existingFeedback._id,
        rating: existingFeedback.rating || "",
        experience_rating: existingFeedback.experience_rating ? Math.round(existingFeedback.experience_rating / 10) : 5,
        detailed_feedback: existingFeedback.detailed_feedback || "",
        experience_date: existingFeedback.experience_date ? existingFeedback.experience_date.split("T")[0] : "",
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
        const updated = checked ? [...prev.feedback_categories, value] : prev.feedback_categories.filter((v) => v !== value);
        return { ...prev, feedback_categories: updated };
      });
      return;
    }
    if (name === "experience_rating") {
      const num = Number(value);
      setFeedbackForm((prev) => ({ ...prev, experience_rating: isNaN(num) ? 0 : num }));
      return;
    }
    setFeedbackForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitFeedback = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Login required.");
      if (!selectedComplaint) return alert("Nothing selected.");

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

      const url = feedbackForm._id ? `http://localhost:7500/api/feedback/${feedbackForm._id}` : `http://localhost:7500/api/feedback`;

      const res = await fetch(url, {
        method: feedbackForm._id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to submit feedback");
      alert("Feedback saved");
      await Promise.all([fetchUserFeedbacks(), fetchUserComplaints()]);
      closeFeedbackForm();
    } catch (err) {
      console.error("Feedback submit error", err);
      alert(err.message || "Submit failed");
    }
  };

// ---- NEW: Fetch all interactions + comments for ACTIVITY tab ----
useEffect(() => {
  if (!complaints.length || !user) return;

  const fetchActivity = async () => {
    try {
      let upvoteCount = 0;
      let commentCount = 0;

      const token = localStorage.getItem("token");

      // loop through each complaint
      for (const c of complaints) {
        
        // --- fetch comments ---
        const resComments = await fetch(
          `http://localhost:7500/api/comments/${c._id}`
        );
        const commentData = await resComments.json();

        // count user's comments
        commentCount += commentData.filter(
          (cm) => cm.userId?._id === user._id
        ).length;

        // --- fetch interactions ---
        const resInteract = await fetch(
          `http://localhost:7500/api/interactions/${c._id}`
        );
        const interactionData = await resInteract.json();

        // count user's upvotes
        upvoteCount += interactionData.upvotes?.filter(
          (u) => u.userId === user._id
        ).length;
      }

      setActivity({
        comments: commentCount,
        upvotes: upvoteCount,
      });
    } catch (err) {
      console.error("Activity fetch error", err);
    }
  };

  fetchActivity();
}, [complaints, user]);

  if (!user || !formUser) {
    return (
      <div className="stunning-loading">
        <MdDashboard /> Awaiting Data Feed...
      </div>
    );
  }

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
                {type === "announcement" ? <th>TITLE</th> : <th>COMPLAINT ID</th>}
                <th>TITLE / MESSAGE</th>
                <th>{type === "complaint" ? "CATEGORY" : type === "announcement" ? "CATEGORY" : "FEEDBACK CATEGORIES"}</th>
                {type === "complaint" && <th>STATUS</th>}
                {type === "announcement" && <th>DATE / RANGE</th>}
                <th>DATE</th>
                <th>CONTROLS</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, i) => {
                if (type === "complaint") {
                  return (
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
                      {item.status?.toLowerCase() !== "accepted" && (
                          <>
                            <button className="action-btn edit" onClick={() => handleEditSubmission(item, "complaint")}>
                              <MdEdit /> Edit
                            </button>
                            <button className="action-btn delete" onClick={() => handleDeleteSubmission(item._id, "complaint")}>
                              <MdDelete /> Delete
                            </button>
                          </>
                        )}
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
                  );
                }

                if (type === "announcement") {
                  const owns =
                    (item.contactEmail && user.email && item.contactEmail.trim().toLowerCase() === user.email.trim().toLowerCase()) ||
                    (item.senderName && user.fullName && item.senderName.trim().toLowerCase() === user.fullName.trim().toLowerCase());

                  return (
                    <tr key={item._id}>
                      <td>{i + 1}</td>
                      <td style={{ maxWidth: 220 }}>{item.title}</td>
                      <td style={{ maxWidth: 360, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.message || "—"}
                      </td>
                      <td>{item.category || "—"}</td>
                      <td>
                        {item.startDate || item.endDate
                          ? `${item.startDate ? new Date(item.startDate).toLocaleDateString() : "—"} - ${item.endDate ? new Date(item.endDate).toLocaleDateString() : "—"}`
                          : "—"}
                      </td>
                      <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td className="action-column-stunning">
                        {owns ? (
                          <>
                            <button className="action-btn edit" onClick={() => handleEditSubmission(item, "announcement")}>
                              <MdEdit /> Edit
                            </button>
                            <button className="action-btn delete" onClick={() => handleDeleteAnnouncement(item._id)}>
                              <MdDelete /> Delete
                            </button>
                          </>
                        ) : (
                          <span style={{ color: "#888" }}>No controls</span>
                        )}
                      </td>
                    </tr>
                  );
                }

                // feedback row
                return (
                  <tr key={item._id}>
                    <td>{i + 1}</td>
                    <td>{item.complaint?.complaintId || "N/A"}</td>
                    <td>{item.complaint?.title || "N/A"}</td>
                    <td>
                      {Array.isArray(item.feedback_categories) ? item.feedback_categories.join(", ") : item.feedback_categories || "—"}
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );

  const renderOverview = () => (
    <section className="dashboard-module overview-module-stunning">
      <div className="overview-header">
        <h2 className="module-title-stunning">
          <MdViewAgenda /> DASHBOARD OVERVIEW
        </h2>
        <p className="overview-welcome">
          Welcome back, <strong>{user.fullName}</strong> 👋
        </p>
      </div>
<div className="premium-stat-grid">
  <div className="premium-stat-card">
    <div className="stat-label">Total Complaints</div>
    <div className="stat-value">{complaints.length}</div>
  </div>

  <div className="premium-stat-card">
    <div className="stat-label">Total Feedbacks</div>
    <div className="stat-value">{feedbacks.length}</div>
  </div>

  <div className="premium-stat-card">
    <div className="stat-label">Your Announcements</div>
    <div className="stat-value">{myAnnouncements.length}</div>
  </div>

  <div className="premium-stat-card">
    <div className="stat-label">Resolved Complaints</div>
    <div className="stat-value">
      {complaints.filter((c) => c.status?.toLowerCase() === "resolved").length}
    </div>
  </div>
</div>

<div className="charts-wrapper">

  {/* Complaints by Status */}
  <div className="chart-card">
    <h3 className="chart-title">Complaints by Status</h3>
    <Pie
      data={{
        labels: ["Pending", "In Progress", "Resolved"],
        datasets: [
          {
            data: [
              complaints.filter((c) => c.status === "Pending").length,
              complaints.filter((c) => c.status === "In Progress").length,
              complaints.filter((c) => c.status === "Resolved").length,
            ],
            backgroundColor: ["#ffc107", "#005b5f", "#28a745"],
            borderColor: "#ffffff",
            borderWidth: 2,
          },
        ],
      }}
      options={{
        plugins: {
          legend: {
            position: "bottom",
            labels: { boxWidth: 20 },
          },
        },
      }}
    />
  </div>

  {/* Complaints Filed Over Time */}
 <div className="chart-card">
  <h3 className="chart-title">Complaints Filed Over Time</h3>

  <Line
    data={(() => {
      // Group complaints by date (DD/MM/YYYY)
      const dateMap = {};
      complaints.forEach(c => {
        const d = new Date(c.createdAt).toLocaleDateString();
        dateMap[d] = (dateMap[d] || 0) + 1;
      });

      const labels = Object.keys(dateMap);
      const counts = Object.values(dateMap);

      return {
        labels,
        datasets: [
          {
            label: "Complaints Filed",
            data: counts,
            borderColor: "#005b5f",
            backgroundColor: "rgba(0,91,95,0.20)",
            borderWidth: 3,
            tension: 0.4,
            pointBackgroundColor: "#005b5f",
            pointRadius: 5,
          },
        ],
      };
    })()}
    options={{
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: "#000",
            font: { weight: "bold" },
          },
        },
      },
      scales: {
        x: {
          ticks: { color: "#000" },
        },
        y: {
          ticks: {
            beginAtZero: true,
            precision: 0,
            color: "#000",
          },
        },
      },
    }}
  />
</div>


  {/* Average Feedback Rating */}
  <div className="chart-card">
    <h3 className="chart-title">Average Feedback Rating</h3>
    <Bar
      data={{
        labels: ["Avg Rating"],
        datasets: [
          {
            label: "Rating / 10",
            data: [
              feedbacks.length
                ? (
                    feedbacks.reduce(
                      (acc, f) => acc + (f.experience_rating || 0),
                      0
                    ) /
                    (feedbacks.length * 10)
                  ).toFixed(2)
                : 0,
            ],
            backgroundColor: "#005b5f",
            borderColor: "#003639",
            borderWidth: 3,
          },
        ],
      }}
      options={{
        scales: {
          y: {
            min: 0,
            max: 1,
            ticks: { stepSize: 0.1 },
          },
        },
      }}
    />
  </div>

  {/* Complaints vs Announcements */}
<div className="chart-card">
  <h3 className="chart-title">Complaints vs Announcements</h3>

  <Bar
    data={{
      labels: ["Complaints", "Announcements"],
      datasets: [
        {
          label: "Count",
          data: [complaints.length, myAnnouncements.length],
          backgroundColor: ["#005b5f", "#f5b800"], // teal + gold
          borderColor: ["#003c3e", "#c79500"],
          borderWidth: 3,
        },
      ],
    }}
    options={{
      plugins: {
        legend: {
          labels: { color: "#000", font: { size: 13, weight: "bold" } },
        },
      },
      scales: {
        x: {
          ticks: { color: "#000", font: { weight: "bold" } },
        },
        y: {
          ticks: { color: "#000", font: { weight: "bold" } },
        },
      },
    }}
  />
</div>


  {/* Announcements by Category */}
  <div className="chart-card">
    <h3 className="chart-title">Announcements by Category</h3>
    <Doughnut
      data={{
        labels: [...new Set(myAnnouncements.map((a) => a.category))],
        datasets: [
          {
            data: [...new Set(myAnnouncements.map((a) => a.category))].map(
              (cat) => myAnnouncements.filter((a) => a.category === cat).length
            ),
            backgroundColor: ["#005b5f", "#ffc107", "#28a745", "#dc3545", "#6f42c1"],
            borderColor: "#ffffff",
            borderWidth: 2,
          },
        ],
      }}
      options={{
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      }}
    />
  </div>

  <div className="chart-card">
  <h3 className="chart-title">Complaints by Category (3D Style)</h3>

  <Doughnut
    data={(() => {
      const categories = [...new Set(complaints.map((c) => c.category))];

      const counts = categories.map(
        (cat) => complaints.filter((c) => c.category === cat).length
      );

      return {
        labels: categories,
        datasets: [
          {
            data: counts,

            // ⭐ PREMIUM 3D COLOR PALETTE
            backgroundColor: [
              "rgba(0, 91, 95, 0.95)",   // Deep Teal
              "rgba(0, 128, 128, 0.9)",  // Dark Aqua
              "rgba(0, 168, 150, 0.9)",  // Bright Teal
              "rgba(0, 200, 180, 0.9)",  // Mint Teal
              "rgba(90, 220, 200, 0.9)", // Fresh Aqua
              "rgba(140, 240, 220, 0.9)",// Soft Aqua
            ],

            // ⭐ Slight shadow for 3D effect
            hoverOffset: 20,
            borderWidth: 3,
            borderColor: "#ffffff",
          },
        ],
      };
    })()}

    options={{
      cutout: "55%", // donut thickness
      spacing: 6,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            font: { size: 12, weight: "bold" },
            color: "#003333",
          },
        },
      },
    }}
  />
</div>


</div>


<div className="reports-area">

  <div className="report-card">
    <h3 className="report-title">Complaint Summary Report</h3>
    <p className="report-desc">
      Download a complete summary of all complaints you have raised.
    </p>
    <div className="report-actions">
      <button className="btn primary">Generate</button>
      <button className="btn secondary">Preview</button>
    </div>
  </div>

  <div className="report-card">
    <h3 className="report-title">Feedback Analysis Report</h3>
    <p className="report-desc">
      View trends and ratings you provided for resolved complaints.
    </p>
    <div className="report-actions">
      <button className="btn primary">Generate</button>
      <button className="btn secondary">Preview</button>
    </div>
  </div>

  <div className="report-card">
    <h3 className="report-title">My Announcements Report</h3>
    <p className="report-desc">
      Export your announcements history with date, category & more.
    </p>
    <div className="report-actions">
      <button className="btn primary">Generate</button>
      <button className="btn secondary">Preview</button>
    </div>
  </div>

</div>




     
    </section>
  );

  const renderProfile = () => {
    const fieldsOrder = [
      { key: "userId", label: "USER ID", editable: false, name: "userId" },
      { key: "fullName", label: "NAME", editable: true, name: "fullName" },
      { key: "email", label: "EMAIL", editable: true, name: "email" },
      { key: "phone", label: "PHONE", editable: true, name: "phone" },
      { key: "age", label: "AGE", editable: true, name: "age" },
      { key: "gender", label: "GENDER", editable: true, name: "gender", type: "select", options: ["Male", "Female", "Other"] },
      { key: "work", label: "PROFESSION", editable: true, name: "work" },
      { key: "location", label: "LOCATION", editable: false, name: "location" },
      { key: "area", label: "AREA", editable: true, name: "area", type: "select", options: AREA_OPTIONS },
      { key: "role", label: "ROLE", editable: false, name: "role" },
      { key: "badge", label: "BADGE", editable: false, name: "badge" },
      { key: "volunteeringTypes", label: "VOLUNTEERING TYPES", editable: true, name: "volunteeringTypes", type: "multicheck" },
      { key: "createdAt", label: "CREATED AT", editable: false, name: "createdAt" },
      { key: "updatedAt", label: "UPDATED AT", editable: false, name: "updatedAt" },
    ];

    const protectedFields = ["userId", "location", "role", "badge", "createdAt", "updatedAt"];

    return (
      <section className="dashboard-module profile-module-stunning">
        <div className="module-header-stunning">
          <h2 className="module-title-stunning">
            <MdAccountCircle /> PROFILE DATA STREAM
          </h2>
          <button
            className={`control-button ${editMode ? "btn-cancel-stunning" : "btn-edit-stunning"}`}
            onClick={() => {
              if (!editMode) fetchUserProfile();
              else fetchUserProfile();
              setEditMode(!editMode);
            }}
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
          {fieldsOrder.map((f) => {
            const rawValue = formUser[f.name];
            const displayValue = Array.isArray(rawValue) ? rawValue.join(", ") : rawValue ?? "";
            const badgeValue = f.name === "badge" && !displayValue ? "Beginner" : displayValue;

            if (f.type === "multicheck") {
              const selectedList = Array.isArray(formUser.volunteeringTypes) ? formUser.volunteeringTypes : [];
              return (
                <div key={f.key} className="data-field-group">
                  <label className="field-label-stunning">{f.label}</label>
                  {!editMode ? (
                    <input type="text" value={selectedList.length ? selectedList.join(", ") : ""} readOnly className="data-input-stunning" />
                  ) : (
                    <div className="volunteering-checkbox-grid" style={{ padding: 12 }}>
                      {VOLUNTEERING_OPTIONS.map((opt) => {
                        const checked = selectedList.includes(opt);
                        return (
                          <label key={opt} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                            <input type="checkbox" checked={checked} onChange={() => handleVolunteeringToggle(opt)} />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            if (f.type === "select") {
              const opts = f.options || [];
              return (
                <div key={f.key} className="data-field-group">
                  <label className="field-label-stunning">{f.label}</label>
                  {!editMode || !f.editable ? (
                    <input type="text" value={f.name === "badge" ? badgeValue : displayValue} readOnly className="data-input-stunning" />
                  ) : (
                    <select name={f.name} value={formUser[f.name] ?? ""} onChange={handleUserChange} className="data-input-stunning editable-select">
                      <option value="">{`Select ${f.label}`}</option>
                      {opts.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              );
            }

            const isEditable = editMode && f.editable && !protectedFields.includes(f.name);

            return (
              <div key={f.key} className="data-field-group">
                <label className="field-label-stunning">{f.label}</label>
                {isEditable ? (
                  <input type="text" name={f.name} value={formUser[f.name] ?? ""} onChange={handleUserChange} className="data-input-stunning editable-input" />
                ) : (
                  <input type="text" value={f.name === "badge" ? badgeValue : displayValue} readOnly className="data-input-stunning" />
                )}
              </div>
            );
          })}
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
  };

const renderActivity = () => (
  <section className="dashboard-module">
    <h2 className="module-title-stunning">
      📊 USER ACTIVITY INSIGHTS
    </h2>

    <div className="premium-stat-grid">
      <div className="premium-stat-card">
        <div className="stat-label">Total Comments</div>
        <div className="stat-value">{activity.comments}</div>
      </div>

      <div className="premium-stat-card">
        <div className="stat-label">Total Upvotes</div>
        <div className="stat-value">{activity.upvotes}</div>
      </div>
    </div>

    <div className="charts-wrapper">
      <div className="chart-card">
        <h3 className="chart-title">Comments vs Upvotes</h3>

        <Bar
          data={{
            labels: ["Comments", "Upvotes"],
            datasets: [
              {
                label: "Count",
                data: [activity.comments, activity.upvotes],
                backgroundColor: ["#0a9396", "#ee9b00"],
                borderColor: ["#005f62", "#bb7700"],
                borderWidth: 3,
              },
            ],
          }}
        />
      </div>
    </div>
  </section>
);

  const renderContent = () => {
    switch (currentView) {
      case "OVERVIEW":
        return renderOverview();
      case "PROFILE":
        return renderProfile();
      case "COMPLAINTS":
        return <SubmissionTable data={complaints} type="complaint" title="COMPLAINT HISTORY" />;
      case "FEEDBACKS":
        return <SubmissionTable data={feedbacks} type="feedback" title="FEEDBACK HISTORY" />;
      case "ANNOUNCEMENTS":
        // Show user's announcements first then others
        const sorted = [
          ...myAnnouncements,
          ...announcements.filter((a) => !myAnnouncements.some((m) => m._id === a._id)),
        ];
        return <SubmissionTable data={sorted} type="announcement" title="ANNOUNCEMENTS" />;
      case "ACTIVITY":
  return renderActivity();

        default:
        return null;
    }
  };

  return (
    <div className="stunning-dashboard-container">
      <header className="stunning-header">
        <MdDashboard className="header-icon" />
        <div className="header-content">
          <h1 className="header-title-stunning">{(user.fullName || "").toUpperCase()} CITIZEN DASHBOARD</h1>
          <p className="header-subtitle-stunning">
            ACCESS LEVEL: <span className="highlight-text">{(user.role || "user").toUpperCase()}</span>
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
        <button className={`nav-link ${currentView === "ANNOUNCEMENTS" ? "active-nav-link" : ""}`} onClick={() => setCurrentView("ANNOUNCEMENTS")}>
          📢 ANNOUNCEMENTS
        </button>
        <button
  className={`nav-link ${currentView === "ACTIVITY" ? "active-nav-link" : ""}`}
  onClick={() => setCurrentView("ACTIVITY")}
>
  📊 ACTIVITY
</button>
      </nav>

      <div className="dashboard-content-area">{renderContent()}</div>

      {/* Feedback form popup */}
      {showFeedbackForm && (
        <div className="feedback-modal">
          <div className="feedback-panel">
            <h3>Feedback for: {selectedComplaint?.title}</h3>
            <label>
              Category:
              <input name="feedback_category" value={feedbackForm.feedback_category} onChange={handleFeedbackChange} />
            </label>
            <label>
              Experience rating (0-10):
              <input name="experience_rating" type="number" min="0" max="10" value={feedbackForm.experience_rating} onChange={handleFeedbackChange} />
            </label>
            <label>
              Detailed feedback:
              <textarea name="detailed_feedback" value={feedbackForm.detailed_feedback} onChange={handleFeedbackChange} />
            </label>
            <div style={{ marginTop: 12 }}>
              <button onClick={submitFeedback} className="control-button btn-save-stunning">Submit</button>
              <button onClick={closeFeedbackForm} className="control-button btn-cancel-stunning" style={{ marginLeft: 8 }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
