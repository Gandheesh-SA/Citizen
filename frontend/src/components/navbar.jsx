import React from "react";
import "../styles/landing.css";

import { useNavigate } from "react-router-dom";
import Button from "./button";


export default function Navbars() {
  const navigate = useNavigate();

   const signIn = () => {
    navigate("/signin");
  }

  return (
    <nav className="navbar">
      <div className="logo">CITIZEN</div>
      <ul className="nav-links">
        <li>
          Home
        </li>
        <li>
          About
        </li>
        <li>
        Services
        </li>
        <li>
          How We Work
        </li>
        <li>
          Contact
        </li>
      </ul>
     <Button type="primary" className="nav-btn" onClick={signIn}>Get Started</Button>
    </nav>
  );
}
