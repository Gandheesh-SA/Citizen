import React, { useEffect, useState } from "react";
import { FaComment, FaArrowUp, FaTimes } from "react-icons/fa";
import "../../styles/homepage.css";

export default function HomePage() {
  const [complaints, setComplaints] = useState([]);
  const [user, setUser] = useState(null);
  const [greeting, setGreeting] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // ===== Fetch complaints =====
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return console.warn("No token found — please login.");

        const res = await fetch("http://localhost:7500/api/complaints", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (res.ok) setComplaints(data);
        else console.error("Error fetching complaints:", data.message);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    const hour = new Date().getHours();
    setGreeting(
      hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
    );

    fetchComplaints();
  }, []);

  // ===== Modal logic =====
  const openComplaintModal = (complaint) => setSelectedComplaint(complaint);
  const closeComplaintModal = () => setSelectedComplaint(null);

  // ===== Helper: show short preview text =====
  const truncate = (text, n = 120) =>
    text?.length > n ? text.slice(0, n) + "..." : text;

  // ===== Helper: build full file URL =====
  const fileURL = (file) =>
    file ? `http://localhost:7500/${file.replace(/\\/g, "/")}` : "";

  return (
    <div className="homepage-container">
      <h1 className="greeting">
        {greeting},{" "}
        <span className="username">{user ? user.fullName : "Citizen"}!</span>
      </h1>
      <p className="location">You are at {user?.location || "your location"}.</p>

      {/* ===== Complaint Feed ===== */}
      {complaints.length === 0 ? (
        <p className="empty-state">No complaints yet.</p>
      ) : (
        complaints.map((c) => (
          <div
            className="complaint-card"
            key={c._id}
            onClick={() => openComplaintModal(c)}
          >
            {/* === User + Title === */}
            <div className="card-header">
              <div className="profile-circle" />
              <h3 className="user-name">
               {c.user?.fullName || "User"} 
              </h3>
            </div>

            <h2 className="complaint-title">{c.title}</h2>

            {/* === Description === */}
            <p className="complaint-description">
              {truncate(c.description)}{" "}
              {c.description?.length > 120 && (
                <span className="read-more">read more</span>
              )}
            </p>

            {/* === 2×2 Media Grid === */}
            <div className="media-grid">
              {(Array.isArray(c.image) ? c.image : c.image ? [c.image] : [])
                .slice(0, 4)
                .map((img, i) => (
                  <img
                    key={i}
                    src={fileURL(img)}
                    alt={`complaint-${i}`}
                    className="media-item"
                  />
                ))}

              {Array.isArray(c.video)
                ? c.video.slice(0, 2).map((vid, i) => (
                    <video
                      key={i}
                      src={fileURL(vid)}
                      controls
                      className="media-item"
                    />
                  ))
                : c.video && (
                    <video
                      src={fileURL(c.video)}
                      controls
                      className="media-item"
                    />
                  )}
            </div>

            {/* === Footer === */}
            <div className="card-footer">
              <button
                className="action-btn"
                onClick={(e) => e.stopPropagation()}
              >
                <FaComment /> Comment
              </button>
              <button
                className="action-btn"
                onClick={(e) => e.stopPropagation()}
              >
                <FaArrowUp /> Upvote
              </button>
            </div>
          </div>
        ))
      )}

      {/* ===== Modal (Expanded View) ===== */}
      {selectedComplaint && (
        <div className="complaint-modal-overlay">
          <div className="complaint-modal">
            <button className="close-btn" onClick={closeComplaintModal}>
              <FaTimes />
            </button>

            <div className="modal-header">
              <div className="profile-circle" />
              <div>
                <h3 className="user-name">
                  {selectedComplaint.user?.fullName || "User"}
                </h3>
                <h2 className="complaint-title">{selectedComplaint.title}</h2>
              </div>
            </div>

            <p className="modal-description">
              {selectedComplaint.description}
            </p>

            {(Array.isArray(selectedComplaint.image)
              ? selectedComplaint.image
              : selectedComplaint.image
              ? [selectedComplaint.image]
              : []
            ).length > 0 && (
              <div className="media-grid-large">
                {(Array.isArray(selectedComplaint.image)
                  ? selectedComplaint.image
                  : [selectedComplaint.image]
                ).map((img, i) => (
                  <img
                    key={i}
                    src={fileURL(img)}
                    alt={`media-${i}`}
                    className="media-item-large"
                  />
                ))}
              </div>
            )}

            {selectedComplaint.video && (
              <video
                src={fileURL(selectedComplaint.video)}
                controls
                className="media-item-large"
              />
            )}

            <div className="modal-footer">
              <div className="modal-actions">
                <button className="action-btn">
                  <FaComment /> Comment
                </button>
                <button className="action-btn">
                  <FaArrowUp /> Upvote
                </button>
              </div>

              <div className="comment-section">
                <h4>Comments</h4>
                <input
                  type="text"
                  placeholder="Write a comment..."
                  className="comment-input"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
