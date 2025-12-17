import Navbar from "../components/navbar"; // اگر مسیرت فرق داره اصلاحش کن
import Footer from "../components/footer"; // اگر داری
import "../styles/user_panel_page.css";

export default function UserPanelPage() {
  const userRaw = localStorage.getItem("user");
  const fullName = localStorage.getItem("fullName") || "";
  const token = localStorage.getItem("token") || "";

  let user: any = null;
  try {
    user = userRaw ? JSON.parse(userRaw) : null;
  } catch {
    user = null;
  }

  return (
    <div className="panel-container">
      <Navbar />

      <div className="panel-card">
        <h2>پنل کاربری</h2>

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
          <b>{user?.Role || "—"}</b>
        </div>

        <div className="panel-row">
          <span>توکن:</span>
          <b>{token ? "✅ دارد" : "❌ ندارد"}</b>
        </div>
      </div>

      <Footer />
    </div>
  );
}
