import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MdPersonOutline,
  MdOutlineEmail,
  MdPhone,
  MdOutlineWork,
  MdVolunteerActivism,
  MdDateRange,
  MdConnectWithoutContact,
  MdManageAccounts,
} from "react-icons/md";
import { FaLocationCrosshairs } from "react-icons/fa6";
import { FaLocationDot, FaGenderless } from "react-icons/fa6";
import { GiAwareness } from "react-icons/gi";
import { SiCcleaner } from "react-icons/si";
import { HiDocumentReport } from "react-icons/hi";

import CustomInput from "../../components/global/custom_input.jsx";
import Button from "../../components/global/button.jsx";
import "../../styles/user_details.css";

const UserForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const signUpData = location.state || {};

  const [formData, setFormData] = useState({
    fullName: signUpData.name || "",
    email: signUpData.email || "",
    password: signUpData.password || "",
    phone: "",
    location: "Coimbatore",
    work: "",
    gender: "",
    age: "",
    preferredContact: "",
    volunteering: "",
    volunteeringTypes: [],
    volunteeringDays: "",
    area: "",
  });

  const [errors, setErrors] = useState({});

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "volunteeringTypes") {
      let updatedTypes = [...formData.volunteeringTypes];
      if (checked) updatedTypes.push(value);
      else updatedTypes = updatedTypes.filter((t) => t !== value);

      setFormData({ ...formData, volunteeringTypes: updatedTypes });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Validation
  const validate = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = "Full Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email address";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit clicked");
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await fetch("http://localhost:7500/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  fullName: formData.fullName,
  email: formData.email,
  password: formData.password,
  phone: formData.phone,
  location: formData.location,
  area: formData.area || null,
  work: formData.work,
  gender: formData.gender || null,
  age: formData.age ? Number(formData.age) : null,
  preferredContact: formData.preferredContact || null,
  volunteering: formData.volunteering || "No",
  volunteeringTypes:
    formData.volunteering === "Yes" ? formData.volunteeringTypes : [],
  volunteeringDays:
    formData.volunteering === "Yes" ? formData.volunteeringDays : null,
})


      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.message || "Registration failed" });
      } else {
        // ✅ Save user info and token locally
        if (data.user && data.token) {
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("token", data.token);
        }

        // ✅ Navigate to home
        navigate("/home");
      }
    } catch (error) {
      setErrors({ general: "Server error during registration" });
    }
  };

  return (
    <div className="trainer-container">
      <div className="trainer-left"></div>

      <div className="trainer-right">
        <h2>Complete Registration</h2>
        <p>
          You are one more step away in being a{" "}
          <b style={{ color: "linear-gradient(135deg, #104c44, #1c6f63)" }}>
            CITIZEN
          </b>
        </p>
        {errors.general && <p className="error">{errors.general}</p>}

        <form onSubmit={handleSubmit} className="trainer-form">
          <div className="form-grid">
            <CustomInput
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              icon={MdPersonOutline}
              registerProps={{
                name: "fullName",
                value: formData.fullName,
                onChange: handleChange,
              }}
            />

            <CustomInput
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              icon={MdOutlineEmail}
              registerProps={{
                name: "email",
                value: formData.email,
                onChange: handleChange,
              }}
            />

            <CustomInput
              label="Phone Number"
              type="number"
              placeholder="Enter phone number"
              icon={MdPhone}
              registerProps={{
                name: "phone",
                value: formData.phone,
                onChange: handleChange,
              }}
            />

            <CustomInput
              label="Preferred Contact Method"
              type="select"
              icon={MdConnectWithoutContact}
              options={["Email", "Phone", "App Notification"]}
              registerProps={{
                name: "preferredContact",
                value: formData.preferredContact,
                onChange: handleChange,
              }}
            />

            <CustomInput
              label="Gender"
              type="select"
              icon={FaGenderless}
              options={["Male", "Female", "Other"]}
              registerProps={{
                name: "gender",
                value: formData.gender,
                onChange: handleChange,
              }}
            />

            <CustomInput
              label="Age"
              type="number"
              icon={MdDateRange}
              placeholder="Enter your age"
              registerProps={{
                name: "age",
                value: formData.age,
                onChange: handleChange,
              }}
            />

            <CustomInput
              label="Location"
              placeholder="Enter Residence"
              icon={FaLocationDot}
              registerProps={{
                name: "location",
                value: formData.location,
                onChange:() => {},
                readOnly: true,
                disabled: true,
              }}
            />

            <CustomInput
              label="Area"
              type="select"
              icon={FaLocationCrosshairs}
              options={[
                "Gandhipuram",
                "RS Puram",
                "Peelamedu",
                "Ettimadai",
                "Singanallur",
              ]}
              registerProps={{
                name: "area",
                value: formData.area,
                onChange: handleChange,
              }}
            />

            <CustomInput
              label="Work"
              placeholder="Enter your Work Designation"
              icon={MdOutlineWork}
              registerProps={{
                name: "work",
                value: formData.work,
                onChange: handleChange,
              }}
            />
          </div>

          {/* Volunteering Section */}
          <div className="volunteering-section">
            <CustomInput
              label="Up for Volunteering Service?"
              type="select"
              icon={MdVolunteerActivism}
              options={["Yes", "No"]}
              registerProps={{
                name: "volunteering",
                value: formData.volunteering,
                onChange: (e) => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    volunteering: val,
                    volunteeringTypes: [],
                    volunteeringDays: "",
                  });
                },
              }}
            />

            {formData.volunteering === "Yes" && (
              <>
                <div className="multi-check-container">
                  {[
                    { label: "Awareness Campaigns", icon: GiAwareness },
                    { label: "Community Cleaning Drives", icon: SiCcleaner },
                    { label: "Event Management", icon: MdManageAccounts },
                    {
                      label: "Digital Reporting Assistance",
                      icon: HiDocumentReport,
                    },
                  ].map(({ label, icon: Icon }) => (
                    <div
                      key={label}
                      className={`custom-checkbox ${
                        formData.volunteeringTypes.includes(label)
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        handleChange({
                          target: {
                            name: "volunteeringTypes",
                            value: label,
                            type: "checkbox",
                            checked:
                              !formData.volunteeringTypes.includes(label),
                          },
                        })
                      }
                    >
                      <Icon size={18} className="checkbox-icon" />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>

                <CustomInput
                  label="Days Available"
                  type="select"
                  options={["Weekdays", "Weekends", "Flexible"]}
                  registerProps={{
                    name: "volunteeringDays",
                    value: formData.volunteeringDays,
                    onChange: handleChange,
                  }}
                />
              </>
            )}
          </div>

          <div className="submit-container">
            <Button type="submit" variant="primary" width="150px">
              Register
            </Button>
          </div>

          <p className="terms">
            By providing your contact details, you agree to our{" "}
            <a href="#">Terms of Use</a> & <a href="#">Privacy Policy</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
