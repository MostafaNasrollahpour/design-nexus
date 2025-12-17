
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5157/iam";





/** ---------------- Types ---------------- */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserDto {
  UserId: number | string;
  FullName: string;
  Email: string;
  Role: string;
  IsVerified: boolean;
  [key: string]: any;
}

export interface AuthResponseDto {
  Success: boolean;
  Message: string;
  Token: string;
  RefreshToken: string;
  User: UserDto;
  [key: string]: any;
}

/** ---------------- Helpers ---------------- */
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

function safeJsonParse(text: string): any | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function pickUser(responseData: any): any {
  if (responseData?.User && typeof responseData.User === "object") return responseData.User;
  if (responseData?.user && typeof responseData.user === "object") return responseData.user;
  if (responseData?.UserId || responseData?.FullName) return responseData; // sometimes root-level
  return null;
}

function extractFullName(userData: any): string {
  return (
    userData?.FullName ||
    userData?.fullName ||
    userData?.Fullname ||
    userData?.fullname ||
    userData?.name ||
    ""
  );
}

function buildAuthResponse(raw: any): AuthResponseDto {
  const userData = pickUser(raw);
  const fullName = extractFullName(userData);

  const token = raw?.Token ?? raw?.token ?? "";
  const refreshToken = raw?.RefreshToken ?? raw?.refreshToken ?? "";

  const email = userData?.Email ?? userData?.email ?? "";
  const fallbackName = email ? String(email).split("@")[0] : "";

  return {
    Success: raw?.Success ?? raw?.success ?? true,
    Message: raw?.Message ?? raw?.message ?? "",
    Token: token,
    RefreshToken: refreshToken,
    User: {
      UserId: userData?.UserId ?? userData?.userId ?? "",
      FullName: fullName || fallbackName,
      Email: email,
      Role: userData?.Role ?? userData?.role ?? "",
      IsVerified: userData?.IsVerified ?? userData?.isVerified ?? false,
      ...(userData || {}),
    },
    ...(raw || {}),
  };
}

async function request<T>(path: string, options: { method: HttpMethod; body?: any; auth?: boolean } ): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  let body: string | undefined;
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  // اگر خواستی Bearer هم بفرستی (برای logout یا endpoint های محافظت شده)
  if (options.auth) {
    const token = localStorage.getItem("token") || "";
    if (token.trim()) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: options.method,
    headers,
    credentials: "include",
    body,
  });

  const text = await res.text();
  const json = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    const msg =
      (json && (json.Message || json.message)) ||
      (text && text.length < 200 ? text : "") ||
      `خطای سرور: ${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  // اگر پاسخ خالی بود
  if (!text) return undefined as T;

  // اگر JSON نبود ولی ok بود
  if (!json) return text as unknown as T;

  return json as T;
}

/** ---------------- API ---------------- */
export async function loginUser(credentials: LoginRequest): Promise<AuthResponseDto> {
  const raw = await request<any>("/api/Auth/login", {
    method: "POST",
    body: credentials,
  });

  const data = buildAuthResponse(raw);

  if (!data.Token?.trim()) {
    throw new Error("توکن معتبر از سرور دریافت نشد");
  }

  return data;
}

export async function logoutUser(): Promise<void> {
  // اگر بک‌اندت با کوکی کار می‌کنه، همون credentials:include کافیه
  // اگر با Bearer کار می‌کنه، auth:true هم می‌فرستیم
  await request<void>("/api/Auth/logout", {
    method: "POST",
    auth: true,
  });
}







/* ---------- Register ---------- */


export interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

export interface RegisterResponse {
  message?: string;
  [key: string]: any;
}


export async function registerUser(
  form: RegisterForm
): Promise<RegisterResponse> {
  const response = await fetch(`${BASE_URL}/api/Auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(form),
  });

  if (!response.ok) {
    let errBody: any;

    try {
      errBody = await response.json();
    } catch {
      throw { message: "خطای ثبت‌نام" };
    }

    throw errBody;
  }

  return await response.json();
}

