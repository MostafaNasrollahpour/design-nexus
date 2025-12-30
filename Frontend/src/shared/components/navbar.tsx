import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoImage from "../assets/logo.jpg";
import DesignNexus from "../assets/design_img.png";
import "../styles/navbar.css";
import Demo from "../../features/auth/components/demo";
import { readFullName, isLoggedIn } from "../../features/auth/utils/authStorage";
import { logoutUser } from "../../features/auth/API/authAPI";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const mobileRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const [fullName, setFullName] = useState<string>(() => readFullName());

  // ✅ مودال خروج
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const modalBoxRef = useRef<HTMLDivElement | null>(null);

  const closeMenu = () => setMenuOpen(false);
  const toggleMenu = () => setMenuOpen((o) => !o);

  const syncAuth = () => setFullName(readFullName());

  const openLogoutModal = () => setLogoutModalOpen(true);

  const closeLogoutModal = () => {
    if (loggingOut) return;
    setLogoutModalOpen(false);
  };

  const confirmLogout = async () => {
    if (loggingOut) return;

    try {
      setLoggingOut(true);

      // ✅ اول logout سمت سرور
      await logoutUser();

      // ✅ پاکسازی سمت کلاینت
      localStorage.removeItem("token");
      localStorage.removeItem("fullName");
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
      localStorage.removeItem("userRole");

      window.dispatchEvent(new Event("authChanged"));
      closeMenu();
      setLogoutModalOpen(false);
      navigate("/", { replace: true });
    } catch (e) {
      console.error("Logout failed:", e);
    } finally {
      setLoggingOut(false);
    }
  };

  // بستن منوی موبایل با کلیک بیرون + Esc
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

  // ✅ بستن مودال با Esc + کلیک بیرون
  useEffect(() => {
    if (!logoutModalOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLogoutModal();
    };

    const onMouseDown = (e: MouseEvent) => {
      if (!modalBoxRef.current) return;
      if (!modalBoxRef.current.contains(e.target as Node)) closeLogoutModal();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onMouseDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [logoutModalOpen, loggingOut]);

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
          <div
            className="mobile-hidden"
            style={{ display: "flex", gap: 10, alignItems: "center" }}
          >
            <Link to="/panel" className="login_signup">
              {fullName || "کاربر"}
            </Link>

            <button type="button" className="nav-logout-btn" onClick={openLogoutModal}>
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
        <li className="nav-item">
          <Link to="/designers" className="login_signup mobile-hidden">
            طراح ها
          </Link>
        </li>
        {/* <li className="nav-item">
          <Link to="/favorites" className="login_signup mobile-hidden">
            پربازدیدها
          </Link>
        </li> */}
        <li className="nav-item">
          <Link to="/support" className="login_signup mobile-hidden">
            مشاوره و پشتیبانی
          </Link>
        </li>
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

                <button
                  type="button"
                  className="mobile-logout"
                  onClick={() => {
                    closeMenu();
                    openLogoutModal();
                  }}
                >
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

      {/* ✅ مودال خروج */}
      {logoutModalOpen && (
        <div className="logout-modal-overlay" role="dialog" aria-modal="true">
          <div className="logout-modal" ref={modalBoxRef}>
            <div className="logout-modal-header">
              <div className="logout-modal-title">خروج از حساب</div>
              <button
                type="button"
                className="logout-modal-close"
                onClick={closeLogoutModal}
                disabled={loggingOut}
                aria-label="بستن"
              >
                ✕
              </button>
            </div>

            <div className="logout-modal-text">مطمئنی می‌خوای خارج بشی؟</div>

            <div className="logout-modal-actions">
              <button
                type="button"
                className="logout-cancel-btn"
                onClick={closeLogoutModal}
                disabled={loggingOut}
              >
                انصراف
              </button>

              <button
                type="button"
                className="logout-confirm-btn"
                onClick={confirmLogout}
                disabled={loggingOut}
              >
                {loggingOut ? "در حال خروج..." : "خروج"}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
