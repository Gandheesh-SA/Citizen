import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { MdOutlineEmail, MdLockOutline, MdPersonOutline } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FaApple } from "react-icons/fa";


import "../styles/auth.css";

const signUpSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(6, "Min 6 characters").required("Password is required"),
  confirmPassword: yup.string().oneOf([yup.ref("password"), null], "Passwords must match").required("Confirm your password"),
});

export default function SignUp() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(signUpSchema),
  });

  const onSubmit = async (data) => console.log("Sign Up Data:", data);

  return (
    <div className="auth-container">
      {/* Left Section - Green Analytics */}
      <div className="left-section green-bg">
        <div className="analytics-card">
          <h3>Analytics</h3>
          <div className="chart-placeholder"></div>
        </div>

        <div className="circle-card">
          <div className="circle"><span>2.4k</span></div>
        </div>

        <div className="insights-text">
          <h3>Data Insights</h3>
          <p>Access analytics and insights into our business performance effortlessly.</p>
        </div>
      </div>

      {/* Right Section - White Form Area */}
      <div className="right-section white-bg">
        <div className="logo">
          <div className="logo-icon"></div>
          <h1>GLATA</h1>
        </div>
        <h2>Create Account</h2>
        <p className="welcome-text">Please fill in the details to sign up</p>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <div className="custom-input">
            <div className="input-icon"><MdPersonOutline size={20} /></div>
            <div className="input-body">
              <label>Name</label>
              <input type="text" placeholder="Enter your name" {...register("name")} />
            </div>
          </div>

          <div className="custom-input">
            <div className="input-icon"><MdOutlineEmail size={20} /></div>
            <div className="input-body">
              <label>Email</label>
              <input type="email" placeholder="Enter your email" {...register("email")} />
            </div>
          </div>

          <div className="custom-input">
            <div className="input-icon"><MdLockOutline size={20} /></div>
            <div className="input-body">
              <label>Password</label>
              <input type="password" placeholder="Enter your password" {...register("password")} />
            </div>
          </div>

          <div className="custom-input">
            <div className="input-icon"><MdLockOutline size={20} /></div>
            <div className="input-body">
              <label>Confirm Password</label>
              <input type="password" placeholder="Re-enter password" {...register("confirmPassword")} />
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="sign-in-btn">
            {isSubmitting ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="divider"><span>Or Continue with</span></div>
        <div className="social-buttons">
          <button className="social-btn google"><FcGoogle size={20} /></button>
          <button className="social-btn facebook"><FaFacebookF color="#1877f2" size={20} /></button>
          <button className="social-btn x"><FaXTwitter size={20} /></button>
                    <button className="social-btn apple"><FaApple size={20} /></button>
        </div>

        <p className="signup-text">Already have an account? <a href="#">Sign In</a></p>
      </div>
    </div>
  );
}