/* ---------- Verify Code for email---------- */

// export interface VerifyPayload {
//   email: string;
//   otp: string;
// }

// export interface VerifyResponse {
//   message?: string;
//   token?: string;
//   name?: string;
//   [key: string]: any;
// }

// export async function verifyCode(
//   payload: VerifyPayload
// ): Promise<VerifyResponse> {
//   const response = await fetch(`${BASE_URL}/api/Auth/verify`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     credentials: "include",
//     body: JSON.stringify(payload),
//   });

//   if (!response.ok) {
//     let message = "کد تأیید اشتباه است";

//     try {
//       const err = await response.json();
//       if (err?.message) message = err.message;
//     } catch {}

//     throw new Error(message);
//   }

//   return await response.json();
// }


/* --------------------- انواع داده --------------------- */
export interface VerifyPayload {
  email: string;
  otp: string;
}

export interface VerifyResponse {
  message?: string;
  token?: string;
  refreshToken?: string;
  name?: string;
  [key: string]: any;
}

export interface ResendCodePayload {
  email: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  // بعضی بک‌اندها ممکنه token هم بده
  token?: string;
  Token?: string;
  refresh_token?: string;
}

/* --------------------- ابزارهای کوچک --------------------- */
function emitAuthChanged() {
  window.dispatchEvent(new Event("authChanged"));
}

function safeParseUser(): any | null {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/* --------------------- مدیریت توکن و رفرش --------------------- */
function getAccessToken(): string | null {
  // ✅ اولویت با token اصلی پروژه
  const t = localStorage.getItem("token");
  if (t) return t;

  // ✅ سازگاری با ساختار قدیمی
  const user = safeParseUser();
  return user?.token || null;
}

function getRefreshToken(): string | null {
  const rt = localStorage.getItem("refreshToken");
  if (rt) return rt;

  const user = safeParseUser();
  return user?.refreshToken || null;
}

function setTokens(accessToken: string, refreshToken?: string) {
  if (accessToken) localStorage.setItem("token", accessToken);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

  // ✅ سازگاری: user.token هم آپدیت بشه
  const user = safeParseUser();
  if (user) {
    const updatedUser = {
      ...user,
      token: accessToken || user.token,
      refreshToken: refreshToken ?? user.refreshToken,
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));
  }

  emitAuthChanged();
}

function clearAuthOnFailure() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  localStorage.removeItem("fullName");
  localStorage.removeItem("userId");
  localStorage.removeItem("userRole");
  emitAuthChanged();
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearAuthOnFailure();
    throw new Error("رفرش توکن موجود نیست");
  }

  const res = await fetch(`${BASE_URL}/api/Auth/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include", // ✅ مهم
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    clearAuthOnFailure();
    throw new Error("توکن منقضی شد، لطفاً دوباره وارد شوید");
  }

  const data: TokenResponse = await res.json();

  // ✅ حالت‌های مختلف نام فیلد از بک‌اند
  const newAccess =
    data.accessToken || data.token || (data as any).Token || "";
  const newRefresh =
    data.refreshToken || (data as any).refresh_token || undefined;

  if (!newAccess) {
    clearAuthOnFailure();
    throw new Error("پاسخ رفرش معتبر نیست");
  }

  setTokens(newAccess, newRefresh);
  return newAccess;
}

/* --------------------- fetch با مدیریت توکن --------------------- */
async function fetchWithAuth(url: string, options: RequestInit): Promise<any> {
  let token = getAccessToken();

  const buildHeaders = (tk: string | null) => ({
    ...(options.headers || {}),
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(tk ? { Authorization: `Bearer ${tk}` } : {}),
  });

  let res = await fetch(url, {
    ...options,
    headers: buildHeaders(token),
    credentials: "include", // ✅ مهم
  });

  if (res.status === 401) {
    token = await refreshAccessToken();

    res = await fetch(url, {
      ...options,
      headers: buildHeaders(token),
      credentials: "include", // ✅ مهم
    });
  }

  if (!res.ok) {
    let message = "خطا در درخواست";
    try {
      const err = await res.json();
      message = err?.message || err?.Message || message;
    } catch {}
    throw new Error(message);
  }

  return await res.json();
}

/* --------------------- API های اصلی --------------------- */
export async function verifyCode(payload: VerifyPayload): Promise<VerifyResponse> {
  return await fetchWithAuth(`${BASE_URL}/api/Auth/verify`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resendVerificationCode(payload: ResendCodePayload): Promise<any> {
  return await fetchWithAuth(`${BASE_URL}/api/Auth/resend-code`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}





/* ---------- Verify Code for Change Password ---------- */
export interface VerifyPayload {
  email: string;
  otp: string;
}

export interface VerifyResponse {
  token?: string;
  name?: string;
  message?: string;
}

export async function verifyCodeToChangePassword(
  payload: VerifyPayload
): Promise<VerifyResponse> {
  const response = await fetch(`${BASE_URL}/api/Auth/verify-change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = "کد تأیید اشتباه است";
    try {
      const err = await response.json();
      if (err?.message) message = err.message;
    } catch {}
    throw new Error(message);
  }

  return await response.json();
}

