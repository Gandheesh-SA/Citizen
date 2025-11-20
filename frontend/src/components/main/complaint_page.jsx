import React, { useState, useEffect } from "react";
import { MdTitle, MdDescription, MdCategory, MdTimer } from "react-icons/md";
import { FaMapMarkerAlt, FaImage } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/post_complaint.css";



export default function PostComplaint() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingComplaint = location.state?.complaint || null;

  // form values
  const [formData, setFormData] = useState({
    title: "",
    category: [],
    complaintType: "",
    areaType: "",
    description: "",
    days: "",
    // location is filled from user profile and readonly
    location: "",
  });

  // new files selected in the UI (File objects)
  const [mediaFiles, setMediaFiles] = useState([]); // File[]
  // existing media paths saved on complaint (strings like "uploads/CMP-...png")
  const [existingMedia, setExistingMedia] = useState([]); // string[]

  // user info (for location prefix)
  const [userData, setUserData] = useState(null);

  // Optional dev-only debug local image path from conversation history
  const DEV_DEBUG_LOCAL_IMAGE = "/mnt/data/Screenshot 2025-11-20 at 1.32.16 AM.png";

  // Fetch current user profile to prefill location (on mount)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch("http://localhost:7500/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          console.error("Failed to fetch user:", data);
          return;
        }
        setUserData(data);
        // prefer "location, area" if area present
        const loc = (data.location || "Coimbatore") + (data.area ? `, ${data.area}` : "");
        setFormData((prev) => ({ ...prev, location: loc }));
      } catch (err) {
        console.error("User fetch error:", err);
      }
    };
    fetchUser();
  }, []);

  // Prefill fields when editing an existing complaint
  useEffect(() => {
    if (!editingComplaint) return;
    setFormData({
      title: editingComplaint.title || "",
      category: Array.isArray(editingComplaint.category) ? editingComplaint.category : [],
      complaintType: editingComplaint.complaintType || "",
      areaType: editingComplaint.areaType || "",
      description: editingComplaint.description || "",
      days: editingComplaint.days ? String(editingComplaint.days) : "",
      location: editingComplaint.location || "",
    });

    // if complaint has `image` (older single-field) or `media` (array) normalize to existingMedia
    if (Array.isArray(editingComplaint.media) && editingComplaint.media.length) {
      setExistingMedia(editingComplaint.media);
    } else if (editingComplaint.image) {
      setExistingMedia([editingComplaint.image]);
    } else {
      setExistingMedia([]);
    }
  }, [editingComplaint]);

  const getMediaLayoutClass = () => {
  const total = existingMedia.length + mediaFiles.length;

  if (total === 1) return "media-grid media-count-1";
  if (total === 2) return "media-grid media-count-2";
  if (total === 3) return "media-grid media-count-3";
  if (total === 4) return "media-grid media-count-4";
  return "media-grid media-count-many";
};

