import React, { useEffect, useState } from "react";
import { MdTitle, MdCategory, MdDescription, MdDateRange } from "react-icons/md";
import { FaImage } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/post_complaint.css"; // reuse your good UI

export default function PostAnnouncement() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingAnnouncement = location.state?.announcement || null;

  const [user, setUser] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    category: "",
    startDate: "",
    endDate: "",
    autoDelete: false,
    senderName: "",
    contactEmail: "",
    contactPhone: "",
    location: "",
    area: "",
  });

  const [imageFile, setImageFile] = useState(null); // new image
  const [existingImage, setExistingImage] = useState(null); // cloud URL

  // -----------------------------------
  // Fetch User Profile
  // -----------------------------------
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
          setUser(data);
          setFormData((prev) => ({
            ...prev,
            senderName: data.fullName || "",
            contactEmail: data.email || "",
            contactPhone: data.phone || "",
            location: data.location || "Coimbatore",
            area: data.area || "",
          }));
        }
      } catch (err) {
        console.error("User fetch error:", err);
      }
    };

    fetchUser();
  }, []);

  // -----------------------------------
  // Prefill when editing
  // -----------------------------------
  useEffect(() => {
    if (!editingAnnouncement) return;

    setFormData({
      title: editingAnnouncement.title || "",
      message: editingAnnouncement.message || "",
      category: editingAnnouncement.category || "",
      startDate: editingAnnouncement.startDate
        ? editingAnnouncement.startDate.split("T")[0]
        : "",
      endDate: editingAnnouncement.endDate
        ? editingAnnouncement.endDate.split("T")[0]
        : "",
      autoDelete: editingAnnouncement.autoDelete || false,
      senderName: editingAnnouncement.senderName || "",
      contactEmail: editingAnnouncement.contactEmail || "",
      contactPhone: editingAnnouncement.contactPhone || "",
      location: editingAnnouncement.location || "",
      area: editingAnnouncement.area || "",
    });

    setExistingImage(editingAnnouncement.imageUrl || null);
  }, [editingAnnouncement]);

  // -----------------------------------
  // Handlers
  // -----------------------------------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) return alert("Only image files allowed");

    setImageFile(file);
    setExistingImage(null);
  };

  const removeImage = () => {
    setImageFile(null);
    setExistingImage(null);
  };

  // -----------------------------------
  // Validation
  // -----------------------------------
  const validateForm = () => {
    if (!formData.title.trim()) return alert("Title is required.");
    if (formData.title.trim().split(" ").length < 3)
      return alert("Title must contain at least 3 words.");
    if (!formData.message.trim()) return alert("Message is required.");
    if (!formData.category) return alert("Category required.");
    if (!formData.location) return alert("Location missing.");
    if (!formData.senderName || !formData.contactEmail)
      return alert("Sender information missing.");

    return true;
  };

  // -----------------------------------
  // Submit
  // -----------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Login required");

      const fd = new FormData();
      for (let key in formData) fd.append(key, formData[key]);

      if (imageFile) fd.append("image", imageFile);
      if (existingImage) fd.append("existingImage", existingImage);

      const url = editingAnnouncement
        ? `http://localhost:7500/api/announcements/${editingAnnouncement._id}`
        : `http://localhost:7500/api/announcements`;

      const method = editingAnnouncement ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) return alert(data.message || "Submission failed");

      alert(editingAnnouncement ? "Announcement updated!" : "Announcement created!");
      navigate("/user-dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      alert("Submission failed");
    }
  };

  // -----------------------------------
  // UI
  // -----------------------------------
  return (
    <section className="main-section2 post-complaint-bg2">
      <div className="form-wrapper2">
        <div className="form-container2">
          <h1 className="form-title2">
            {editingAnnouncement ? "Edit Announcement" : "Create Announcement"}
          </h1>

          <form onSubmit={handleSubmit} className="complaint-form2">

            {/* Title */}
            <div className="form-group2 full-width2">
              <label><MdTitle className="icon2" /> Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter a descriptive announcement title"
              />
            </div>

            {/* Category */}
            <div className="form-group2 full-width2">
              <label><MdCategory className="icon2" /> Category</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="">Select category</option>
                <option value="Public Notice">Public Notice</option>
                <option value="Community Event">Community Event</option>
                <option value="Alert">Alert</option>
                <option value="Government">Government</option>
              </select>
            </div>

            {/* Message */}
            <div className="form-group2 full-width2">
              <label><MdDescription className="icon2" /> Message</label>
              <textarea
                name="message"
                rows="4"
                placeholder="Write the announcement message here..."
                value={formData.message}
                onChange={handleChange}
              ></textarea>
            </div>

            {/* Dates */}
            <div className="form-group2 full-width2">
              <label><MdDateRange className="icon2" /> Event Dates</label>
              <div style={{ display: "flex", gap: "12px" }}>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                />
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Auto Delete */}
            <label className="checkbox-label2" style={{ marginTop: "10px" }}>
              <input
                type="checkbox"
                name="autoDelete"
                checked={formData.autoDelete}
                onChange={handleChange}
              />
              Auto-delete after event ends
            </label>

            {/* Image upload */}
            <div className="form-group2 full-width2">
              <label><FaImage className="icon2" /> Upload Image (optional)</label>

              {!imageFile && !existingImage && (
                <input type="file" accept="image/*" onChange={handleImageChange} />
              )}

              {(imageFile || existingImage) && (
                <div className="preview-box" style={{ marginTop: 10 }}>
                  <img
                    src={
                      imageFile
                        ? URL.createObjectURL(imageFile)
                        : existingImage
                    }
                    className="preview-media"
                    alt="preview"
                  />
                  <button
                    type="button"
                    className="remove-media"
                    onClick={removeImage}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Readonly User Data */}
            <div className="form-group2 full-width2">
              <label>Your Contact Information</label>
              <input type="text" readOnly value={formData.senderName} />
              <input type="text" readOnly value={formData.contactEmail} />
              <input type="text" readOnly value={formData.contactPhone} />
            </div>

            {/* Location */}
            <div className="form-group2 full-width2">
              <label>Location</label>
              <input type="text" readOnly value={formData.location} />
              <input type="text" readOnly value={formData.area} />
            </div>

            {/* Submit */}
            <div className="form-footer2">
              <button type="submit" className="submit-btn2">
                {editingAnnouncement ? "Update Announcement" : "Submit Announcement"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </section>
  );
}
