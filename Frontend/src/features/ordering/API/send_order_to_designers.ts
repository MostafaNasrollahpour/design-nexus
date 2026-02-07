import { BASE_URL } from "../../media/API/base";

/* ===================== Types ===================== */

export interface DesignerRequestDto {
  requestId: number;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  designerName: string;
  categoryId: number | null;
  budget: number | null;
  address: string;
  deadline: string;
}

/* ===================== Token ===================== */

const ACCESS_TOKEN_KEY = "token";

export function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

/* ===================== Helpers ===================== */

async function safeJson(res: Response) {
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

/* ===================== Auth ===================== */

export async function refreshAccessToken(): Promise<string> {
  const res = await fetch(`${BASE_URL}/iam/api/Auth/refresh`, {
    method: "POST",
    credentials: "include", // ارسال refresh token cookie
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  const data = await safeJson(res);

  if (!res.ok || !data?.token) {
    clearAccessToken();
    throw new Error("رفرش توکن ناموفق بود");
  }

  setAccessToken(data.token);
  return data.token;
}

/* ===================== Auth Fetch (Auto Refresh) ===================== */

async function authFetch(
  url: string,
  options: RequestInit = {},
  retry = true
): Promise<Response> {
  const token = getAccessToken();

  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // اگر توکن منقضی شده
  if (res.status === 401 && retry) {
    try {
      const newToken = await refreshAccessToken();

      return fetch(url, {
        ...options,
        headers: {
          Accept: "application/json",
          ...(options.headers || {}),
          Authorization: `Bearer ${newToken}`,
        },
      });
    } catch {
      throw new Error("احراز هویت منقضی شده است");
    }
  }

  return res;
}

/* ===================== Mapper ===================== */

function mapDesignerRequest(item: any): DesignerRequestDto {
  return {
    requestId: item.requestId,
    title: item.title ?? "—",
    description: item.description ?? "—",
    status: item.status ?? "Pending",
    createdAt: item.createdAt ?? "",
    updatedAt: item.updatedAt ?? "",
    designerName: item.designerName ?? "—",
    categoryId: item.categoryId ?? null,
    budget: item.budget ?? null,
    address: item.address ?? "—",
    deadline: item.deadline ?? "",
  };
}

/* ===================== API ===================== */

export async function fetchDesignerRequests(): Promise<DesignerRequestDto[]> {
  const res = await authFetch(
    `${BASE_URL}/request/api/projectrequest/by-designer`,
    {
      method: "GET",
    }
  );

  const result = await safeJson(res);

  if (!res.ok || result?.success !== true) {
    throw new Error(result?.message || "خطا در دریافت درخواست‌ها");
  }

  const list = Array.isArray(result.data) ? result.data : [];
  return list.map(mapDesignerRequest);
}
