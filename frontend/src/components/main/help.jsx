// src/pages/help/HelpSupport.jsx
import React, { useState, useEffect } from "react";
import "../../styles/post_complaint.css"; // same styles as complaint form

export default function HelpSupport() {
  const [user, setUser] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const [form, setForm] = useState({
    contactPreference: "",
    message: "",
  });

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:7500/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (res.ok) {
          setUser({
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.contactPreference || !form.message)
      return alert("Please fill all required fields.");

    alert("Support request submitted!");
  };

  return (
    <section className="main-section2 post-complaint-bg2">
      <div className="form-wrapper2">
        <div className="form-container2">
          <h1 className="form-title2">Help & Support</h1>
          <p className="form-subtitle2">
            We're here to help you. Submit your issue and our team will reach out.
          </p>

          <form className="complaint-form2" onSubmit={handleSubmit}>
            {/* USER NAME */}
            <div className="form-group2 full-width2">
              <label>Your Name</label>
              <input type="text" value={user.fullName} readOnly />
            </div>

            {/* EMAIL */}
            <div className="form-group2 full-width2">
              <label>Email</label>
              <input type="text" value={user.email} readOnly />
            </div>

            {/* PHONE */}
            <div className="form-group2 full-width2">
              <label>Phone Number</label>
              <input type="text" value={user.phone} readOnly />
            </div>

            {/* CONTACT PREFERENCE */}
            <div className="form-group2 full-width2">
              <label>Contact You On *</label>
              <select
                name="contactPreference"
                value={form.contactPreference}
                onChange={handleChange}
              >
                <option value="">Select option</option>
                <option value="phone">Phone</option>
                <option value="email">Email</option>
                <option value="both">Both</option>
              </select>
            </div>

            {/* MESSAGE */}
            <div className="form-group2 full-width2">
              <label>Drop Your Message *</label>
              <textarea
                name="message"
                rows="4"
                placeholder="Explain your issue or message..."
                value={form.message}
                onChange={handleChange}
              />
            </div>

            <div className="form-footer2 full-width2">
              <button className="submit-btn2" type="submit">
                Submit Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
