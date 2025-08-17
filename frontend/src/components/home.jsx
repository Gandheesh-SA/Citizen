
import React from "react";
import "../styles/landing.css";
import hero from "../assets/hero.png";
import { useNavigate } from "react-router-dom";


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
    <section className="main-section" id="main-section">
      <div className="text-section">
        <span className="tag">SMART CITY SOLUTIONS</span>
        <h1>Your Voice Matters. Transform Your Neighborhood and Shape a Better Future.</h1>
        <p>
          Spot problems in your city, share them instantly, and rally community support. Empower authorities to fix what truly matters first.
        </p>
        <div className="buttons">
          <button className="btn-primary" onClick={signIn}>Get Started</button>
          <button className="btn-outline" onClick={stayOn}>Learn More ↗</button>
        </div>

      </div>

      <div className="image-section">
        <img src={hero} alt="city" className="main-image" />
      </div>
    </section>
  );
}
