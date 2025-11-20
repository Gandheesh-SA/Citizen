import React, { useEffect, useState } from "react";
import "../../styles/community_join.css";
import { useNavigate } from "react-router-dom";

export default function JoinCommunity() {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState([]);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:7500/api/communities", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        if (res.ok) setCommunities(data.communities);
      } catch (err) {
        console.error("Error fetching communities:", err);
      }
    };

    fetchCommunities();
  }, []);

  const handleJoin = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:7500/api/communities/${id}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message);

      alert("Joined community successfully!");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to join community.");
    }
  };

  return (
    <div className="join-container">
      <div className="join-header">
        <h1>Explore Communities</h1>
        <button
          className="create-btn"
          onClick={() => navigate("/community/create")}
        >
          + Create Community
        </button>
      </div>

      <p className="join-description">
        Discover groups around you. Join a community to participate in discussions,
        collaborate with members, and stay updated with group activities.
      </p>

      <div className="table-wrapper">
        <table className="community-table">
          <thead>
            <tr>
              <th>Community Name</th>
              <th>Category</th>
              <th>Description</th>
              <th>Admin Name</th>
              <th>Contact</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {communities.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">No communities found</td>
              </tr>
            ) : (
              communities.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{c.category || "N/A"}</td>
                  <td>{c.description || "—"}</td>
                  <td>{c.createdBy?.fullName || "Unknown"}</td>
                  <td>{c.createdBy?.phone || "N/A"}</td>

                  <td>
                    <button
                      className="join-btn"
                      onClick={() => handleJoin(c._id)}
                    >
                      Join
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
