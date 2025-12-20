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

/** ✅ Toast شیک (CSS جداست و از main.tsx import میشه) */
function prettyAlert(message: string, type: "success" | "error" = "success") {
  if (typeof document === "undefined") return;

  const wrapId = "pa-wrap";
  let wrap = document.getElementById(wrapId);
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.id = wrapId;
    wrap.className = "pa-wrap";
    document.body.appendChild(wrap);
  }

  const toast = document.createElement("div");
  toast.className = `pa-toast ${type === "error" ? "pa-error" : ""}`;

  const bar = document.createElement("div");
  bar.className = "pa-bar";

  const content = document.createElement("div");

  const title = document.createElement("div");
  title.className = "pa-title";
  title.textContent = type === "error" ? "خطا" : "موفقیت";

  const msg = document.createElement("div");
  msg.className = "pa-msg";
  msg.textContent = message;

  content.appendChild(title);
  content.appendChild(msg);

  const close = document.createElement("button");
  close.className = "pa-x";
  close.type = "button";
  close.textContent = "✕";

  const remove = () => {
    toast.classList.remove("pa-show");
    window.setTimeout(() => toast.remove(), 200);
  };
  close.onclick = remove;

  toast.appendChild(bar);
  toast.appendChild(content);
  toast.appendChild(close);

  wrap.appendChild(toast);

  window.setTimeout(() => toast.classList.add("pa-show"), 10);
  window.setTimeout(remove, 3000);
}

/** تلاش برای parse کردن JSON پاسخ */
async function readResponseBody(res: Response): Promise<{ text: string; data: any }> {
  const text = await res.text().catch(() => "");
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  return { text, data };
}

/** استخراج پیام خطا از ساختارهای رایج بک‌اندها */
function extractApiMessage(data: any, fallbackText: string): string {
  const direct =
    data?.Message ||
    data?.message ||
    data?.error?.message ||
    data?.error?.Message;

  if (typeof direct === "string" && direct.trim()) return direct.trim();

  const errors = data?.errors || data?.Errors;
  if (errors && typeof errors === "object") {
    if (Array.isArray(errors)) {
      const first = errors.find((x) => typeof x === "string" && x.trim());
      if (first) return first.trim();
    }

    const firstKey = Object.keys(errors)[0];
    const val = errors[firstKey];
    if (Array.isArray(val) && val.length && typeof val[0] === "string") {
      return val[0];
    }
    if (typeof val === "string" && val.trim()) {
      return val.trim();
    }
  }

  if (fallbackText && fallbackText.trim()) return fallbackText.slice(0, 200);
  return "خطا در درخواست";
}

/** ساختن Error استاندارد که پیامش همون چیز قابل چاپ روی صفحه باشه */
function makeApiError(message: string, status?: number, data?: any) {
  const err = new Error(message) as Error & { status?: number; data?: any };
  err.status = status;
  err.data = data;
  return err;
}

/**
 * ✅ refresh-token فقط با Cookie
 */
async function refreshAccessTokenFromCookie(): Promise<string> {
  const res = await fetch(`${BASE_URL}${AUTH_REFRESH_TOKEN_PATH}`, {
    method: "POST",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  const { text, data } = await readResponseBody(res);

  if (!res.ok) {
    clearClientAuth();
    const msg = extractApiMessage(data, text) || "نشست شما منقضی شده، دوباره وارد شوید";
    throw makeApiError(msg, res.status, data);
  }

  const newToken =
    data?.accessToken ||
    data?.AccessToken ||
    data?.token ||
    data?.Token ||
    "";

  if (!newToken) {
    clearClientAuth();
    throw makeApiError("توکن جدید از سرور دریافت نشد", res.status, data);
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

  const { text, data } = await readResponseBody(res);

  if (!res.ok) {
    const msg = extractApiMessage(data, text);
    throw makeApiError(msg, res.status, data);
  }

  // ✅ موفقیت: چاپ + Toast شیک (CSS جدا)
  if (data?.success === true && typeof data?.message === "string" && data.message.trim()) {
    const msg = data.message.trim();
    console.log(msg);
    prettyAlert(msg, "success");
  }

  return data as T;
}

export async function saveProfileSettings(
  payload: ProfileSettingsPayload
): Promise<ProfileSettingsResult> {
  const hasPasswordChange =
    !!payload.currentPassword?.trim() ||
    !!payload.newPassword?.trim() ||
    !!payload.confirmNewPassword?.trim();

  if (hasPasswordChange) {
    if (
      !payload.currentPassword?.trim() ||
      !payload.newPassword?.trim() ||
      !payload.confirmNewPassword?.trim()
    ) {
      throw new Error("برای تغییر رمز عبور، هر سه فیلد رمز را کامل پر کنید.");
    }
    if (payload.newPassword !== payload.confirmNewPassword) {
      throw new Error("رمز عبور جدید و تکرار آن یکسان نیست.");
    }
  }

  const body: any = {
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
    method: "PUT",
    body: JSON.stringify(body),
  });
}

//------------------------------------------------------
export type UploadDesignPayload = {
  title: string;
  description: string | null;
  categoryId: number;
  imageFile: File;
};

export async function uploadDesignerDesign(payload: UploadDesignPayload) {
  const token = localStorage.getItem("token") || "";

  const fd = new FormData();
  
  // ✅ نام فیلدها باید دقیقاً با DTO در C# مطابقت داشته باشند
  fd.append("Title", payload.title); // حرف بزرگ اول مهم است!
  fd.append("CategoryId", String(payload.categoryId)); // از "category" به "CategoryId" تغییر دادم
  fd.append("Description", payload.description || "");

  if (payload.imageFile) {
    fd.append("ImageFile", payload.imageFile); // از "image" به "ImageFile" تغییر دادم
  }

  const res = await fetch("http://localhost:5118/api/portfolios", {
    method: "POST",
    body: fd,
    credentials: "include",
    headers: token.trim() ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!res.ok) {
    let msg = "خطا در ارسال اطلاعات";
    try {
      const data = await res.json();
      msg = data?.Message || data?.message || msg;
    } catch {
      try {
        const t = await res.text();
        if (t && t.length < 200) msg = t;
      } catch {}
    }
    throw new Error(msg);
  }

  try {
    return await res.json();
  } catch {
    return null;
  }
}