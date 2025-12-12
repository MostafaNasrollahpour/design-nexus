
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5157/iam";

/* ---------- Login ---------- */

// export interface LoginRequest {
//   email: string;
//   password: string;
// }

// export interface LoginResponse {
//   access_token: string;
//   [key: string]: any;
// }

// export async function loginUser(
//   credentials: LoginRequest
// ): Promise<LoginResponse> {
//   const response = await fetch(`${BASE_URL}/api/Auth/login`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     credentials: "include",
//     body: JSON.stringify(credentials),
//   });

//   if (!response.ok) {
//     let message = "ایمیل یا رمز عبور اشتباه است";

//     try {
//       const data = await response.json();
//       if (data?.message) message = data.message;
//     } catch {}

//     throw new Error(message);
//   }

//   return await response.json();
// }
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  [key: string]: any;
}


export async function loginUser(
  credentials: LoginRequest
): Promise<LoginResponse> {
  const response = await fetch(`${BASE_URL}/api/Auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // برای ارسال کوکی refresh token
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    let message = "ایمیل یا رمز عبور اشتباه است";
    try {
      const data = await response.json();
      if (data?.message) message = data.message;
    } catch {}
    throw new Error(message);
  }

  const data: LoginResponse = await response.json();
  // ذخیره access token برای استفاده در درخواست‌های بعدی
  localStorage.setItem("access_token", data.accessToken);
  return data;
}


export async function fetchWithToken(url: string, options: RequestInit = {}) {
  let accessToken = localStorage.getItem("access_token");

  if (!accessToken) {
    throw new Error("توکن موجود نیست، لطفا دوباره لاگین کنید");
  }

  if (!options.headers) options.headers = {};
  (options.headers as any)["Authorization"] = `Bearer ${accessToken}`;

  let response = await fetch(url, { ...options, credentials: "include" });

  if (response.status === 401) {
    // access token منقضی شده، درخواست رفرش
    const refreshRes = await fetch(`${BASE_URL}/api/Auth/refresh`, {
      method: "POST",
      credentials: "include", // کوکی refresh token فرستاده میشه
    });

    if (!refreshRes.ok) throw new Error("توکن منقضی شد، دوباره لاگین کنید");

    const data = await refreshRes.json();
    accessToken = data.access_token;

    if (!accessToken) {
      throw new Error("رفرش توکن معتبر نیست، دوباره لاگین کنید");
    }

    localStorage.setItem("access_token", accessToken);

    // دوباره درخواست اصلی با توکن جدید
    (options.headers as any)["Authorization"] = `Bearer ${accessToken}`;
    response = await fetch(url, { ...options, credentials: "include" });
  }

  return response;
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
}

/* --------------------- مدیریت توکن و رفرش --------------------- */
function getAccessToken(): string | null {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user)?.token : null;
}

async function refreshAccessToken(): Promise<string> {
  const user = localStorage.getItem("user");
  if (!user) throw new Error("کاربر لاگین نکرده");

  const refreshToken = JSON.parse(user)?.refreshToken;
  if (!refreshToken) throw new Error("رفرش توکن موجود نیست");

  const res = await fetch(`${BASE_URL}/api/Auth/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    localStorage.removeItem("user");
    throw new Error("توکن منقضی شد، لطفاً دوباره وارد شوید");
  }

  const data: TokenResponse = await res.json();

  const updatedUser = { ...JSON.parse(user), token: data.accessToken };
  if (data.refreshToken) updatedUser.refreshToken = data.refreshToken;
  localStorage.setItem("user", JSON.stringify(updatedUser));

  return data.accessToken;
}

/* --------------------- fetch با مدیریت توکن --------------------- */
async function fetchWithAuth(
  url: string,
  options: RequestInit
): Promise<any> {
  let token = getAccessToken();
  options.headers = {
    ...options.headers,
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };

  let res = await fetch(url, options);

  if (res.status === 401) {
    try {
      token = await refreshAccessToken();
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      res = await fetch(url, options);
    } catch (err) {
      throw err;
    }
  }

  if (!res.ok) {
    let message = "خطا در درخواست";
    try {
      const err = await res.json();
      if (err?.message) message = err.message;
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


/* ---------- Resend Code to Signup---------- */

export interface ResendCodePayload {
  email: string;   
}

export async function resendCode(
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





