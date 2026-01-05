// src/features/view/api/designerApi.ts

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/+$/, "") ||
  "http://localhost:5157/portfolio";

const DESIGNERS_ENDPOINT = "/api/portfolios/designers";

// ---------------- نوع‌ها ----------------
export type DesignerItem = {
  id: number;
  name?: string;
  location?: string;
  imageUrl: string | null;
};

// چیزی که از API برمی‌گرده
type DesignerApiDto = {
  id: number;
  location?: string | null;
  imageUrl: string | null;
};

// ---------------- توابع کمکی ----------------
function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return `${API_BASE_URL}${url}`;
  return `${API_BASE_URL}/${url}`;
}

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API Error ${res.status}: ${text || res.statusText}`);
  }

  return (await res.json()) as T;
}

// ---------------- API ----------------
export async function getAllDesigners(
  signal?: AbortSignal
): Promise<DesignerItem[]> {
  const url = `${API_BASE_URL}${DESIGNERS_ENDPOINT}`;
  const data = await fetchJson<DesignerApiDto[]>(url, signal);

  return data.map((d) => ({
    id: d.id,
    name: undefined,
    location: d.location || "بدون لوکیشن",
    imageUrl: normalizeImageUrl(d.imageUrl), // ✅ دقیقاً مثل portfolio
  }));
}

// src/view/API/category_view_API.ts

export type PortfolioListItem = {
  id: number;
  title: string;
  description: string;
  // Add any other properties you expect for a portfolio item
};

// Mockup function for getPortfoliosByCategoryId
export async function getPortfoliosByCategoryId(categoryId: number): Promise<PortfolioListItem[]> {
  const url = `${API_BASE_URL}/portfolios/${categoryId}`; // Adjust the endpoint as necessary
  const response = await fetch(url);
  const data: PortfolioListItem[] = await response.json();
  return data;
}
