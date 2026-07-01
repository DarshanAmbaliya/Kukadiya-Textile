import React from "react";
import "swiper/css";
import "swiper/css/navigation";
import './Homepage.css'

const Homepage = () => {

  return (
    <>
      <h2 style={{ fontSize: "34px", textAlign: "center" }}>Kukadiya Textile</h2>
      <div className="home-banner">
        <div className="image" style={{ display: "flex", justifyContent: "center", background: "white" }}>
          <img src="./remove-bg.png" alt="logo" />
        </div>
      </div>
    </>
  );
};

export default Homepage;