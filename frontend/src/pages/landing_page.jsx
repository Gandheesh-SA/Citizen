import React from "react";
import "../styles/landing.css";

import Navbars from "../components/navbar";
import LandScreen from "../components/home";
import Abouts from "../components/about";
import Service from "../components/services";


export default function LandingPage() {


  return (
    <>
    <div className="landing-container1">
    
        <Navbars/>
        <LandScreen />
   
      </div>
        


    </>
  );
}