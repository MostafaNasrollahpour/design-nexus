import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../shared/components/navbar";
import Footer from "../../../shared/components/footer";

import { fetchUserOrders, type OrderResponse } from "../../ordering/API/orderAPI";
import "../styles/user_panel_page.css";

type PanelTab = "profile" | "orders" | "favorites" | "settings";

export default function UserPanelPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<PanelTab>("profile");
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const fullNameLS = localStorage.getItem("fullName") || "";
  const emailLS =
    JSON.parse(localStorage.getItem("user") || "{}")?.Email || "";

  // بارگذاری سفارش‌ها وقتی تب سفارش‌ها فعال شد
  useEffect(() => {
    if (activeTab === "orders") loadOrders();
  }, [activeTab]);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await fetchUserOrders();
      setOrders(data);
    } catch {
      // اگر خطا بود، فقط لیست خالی می‌مونه
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };


  const CATEGORIES: Record<number, string> = {
  1: "اتاق خواب",
  2: "پذیرایی",
  3: "آشپزخانه",
  4: "اتاق کار",
  5: "عروسی و نامزدی",
  6: "جشن تولد",
  7: "کافی‌ شاپ و رستوران",
};

  return (
    <div className="panel-container">
      <Navbar />

      <div className="panel-layout">
        <aside className="panel-sidebar">
          <div className="sidebar-header">
            <div className="sidebar-name">
              {fullNameLS || "کاربر"}
            </div>
            <div className="sidebar-email">{emailLS}</div>
          </div>

          <button
            className="sidebar-item"
            onClick={() => navigate("/", { replace: true })}
          >
            صفحه اصلی
          </button>

          <button
            className={`sidebar-item ${
              activeTab === "profile" ? "active" : ""
            }`}
            onClick={() => setActiveTab("profile")}
          >
            اطلاعات حساب
          </button>

          <button
            className={`sidebar-item ${
              activeTab === "orders" ? "active" : ""
            }`}
            onClick={() => setActiveTab("orders")}
          >
            سفارش‌ها
          </button>

          <button
            className={`sidebar-item ${
              activeTab === "favorites" ? "active" : ""
            }`}
            onClick={() => setActiveTab("favorites")}
          >
            علاقه‌مندی‌ها
          </button>

          <button
            className={`sidebar-item ${
              activeTab === "settings" ? "active" : ""
            }`}
            onClick={() => setActiveTab("settings")}
          >
            ویرایش اطلاعات
          </button>

          <button
            className="sidebar-item"
            onClick={() => navigate("/support", { replace: true })}
          >
            مشاوره و پشتیبانی
          </button>
        </aside>

        <main className="panel-content">
          {activeTab === "profile" && (
            <div className="panel-card">
              <h2>اطلاعات حساب</h2>
              <div className="panel-row">
                <span>نام:</span>
                <b>{fullNameLS || "—"}</b>
              </div>
              <div className="panel-row">
                <span>ایمیل:</span>
                <b>{emailLS || "—"}</b>
              </div>
            </div>
          )}



{activeTab === "orders" && (
  <div className="panel-card">
    <h2>سفارش‌ها</h2>
    <p className="panel-muted">
      در این بخش تمام سفارش‌های ثبت‌شده نمایش داده می‌شوند.
    </p>

    {loadingOrders ? (
      <div className="requests-list">
        {Array.from({ length: 4 }).map((_, i) => (
          <div className="request-card request-card--skeleton" key={i}>
            <div className="skeleton-line w-60" />
            <div className="skeleton-line w-80" />
            <div className="skeleton-line w-70" />
          </div>
        ))}
      </div>
    ) : orders.length === 0 ? (
      <div className="projects-empty">
        <div className="projects-emptyTitle">فعلاً سفارشی ندارید 🧩</div>
        <div className="projects-emptyText">
          وقتی مشتری‌ها سفارش جدید ثبت کنند اینجا نمایش داده می‌شود.
        </div>
      </div>
    ) : (
      <div className="requests-list">
        {orders.map((order, index) => (
          <div key={order.id ?? index} className="request-card">
            <div className="request-header">
              <div className="request-title">{order.title}</div>
              <span className="request-status">{order.status}</span>
            </div>

            <div className="request-body">
              <div><b>دسته‌بندی:</b> {CATEGORIES[order.categoryId] ?? "—"}</div>
              <div><b>بودجه:</b> {order.budget} تومان</div>
              <div><b>آدرس:</b> {order.address}</div>
              <div><b>مهلت:</b> {order.deadline.toString()}</div>

              {order.description && (
                <div className="request-desc">
                  <b>توضیحات:</b>
                  <p>{order.description}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}


          {activeTab === "favorites" && (
            <div className="panel-card">
              <h2>علاقه‌مندی‌ها</h2>
              <p className="panel-muted">
                فعلاً موردی در علاقه‌مندی‌ها ندارید.
              </p>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="panel-card">
              <h2>ویرایش اطلاعات</h2>
              {/* بخش ویرایش اطلاعات */}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
