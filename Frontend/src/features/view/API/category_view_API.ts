// src/features/view/api/portfolioApi.ts

export type PortfolioListItem = {
  id: number;
  title: string;
  imageUrl: string | null;
  categoryId?: number | null;
  designerId: number;
};

// چیزی که از API برمی‌گرده (اکثر بک‌اندها camelCase می‌دن)
type PortfolioApiDto = {
  id: number;
  title: string;
  imageUrl: string | null;
  categoryId?: number | null;
  designerId: number;
};

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/+$/, "") ||
  "http://localhost:5118";

const PORTFOLIOS_ENDPOINT = "/api/portfolios";

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

export async function getPortfoliosByCategoryId(
  categoryId: number,
  signal?: AbortSignal
): Promise<PortfolioListItem[]> {
  const url = `${API_BASE_URL}${PORTFOLIOS_ENDPOINT}/category/${encodeURIComponent(
    String(categoryId)
  )}`;

  const data = await fetchJson<PortfolioApiDto[]>(url, signal);

  return data.map((x) => ({
    id: x.id,
    title: x.title,
    imageUrl: normalizeImageUrl(x.imageUrl),
    categoryId: x.categoryId ?? null,
    designerId: x.designerId,
  }));
}
