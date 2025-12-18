import { Navigate } from "react-router-dom";
import UserPanelPage from "./user_panel_page";
import DesignerPanelPage from "./designer_panel_page";

function normalizeRole(role: string) {
  const r = (role || "").trim().toLowerCase();

  if (r.includes("طراح") || r.includes("designer")) return "designer";
  if (r.includes("کاربر") || r.includes("user")) return "user";

  return "user";
}

function readRoleFromStorage(): string {
  const roleLS = localStorage.getItem("userRole") || "";
  if (roleLS) return roleLS;

  try {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    return u?.Role || u?.role || "";
  } catch {
    return "";
  }
}

export default function PanelPage() {
  const token = (localStorage.getItem("token") || "").trim();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const role = normalizeRole(readRoleFromStorage());
  return role === "designer" ? <DesignerPanelPage /> : <UserPanelPage />;
}
