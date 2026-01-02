import { BASE_URL } from "./base";

/* ===================== Types ===================== */

export type DesignerProjectDto = {
  id: number;
  title: string;
  categoryId: number;
  imageUrl: string | null;
  description: string | null;
  [key: string]: any;
};

/* ===================== Token ===================== */

const ACCESS_TOKEN_KEY = "token";

function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

/* ===================== Auth ===================== */

async function refreshAccessToken(): Promise<string> {
  const res = await fetch(`${BASE_URL}/iam/api/Auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  const data = await res.json();
  if (!res.ok || !data?.token) {
    throw new Error("Access token از refresh دریافت نشد");
  }

  setAccessToken(data.token);
  return data.token;
}

/* ===================== Utils ===================== */

function normalizeImageUrl(imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${BASE_URL}/portfolio${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
}

/* ===================== API ===================== */

export async function getDesignerProjects(): Promise<DesignerProjectDto[]> {
  const token = await refreshAccessToken();

  const res = await fetch(`${BASE_URL}/portfolio/api/portfolios/designer/me`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  const projects = Array.isArray(data) ? data : data?.data ?? [];

  return projects.map((p: DesignerProjectDto) => ({
    ...p,
    imageUrl: normalizeImageUrl(p.imageUrl),
  }));
}
