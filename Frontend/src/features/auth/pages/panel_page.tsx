import UserPanelPage from "./user_panel_page";
import DesignerPanelPage from "./designer_panel_page";

function normalizeRole(role: string) {
  const r = (role || "").trim().toLowerCase();

  // حالت‌های فارسی
  if (r.includes("طراح")) return "designer";
  if (r.includes("کاربر")) return "user";

  // حالت‌های انگلیسی رایج
  if (r === "designer") return "designer";
  if (r === "user") return "user";

  return "user"; // پیش‌فرض
}

export default function PanelPage() {
  const roleRaw =
    localStorage.getItem("userRole") ||
    (() => {
      try {
        const u = JSON.parse(localStorage.getItem("user") || "null");
        return u?.Role || u?.role || "";
      } catch {
        return "";
      }
    })();

  const role = normalizeRole(roleRaw);

  return role === "designer" ? <DesignerPanelPage /> : <UserPanelPage />;
}
