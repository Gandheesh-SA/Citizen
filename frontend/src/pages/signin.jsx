import React, { useState } from "react";
import { MdOutlineEmail, MdLockOutline } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF, FaApple } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import CustomInput from "../components/custom_input.jsx";
import Button from "../components/button.jsx"; 
import "../styles/auth.css";
import axios from "axios"; 

export default function SignIn() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid Email";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Minimum 6 characters";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
      try {
        console.log("🟡 Sending login data:", formData);

   const res = await axios.post("http://localhost:7500/api/auth/login", formData, {
  headers: { "Content-Type": "application/json" },
});
    console.log("Login successful:", res.data);

    localStorage.setItem("user", JSON.stringify(res.data.user));
localStorage.setItem("token", res.data.token);
    navigate("/home");
    
  } catch (err) {
    if (err.response) {
      alert(err.response.data.message || "Login failed!");
    } else {
      alert("Server not reachable!");
    }
    console.error("Error during login:", err);
  } finally {
    setIsSubmitting(false);
  }
  };

  return (
    <div className="auth-container">
      <div className="left-section white-bg">
        <div className="logo"><h1>CITIZEN</h1></div>
        <h2>Welcome Back</h2>
        <p className="welcome-text">Welcome back, please enter your details</p>

        <form onSubmit={handleSubmit} className="login-form">
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

          <Button
            type="primary"
            width="100%"
            isLoading={isSubmitting}
          >
            Sign In
          </Button>
        </form>

        <div className="divider"><span>Or Continue with</span></div>
        <div className="social-buttons">
          <button className="social-btn google"><FcGoogle size={20} /></button>
          <button className="social-btn facebook"><FaFacebookF color="#1877f2" size={20} /></button>
          <button className="social-btn x"><FaXTwitter size={20} /></button>
          <button className="social-btn apple"><FaApple size={20} /></button>
        </div>

        <p className="signup-text">Don’t have an account? <Link to="/signup">Sign Up</Link></p>
      </div>

      <div className="right-section green-bg">
      
      </div>
    </div>
  );
}
