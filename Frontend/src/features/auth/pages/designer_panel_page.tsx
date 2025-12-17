import { useMemo, useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import "../styles/user_panel_page.css";
import { useNavigate } from "react-router-dom";


type DesignerTab = "profile" | "projects" | "requests" | "wallet" | "settings";

export default function DesignerPanelPage() {
  const userRaw = localStorage.getItem("user");
  const fullName = localStorage.getItem("fullName") || "";
  const navigate = useNavigate();


  const user = useMemo(() => {
    try {
      return userRaw ? JSON.parse(userRaw) : null;
    } catch {
      return null;
    }
  }, [userRaw]);

  const [activeTab, setActiveTab] = useState<DesignerTab>("profile");

  return (
    <div className="panel-container">
      <Navbar />

      <div className="panel-layout">
        {/* سایدبار راست */}
        <aside className="panel-sidebar">
          <div className="sidebar-header">
            <div className="sidebar-name">{fullName || "طراح"}</div>
            <div className="sidebar-email">{user?.Email || ""}</div>
          </div>

         <button
  className="sidebar-item"
  onClick={() => navigate("/", { replace: true })}
  type="button"
>
  صفحه اصلی
</button>


          <button
            className={`sidebar-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
            type="button"
          >
            اطلاعات طراح
          </button>

          <button
            className={`sidebar-item ${activeTab === "projects" ? "active" : ""}`}
            onClick={() => setActiveTab("projects")}
            type="button"
          >
            پروژه‌ها
          </button>

          <button
            className={`sidebar-item ${activeTab === "requests" ? "active" : ""}`}
            onClick={() => setActiveTab("requests")}
            type="button"
          >
            درخواست‌ها
          </button>

          <button
            className={`sidebar-item ${activeTab === "wallet" ? "active" : ""}`}
            onClick={() => setActiveTab("wallet")}
            type="button"
          >
            کیف پول / درآمد
          </button>

          <button
            className={`sidebar-item ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
            type="button"
          >
            تنظیمات
          </button>
        </aside>

        {/* محتوا */}

        
        <main className="panel-content">
          {activeTab === "profile" && (
            <div className="panel-card">
              <h2>اطلاعات طراح</h2>

              <div className="panel-row">
                <span>نام:</span>
                <b>{fullName || "—"}</b>
              </div>

              <div className="panel-row">
                <span>ایمیل:</span>
                <b>{user?.Email || "—"}</b>
              </div>

              <div className="panel-row">
                <span>نقش:</span>
                <b>{user?.Role || localStorage.getItem("userRole") || "طراح"}</b>
              </div>
            </div>
          )}

          {activeTab === "projects" && (
            <div className="panel-card">
              <h2>پروژه‌ها</h2>
              <p className="panel-muted">اینجا لیست پروژه‌های شما نمایش داده می‌شود.</p>
            </div>
          )}

          {activeTab === "requests" && (
            <div className="panel-card">
              <h2>درخواست‌ها</h2>
              <p className="panel-muted">اینجا درخواست‌های جدید مشتری‌ها می‌آید.</p>
            </div>
          )}

          {activeTab === "wallet" && (
            <div className="panel-card">
              <h2>کیف پول / درآمد</h2>
              <p className="panel-muted">گزارش درآمد و تسویه‌ها اینجا قرار می‌گیرد.</p>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="panel-card">
              <h2>تنظیمات</h2>
              <p className="panel-muted">تنظیمات پنل طراح.</p>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
