import React, { useState, useEffect } from "react";
import { MdTitle, MdDescription, MdCategory, MdTimer } from "react-icons/md";
import { FaMapMarkerAlt, FaImage } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/post_complaint.css";

export default function PostComplaint() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingComplaint = location.state?.complaint || null;

  // 🧠 State initialization
  const [formData, setFormData] = useState({
    title: "",
    category: [],
    complaintType: "",
    areaType: "",
    description: "",
    days: "",
    image: "",
    location: "",
  });

  // ✅ Prefill when editing
  useEffect(() => {
    if (editingComplaint) {
      setFormData({
        title: editingComplaint.title || "",
        category: editingComplaint.category || [],
        complaintType: editingComplaint.complaintType || "",
        areaType: editingComplaint.areaType || "",
        description: editingComplaint.description || "",
        days: editingComplaint.days || "",
        image: editingComplaint.image || "",
        location: editingComplaint.location || "",
      });
    }
  }, [editingComplaint]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;

    if (type === "checkbox") {
      const updatedCategories = checked
        ? [...formData.category, value]
        : formData.category.filter((c) => c !== value);
      setFormData({ ...formData, category: updatedCategories });
    } else {
      setFormData({ ...formData, [name]: files ? files[0] : value });
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  // ✅ Title
  if (!formData.title.trim()) {
    alert("Title is required!");
    return;
  }
  if (!/^[A-Za-z\s]{3,}$/.test(formData.title.trim())) {
    alert("Title should contain only letters and be at least 3 characters long.");
    return;
  }

  // ✅ Complaint Type
  if (!formData.complaintType) {
    alert("Please select a complaint type!");
    return;
  }

  // ✅ Category
  if (formData.category.length === 0) {
    alert("Please select at least one category!");
    return;
  }

  // ✅ Description
  if (!formData.description.trim()) {
    alert("Description cannot be empty!");
    return;
  }
  if (formData.description.trim().length < 10) {
    alert("Description must be at least 10 characters long.");
    return;
  }

  // ✅ Days (number only)
  if (!formData.days) {
    alert("Please enter number of days!");
    return;
  }
  if (!/^\d+$/.test(formData.days) || Number(formData.days) <= 0) {
    alert("Days must be a positive number!");
    return;
  }

  // ✅ Image (only for new complaints)
  if (!editingComplaint && !formData.image) {
    alert("Please upload an image!");
    return;
  }
  if (formData.image && formData.image.name) {
    const validExtensions = ["jpg", "jpeg", "png", "gif"];
    const fileExt = formData.image.name.split(".").pop().toLowerCase();
    if (!validExtensions.includes(fileExt)) {
      alert("Only image files (JPG, JPEG, PNG, GIF) are allowed.");
      return;
    }
  }

  // ✅ Location
  if (!formData.location.trim()) {
    alert("Please enter a location!");
    return;
  }

  // ✅ Area Type
  if (!formData.areaType) {
    alert("Please select the area type!");
    return;
  }

  // 🧾 Prepare form data for backend
  const formDataToSend = new FormData();
  Object.entries(formData).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => formDataToSend.append(key, v));
    } else {
      formDataToSend.append(key, value);
    }
  });

  try {
    let response;
    if (editingComplaint) {
      response = await fetch(
        `http://localhost:7500/api/complaints/${editingComplaint._id}`,
        {
          method: "PUT",
          body: formDataToSend,
        }
      );
    } else {
      response = await fetch("http://localhost:7500/api/complaints", {
        method: "POST",
        body: formDataToSend,
      });
    }

    const data = await response.json();

    if (response.ok) {
      alert(editingComplaint ? "Complaint updated successfully!" : "Complaint submitted successfully!");
      setFormData({
        title: "",
        category: [],
        complaintType: "",
        areaType: "",
        description: "",
        days: "",
        image: "",
        location: "",
      });
      navigate("/user-dashboard");
    } else {
      alert(data.message || "Operation failed.");
    }
  } catch (error) {
    console.error("Error submitting complaint:", error);
    alert("Something went wrong!");
  }
};


  return (
    <section className="main-section2 post-complaint-bg2">
      <div className="form-wrapper2">
        <div className="form-container2">
          <h1 className="form-title2">
            {editingComplaint ? "Edit Complaint" : "Post Complaint"}
          </h1>
          <p className="form-subtitle2">
            {editingComplaint
              ? "Update your existing complaint details."
              : "Share your concern — we’ll ensure it reaches the right authority."}
          </p>

          <form onSubmit={handleSubmit} className="complaint-form2">
            {/* Title */}
            <div className="form-group2 full-width2">
              <label>
                <MdTitle className="icon2" /> Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter the title of the complaint"
              />
            </div>

            {/* Complaint Type */}
            <div className="form-group2 full-width2">
              <label>
                <MdCategory className="icon2" /> Complaint Type
              </label>
              <select
                name="complaintType"
                value={formData.complaintType}
                onChange={handleChange}
              >
                <option value="">Select complaint type</option>
                <option value="civic">Civic Issue</option>
                <option value="environmental">Environmental</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="public-safety">Public Safety</option>
                <option value="others">Others</option>
              </select>
            </div>

            {/* Category */}
            <div className="form-group2 full-width2">
              <label>
                <MdCategory className="icon2" /> Category
              </label>
              <div className="checkbox-group2">
                {["Road", "Water", "Electricity", "Sanitation", "Others"].map(
                  (cat) => (
                    <label key={cat} className="checkbox-label2">
                      <input
                        type="checkbox"
                        name="category"
                        value={cat.toLowerCase()}
                        checked={formData.category.includes(cat.toLowerCase())}
                        onChange={handleChange}
                      />
                      {cat}
                    </label>
                  )
                )}
              </div>
            </div>

            {/* Description */}
            <div className="form-group2 full-width2">
              <label>
                <MdDescription className="icon2" /> Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the issue in detail"
                rows="4"
              ></textarea>
            </div>

            {/* Number of Days */}
            <div className="form-group2 full-width2">
              <label>
                <MdTimer className="icon2" /> Number of Days Problem Persisted
              </label>
              <input
                type="number"
                name="days"
                value={formData.days}
                onChange={handleChange}
                placeholder="Enter number of days"
                min="0"
              />
            </div>

            {/* Image */}
            <div className="form-group2 full-width2">
              <label>
                <FaImage className="icon2" /> Upload Image
              </label>
              <div className="file-input-wrapper2">
                <input
                  type="file"
                  name="image"
                  onChange={handleChange}
                  className="file-input2"
                  accept="image/*"
                />
              </div>
              {editingComplaint && !formData.image?.name && (
                <small>Current image: {formData.image}</small>
              )}
            </div>

            {/* Location */}
            <div className="form-group2 full-width2">
              <label>
                <FaMapMarkerAlt className="icon2" /> Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter or auto-fetch location"
              />
            </div>

            {/* Area Type */}
            <div className="form-group2 full-width2">
              <label>
                <MdCategory className="icon2" /> Type of Area
              </label>
              <select
                name="areaType"
                value={formData.areaType}
                onChange={handleChange}
              >
                <option value="">Select area type</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="public">Public Space</option>
                <option value="industrial">Industrial</option>
                <option value="government">Government Premises</option>
              </select>
            </div>

            {/* Submit */}
            <div className="form-footer2">
              <button type="submit" className="submit-btn2">
                {editingComplaint ? "Update Complaint" : "Submit Complaint"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
