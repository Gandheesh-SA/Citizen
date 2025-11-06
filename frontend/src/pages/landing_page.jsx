import React from "react";
import "../styles/landing.css";

import Navbars from "../components/landingpage/navbar";
import LandScreen from "../components/landingpage/home";
import Abouts from "../components/landingpage/about";
import Service from "../components/landingpage/services";


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