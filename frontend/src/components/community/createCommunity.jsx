import React, { useState, useEffect } from "react";
import { MdTitle, MdDescription, MdCategory } from "react-icons/md";
import { FaUser, FaPhone, FaEnvelope } from "react-icons/fa";
import "../../styles/community_form.css";
import { useNavigate } from "react-router-dom";

export default function CreateCommunity() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tagline: "",
    category: "",
    isPublic: true,

    admin: "",
    phone: "",
    email: ""
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:7500/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        setUserData(data);

        setFormData((prev) => ({
          ...prev,
          admin: data.fullName || "",
          phone: data.phone || "",
          email: data.email || ""
        }));
      } catch (err) {
        console.error("User fetch error:", err);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Login required.");

      const payload = {
        name: formData.name,
        description: formData.description,
        tagline: formData.tagline,
        category: formData.category,
        isPublic: formData.isPublic
      };

      const res = await fetch("http://localhost:7500/api/communities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to create community.");
        return;
      }

      alert("Community created successfully!");
      navigate("/community");
    } catch (err) {
      console.error("Submit error:", err);
      alert("Something went wrong.");
    }
  };

  return (
    <section className="main-section2 post-complaint-bg2">
      <div className="form-wrapper2">
        <div className="form-container2">
          <h1 className="form-title2">Create a Community</h1>
          <p className="form-subtitle2">
            Bring people together. Start a new group for your area or interest.
          </p>

          <form className="complaint-form2" onSubmit={handleSubmit}>
            
            <div className="form-group2 full-width2">
              <label><MdTitle className="icon2" /> Community Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter community name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group2 full-width2">
              <label><FaUser className="icon2" /> Community Admin</label>
              <input type="text" value={formData.admin} readOnly />
            </div>

            <div className="form-group2 full-width2">
              <label><FaPhone className="icon2" /> Phone</label>
              <input type="text" value={formData.phone} readOnly />
            </div>

            <div className="form-group2 full-width2">
              <label><FaEnvelope className="icon2" /> Email</label>
              <input type="text" value={formData.email} readOnly />
            </div>

            <div className="form-group2 full-width2">
              <label><MdDescription className="icon2" /> Description</label>
              <textarea
                name="description"
                rows="4"
                placeholder="Describe this community"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group2 full-width2">
              <label><MdTitle className="icon2" /> Tagline</label>
              <input
                type="text"
                name="tagline"
                placeholder="Short tagline (e.g., Together We Grow)"
                value={formData.tagline}
                onChange={handleChange}
              />
            </div>

            <div className="form-group2 full-width2">
              <label><MdCategory className="icon2" /> Community Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>
                <option value="sports">Sports & Fitness</option>
                <option value="education">Education</option>
                <option value="environment">Environment</option>
                <option value="awareness">Public Awareness</option>
                <option value="social">Social Activities</option>
              </select>
            </div>

            <div className="form-group2 full-width2">
              <label><MdCategory className="icon2" /> Visibility</label>

              <label className="checkbox-label2" style={{ marginTop: "8px" }}>
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleChange}
                />
                Public Community
              </label>
            </div>

            <div className="form-footer2 full-width2">
              <button className="submit-btn2" type="submit">
                Create Community
              </button>
            </div>

          </form>
        </div>
      </div>
    </section>
  );
}
