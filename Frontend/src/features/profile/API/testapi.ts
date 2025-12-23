/* ============================
   API Client (Auth + Portfolio)
   - همان منطق قبلی حفظ شده
   - preRefresh اضافه شده
   - ✅ برای آپدیت اطلاعات تکمیلی (bio/location/...) هم prettyAlert مثل بقیه صدا زده میشه
   ============================ */

const BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:5157/iam").replace(/\/+$/, "");

// اگر سرویس پورتفولیو جداست می‌تونی تو .env ست کنی: VITE_PORTFOLIO_URL=http://localhost:5118
const PORTFOLIO_BASE_URL = (import.meta.env.VITE_PORTFOLIO_URL ?? "http://localhost:5118").replace(/\/+$/, "");
const DESIGNER_EXTRA_PROFILE_PATH = "http://localhost:5118/api/portfolios/profile";

// 🔧 مطابق بک‌اندت تنظیم کن
const USER_UPDATE_PROFILE_PATH = "/api/Auth/update-profile";
const AUTH_REFRESH_TOKEN_PATH = "/api/Auth/refresh";

// 🔧 مطابق بک‌اند پورتفولیو
const PORTFOLIOS_PATH = "/api/portfolios";

/* ---------------- Types ---------------- */
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

//------------------------------------------------------
export type UploadDesignPayload = {
  title: string;
  description: string | null;
  categoryId: number;
  imageFile: File;
};

export type UploadDesignResult = {
  success?: boolean;
  message?: string;
  [key: string]: any;
};

export type DesignerExtraProfilePayload = {
  bio: string;
  location: string;
  specialty: string;
  avatarFile?: File | null;
};

