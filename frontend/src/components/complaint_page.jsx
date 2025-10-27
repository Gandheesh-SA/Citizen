import React, { useState } from "react";
import { MdTitle, MdDescription, MdCategory, MdTimer } from "react-icons/md";
import { FaMapMarkerAlt, FaImage } from "react-icons/fa";
import "../styles/post_complaint.css";

export default function PostComplaint() {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    days: "",
    image: "",
    location: "",
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Complaint Submitted:", formData);
  };

  return (
    <div className="complaint-layout">
      <div className="complaint-content">
        <div className="form-container">
          <h1 className="form-title">Post Complaint</h1>
          <p className="form-subtitle">
            Share your concern — we’ll ensure it reaches the right authority.
          </p>

          <form onSubmit={handleSubmit} className="complaint-form">
            {/* Title */}
            <div className="form-group full-width">
              <label>
                <MdTitle className="icon" /> Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter the title of the complaint"
              />
            </div>

            {/* Category */}
            <div className="form-group full-width">
              <label>
                <MdCategory className="icon" /> Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select category</option>
                <option value="road">Road</option>
                <option value="water">Water</option>
                <option value="electricity">Electricity</option>
                <option value="sanitation">Sanitation</option>
                <option value="others">Others</option>
              </select>
            </div>

            {/* Description */}
            <div className="form-group full-width">
              <label>
                <MdDescription className="icon" /> Description
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
            <div className="form-group full-width">
              <label>
                <MdTimer className="icon" /> Number of Days Problem Persisted
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
            <div className="form-group full-width">
              <label>
                <FaImage className="icon" /> Upload Image
              </label>
              <input
                type="file"
                name="image"
                onChange={handleChange}
                className="file-input"
              />
            </div>

            {/* Location */}
            <div className="form-group full-width">
              <label>
                <FaMapMarkerAlt className="icon" /> Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Auto-fetched from image metadata"
              />
            </div>

            {/* Submit */}
            <div className="form-footer">
              <button type="submit" className="submit-btn">
                Submit Complaint
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
