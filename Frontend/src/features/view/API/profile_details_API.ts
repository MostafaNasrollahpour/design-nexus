import { getDesignerById } from "../API/designerAPI";

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/+$/, "") ||
  "http://gateway:5157/portfolio";

const PORTFOLIOS_ENDPOINT = "/api/portfolios";

export type PortfolioDetails = {
  id: number;
  title?: string | null;
  imageUrl: string | null;

  categoryId: number | null;
  designerId: number | null;
  designerName?: string | null;

  description: string | null;
  location: string | null;
  biography: string | null;
  expertise: string | null;
};

type PortfolioDetailsApiDto = {
  id: number;
  title?: string | null;
  imageUrl?: string | null;

  categoryId?: number | null;
  designerId?: number | null;
  designerName?: string | null;

  description?: string | null;
  location?: string | null;
  biography?: string | null;
  expertise?: string | null;
};

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

/**
 * دریافت جزئیات یک نمونه‌کار بر اساس id
 * اگر designerName موجود نبود، از API جدید designerAPI استفاده می‌کنیم
 */
export async function getPortfolioDetailsById(
  portfolioId: number,
  signal?: AbortSignal
): Promise<PortfolioDetails> {
  const url = `${API_BASE_URL}${PORTFOLIOS_ENDPOINT}/${encodeURIComponent(portfolioId)}`;
  const x = await fetchJson<PortfolioDetailsApiDto>(url, signal);

  let designerName = x.designerName ?? null;

  // اگر designerName موجود نبود و designerId داریم، API جدید را صدا بزن
  if (!designerName && x.designerId != null) {
    try {
      const designer = await getDesignerById(x.designerId);
      designerName = designer?.name ?? null;
    } catch (err) {
      console.error("Error fetching designer name:", err);
      designerName = null;
    }
  }

  return {
    id: x.id,
    title: x.title ?? null,
    imageUrl: normalizeImageUrl(x.imageUrl),
    categoryId: x.categoryId ?? null,
    designerId: x.designerId ?? null,
    designerName: designerName,
    description: x.description ?? null,
    location: x.location ?? null,
    biography: x.biography ?? null,
    expertise: x.expertise ?? null,
  };
}
