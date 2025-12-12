import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import logoImage from "../assets/logo.jpg";
import DesignNexus from "../assets/design_img.png";
import "../styles/navbar.css";

import Demo from "./demo";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const mobileRef = useRef<HTMLDivElement | null>(null);

  const closeMenu = () => setMenuOpen(false);
  const toggleMenu = () => setMenuOpen((o) => !o);

  // بستن با کلیک بیرون + Esc
  useEffect(() => {
    if (!menuOpen) return;

    const onMouseDown = (e: MouseEvent) => {
      if (!mobileRef.current) return;
      if (!mobileRef.current.contains(e.target as Node)) closeMenu();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <nav className="navbar" dir="rtl">
      <div className="nav-left">
        <img src={logoImage} className="logo" alt="Logo" />

        <Link to="/login" className="login_signup mobile-hidden">
          ورود / ثبت نام
        </Link>
      </div>

      {/* منوی دسکتاپ */}
      <ul className="nav-links mobile-hidden">
        <li className="nav-item">
          <Demo />
        </li>
        <li className="nav-item">طراح ها</li>
        <li className="nav-item">پربازدیدها</li>
        <li className="nav-item">مشاوره و پشتیبانی</li>
      </ul>

      <div className="nav-right mobile-hidden">
        <img src={DesignNexus} className="design_img" alt="Design Nexus" />
      </div>

      {/* همبرگری + منوی موبایل (زیر خودش باز میشه) */}
      <div className="nav-mobile" ref={mobileRef}>
        <button
          type="button"
          className="hamburger"
          onClick={toggleMenu}
          aria-label="باز کردن منو"
          aria-expanded={menuOpen}
        >
          ☰
        </button>

        {menuOpen && (
          <div className="mobile-menu">
            <Link to="/login" onClick={closeMenu}>
              ورود / ثبت نام
            </Link>

            <Link to="/categories" onClick={closeMenu}>
              دسته بندی ها
            </Link>

            <Link to="/designers" onClick={closeMenu}>
              طراح ها
            </Link>

            <Link to="/popular" onClick={closeMenu}>
              پربازدیدها
            </Link>

            <Link to="/support" onClick={closeMenu}>
              مشاوره و پشتیبانی
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
