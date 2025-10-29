
import React from "react";
import "../styles/landing.css";
import hero from "../assets/hero.png";
import { useNavigate } from "react-router-dom";
import Button from "./button";


export default function LandScreen() {

const navigate = useNavigate();

  const stayOn = () => {

    const aboutSection = document.getElementById("about");
    aboutSection.scrollIntoView({ behavior: "smooth" });

  } 

  const signIn = () => {
    navigate("/signin");
  }

  return (
    <section className="main-section1" id="main-section">
      <div className="text-section1">
        <span className="tag1">SMART CITY SOLUTIONS</span>
        <h1>Your Voice Matters. Transform Your Neighborhood and Shape a Better Future.</h1>
        <p>
          Spot problems in your city, share them instantly, and rally community support. Empower authorities to fix what truly matters first.
        </p>
        <div className="buttons1">
          <Button type="primary" onClick={signIn}>Get Started</Button>
      <Button type="outline" onClick={stayOn}>Learn More ↗</Button>
        </div>

      </div>

      <div className="image-section1">
        <img src={hero} alt="city" className="main-image1" />
      </div>
    </section>
  );
}
