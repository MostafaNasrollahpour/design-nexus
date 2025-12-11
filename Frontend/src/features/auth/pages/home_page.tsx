import "../styles/home_page.css";
import logoImage from "../assets/logo.jpg";
import DesignNexus from "../assets/design_img.png";
import { useState } from "react";
import "../styles/fonts.css";
import Slider from "../components/slider";
import Footer from "../components/footer";
import bedroom from "../assets/bedroom.jpg";
import hall from "../assets/hall.jpg";
import kitchen from "../assets/kitchen.jpg";
import workroom from "../assets/workroom.jpg";
import wedding from "../assets/wedding.jpg";
import birthday from "../assets/birthday.jpg";
import caffee from "../assets/caffee.jpg";


import { Link } from "react-router-dom";

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="home-container">

      {/* --- Navbar --- */}
      <nav className="navbar">
        <div className="nav-left">
          <img src={logoImage} className="logo" />
          
          {/* تبدیل به Link */}
          <Link to="/login" className="login_signup mobile-hidden">
            ورود / ثبت نام
          </Link>
        </div>

        {/* Desktop menu */}
        <ul className="nav-links">
          <li>دسته بندی ها</li>
          <li>طراح ها</li>
          <li>پربازدیدها</li>
          <li>مشاوره و پشتیبانی</li>
        </ul>

        <div className="nav-right">
          <img src={DesignNexus} className="design_img" />
        </div>

        {/* Hamburger menu button (mobile) */}
        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="mobile-menu">
            {/* تبدیل به Link */}
            <Link to="/login">ورود / ثبت نام</Link>

            <a>دسته بندی ها</a>
            <a>طراح ها</a>
            <a>پربازدیدها</a>
            <a>مشاوره و پشتیبانی</a>
          </div>
        )}
      </nav>

      {/* --- Header Text --- */}
      <div className="header-title">
        از جرقه <span className="red">رویا</span> تا نوازش <span className="red">هنر</span> ...!
      </div>

      {/* --- Main Images Section --- */}
      <div className="image-section">
        <div className="image-large">
          <div className="slider-wrapper-custom">
            <Slider
              images={[bedroom, hall, kitchen, workroom,wedding,birthday,caffee]}
              interval={3000}
              showDots={true}
              autoPlay={true}
            />
          </div>
        </div>
      </div>

    <Footer/>
    </div>
  );
}
