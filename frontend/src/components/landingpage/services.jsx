import React from "react";
import "../styles/landing.css";

export default function Service() {
  return (
    <>
<section className="service" id="service">
  <span className="section-tag">SERVICES</span>
  <h3 className="section-title">What We Offer</h3>

  <div className="services-row">
    <div className="service-card">
      <img src="/icons/environment.png" alt="Environment" className="service-icon" />
      <h4>Environment</h4>
      <p>Protecting and improving green spaces.</p>
    </div>
    <div className="service-card">
      <img src="/icons/garbage.png" alt="Garbage" className="service-icon" />
      <h4>Garbage</h4>
      <p>Efficient waste collection & recycling.</p>
    </div>
  </div>

  <div className="services-row">
    <div className="service-card">
      <img src="/icons/roads.png" alt="Roads" className="service-icon" />
      <h4>Roads</h4>
      <p>Better road maintenance and construction.</p>
    </div>
    <div className="service-card">
      <img src="/icons/potholes.png" alt="Potholes" className="service-icon" />
      <h4>Potholes</h4>
      <p>Quick response for road damages.</p>
    </div>
    <div className="service-card">
      <img src="/icons/infrastructure.png" alt="Public Infrastructure" className="service-icon" />
      <h4>Public Infrastructure</h4>
      <p>Improving facilities for the community.</p>
    </div>
  </div>

  <div className="services-row">
    <div className="service-card">
      <img src="/icons/water.png" alt="Water" className="service-icon" />
      <h4>Water</h4>
      <p>Safe and reliable water supply.</p>
    </div>
    <div className="service-card">
      <img src="/icons/drainage.png" alt="Drainage" className="service-icon" />
      <h4>Drainage</h4>
      <p>Better urban drainage system.</p>
    </div>
  </div>
</section>

    </>
  );
}