export type DesignerExtraProfileResult = {
  success?: boolean;
  message?: string; // ✅ اضافه شد (بیشتر بک‌اندها message میدن)
  error?: string;
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
  const direct = data?.Message || data?.message || data?.error?.message || data?.error?.Message;
  if (typeof direct === "string" && direct.trim()) return direct.trim();

  const errors = data?.errors || data?.Errors;
  if (errors && typeof errors === "object") {
    if (Array.isArray(errors)) {
      const first = errors.find((x) => typeof x === "string" && x.trim());
      if (first) return first.trim();
    }

    const firstKey = Object.keys(errors)[0];
    const val = (errors as any)[firstKey];
    if (Array.isArray(val) && val.length && typeof val[0] === "string") return val[0];
    if (typeof val === "string" && val.trim()) return val.trim();
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

/** ✅ Toast موفقیت اگر بک‌اند success/message داشته باشد */
function toastIfApiSuccess(data: any) {
  const success = data?.success === true || data?.Success === true;
  const msg = data?.message || data?.Message;
  if (success && typeof msg === "string" && msg.trim()) {
    prettyAlert(msg.trim(), "success");
  }
}

/* ---------------- Auth: Refresh ---------------- */
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

  const newToken = data?.accessToken || data?.AccessToken || data?.token || data?.Token || "";
  if (!newToken) {
    clearClientAuth();
    throw makeApiError("توکن جدید از سرور دریافت نشد", res.status, data);
  }

  writeAccessTokenLS(newToken);
  return newToken;
}

/* ---------------- Core JSON API ---------------- */
/**
 * apiJsonWithBearer
 * - منطق قبلی حفظ شده: اگر 401 شد => refresh + retry
 * - قابلیت جدید: opts.preRefresh => قبل از درخواست اصلی refresh می‌زند
 */
async function apiJsonWithBearer<T>(
  path: string,
  init: RequestInit,
  opts?: { preRefresh?: boolean }
): Promise<T> {
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

  // ✅ افزوده شده: اگر لازم بود قبل از درخواست refresh بزن
  let token = readAccessTokenLS();
  if (opts?.preRefresh) {
    token = await refreshAccessTokenFromCookie();
  }

  let res = await doFetch(token);

  // ✅ منطق قبلی: فقط اگر 401 شد refresh می‌کنیم
  if (res.status === 401) {
    token = await refreshAccessTokenFromCookie();
    res = await doFetch(token);
  }

  const { text, data } = await readResponseBody(res);

  if (!res.ok) {
    const msg = extractApiMessage(data, text);
    throw makeApiError(msg, res.status, data);
  }

  // ✅ موفقیت: Toast شیک (اگر success/message داشت)
  toastIfApiSuccess(data);

  return data as T;
}

/* ---------------- API: Profile Settings ---------------- */
export async function saveProfileSettings(payload: ProfileSettingsPayload): Promise<ProfileSettingsResult> {
  const hasPasswordChange =
    !!payload.currentPassword?.trim() || !!payload.newPassword?.trim() || !!payload.confirmNewPassword?.trim();

  if (hasPasswordChange) {
    if (!payload.currentPassword?.trim() || !payload.newPassword?.trim() || !payload.confirmNewPassword?.trim()) {
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

  // ✅ قبل از ارسال آپدیت پروفایل، یک refresh انجام شود
  return apiJsonWithBearer<ProfileSettingsResult>(
    USER_UPDATE_PROFILE_PATH,
    {
      method: "PUT",
      body: JSON.stringify(body),
    },
    { preRefresh: true }
  );
}

/* ---------------- API: Upload Design (Portfolio) ---------------- */
export async function uploadDesignerDesign(payload: UploadDesignPayload): Promise<UploadDesignResult | null> {
  const url = `${PORTFOLIO_BASE_URL}${PORTFOLIOS_PATH}`;

  // ✅ برای retry امن‌تر: هر بار FormData از نو ساخته میشه
  const buildFormData = () => {
    const fd = new FormData();

    // ✅ نام فیلدها باید دقیقاً با DTO در C# مطابقت داشته باشند
    fd.append("Title", payload.title);
    fd.append("CategoryId", String(payload.categoryId));
    fd.append("Description", payload.description || "");
    fd.append("ImageFile", payload.imageFile); // باینری

    return fd;
  };

  const doFetch = (token: string) => {
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...(token.trim() ? { Authorization: `Bearer ${token}` } : {}),
    };

    return fetch(url, {
      method: "POST",
      body: buildFormData(),
      credentials: "include",
      headers,
    });
  };

  // ✅ 1) همیشه قبل از آپلود refresh بزن (همان منطق قبلی شما)
  let token = await refreshAccessTokenFromCookie();

  // ✅ 2) با توکن جدید آپلود کن
  let res = await doFetch(token);

  // ✅ 3) اگر به هر دلیل هنوز 401 بود، یک بار دیگر refresh + retry
  if (res.status === 401) {
    token = await refreshAccessTokenFromCookie();
    res = await doFetch(token);
  }

  const { text, data } = await readResponseBody(res);

  if (!res.ok) {
    const msg = extractApiMessage(data, text) || "خطا در ارسال اطلاعات";
    throw makeApiError(msg, res.status, data);
  }

  // ✅ toast
  toastIfApiSuccess(data);

  return (data as UploadDesignResult) ?? null;
}

/* ---------------- API: Designer Extra Profile (Portfolio) ---------------- */
export async function saveDesignerExtraProfile(
  payload: DesignerExtraProfilePayload
): Promise<DesignerExtraProfileResult> {
  const url = DESIGNER_EXTRA_PROFILE_PATH;

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("Bio", payload.bio);
    fd.append("Location", payload.location);
    fd.append("Specialty", payload.specialty);

    if (payload.avatarFile) {
      fd.append("AvatarFile", payload.avatarFile);
    }

    return fd;
  };

  const doFetch = (token: string) => {
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    return fetch(url, {
      method: "POST",
      body: buildFormData(),
      credentials: "include",
      headers,
    });
  };

  let token = await refreshAccessTokenFromCookie();
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

  // ✅ 1) اگر بک‌اند success/message داد، همون رو نمایش بده
  const success = data?.success === true || data?.Success === true;
  const msg = (data?.message || data?.Message) as string | undefined;

  if (success && typeof msg === "string" && msg.trim()) {
    prettyAlert(msg.trim(), "success");
  } else {
    // ✅ 2) اگر body خالی بود یا message نداشت، پیام پیش‌فرض بده
    prettyAlert("اطلاعات تکمیلی با موفقیت بروزرسانی شد ✅", "success");
  }

  return (data ?? { success: true }) as DesignerExtraProfileResult;
}



//--------------------------------------------------------------------
export type DesignerProjectDto = {
  id: number;
  title: string;
  categoryId: number;
  imageUrl: string | null;
  description: string | null;
  [key: string]: any;
};

const API_BASE_URL = "http://localhost:5118";

function normalizeErrorMessage(res: Response, data: any) {
  if (data && typeof data === "object") {
    return data.message || data.error || `خطا (${res.status})`;
  }
  return `خطا (${res.status})`;
}

function normalizeImageUrl(imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${API_BASE_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
}

export async function getDesignerProjects(
  token: string
): Promise<DesignerProjectDto[]> {
  const res = await fetch(
    `${API_BASE_URL}/api/portfolios/designer/me`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // پاسخ خالی یا غیر JSON
  }

  if (!res.ok) {
    throw new Error(normalizeErrorMessage(res, data));
  }

  const projects: DesignerProjectDto[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
    ? data.data
    : [];

  // نرمال‌سازی imageUrl
  return projects.map((p) => ({
    ...p,
    imageUrl: normalizeImageUrl(p.imageUrl),
  }));
}
