import React, { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { MdEdit, MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import "../styles/user_dashboard.css";
import FeedbackButton from "./FeedbackButton";

// User Dashboard Component    

const UserDashboard = () => {
  const navigate = useNavigate();

  const [editable, setEditable] = useState(false);
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
  const [searchCategory, setSearchCategory] = useState("");

  const fetchComplaints = async (category = "") => {
    try {
      const url = category
        ? `http://localhost:7500/api/complaints?category=${category}`
        : "http://localhost:7500/api/complaints";

      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) setComplaints(data);
      else console.error("Error fetching complaints:", data.message);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSearchChange = (e) => {
    setSearchCategory(e.target.value.toLowerCase());
  };

  const handleSearchClick = () => {
    fetchComplaints(searchCategory.trim());
  };

  const handleDelete = async (id) => {
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

  const handleEdit = (complaint) => {
    navigate("/post-complaint", { state: { complaint } });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      // Add your account deletion logic here
      alert("Account deletion functionality to be implemented");
    }
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
          <div className="action-buttons">
            <button
              className={`edit-button ${editable ? "active" : ""}`}
              onClick={() => setEditable(!editable)}
            >
              <MdEdit /> {editable ? "Save" : "Edit"}
            </button>
            
            {/* Account Actions */}
            <div className="account-actions">
              <button 
                className="delete-account-btn" 
                onClick={handleDeleteAccount}
              >
                <MdDelete /> Delete Account
              </button>
            </div>
          </div>
        </div>

        <div className="user-details">
          {Object.entries(user).map(([key, value]) => (
            <div className="detail-row" key={key}>
              <label>{key.replace(/([A-Z])/g, " $1").toUpperCase()}</label>
              {Array.isArray(value) ? (
                <input
                  type="text"
                  name={key}
                  value={value.join(", ")}
                  onChange={handleChange}
                  readOnly={!editable}
                  className={editable ? "editable" : ""}
                />
              ) : (
                <input
                  type={typeof value === "number" ? "number" : "text"}
                  name={key}
                  value={value}
                  onChange={handleChange}
                  readOnly={!editable}
                  className={editable ? "editable" : ""}
                />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="complaints-section">
        <h2>YOUR COMPLAINTS</h2>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by category (e.g., road, water, sanitation)"
            value={searchCategory}
            onChange={handleSearchChange}
            className="search-input"
          />
          <button className="search-button" onClick={handleSearchClick}>
            Search
          </button>
        </div>

        {complaints.length === 0 ? (
          <p className="no-complaints">No complaints found.</p>
        ) : (
          <table className="complaints-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Complaint</th>
                <th>Category</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
                <th>Feedback</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c, i) => (
                <tr key={c._id}>
                  <td>{i + 1}</td>
                  <td>{c.title}</td>
                  <td>{Array.isArray(c.category) ? c.category.join(", ") : c.category}</td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className={`status ${c.status?.toLowerCase().replace(" ", "-")}`}>
                    {c.status || "Pending"}
                  </td>
                  <td className="action-buttons">
                    <button className="edit-btn" onClick={() => handleEdit(c)}>
                      <MdEdit /> Edit
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(c._id)}>
                      <MdDelete /> Delete
                    </button>
                  </td>
                  <td>
                    <FeedbackButton user={user} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default UserDashboard;