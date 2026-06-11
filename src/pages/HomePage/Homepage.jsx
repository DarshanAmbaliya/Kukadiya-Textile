import React from "react";
import { NavLink } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import './Homepage.css'

const Homepage = () => {

  const fabrictype = [
    {
      id: 1,
      type: "Viscose Fabric",
      imgsrc: "/fabricType-cotton.jpg"
    },
    {
      id: 2,
      type: "Polyester Fabric",
      imgsrc: "https://demo2.wpopal.com/extice/wp-content/uploads/2025/08/project_6.jpg"
    },
    {
      id: 3,
      type: "Polyester-Viscose Fabric",
      imgsrc: "https://demo2.wpopal.com/extice/wp-content/uploads/2025/08/project_2.jpg"
    },
    {
      id: 4,
      type: "Cotton Fabric",
      imgsrc: "/fabricType-cotton.jpg"
    },
  ]

  const fabricName = [
    {
      id: 1,
      fabricname: "Sartin",
      imgsrc: [
        "https://i.etsystatic.com/30262280/r/il/996f17/5243754732/il_570xN.5243754732_c4er.jpg",
        "https://cpimg.tistatic.com/06864008/b/4/White-Dye-Satin-Fabrics.jpg",
        "https://5.imimg.com/data5/SELLER/Default/2024/8/440865811/NQ/SK/BU/37855716/digital-printed-modal-sartin-fabric-500x500.jpg",
      ]
    },
    {
      id: 2,
      fabricname: "Sartin",
      imgsrc: [
        "https://i.etsystatic.com/30262280/r/il/996f17/5243754732/il_570xN.5243754732_c4er.jpg",
        "https://cpimg.tistatic.com/06864008/b/4/White-Dye-Satin-Fabrics.jpg",
        "https://5.imimg.com/data5/SELLER/Default/2024/8/440865811/NQ/SK/BU/37855716/digital-printed-modal-sartin-fabric-500x500.jpg",
      ]
    },
    {
      id: 3,
      fabricname: "Sartin",
      imgsrc: [
        "https://i.etsystatic.com/30262280/r/il/996f17/5243754732/il_570xN.5243754732_c4er.jpg",
        "https://cpimg.tistatic.com/06864008/b/4/White-Dye-Satin-Fabrics.jpg",
        "https://5.imimg.com/data5/SELLER/Default/2024/8/440865811/NQ/SK/BU/37855716/digital-printed-modal-sartin-fabric-500x500.jpg",
      ]
    },
  ]

  return (
    <>
      {/* main-banner-section start */}
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
                      Precision in Every Weave.<br />
                      Weaving Excellence Into Every Thread.<br />
                      Delivering Quality, Consistency, and Trust Worldwide.
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
      {/* main-banner-section end */}

      {/* banner-box-section start */}
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
      {/* banner-box-section end */}

      {/* fabric-type-section start */}
      <section className="fabric-type-section">
        <div className="container">
          <div className="row">
            <div className="main-heading">
              <h3 className="watermark">Mahakali Textile</h3>
              <h2>Explore our wide range of woven fabric compositions designed for quality and performance.</h2>
              <p>We specialize in producing high-quality fabrics using cotton, polyester, viscose, and blended yarns.
                Each fabric is engineered to meet the needs of modern garment manufacturing with consistency and durability.</p>
            </div>
            <div className="main-box">
              {
                fabrictype && fabrictype.map((val) => {
                  const { id, type, imgsrc } = val;

                  return (
                    <div className="box" key={id}>
                      <div className="content">
                        <div className="image">
                          <img src={imgsrc} alt="image" />
                        </div>
                        <div className="detail">
                          <p>0{id}.</p>
                          <h3>{type}</h3>
                        </div>
                      </div>
                    </div>
                  )
                })
              }
            </div>
          </div>
        </div>
      </section>
      {/* fabric-type-section end */}

      {/* fabric-section start */}
      <section className="our-fabric-section">
        <div className="container">
          <div className="row">
            <div className="main-heading">
              <h2>Our Fabrics</h2>
            </div>
            <div className="main-box">
              {fabricName && fabricName.map((val) => {
                const { id, fabricname, imgsrc } = val;

                return (
                  <div className="box" key={id}>
                    <div className="content">
                      <div className="image">
                        <Swiper
                          modules={[Navigation]}
                          slidesPerView={1}
                          navigation
                          loop={true}
                        >
                          {imgsrc.map((img, index) => (
                            <SwiperSlide key={index}>
                              <img
                                src={img}
                                alt={`${fabricname}-${index}`}
                                key={`${fabricname}-${index}`}
                              />
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      </div>
                      <div className="detail">
                        <h3>{fabricname}</h3>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>
      {/* fabric-section end */}
    </>
  );
};

export default Homepage;