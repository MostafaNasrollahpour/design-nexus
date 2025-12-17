import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoImage from "../assets/logo.jpg";
import DesignNexus from "../assets/design_img.png";
import "../styles/navbar.css";
import Demo from "./demo";
import {readFullName, isLoggedIn } from "../utils/authStorage";
import { logoutUser } from "../API/authAPI";


const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const mobileRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const [fullName, setFullName] = useState<string>(() => readFullName());

  const closeMenu = () => setMenuOpen(false);
  const toggleMenu = () => setMenuOpen((o) => !o);

  const syncAuth = () => setFullName(readFullName());

const logout = async () => {
  const ok = window.confirm("مطمئنی می‌خوای خارج بشی؟");
  if (!ok) return;

  // ✅ اول به سرور می‌گیم logout
  await logoutUser();

  // ✅ بعد پاکسازی سمت کلاینت
  localStorage.removeItem("token");
  localStorage.removeItem("fullName");
  localStorage.removeItem("user");
  localStorage.removeItem("userId");
  localStorage.removeItem("userRole");

  window.dispatchEvent(new Event("authChanged"));
  closeMenu();
  navigate("/", { replace: true });
};



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

  // ✅ سینک بعد از لاگین/لاگ‌اوت بدون رفرش
  useEffect(() => {
    window.addEventListener("authChanged", syncAuth);
    window.addEventListener("storage", syncAuth);
    return () => {
      window.removeEventListener("authChanged", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  const loggedIn = isLoggedIn();

  return (
    <nav className="navbar" dir="rtl">
      <div className="nav-left">
        <img src={logoImage} className="logo" alt="Logo" />

        {loggedIn ? (
          <div className="mobile-hidden" style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Link to="/panel" className="login_signup">
              {fullName || "کاربر"}
            </Link>
            <button type="button" className="nav-logout-btn" onClick={logout}>
              خروج
            </button>
          </div>
        ) : (
          <Link to="/login" className="login_signup mobile-hidden">
            ورود / ثبت نام
          </Link>
        )}
      </div>

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
            {loggedIn ? (
              <>
                <Link to="/panel" onClick={closeMenu}>
                  {fullName || "کاربر"}
                </Link>
                <button type="button" className="mobile-logout" onClick={logout}>
                  خروج
                </button>
              </>
            ) : (
              <Link to="/login" onClick={closeMenu}>
                ورود / ثبت نام
              </Link>
            )}

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
