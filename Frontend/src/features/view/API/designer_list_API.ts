const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/+$/, "") ||
  "http://localhost:5157/portfolio";

const DESIGNERS_ENDPOINT = "/api/portfolios/designers";
const PORTFOLIOS_ENDPOINT = "/api/portfolios";

// ---------------- نوع‌ها ----------------
export type DesignerItem = {
  id: number;
  name?: string;
  location?: string; // ← می‌تواند خالی باشد
  imageUrl: string | null;
};

export type PortfolioListItem = {
  id: number;
  title: string;
  imageUrl: string | null;
  categoryId?: number | null;
  designerId: number;
};

// نوع داده دریافتی از API
type DesignerApiDto = {
  id: number;
  location?: string | null;
  imageUrl: string | null;
};

type PortfolioApiDto = {
  id: number;
  title: string;
  imageUrl: string | null;
  categoryId?: number | null;
  designerId: number;
};

// ---------------- توابع کمکی ----------------
function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return `${API_BASE_URL}${url}`;
  return `${API_BASE_URL}/${url}`;
}

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" }, signal });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API Error ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}

// ---------------- API ها ----------------
export async function getAllDesigners(signal?: AbortSignal): Promise<DesignerItem[]> {
  const url = `${API_BASE_URL}${DESIGNERS_ENDPOINT}`;
  const data = await fetchJson<DesignerApiDto[]>(url, signal);

  return data.map((d) => ({
    id: d.id,
    name: undefined,
    location: d.location || "بدون لوکیشن", // ← پیش‌فرض اضافه شد
    imageUrl: normalizeImageUrl(d.imageUrl),
  }));
}

export async function getPortfoliosByCategoryId(
  categoryId: number,
  signal?: AbortSignal
): Promise<PortfolioListItem[]> {
  const url = `${API_BASE_URL}${PORTFOLIOS_ENDPOINT}/category/${encodeURIComponent(categoryId)}`;
  const data = await fetchJson<PortfolioApiDto[]>(url, signal);

  return data.map((p) => ({
    id: p.id,
    title: p.title,
    imageUrl: normalizeImageUrl(p.imageUrl),
    categoryId: p.categoryId ?? null,
    designerId: p.designerId,
  }));
}
