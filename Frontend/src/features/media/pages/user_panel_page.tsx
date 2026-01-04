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
  const emailLS = JSON.parse(localStorage.getItem("user") || "{}")?.Email || "";

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

  return (
    <div className="panel-container">
      <Navbar />

      <div className="panel-layout">
        <aside className="panel-sidebar">
          <div className="sidebar-header">
            <div className="sidebar-name">{fullNameLS || "کاربر"}</div>
            <div className="sidebar-email">{emailLS}</div>
          </div>

          <button className="sidebar-item" onClick={() => navigate("/", { replace: true })}>صفحه اصلی</button>
          <button className={`sidebar-item ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")}>اطلاعات حساب</button>
          <button className={`sidebar-item ${activeTab === "orders" ? "active" : ""}`} onClick={() => setActiveTab("orders")}>سفارش‌ها</button>
          <button className={`sidebar-item ${activeTab === "favorites" ? "active" : ""}`} onClick={() => setActiveTab("favorites")}>علاقه‌مندی‌ها</button>
          <button className={`sidebar-item ${activeTab === "settings" ? "active" : ""}`} onClick={() => setActiveTab("settings")}>ویرایش اطلاعات</button>
          <button className="sidebar-item" onClick={() => navigate("/support", { replace: true })}>مشاوره و پشتیبانی</button>
        </aside>

        <main className="panel-content">
          {activeTab === "profile" && (
            <div className="panel-card">
              <h2>اطلاعات حساب</h2>
              <div className="panel-row"><span>نام:</span><b>{fullNameLS || "—"}</b></div>
              <div className="panel-row"><span>ایمیل:</span><b>{emailLS || "—"}</b></div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="panel-card">
              <h2>سفارش‌ها</h2>
              {loadingOrders ? (
                <p>در حال بارگذاری...</p>
              ) : orders.length === 0 ? (
                <p className="projects-emptyText">فعلاً سفارشی برای نمایش ندارید.</p>
              ) : (
                <div className="projects-grid-wrapper">
                  <div className="projects-grid">
                    {orders.map((order) => (
                      <div key={order.id} className="project-card">
                        <div className="project-body">
                          <div className="project-title">{order.title}</div>
                          <div className="project-desc">
                            دسته: {order.categoryId} <br />
                            بودجه: {order.budget} <br />
                            آدرس: {order.address} <br />
                            مهلت: {order.deadline.toString()} <br />
                            توضیحات: {order.description}
                          </div>
                        </div>
                        <div className="project-footer">
                          <span className="project-badge project-badge--light">
                            {order.status} {order.designerName ? `- طراح: ${order.designerName}` : ""}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "favorites" && (
            <div className="panel-card">
              <h2>علاقه‌مندی‌ها</h2>
              <p className="panel-muted">فعلاً موردی در علاقه‌مندی‌ها ندارید.</p>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="panel-card">
              <h2>ویرایش اطلاعات</h2>
              {/* بخش ویرایش اطلاعات مثل قبل اضافه می‌شود */}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
