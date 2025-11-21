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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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

  const [adminCommunities, setAdminCommunities] = useState([]);
const [memberCommunities, setMemberCommunities] = useState([]);

// FEEDBACK MODAL STATES
const [fbDays, setFbDays] = useState("");
const [fbRating, setFbRating] = useState(5);
const [fbMood, setFbMood] = useState("happy"); // happy | neutral | sad
const [fbResolved, setFbResolved] = useState(true);
const [fbPending, setFbPending] = useState("");
const [fbDetails, setFbDetails] = useState("");
const [fbImage, setFbImage] = useState(null);
const [fbImagePreview, setFbImagePreview] = useState("/mnt/data/Screenshot 2025-11-20 at 9.38.37 PM.png");

const handleFbImage = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!["image/png", "image/jpeg"].includes(file.type)) {
    alert("Only JPG/PNG allowed");
    return;
  }

  setFbImage(file);
  setFbImagePreview(URL.createObjectURL(file));
};



const handleSubmitNewFeedback = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return alert("Login required.");

    if (!selectedComplaint) return alert("No complaint selected.");

    // VALIDATION
    if (!fbDays || fbDays < 0) return alert("Enter valid number of days.");
    if (!fbRating) return alert("Rating required.");
    if (!fbMood) return alert("Satisfaction required.");
    if (fbResolved === false && fbPending.trim().length < 5)
      return alert("Describe what is pending.");

    if (fbDetails.trim().length < 20)
      return alert("Detailed feedback must be at least 20 characters.");

    // PAYLOAD
    const payload = {
      complaint: selectedComplaint._id,
      daysTaken: fbDays,
      rating: fbRating,
      satisfaction: fbMood,
      resolved: fbResolved,
      pendingIssue: fbResolved ? "" : fbPending,
      detailedFeedback: fbDetails,
    };

    const url = feedbackForm?._id
      ? `http://localhost:7500/api/feedback/${feedbackForm._id}`
      : `http://localhost:7500/api/feedback`;

    const method = feedbackForm?._id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Feedback failed");

    alert("Feedback submitted successfully!");

    // refresh your feedback list
    fetchUserFeedbacks();
    setShowFeedbackForm(false);

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};




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

  const fetchMyCommunities = useCallback(async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch("http://localhost:7500/api/communities", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    if (!res.ok) return;

    const all = data.communities;

    setAdminCommunities(
      all.filter((c) => c.createdBy?._id === user._id)
    );

    setMemberCommunities(
      all.filter((c) => c.members?.includes(user._id) && c.createdBy?._id !== user._id)
    );

  } catch (err) {
    console.error("Community fetch error:", err);
  }
}, [user]);

useEffect(() => {
  if (user) fetchMyCommunities();
}, [user])

const deleteCommunity = async (id) => {
  if (!window.confirm("Delete this community?")) return;

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:7500/api/communities/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    if (!res.ok) return alert(data.message);

    alert("Community deleted");
    fetchMyCommunities();
  } catch (err) {
    console.error(err);
  }
};