/* ---------- Resend Code for Change Password ---------- */
export interface ResendCodePayload {
  email: string;
}

export async function resendCodeToChangePassword(
  payload: ResendCodePayload
): Promise<{ message: string }> {
  const response = await fetch(`${BASE_URL}/api/Auth/resend-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = "خطا در ارسال کد جدید";
    try {
      const err = await response.json();
      if (err?.message) message = err.message;
    } catch {}
    throw new Error(message);
  }

  return await response.json();
}

/* ---------- Change Password ---------- */

export interface ChangePasswordPayload {
  email: string;
  password: string;
  confirmPassword: string;
  otp: string;
}

export const changePassword = async (payload: ChangePasswordPayload) => {
  const res = await fetch(`${BASE_URL}/api/Auth/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "تغییر رمز عبور انجام نشد");
  }

  return res.json();
};



/* ---------- Password Reset (Forgot Password) ---------- */

export interface PasswordResetPayload {
  email: string;
}

export interface PasswordResetResponse {
  message?: string;
  [key: string]: any;
}

export async function sendPasswordResetLink(
  payload: PasswordResetPayload
): Promise<PasswordResetResponse> {
  const response = await fetch(
    `${BASE_URL}/api/Auth/forgot-password`, 
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    let message = "خطا در ارسال لینک بازنشانی رمز عبور";

    try {
      const err = await response.json();
      if (err?.message) message = err.message;
    } catch {}

    throw new Error(message);
  }

  return await response.json();
}



//------------------------------------------------------slider



const joinUrl = (base: string, path: string) =>
  `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;

const RESOLVE_ENDPOINT = joinUrl(BASE_URL, "resolve-page");

export type ResolveSlideResponse<TPageData = unknown> = {
  route: string;
  pageData: TPageData;
};

async function postJson<TResponse>(url: string, body: unknown): Promise<TResponse> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    // تلاش برای خواندن خطا به شکل JSON یا متن
    let message = res.statusText;
    try {
      const data = await res.json();
      message = typeof data === "string" ? data : JSON.stringify(data);
    } catch {
      const text = await res.text().catch(() => "");
      if (text) message = text;
    }
    throw new Error(`API ${res.status}: ${message}`);
  }

  return (await res.json()) as TResponse;
}

export function resolveSlide<TPageData = unknown>(key: string) {
  return postJson<ResolveSlideResponse<TPageData>>(RESOLVE_ENDPOINT, { key });
}








//------------------------------------------------------------


// 🔧 مطابق بک‌اندت تنظیم کن
const USER_UPDATE_PROFILE_PATH = "/api/User/update-profile";
const AUTH_REFRESH_TOKEN_PATH = "/api/Auth/refresh-token";

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