const combinedMedia = [
  ...existingMedia.map((m) => ({ type: "existing", value: m })),
  ...mediaFiles.map((f) => ({ type: "new", value: f })),
];



  // --- handlers ---
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (name === "category") {
      // checkbox group handled when name === "category"
      const updated = checked
        ? [...formData.category, value]
        : formData.category.filter((c) => c !== value);
      setFormData((prev) => ({ ...prev, category: updated }));
      return;
    }

    // For file inputs (not used by new multi-media UI below, but keep compatibility)
    if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // handle multiple media selection (images/videos)
  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // validate count
    const totalAfter = existingMedia.length + mediaFiles.length + files.length;
    if (totalAfter > 4) {
      alert("Maximum 4 media items allowed (existing + new). Remove some before adding.");
      return;
    }

    // basic validation for file types (allow images + videos)
    const allowedMime = ["image/", "video/"];
    for (const f of files) {
      if (!allowedMime.some((m) => f.type.startsWith(m))) {
        alert("Only image and video files are allowed.");
        return;
      }
    }

    setMediaFiles((prev) => [...prev, ...files]);
    // reset input value to allow re-selecting same file if removed
    e.target.value = "";
  };

  const removeNewMedia = (index) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingMedia = (index) => {
    // remove from existingMedia (server-side should delete if requested on save)
    setExistingMedia((prev) => prev.filter((_, i) => i !== index));
  };

  // --- validation helpers ---
  const validateForm = () => {
    if (!formData.title || !formData.title.trim()) {
      alert("Title is required.");
      return false;
    }
    if (!/^[A-Za-z\s]{3,50}$/.test(formData.title.trim())) {
      alert("Title should contain only letters and be 3–50 characters long.");
      return false;
    }
    if (!formData.complaintType) {
      alert("Please select a complaint type.");
      return false;
    }
    if (!formData.category || formData.category.length === 0) {
      alert("Select at least one category.");
      return false;
    }
    if (!formData.description || formData.description.trim().length < 20) {
      alert("Description must be at least 20 characters.");
      return false;
    }
    if (!/[A-Za-z]/.test(formData.description)) {
      alert("Description must include at least one alphabetic character.");
      return false;
    }
    if (!formData.days || !/^\d+$/.test(formData.days) || Number(formData.days) <= 1) {
      alert("Days must be a positive number greater than 1.");
      return false;
    }
    // must have at least one media when creating a new complaint
    if (!editingComplaint && existingMedia.length + mediaFiles.length === 0) {
      alert("Please upload at least one image or video.");
      return false;
    }
    // location: allow letters, spaces, commas, minimum 3 characters
    if (!formData.location || !formData.location.trim()) {
      alert("Please provide a location.");
      return false;
    }
    if (!/^[A-Za-z\s,]{3,}$/.test(formData.location.trim())) {
      alert("Location should only contain letters, spaces or commas and be at least 3 chars.");
      return false;
    }
    if (!formData.areaType) {
      alert("Please select the area type.");
      return false;
    }
    // total media guard again
    if (existingMedia.length + mediaFiles.length > 4) {
      alert("Maximum 4 media items allowed (existing + new).");
      return false;
    }
    return true;
  };

  // --- submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Login required.");
        return;
      }

      const payload = new FormData();
      // append scalar fields
      payload.append("title", formData.title);
      // category as array -> append each
      formData.category.forEach((c) => payload.append("category", c));
      payload.append("complaintType", formData.complaintType);
      payload.append("areaType", formData.areaType);
      payload.append("description", formData.description);
      payload.append("days", formData.days);
      payload.append("location", formData.location);

      // append existing media list so the backend knows which to keep
      // backend should expect `existingMedia` as JSON string or array — here we append as JSON string
      payload.append("existingMedia", JSON.stringify(existingMedia || []));

      // append new files under 'media' (one append per file)
      mediaFiles.forEach((file) => {
        payload.append("media", file);
      });

      // send request
      const url = editingComplaint
        ? `http://localhost:7500/api/complaints/${editingComplaint._id}`
        : "http://localhost:7500/api/complaints";

      const method = editingComplaint ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          // NOTE: Do NOT set Content-Type here; browser will set multipart/form-data with boundary
        },
        body: payload,
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Server error:", data);
        alert(data.message || "Failed to submit complaint.");
        return;
      }

      alert(editingComplaint ? "Complaint updated!" : "Complaint submitted!");
      // reset
      setFormData({
        title: "",
        category: [],
        complaintType: "",
        areaType: "",
        description: "",
        days: "",
        location: userData ? `${userData.location}${userData.area ? `, ${userData.area}` : ""}` : "",
      });
      setMediaFiles([]);
      setExistingMedia([]);
      navigate("/user-dashboard");
    } catch (err) {
      console.error("Submit error:", err);
      alert("Something went wrong while submitting the complaint.");
    }
  };

  // --- helpers for rendering media previews ---
  const toPublicUrl = (pathOrUrl) => {
    if (!pathOrUrl) return "";
    // if path is already a full URL
    if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) return pathOrUrl;
    // if server stores like "uploads/foo.png" convert to absolute URL
    const cleaned = pathOrUrl.replace(/\\/g, "/").replace(/^\//, "");
    return `http://localhost:7500/${cleaned}`;
  };

  const renderMediaPreview = (item, isExisting = false, index) => {
    // existing: item is string (path)
    // new: item is File object
    if (isExisting) {
      const url = toPublicUrl(item);
      const isVideo = /\.(mp4|mov|webm|mkv)$/i.test(item);
      return (
        <div className="preview-box" key={`exist-${index}`}>
          {isVideo ? (
            <video src={url} controls className="preview-media" />
          ) : (
            <img src={url} alt="existing" className="preview-media" />
          )}
          <button type="button" className="remove-media" onClick={() => removeExistingMedia(index)}>
            ✕
          </button>
        </div>
      );
    } else {
      const file = item; // File
      const objectUrl = URL.createObjectURL(file);
      const isVideo = file.type.startsWith("video/");
      return (
        <div className="preview-box" key={`new-${index}`}>
          {isVideo ? (
            <video src={objectUrl} controls className="preview-media" />
          ) : (
            <img src={objectUrl} alt="preview" className="preview-media" />
          )}
          <button type="button" className="remove-media" onClick={() => removeNewMedia(index)}>
            ✕
          </button>
        </div>
      );
    }
  };

  return (
    <section className="main-section2 post-complaint-bg2">
      <div className="form-wrapper2">
        <div className="form-container2">
          <h1 className="form-title2">{editingComplaint ? "Edit Complaint" : "Post Complaint"}</h1>
          <p className="form-subtitle2">
            {editingComplaint ? "Update your existing complaint details." : "Share your concern — we’ll ensure it reaches the right authority."}
          </p>

          <form onSubmit={handleSubmit} className="complaint-form2" encType="multipart/form-data">
            {/* Title */}
            <div className="form-group2 full-width2">
              <label><MdTitle className="icon2" /> Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Enter the title of the complaint" />
            </div>

            {/* Complaint Type */}
            <div className="form-group2 full-width2">
              <label><MdCategory className="icon2" /> Complaint Type</label>
              <select name="complaintType" value={formData.complaintType} onChange={handleChange}>
                <option value="">Select complaint type</option>
                <option value="civic">Civic Issue</option>
                <option value="environmental">Environmental</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="public-safety">Public Safety</option>
              </select>
            </div>

            {/* Category */}
            <div className="form-group2 full-width2">
              <label><MdCategory className="icon2" /> Category</label>
              <div className="checkbox-group2">
                {["Road", "Water", "Electricity", "Sanitation", "Garbage"].map((cat) => (
                  <label key={cat} className="checkbox-label2">
                    <input type="checkbox" name="category" value={cat.toLowerCase()} checked={formData.category.includes(cat.toLowerCase())} onChange={handleChange} />
                    {cat}
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="form-group2 full-width2">
              <label><MdDescription className="icon2" /> Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe the issue in detail" rows="4"></textarea>
            </div>

            {/* Days */}
            <div className="form-group2 full-width2">
              <label><MdTimer className="icon2" /> Number of Days Problem Persisted</label>
              <input type="number" name="days" value={formData.days} onChange={handleChange} placeholder="Enter number of days" min="1" />
            </div>

            {/* Media upload (multiple) */}
            <div className="form-group2 full-width2">
              <label><FaImage className="icon2" /> Upload Media (images & videos) — max 4 total</label>
              <input type="file" accept="image/*,video/*" multiple onChange={handleMediaChange} />
               {/* Media Preview (Instagram style layout) */}
<div className={getMediaLayoutClass()} style={{ marginTop: 10 }}>
  {/* Case: 3 items — special layout */}
  {combinedMedia.length === 3 ? (
    <>
      {/* Left large media */}
      <div className="media-left">
        {renderMediaPreview(
          combinedMedia[0].value,
          combinedMedia[0].type === "existing",
          0
        )}
      </div>

      {/* Right stacked media */}
      <div className="media-right">
        {renderMediaPreview(
          combinedMedia[1].value,
          combinedMedia[1].type === "existing",
          1
        )}
        {renderMediaPreview(
          combinedMedia[2].value,
          combinedMedia[2].type === "existing",
          2
        )}
      </div>
    </>
  ) : (
    /* Case: 1, 2, 4, many — normal grid */
    combinedMedia.map((item, index) =>
      renderMediaPreview(
        item.value,
        item.type === "existing",
        index
      )
    )
  )}
</div>

            </div>

            {/* Location (readonly) */}
            <div className="form-group2 full-width2">
              <label><FaMapMarkerAlt className="icon2" /> Location</label>
              <input type="text" name="location" value={formData.location} readOnly style={{ background: "#f5f5f5", cursor: "not-allowed" }} />
            </div>

            {/* Area Type */}
            <div className="form-group2 full-width2">
              <label><MdCategory className="icon2" /> Type of Area</label>
              <select name="areaType" value={formData.areaType} onChange={handleChange}>
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
              <button type="submit" className="submit-btn2">{editingComplaint ? "Update Complaint" : "Submit Complaint"}</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
