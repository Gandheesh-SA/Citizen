import React from "react";
import "../styles/landing.css";

import { useNavigate } from "react-router-dom";


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
      <button className="btn-primary"  onClick={signIn}>Get Started</button>
    </nav>
  );
}
