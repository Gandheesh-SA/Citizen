import React from "react";
import "../styles/landing.css";

import Navbars from "../components/navbar";
import LandScreen from "../components/home";
import Abouts from "../components/about";


export default function LandingPage() {


  return (
    <>
    <div className="landing-container">
    
        <Navbars/>
        <LandScreen />
   
      </div>
        <Abouts />

    </>
  );
}
