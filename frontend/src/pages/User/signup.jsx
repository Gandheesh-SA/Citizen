import React, { useState } from "react";
import { MdOutlineEmail, MdLockOutline, MdPersonOutline } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF, FaApple } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { Link, useNavigate,  } from "react-router-dom";

import CustomInput from "../../components/global/custom_input.jsx";
import Button from "../../components/global/button.jsx";
import "../styles/auth.css";

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";

    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Min 6 characters";

    if (!formData.confirmPassword) newErrors.confirmPassword = "Confirm your password";
    else if (formData.confirmPassword !== formData.password) newErrors.confirmPassword = "Passwords must match";

    return newErrors;
  };

  const handleSubmit = (e) => {
  e.preventDefault();
  const validationErrors = validate();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  navigate("/user_registration", { state: { name: formData.name, email: formData.email, password: formData.password } });
};

  return (
    <div className="auth-container">
      {/* Left Section - Green Analytics */}
      <div className="left-section green-bg">
       
      </div>

      {/* Right Section - White Form Area */}
      <div className="right-section white-bg">
        <div className="logo"><h1>CITIZEN</h1></div>
        <h2>Create Account</h2>
        <p className="welcome-text">Please fill in the details to sign up</p>

        <form onSubmit={handleSubmit} className="login-form">
          <CustomInput
            label="Name"
            type="text"
            placeholder="Enter your name"
            icon={MdPersonOutline}
            registerProps={{
              name: "name",
              value: formData.name,
              onChange: handleChange
            }}
          />
          {errors.name && <span className="error-text">{errors.name}</span>}

          <CustomInput
            label="Email"
            type="email"
            placeholder="Enter your email"
            icon={MdOutlineEmail}
            registerProps={{
              name: "email",
              value: formData.email,
              onChange: handleChange
            }}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}

          <CustomInput
            label="Password"
            type="password"
            placeholder="Enter your password"
            icon={MdLockOutline}
            registerProps={{
              name: "password",
              value: formData.password,
              onChange: handleChange
            }}
          />
          {errors.password && <span className="error-text">{errors.password}</span>}

          <CustomInput
            label="Confirm Password"
            type="password"
            placeholder="Re-enter password"
            icon={MdLockOutline}
            registerProps={{
              name: "confirmPassword",
              value: formData.confirmPassword,
              onChange: handleChange
            }}
          />
          {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}

          <Button type="primary" width="100%" isLoading={isSubmitting}>
            Sign Up
          </Button>
        </form>

       

        <p className="signup-text">Already have an account? <Link to="/signin">Sign In</Link></p>
      </div>
    </div>
  );
}
