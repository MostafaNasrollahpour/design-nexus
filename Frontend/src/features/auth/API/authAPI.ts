
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5157/iam";



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
  // [key: string]: any;
}

export interface AuthResponseDto {
  Success: boolean;
  Message: string;
  Token: string;
  RefreshToken: string;
  User: UserDto;
  // [key: string]: any;
}


export async function loginUser(
  credentials: LoginRequest
): Promise<AuthResponseDto> {
  try {
    console.log("Sending login request to:", `${BASE_URL}/api/Auth/login`);
    console.log("Credentials:", { email: credentials.email, password: "***" });

    const response = await fetch(`${BASE_URL}/api/Auth/login`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(credentials),
    });

    console.log("Response status:", response.status, response.statusText);

    // دریافت پاسخ به صورت متن اول
    const responseText = await response.text();
    // console.log("Raw response text:", responseText);

    // بررسی اینکه آیا پاسخ JSON است
    if (!responseText) {
      throw new Error("پاسخ خالی از سرور دریافت شد");
    }

    let responseData: any;
    try {
      responseData = JSON.parse(responseText);
    } catch (error) {
      console.error("Failed to parse JSON:", responseText);
      throw new Error("پاسخ سرور معتبر نیست (JSON نیست)");
    }

    // console.log("Parsed response data:", responseData);

    // بررسی خطای HTTP
    if (!response.ok) {
      console.error("HTTP error response:", responseData);
      const errorMessage = responseData?.Message || 
                          responseData?.message ||
                          `خطای سرور: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    // بررسی ساختار پاسخ با دقت
    // console.log("Checking response structure...");
    // console.log("Has 'User' property?", 'User' in responseData);
    // console.log("Has 'user' property?", 'user' in responseData);
    // console.log("All properties:", Object.keys(responseData));

    // استخراج اطلاعات کاربر با روش ایمن
    let userData: any = null;
    
    // اول با حرف بزرگ 'User' بررسی می‌کنیم
    if (responseData.User && typeof responseData.User === 'object') {
      // console.log("Found 'User' with capital U");
      userData = responseData.User;
    } 
    // سپس با حرف کوچک 'user' بررسی می‌کنیم
    else if (responseData.user && typeof responseData.user === 'object') {
      // console.log("Found 'user' with lowercase u");
      userData = responseData.user;
    }
    // اگر هیچکدام نبود، خود responseData را بررسی می‌کنیم
    else if (responseData.UserId || responseData.FullName) {
      // console.log("User data is at root level");
      userData = responseData;
    } 
    else {
      console.warn("No user data found in response");
    }

    // console.log("Extracted userData:", userData);

    // استخراج FullName با بررسی همه حالت‌های ممکن
    let fullName = "";
    
    if (userData) {
      fullName = userData.FullName || 
                userData.fullName || 
                userData.Fullname || 
                userData.fullname || 
                userData.name ||
                "";
    }

    console.log("Extracted fullName:", fullName);

    // ایجاد آبجکت نهایی
    const data: AuthResponseDto = {
      Success: responseData.Success || responseData.success || true,
      Message: responseData.Message || responseData.message || "",
      Token: responseData.Token || responseData.token || "",
      RefreshToken: responseData.RefreshToken || responseData.refreshToken || "",
      User: {
        UserId: userData?.UserId || userData?.userId || "",
        FullName: fullName,
        Email: userData?.Email || userData?.email || "",
        Role: userData?.Role || userData?.role || "",
        IsVerified: userData?.IsVerified || userData?.isVerified || false,
        ...(userData || {})
      }
    };

    // لاگ اطلاعات نهایی
    console.log("Final data structure:", {
      hasToken: !!data.Token,
      tokenLength: data.Token?.length,
      hasUser: !!data.User,
      userFullName: data.User.FullName,
      userEmail: data.User.Email
    });

    // ذخیره در localStorage فقط اگر مقادیر معتبر باشند
    if (data.Token && data.Token.trim() !== "") {
      localStorage.setItem("token", data.Token);
      // console.log("✓ Token saved to localStorage");
    } else {
      console.warn("⚠ No valid token to save");
    }

    if (data.User.FullName && data.User.FullName.trim() !== "") {
      localStorage.setItem("fullName", data.User.FullName);
      // console.log("✓ FullName saved:", data.User.FullName);
    } else {
      console.warn("⚠ FullName is empty, not saving");
      // اگر ایمیل داریم، از آن استفاده می‌کنیم
      if (data.User.Email) {
        localStorage.setItem("fullName", data.User.Email.split('@')[0]);
        // console.log("✓ Using email username as fallback");
      }
    }

    if (data.User) {
      localStorage.setItem("user", JSON.stringify(data.User));
      // console.log("✓ User object saved");
      
      if (data.User.UserId) {
        localStorage.setItem("userId", String(data.User.UserId));
      }
      
      if (data.User.Role) {
        localStorage.setItem("userRole", data.User.Role);
      }
    }

    console.log("✅ Login successful!");
    return data;

  } catch (error) {
    console.error("❌ Login failed:", error);
    
    // پاک کردن localStorage در صورت خطا
    localStorage.removeItem("token");
    localStorage.removeItem("fullName");
    localStorage.removeItem("user");
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error("خطای ناشناخته در عملیات ورود");
  }
}

// توابع کمکی اضافه
export function validateLoginResponse(data: any): boolean {
  if (!data) return false;
  if (!data.Token || data.Token.trim() === "") return false;
  if (!data.User || typeof data.User !== 'object') return false;
  return true;
}

export function extractUserInfo(data: any): {fullName: string, email: string} {
  const user = data.User || data.user || data;
  
  return {
    fullName: user.FullName || user.fullName || user.Email?.split('@')[0] || "کاربر",
    email: user.Email || user.email || ""
  };
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





