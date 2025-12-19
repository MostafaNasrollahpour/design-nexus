
//------------------------------------------------------------
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5157/iam";


// 🔧 مطابق بک‌اندت تنظیم کن
const USER_UPDATE_PROFILE_PATH = "/api/Auth/update-profile";
const AUTH_REFRESH_TOKEN_PATH = "/api/Auth/refresh";

export type ProfileSettingsPayload = {
  fullName: string;
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
};

export type ProfileSettingsResult = {
  success?: boolean;
  message?: string;
  user?: any;
  [key: string]: any;
};

/* ---------------- Helpers ---------------- */
function notifyAuthChanged() {
  window.dispatchEvent(new Event("authChanged"));
}

function readAccessTokenLS(): string {
  return localStorage.getItem("token") || "";
}

function writeAccessTokenLS(token: string) {
  if (token && token.trim()) {
    localStorage.setItem("token", token);
    notifyAuthChanged();
  }
}

function clearClientAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("fullName");
  localStorage.removeItem("user");
  localStorage.removeItem("userId");
  localStorage.removeItem("userRole");
  notifyAuthChanged();
}

/**
 * ✅ refresh-token فقط با Cookie
 * بک‌اند refreshToken رو از cookie می‌خونه
 */
async function refreshAccessTokenFromCookie(): Promise<string> {
  const res = await fetch(`${BASE_URL}${AUTH_REFRESH_TOKEN_PATH}`, {
    method: "POST",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  const text = await res.text().catch(() => "");
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    clearClientAuth();
    const msg = data?.Message || data?.message || "نشست شما منقضی شده، دوباره وارد شوید";
    throw new Error(msg);
  }

  const newToken = data?.accessToken || data?.AccessToken || data?.token || data?.Token || "";
  if (!newToken) {
    clearClientAuth();
    throw new Error("توکن جدید از سرور دریافت نشد");
  }

  writeAccessTokenLS(newToken);
  return newToken;
}

async function apiJsonWithBearer<T>(path: string, init: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const doFetch = (token: string) => {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers as any),
    };

    return fetch(url, { ...init, headers, credentials: "include" });
  };

  let token = readAccessTokenLS();
  let res = await doFetch(token);

  if (res.status === 401) {
    token = await refreshAccessTokenFromCookie();
    res = await doFetch(token);
  }

  const text = await res.text().catch(() => "");
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    const msg =
      data?.Message ||
      data?.message ||
      (text && text.slice(0, 200)) ||
      "خطا در درخواست";
    throw new Error(msg);
  }

  return data as T;
}

/**
 * ✅ ذخیره تنظیمات پروفایل (یکجا)
 * JSON شامل FullName, Email و اگر پسورد وارد شده باشد، فیلدهای پسورد هم ارسال می‌شود
 */
export async function saveProfileSettings(
  payload: ProfileSettingsPayload
): Promise<ProfileSettingsResult> {
  const hasPasswordChange =
    !!payload.currentPassword?.trim() ||
    !!payload.newPassword?.trim() ||
    !!payload.confirmNewPassword?.trim();

  // اگر قصد تغییر پسورد داری، همه باید پر باشند
  if (hasPasswordChange) {
    if (!payload.currentPassword?.trim() || !payload.newPassword?.trim() || !payload.confirmNewPassword?.trim()) {
      throw new Error("برای تغییر رمز عبور، هر سه فیلد رمز را کامل پر کنید.");
    }
    if (payload.newPassword !== payload.confirmNewPassword) {
      throw new Error("رمز عبور جدید و تکرار آن یکسان نیست.");
    }
  }

  const body: any = {
    // سازگاری با بک‌اندهای مختلف
    FullName: payload.fullName,
   
    fullName: payload.fullName,
    
  };

  if (hasPasswordChange) {
    body.CurrentPassword = payload.currentPassword;
    body.NewPassword = payload.newPassword;
    body.ConfirmNewPassword = payload.confirmNewPassword;

    body.currentPassword = payload.currentPassword;
    body.newPassword = payload.newPassword;
    body.confirmNewPassword = payload.confirmNewPassword;
  }

  return apiJsonWithBearer<ProfileSettingsResult>(USER_UPDATE_PROFILE_PATH, {
    method: "PUT", // اگر بک‌اند PATCH می‌خواد -> "PATCH"
    body: JSON.stringify(body),
  });
}

