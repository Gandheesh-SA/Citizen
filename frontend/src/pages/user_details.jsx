import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdPersonOutline,
  MdOutlineEmail,
  MdPhone,
  MdOutlineWork,
  MdVolunteerActivism,
  MdDateRange,
} from "react-icons/md";
import axios from "axios";
import { FaLocationDot } from "react-icons/fa6";
import { GiAwareness } from "react-icons/gi";
import { SiCcleaner } from "react-icons/si";
import { FaGenderless } from "react-icons/fa6";

import { HiDocumentReport } from "react-icons/hi";
import { MdConnectWithoutContact } from "react-icons/md";

import { MdManageAccounts } from "react-icons/md";

import CustomInput from "../components/custom_input.jsx";
import Button from "../components/button.jsx";
import "../styles/user_details.css";
import { useLocation } from "react-router-dom";

const UserForm = () => {
  const navigate = useNavigate();
  const signUpData = location.state || {};

  const [formData, setFormData] = useState({
    fullName: signUpData.name || "",
    email: signUpData.email || "",
    password: signUpData.password || "",
    phone: "",
    location: "",
    work: "",
    gender: "",
    age: "",
    preferredContact: "",
    volunteering: "",
    volunteeringTypes: [],
    volunteeringDays: "",
  });

 

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "volunteeringTypes") {
      let updatedTypes = [...formData.volunteeringTypes];
      if (checked) {
        updatedTypes.push(value);
      } else {
        updatedTypes = updatedTypes.filter((t) => t !== value);
      }
      setFormData({ ...formData, volunteeringTypes: updatedTypes });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
    const res = await axios.post("http://localhost:8000/register", formData);
    console.log("✅ User registered:", res.data);

    alert("Registration successful!");
    navigate("/home");
  } catch (error) {
    console.error("Registration failed:", error.response?.data || error.message);
    alert("Something went wrong. Please try again.");
  }
  
  };

  return (
    <div className="trainer-container">
      <div className="trainer-left"></div>

      <div className="trainer-right">
        <h2>COMPLETE  REGISTRATION</h2>
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
              placeholder="Select Contact Method"
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
              placeholder="Select Gender"
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
              placeholder="Select Option"
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
                  {/* Awareness Campaigns */}
                  <div
                    className={`custom-checkbox ${
                      formData.volunteeringTypes.includes("Awareness Campaigns")
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      handleChange({
                        target: {
                          name: "volunteeringTypes",
                          value: "Awareness Campaigns",
                          type: "checkbox",
                          checked: !formData.volunteeringTypes.includes(
                            "Awareness Campaigns"
                          ),
                        },
                      })
                    }
                  >
                    <GiAwareness size={18} className="checkbox-icon" />
                    <span>Awareness Campaigns</span>
                  </div>

                  {/* Community Cleaning Drives */}
                  <div
                    className={`custom-checkbox ${
                      formData.volunteeringTypes.includes(
                        "Community Cleaning Drives"
                      )
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      handleChange({
                        target: {
                          name: "volunteeringTypes",
                          value: "Community Cleaning Drives",
                          type: "checkbox",
                          checked: !formData.volunteeringTypes.includes(
                            "Community Cleaning Drives"
                          ),
                        },
                      })
                    }
                  >
                    <SiCcleaner size={18} className="checkbox-icon" />
                    <span>Community Cleaning Drives</span>
                  </div>

                  {/* Event Management */}
                  <div
                    className={`custom-checkbox ${
                      formData.volunteeringTypes.includes("Event Management")
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      handleChange({
                        target: {
                          name: "volunteeringTypes",
                          value: "Event Management",
                          type: "checkbox",
                          checked:
                            !formData.volunteeringTypes.includes(
                              "Event Management"
                            ),
                        },
                      })
                    }
                  >
                    <MdManageAccounts size={18} className="checkbox-icon" />
                    <span>Event Management</span>
                  </div>

                  {/* Digital Reporting Assistance */}
                  <div
                    className={`custom-checkbox ${
                      formData.volunteeringTypes.includes(
                        "Digital Reporting Assistance"
                      )
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      handleChange({
                        target: {
                          name: "volunteeringTypes",
                          value: "Digital Reporting Assistance",
                          type: "checkbox",
                          checked: !formData.volunteeringTypes.includes(
                            "Digital Reporting Assistance"
                          ),
                        },
                      })
                    }
                  >
                    <HiDocumentReport size={18} className="checkbox-icon" />
                    <span>Digital Reporting Assistance</span>
                  </div>
                </div>

                <CustomInput
                  label="Days Available"
                  type="select"
                  options={["Weekdays", "Weekends", "Flexible"]}
                  placeholder="Select Days"
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
            <Button type="primary" width="150px">
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
