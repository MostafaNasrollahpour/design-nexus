export type PortfolioDetails = {
  id: number;
  title?: string | null;
  imageUrl: string | null;

  categoryId: number | null;
  designerId: number | null;

  description: string | null;
  location: string | null;
  biography: string | null;
  expertise: string | null;
};

/**
 * DTO چیزی که از بک میاد (ممکنه دقیقاً همین نباشه)
 * اگر بک شما اسم فیلدهاش فرق داره، همینجا نگاشت کن ✅
 */
type PortfolioDetailsApiDto = {
  id: number;
  title?: string | null;
  imageUrl?: string | null;

  categoryId?: number | null;
  designerId?: number | null;

  description?: string | null;
  location?: string | null;
  biography?: string | null;
  expertise?: string | null;
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

/**
 * نکته مهم:
 * اینجا فرض کردیم endpoint جزئیات اینه:
 *   GET /api/portfolios/{id}
 *
 * اگر بک شما مثلا اینه:
 *   GET /api/portfolios/details/{id}
 * یا:
 *   GET /api/portfolios/getById?id=...
 * فقط همین URL رو تغییر بده.
 */
export async function getPortfolioDetailsById(
  portfolioId: number,
  signal?: AbortSignal
): Promise<PortfolioDetails> {
  const url = `${API_BASE_URL}${PORTFOLIOS_ENDPOINT}/${encodeURIComponent(
    String(portfolioId)
  )}`;

  const x = await fetchJson<PortfolioDetailsApiDto>(url, signal);

  return {
    id: x.id,
    title: x.title ?? null,
    imageUrl: normalizeImageUrl(x.imageUrl),

    categoryId: x.categoryId ?? null,
    designerId: x.designerId ?? null,

    description: x.description ?? null,
    location: x.location ?? null,
    biography: x.biography ?? null,
    expertise: x.expertise ?? null,
  };
}
