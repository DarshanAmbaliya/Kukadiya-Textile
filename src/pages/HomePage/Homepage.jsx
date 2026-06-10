import React from "react";
import './Homepage.css'
import { NavLink } from "react-router-dom";

const Homepage = ({ currentUser }) => {
  if (!currentUser) {
    return (
      <>
        <section className="main-banner-section">
        <div className="container">
          <div className="row">
            <div className="main-box">
              <div className="box">
                <div className="content">
                  <div className="tagline">
                    <h3>Welcome to <span>Mahakali Textile</span></h3>
                  </div>
                  <div className="detail">
                    <h2>
                      Precision in Every Weave<br />
                      Weaving Excellence Into Every Thread<br />
                      Delivering Quality, Consistency, and Trust Worldwide
                    </h2>
                    <p>From high-quality yarn to exceptional finished fabrics, we combine cutting-edge technology with expert craftsmanship <br />to deliver consistent quality, reliability, and excellence in every weave.</p>
                  </div>
                  <div className="primary-btn">
                    <NavLink to='/'>Begin Your Fabric Journey</NavLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="banner-box-section">
        <div className="container">
          <div className="row">
            <div className="main-box">
              <div className="box">
                <div className="content">
                  <div className="image">
                    <img src="./icon-hero-info-item-metal.svg" alt="" />
                  </div>
                  <div className="detail">
                    <h3>Customized Textile Solutions</h3>
                    <p>We provide tailor-made fabric designs, textures, and finishes to perfectly match your brand's vision</p>
                  </div>
                </div>
              </div>
              <div className="box">
                <div className="content">
                  <div className="detail">
                    <h2>5+</h2>
                    <p>Years of Excellence in Textile Industry</p>
                  </div>
                </div>
              </div>
              <div className="box">
                <div className="content">
                  <div className="detail">
                    <h2>5L+</h2>
                    <p>Meters Produced Monthly textile innovations</p>
                  </div>
                </div>
              </div>
              <div className="box">
                <div className="content">
                  <div className="detail">
                    <div className="top">
                      <h3>Let's Weave Success Together - Contact Us Today</h3>
                      <div className="image">
                        <img src="./icon-headset.svg" alt="" />
                      </div>
                    </div>
                    <div className="bottom">
                      <ul>
                        <li>
                          <span>E-mail Us</span>
                          <a href="#">info@example.com</a>
                        </li>
                        <li>
                          <span>Need Help!</span>
                          <a href="#">+91 9913241064</a>
                          <a href="#">+91 9510721068</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </>
    );
  }

  return (
    <>
      <ul style={{
        listStyle: "none",
        padding: 0,
        display: "flex",
        gap: "10px",
        justifyContent: "center",
        flexWrap: "wrap"
      }}>

        {/* Common Links */}
        <li>
          <NavLink to="/attendance" style={navStyle("#4CAF50")}>
            Daily Attendance
          </NavLink>
        </li>

        <li>
          <NavLink to="/production" style={navStyle("#2196F3")}>
            Daily Production
          </NavLink>
        </li>

        {/* Admin Only Links */}
        {currentUser.role === "admin" && (
          <>
            <li>
              <NavLink to="/attendancerecord" style={navStyle("#ff9800")}>
                Attendance Record
              </NavLink>
            </li>

            <li>
              <NavLink to="/productionreport" style={navStyle("#9c27b0")}>
                Production Report
              </NavLink>
            </li>
          </>
        )}

        <li>
          <NavLink to="/adminreport" style={navStyle("#f44336")}>
            Admin Report
          </NavLink>
        </li>
      </ul>
      <section className="main-banner-section">
        <div className="container">
          <div className="row">
            <div className="main-box">
              <div className="box">
                <div className="content">
                  <div className="tagline">
                    <h3>Welcome to <span>Mahakali Textile</span></h3>
                  </div>
                  <div className="detail">
                    <h2>
                      Precision in Every Weave<br />
                      Weaving Excellence Into Every Thread<br />
                      Delivering Quality, Consistency, and Trust Worldwide
                    </h2>
                    <p>From high-quality yarn to exceptional finished fabrics, we combine cutting-edge technology with expert craftsmanship <br />to deliver consistent quality, reliability, and excellence in every weave.</p>
                  </div>
                  <div className="primary-btn">
                    <NavLink to='/'>Begin Your Fabric Journey</NavLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="banner-box-section">
        <div className="container">
          <div className="row">
            <div className="main-box">
              <div className="box">
                <div className="content">
                  <div className="image">
                    <img src="./icon-hero-info-item-metal.svg" alt="" />
                  </div>
                  <div className="detail">
                    <h3>Customized Textile Solutions</h3>
                    <p>We provide tailor-made fabric designs, textures, and finishes to perfectly match your brand's vision</p>
                  </div>
                </div>
              </div>
              <div className="box">
                <div className="content">
                  <div className="detail">
                    <h2>5+</h2>
                    <p>Years of Excellence in Textile Industry</p>
                  </div>
                </div>
              </div>
              <div className="box">
                <div className="content">
                  <div className="detail">
                    <h2>5L+</h2>
                    <p>Meters Produced Monthly textile innovations</p>
                  </div>
                </div>
              </div>
              <div className="box">
                <div className="content">
                  <div className="detail">
                    <div className="top">
                      <h3>Let's Weave Success Together - Contact Us Today</h3>
                      <div className="image">
                        <img src="./icon-headset.svg" alt="" />
                      </div>
                    </div>
                    <div className="bottom">
                      <ul>
                        <li>
                          <span>E-mail Us</span>
                          <a href="#">info@example.com</a>
                        </li>
                        <li>
                          <span>Need Help!</span>
                          <a href="#">+91 9913241064</a>
                          <a href="#">+91 9510721068</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

const navStyle = (bgColor) => ({
  display: "inline-block",
  padding: "10px 18px",
  backgroundColor: bgColor,
  color: "#fff",
  textDecoration: "none",
  borderRadius: "6px",
  fontSize: "16px",
  fontWeight: "bold",
  transition: "0.3s"
});

export default Homepage;