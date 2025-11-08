import React from "react";
import "../../styles/landing.css";

import { useNavigate } from "react-router-dom";
import Button from "../global/button";


export default function Navbars() {
  const navigate = useNavigate();

   const signIn = () => {
    navigate("/signin");
  }

  return (
    <nav className="navbar1">
      <div className="logo1">CITIZEN</div>
      
    </nav>
  );
}
