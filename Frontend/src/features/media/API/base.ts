import { prettyAlert } from "../components/pretty_alert";

/* ===================== Base ===================== */

export const BASE_URL = import.meta.env.VITE_API_URL.replace(/\/+$/, "");

/* ===================== Helpers ===================== */

export function notifyAuthChanged() {
  window.dispatchEvent(new Event("authChanged"));
}

export function readAccessTokenLS(): string {
  return localStorage.getItem("token") || "";
}

export function writeAccessTokenLS(token: string) {
  if (token && token.trim()) {
    localStorage.setItem("token", token);
    notifyAuthChanged();
  }
}

export function clearClientAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("fullName");
  localStorage.removeItem("user");
  localStorage.removeItem("userId");
  localStorage.removeItem("userRole");
  notifyAuthChanged();
}

export async function readResponseBody(res: Response): Promise<{ text: string; data: any }> {
  const text = await res.text().catch(() => "");
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  return { text, data };
}

export function extractApiMessage(data: any, fallbackText: string): string {
  const direct = data?.Message || data?.message || data?.error?.message || data?.error?.Message;
  if (typeof direct === "string" && direct.trim()) return direct.trim();

  const errors = data?.errors || data?.Errors;
  if (errors && typeof errors === "object") {
    const firstKey = Object.keys(errors)[0];
    const val = errors[firstKey];
    if (Array.isArray(val) && val[0]) return val[0];
    if (typeof val === "string") return val;
  }

  return fallbackText || "خطا در درخواست";
}

export function makeApiError(message: string, status?: number, data?: any) {
  const err = new Error(message) as Error & { status?: number; data?: any };
  err.status = status;
  err.data = data;
  return err;
}

export function toastIfApiSuccess(data: any) {
  const success = data?.success === true || data?.Success === true;
  const msg = data?.message || data?.Message;
  if (success && typeof msg === "string" && msg.trim()) {
    prettyAlert(msg.trim(), "success");
  }
}
