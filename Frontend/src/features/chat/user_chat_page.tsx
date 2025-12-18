import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../../shared/components/navbar";
import Footer from "../../shared/components/footer";
import ChatBox from "./chatbox";
import LoginRequiredModal from "./login_modal";
import "./user_chat_page.css";

function safeParseUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function getAuthIdentity(): string | null {
  const u = safeParseUser();
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("jwt");

  const id =
    u?.Id ?? u?.ID ?? u?.UserId ?? u?.userId ?? u?.Email ?? u?.email ?? u?.Username ?? u?.username;

  if (id) return String(id);
  if (token) return `token_${token.slice(0, 16)}`;
  return null;
}

export default function UserChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { designerId } = useParams<{ designerId?: string }>();

  const authIdentity = useMemo(() => getAuthIdentity(), []);
  const [loginModalOpen, setLoginModalOpen] = useState(!authIdentity);

  if (!authIdentity) {
    const confirmLogin = () => {
      navigate("/login", { state: { from: location.pathname }, replace: false });
    };

    const closeModal = () => {
      setLoginModalOpen(false);
      if (window.history.length > 1) navigate(-1);
      else navigate("/", { replace: true });
    };

    return (
      <div className="panel-container">
        <Navbar />

        <div className="chatpage-layout">
          <main className="chatpage-content">
            <div className="chatpage-card">
              <div className="chatpage-title">چت</div>
              <p className="chatpage-warn">برای ورود به چت باید لاگین کنید.</p>
            </div>
          </main>
        </div>

        <Footer />

        <LoginRequiredModal open={loginModalOpen} onConfirm={confirmLogin} onClose={closeModal} />
      </div>
    );
  }

  const conversationId = designerId ? `u:${authIdentity}|d:${designerId}` : `u:${authIdentity}`;
  const headerTitle = designerId ? `گفتگو درباره دیزاینر #${designerId}` : "پشتیبانی آنلاین";

  return (
    <div className="panel-container">
      <Navbar />

      <div className="chatpage-layout">
        <main className="chatpage-content">
          <div className="chatpage-card">
            <div className="chatpage-topbar">
              <button type="button" className="chatpage-back" onClick={() => navigate(-1)}>
                ← برگشت
              </button>
              <div className="chatpage-title">{headerTitle}</div>
            </div>

            <ChatBox userId={conversationId} headerTitle={headerTitle} />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
