// src/features/view/api/designerAPI.ts

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/+$/, "") ||
  "http://localhost:5157/portfolio";

export type DesignerItem = {
  id: number;
//   name: string;
  location: string;
  imageUrl: string | null;
};

type DesignerApiDto = {
  id: number;
//   name: string;
  location: string;
  imageUrl: string | null;
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

// گرفتن لیست تمام طراحان
export async function getAllDesigners(signal?: AbortSignal): Promise<DesignerItem[]> {
  const url = `${API_BASE_URL}/api/portfolios/designers`;
  const data = await fetchJson<DesignerApiDto[]>(url, signal);
  return data.map(x => ({
    id: x.id,
    // name: x.name,
    location: x.location,
    imageUrl: normalizeImageUrl(x.imageUrl),
  }));
}
