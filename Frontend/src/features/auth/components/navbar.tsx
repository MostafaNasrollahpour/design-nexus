import { useState } from "react";
import { Link } from "react-router-dom";
import logoImage from "../assets/logo.jpg";
import DesignNexus from "../assets/design_img.png";
import "./navbar.css"

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-left">
        <img src={logoImage} className="logo" alt="Logo" />

        {/* تبدیل به Link */}
        <Link to="/login" className="login_signup mobile-hidden">
          ورود / ثبت نام
        </Link>
      </div>

      {/* منوی دسکتاپ */}
      <ul className="nav-links">
        <li>دسته بندی ها</li>
        <li>طراح ها</li>
        <li>پربازدیدها</li>
        <li>مشاوره و پشتیبانی</li>
      </ul>

      <div className="nav-right">
        <img src={DesignNexus} className="design_img" alt="Design Nexus" />
      </div>

      {/* دکمه منوی همبرگری (موبایل) */}
      <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </div>

      {/* منوی موبایل */}
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
  );
};

export default Navbar;
