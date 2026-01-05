// src/API/designer_details_API.ts

export type PortfolioListItem = {
  id: number;
  title: string;
  imageUrl: string | null;
  categoryId?: number | null;
  designerId: number;
};

export type DesignerDetails = {
  id: number;
  name: string;
  biography: string;
  expertise: string;
  location: string;
  imageUrl?: string | null;
};

const API_BASE_URL = import.meta.env.VITE_API_URL.replace(/\/+$/, "") + "/portfolio";

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

// دریافت اطلاعات کامل یک طراح
export async function getDesignerDetailsById(
  designerId: number,
  signal?: AbortSignal
): Promise<DesignerDetails> {
  const url = `${API_BASE_URL}/api/portfolios/designer-details/${designerId}`;
  const res = await fetchJson<any>(url, signal);

  const d = res.data; // 👈 خیلی مهم

  return {
    id: d.designerId,
    name: d.fullName,
    biography: d.bio ?? "",
    expertise: d.specialty ?? "",
    location: d.location ?? "",
    imageUrl: normalizeImageUrl(d.avatarUrl),
  };
}


// دریافت پورتفولیوهای یک طراح
export async function getPortfoliosByDesignerId(
  designerId: number,
  signal?: AbortSignal
): Promise<PortfolioListItem[]> {
  const url = `${API_BASE_URL}/api/portfolios/designer/${encodeURIComponent(String(designerId))}`;
  const data = await fetchJson<PortfolioListItem[]>(url, signal);

  return data.map(x => ({
    ...x,
    imageUrl: normalizeImageUrl(x.imageUrl),
  }));
}
