import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../../shared/components/navbar";
import Footer from "../../../shared/components/footer";
import LoginRequiredModal from "../../chat/login_modal";
import "../styles/designer_cards_page.css";

type DesignerCardItem = {
  id: string;
  fullName: string;
  title: string;
  imageUrl: string;
  city?: string;
  category?: string;
  description?: string;
};

function safeParseUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function isLoggedIn() {
  const user = safeParseUser();
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("jwt");

  return Boolean(user || token);
}

export default function DesignerCardsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [items, setItems] = useState<DesignerCardItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [pendingChatDesignerId, setPendingChatDesignerId] = useState<string | null>(null);

  useEffect(() => {
    const mock: DesignerCardItem[] = [
      {
        id: "d-101",
        fullName: "نگار محمدی",
        title: "طراح UI/UX",
        imageUrl: "https://picsum.photos/seed/designer1/800/500",
        city: "تهران",
        category: "طراحی اپلیکیشن",
        description: "طراحی مینیمال و مدرن برای داشبورد و اپ موبایل",
      },
      {
        id: "d-102",
        fullName: "آرین رضایی",
        title: "گرافیست",
        imageUrl: "https://picsum.photos/seed/designer2/800/500",
        city: "اصفهان",
        category: "برندینگ",
        description: "لوگو، هویت بصری و پکیج کامل برند",
      },
    ];

    const t = window.setTimeout(() => {
      setItems(mock);
      setLoading(false);
    }, 200);

    return () => window.clearTimeout(t);
  }, []);

  // ✅ همون چیزی که گفتی: /chat/:designerId
  const goToChat = (designerId: string) => {
    if (!isLoggedIn()) {
      setPendingChatDesignerId(designerId);
      setLoginModalOpen(true);
      return;
    }
    navigate(`/chat/${designerId}`);
  };

  const goToDesignerPage = (designerId: string) => {
    navigate(`/designer/${designerId}`);
  };

  const confirmLogin = () => {
    const target = pendingChatDesignerId ? `/chat/${pendingChatDesignerId}` : location.pathname;
    setLoginModalOpen(false);
    setPendingChatDesignerId(null);

    // اگر صفحه لاگین state.from را می‌خواند، بعد از لاگین برمی‌گردد
    navigate("/login", { state: { from: target }, replace: false });
  };

  const closeModal = () => {
    setLoginModalOpen(false);
    setPendingChatDesignerId(null);
  };

  return (
    <div className="panel-container">
      <Navbar />

      <div className="designer-panel-layout">
        <main className="designer-panel-content">
          <div className="designer-panel-card">
            <div className="designer-header">
              <h2 className="designer-title">دیزاینرها</h2>
              <div className="designer-subtitle">تعداد کارت‌ها بر اساس دیتای بک‌اند/Mock تغییر می‌کند.</div>
            </div>

            {loading ? (
              <div className="designer-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div className="designer-card designer-card--skeleton" key={i}>
                    <div className="designer-image skeleton-box" />
                    <div className="designer-body">
                      <div className="skeleton-line w-60" />
                      <div className="skeleton-line w-80" />
                      <div className="skeleton-line w-70" />
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <p className="designer-muted">فعلاً موردی برای نمایش وجود ندارد.</p>
            ) : (
              <div className="designer-grid">
                {items.map((it) => (
                  <article className="designer-card" key={it.id}>
                    <div className="designer-imageWrap">
                      <img className="designer-image" src={it.imageUrl} alt={it.fullName} />
                      <div className="designer-badge">{it.category || "دیزاینر"}</div>
                    </div>

                    <div className="designer-body">
                      <div className="designer-nameRow">
                        <div className="designer-name">{it.fullName}</div>
                        <div className="designer-role">{it.title}</div>
                      </div>

                      <div className="designer-meta">
                        {it.city && <span className="designer-chip">{it.city}</span>}
                        {it.category && <span className="designer-chip">{it.category}</span>}
                      </div>

                      {it.description && <p className="designer-desc">{it.description}</p>}
                    </div>

                    <div className="designer-actions">
                      <button
                        type="button"
                        className="designer-iconBtn"
                        title="پیام"
                        onClick={() => goToChat(it.id)}
                      >
                        💬
                      </button>

                      <button type="button" className="designer-viewBtn" onClick={() => goToDesignerPage(it.id)}>
                        دیدن صفحه
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />

      <LoginRequiredModal
        open={loginModalOpen}
        onConfirm={confirmLogin}
        onClose={closeModal}
      />
    </div>
  );
}