const leaveCommunity = async (id) => {
  if (!window.confirm("Leave this community?")) return;

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:7500/api/communities/${id}/leave`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    if (!res.ok) return alert(data.message);

    alert("Left community successfully");
    fetchMyCommunities();
  } catch (err) {
    console.error(err);
  }
};


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
const exportPDF = (title, summaryText, columns, rows) => {
  try {
    const doc = new jsPDF("p", "pt", "a4");
    const left = 40;
    let y = 40;

    doc.setFontSize(18);
    doc.text(title, left, y);
    y += 20;

    if (summaryText) {
      doc.setFontSize(11);
      // allow long text wrap
      const split = doc.splitTextToSize(summaryText, 520);
      doc.text(split, left, y);
      y += split.length * 12 + 12;
    }

    autoTable(doc, {
      startY: y,
      head: [columns],
      body: rows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 91, 95] },
    });

    doc.save(`${title}.pdf`);
  } catch (err) {
    console.error("PDF export error:", err);
    alert("Failed to generate PDF. Check console for details.");
  }
};

/* -----------------------
   Summary generators
   ----------------------- */
const getComplaintSummaryText = (complaints) => {
  if (!Array.isArray(complaints) || complaints.length === 0)
    return "No complaints have been filed yet.";

  const total = complaints.length;
  const pending = complaints.filter(c => (c.status || "").toLowerCase() === "pending").length;
  const inProgress = complaints.filter(c => (c.status || "").toLowerCase() === "in progress").length;
  const resolved = complaints.filter(c => (c.status || "").toLowerCase() === "resolved").length;

  const catCount = {};
  complaints.forEach(c => {
    const k = c.category || "Uncategorized";
    catCount[k] = (catCount[k] || 0) + 1;
  });
  const topCategory = Object.entries(catCount).sort((a,b) => b[1]-a[1])[0]?.[0] || "N/A";

  const rate = total ? ((resolved / total) * 100).toFixed(1) : "0";

  return `Total complaints: ${total}
Resolved: ${resolved} · Pending: ${pending} · In Progress: ${inProgress}
Most common category: ${topCategory}
Resolution rate: ${rate}%`;
};

const getFeedbackSummaryText = (feedbacks) => {
  if (!Array.isArray(feedbacks) || feedbacks.length === 0) return "No feedback records available.";

  const total = feedbacks.length;
  const avgRating = (feedbacks.reduce((acc, f) => acc + (Number(f.rating) || 0), 0) / total).toFixed(1);

  const resolvedFeedbacks = feedbacks.filter(f => f.resolved).length;

  const moods = {};
  feedbacks.forEach(f => { const m = f.satisfaction || "unknown"; moods[m] = (moods[m] || 0) + 1; });
  const topMood = Object.entries(moods).sort((a,b) => b[1]-a[1])[0]?.[0] || "N/A";

  const quality = avgRating >= 4 ? "high" : avgRating >= 3 ? "moderate" : "needs improvement";

  return `Total feedback entries: ${total}
Average rating: ${avgRating} / 5
Resolved feedbacks: ${resolvedFeedbacks}
Most common mood: ${topMood}
Overall service quality: ${quality}`;
};

const getAnnouncementSummaryText = (announcements) => {
  if (!Array.isArray(announcements) || announcements.length === 0) return "You have not created any announcements.";

  const total = announcements.length;
  const catCount = {};
  announcements.forEach(a => { const k = a.category || "Uncategorized"; catCount[k] = (catCount[k] || 0) + 1; });
  const topCategory = Object.entries(catCount).sort((a,b)=>b[1]-a[1])[0]?.[0] || "N/A";

  return `Total announcements: ${total}
Most frequent category: ${topCategory}`;
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

 
  {item.status?.toLowerCase() === "pending" && (
    <>
      <button
        className="action-btn edit"
        onClick={() => handleEditSubmission(item, "complaint")}
      >
        <MdEdit /> Edit
      </button>

      <button
        className="action-btn delete"
        onClick={() => handleDeleteSubmission(item._id, "complaint")}
      >
        <MdDelete /> Delete
      </button>
    </>
  )}

  {/* -------------------------- */}
  {/* FEEDBACK LOGIC             */}
  {/* -------------------------- */}

  {item.status?.toLowerCase() === "resolved" ? (
    // If resolved, check if feedback already exists
    !feedbacks.some((f) => f.complaint?._id === item._id) ? (
      <button
        className="action-btn feedback"
        onClick={() => openFeedbackForm(item)}
      >
        <MdFeedback /> Feedback
      </button>
    ) : (
      <button className="action-btn feedback disabled" disabled>
        <MdFeedback /> Feedback Given
      </button>
    )
  ) : (
    // For all other states: pending, in progress, accepted, rejected
    <button className="action-btn feedback disabled" disabled>
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
        <button className="btn primary" onClick={() => {
    const columns = ["Complaint ID", "Title", "Category", "Status", "Date"];
    const rows = (complaints || []).map((c) => [
      c.complaintId || "N/A",
      c.title || "—",
      c.category || "—",
      c.status || "—",
      c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—",
    ]);

    const summary = getComplaintSummaryText(complaints || []);
    exportPDF("Complaint Summary Report", summary, columns, rows);
  }}>Generate</button>
      
    </div>
  </div>

  <div className="report-card">
    <h3 className="report-title">Feedback Analysis Report</h3>
    <p className="report-desc">
      View trends and ratings you provided for resolved complaints.
    </p>
    <div className="report-actions">
      <button className="btn primary" onClick={() => {
    const columns = ["Complaint ID", "Rating", "Satisfaction", "Resolved", "Date"];
    const rows = (feedbacks || []).map((f) => [
      f.complaint?.complaintId || "N/A",
      f.rating ?? "—",
      f.satisfaction ?? "—",
      f.resolved ? "Yes" : "No",
      f.createdAt ? new Date(f.createdAt).toLocaleDateString() : "—",
    ]);

    const summary = getFeedbackSummaryText(feedbacks || []);
    exportPDF("Feedback Analysis Report", summary, columns, rows);
  }}>Generate</button>
      
    </div>
  </div>

  <div className="report-card">
    <h3 className="report-title">My Announcements Report</h3>
    <p className="report-desc">
      Export your announcements history with date, category & more.
    </p>
    <div className="report-actions">
      <button className="btn primary" onClick={() => {
    const columns = ["Title", "Category", "Message", "Date"];
    const rows = (myAnnouncements || []).map((a) => [
      a.title || "—",
      a.category || "—",
      (a.message || "").replace(/\n/g, " ").slice(0, 200),
      a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "—",
    ]);

    const summary = getAnnouncementSummaryText(myAnnouncements || []);
    exportPDF("My Announcements Report", summary, columns, rows);
  }}>Generate</button>
      
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
      case "COMMUNITY":
  return renderCommunity();

      case "ACTIVITY":
  return renderActivity();

        default:
        return null;
    }
  };

  const renderCommunity = () => (
  <section className="dashboard-module submissions-module-stunning">
    <div className="module-header-stunning">
      <h2 className="module-title-stunning">🏘 YOUR COMMUNITIES</h2>
    </div>

    {/* ADMIN COMMUNITIES */}
    <h3 className="sub-section-title">Communities You Manage</h3>
    <div className="table-wrapper-stunning">
      <table className="data-table-stunning">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Description</th>
            <th>Members</th>
            <th>Created</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {adminCommunities.length === 0 ? (
            <tr><td colSpan="6" className="empty-state-stunning">You are not admin of any community.</td></tr>
          ) : (
            adminCommunities.map((c) => (
              <tr key={c._id}>
                <td>{c.name}</td>
                <td>{c.category}</td>
                <td>{c.description}</td>
                <td>{c.members?.length || 0}</td>
                <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className="action-btn delete" onClick={() => deleteCommunity(c._id)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    {/* MEMBER COMMUNITIES */}
    <h3 className="sub-section-title" style={{ marginTop: 40 }}>Communities You Joined</h3>
    <div className="table-wrapper-stunning">
      <table className="data-table-stunning">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Description</th>
            <th>Admin</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {memberCommunities.length === 0 ? (
            <tr><td colSpan="5" className="empty-state-stunning">You have not joined any community.</td></tr>
          ) : (
            memberCommunities.map((c) => (
              <tr key={c._id}>
                <td>{c.name}</td>
                <td>{c.category}</td>
                <td>{c.description}</td>
                <td>{c.createdBy?.fullName}</td>
                <td>
                  <button className="action-btn delete" onClick={() => leaveCommunity(c._id)}>Leave</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </section>
);


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
        <button
  className={`nav-link ${currentView === "COMMUNITY" ? "active-nav-link" : ""}`}
  onClick={() => setCurrentView("COMMUNITY")}
>
  🏘 COMMUNITIES
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

{/* ======================= UPDATED FEEDBACK MODAL (SCROLLABLE + NO IMAGE) ======================= */}
{showFeedbackForm && selectedComplaint && (
  <div className="fb-overlay">
    <div className="fb-card fb-scroll">

      <div className="fb-header">
        <h2>Feedback Form</h2>
        <button className="fb-close" onClick={() => { setShowFeedbackForm(false); setSelectedComplaint(null); }}>×</button>
      </div>

      <form className="fb-form" onSubmit={(e) => {
        e.preventDefault();
        handleSubmitNewFeedback();
      }}>

        {/* Complaint Info */}
        <label>Complaint ID</label>
        <input type="text" value={selectedComplaint?.complaintId || "CMPXXXX"} readOnly />

        <label>Complaint Title</label>
        <input type="text" value={selectedComplaint?.title || ""} readOnly />

        {/* Days */}
        <label>How many days it took to solve *</label>
        <input
          type="number"
          min="0"
          value={fbDays}
          onChange={(e) => setFbDays(e.target.value)}
          required
        />

        {/* Rating */}
        <label>Rating *</label>
        <div className="fb-stars">
          {[1,2,3,4,5].map(num => (
            <span
              key={num}
              className={num <= fbRating ? "star active" : "star"}
              onClick={() => setFbRating(num)}
            >
              ★
            </span>
          ))}
        </div>

        {/* Satisfaction */}
        <label>Satisfaction *</label>
        <div className="fb-emojis">
          <span className={fbMood==="happy"?"emo selected":"emo"} onClick={() => setFbMood("happy")}>🙂</span>
          <span className={fbMood==="neutral"?"emo selected":"emo"} onClick={() => setFbMood("neutral")}>😐</span>
          <span className={fbMood==="sad"?"emo selected":"emo"} onClick={() => setFbMood("sad")}>🙁</span>
        </div>

        {/* Resolved Toggle */}
        <label>Was the complaint fully resolved? *</label>
        <div className="fb-radio">
          <label><input type="radio" checked={fbResolved===true} onChange={() => setFbResolved(true)} /> Yes</label>
          <label><input type="radio" checked={fbResolved===false} onChange={() => setFbResolved(false)} /> No</label>
        </div>

        {/* Pending Issue */}
        {!fbResolved && (
          <>
            <label>What is still pending *</label>
            <textarea
              rows="3"
              value={fbPending}
              onChange={(e)=>setFbPending(e.target.value)}
              required
            ></textarea>
          </>
        )}

        {/* Detailed Feedback */}
        <label>Detailed Feedback *</label>
        <textarea
          rows="5"
          value={fbDetails}
          onChange={(e)=>setFbDetails(e.target.value)}
          placeholder="Explain your experience in detail..."
          required
        ></textarea>

        {/* Submit */}
        <div className="fb-actions">
          <button type="button" className="fb-btn cancel" onClick={() => { setShowFeedbackForm(false); setSelectedComplaint(null); }}>Cancel</button>
          <button type="submit" className="fb-btn submit">Submit</button>
        </div>

      </form>
    </div>
  </div>
)}



    </div>
  );
}
