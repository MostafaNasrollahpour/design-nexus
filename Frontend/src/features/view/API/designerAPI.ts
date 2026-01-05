

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/+$/, "") ||
  "http://gateway:5157/iam";

const DESIGNERS_ENDPOINT = "/api/Auth/get-name";

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

export type DesignerDto = {
  id: number;
  name: string;
  // سایر فیلدها
};

export async function getDesignerById(
  designerId: number,
  signal?: AbortSignal
): Promise<DesignerDto> {
  const url = `${API_BASE_URL}${DESIGNERS_ENDPOINT}/${encodeURIComponent(
    String(designerId)
  )}`;
  
  return fetchJson<DesignerDto>(url, signal);
}

export async function getDesignerName(
  designerId: number,
  signal?: AbortSignal
): Promise<string> {
  try {
    const designer = await getDesignerById(designerId, signal);
    return designer.name;
  } catch (error) {
    console.error("Error fetching designer name:", error);
    return "طراح ناشناس";
  }
}

// برای بهینه‌سازی: دریافت لیستی از طراحان
export async function getDesignersByIds(
  designerIds: number[],
  signal?: AbortSignal
): Promise<Map<number, string>> {
  if (designerIds.length === 0) {
    return new Map();
  }

  // اگر API پشتیبانی می‌کند، می‌توانید endpoint جدید بسازید
  // مثلاً: GET /api/designers/batch?ids=1,2,3
  const uniqueIds = [...new Set(designerIds)];
  const designerMap = new Map<number, string>();
  
  const promises = uniqueIds.map(async (id) => {
    try {
      const designer = await getDesignerById(id, signal);
      console.log(designer);
      designerMap.set(id, designer.name);
    } catch (error) {
      console.error(`Error fetching designer ${id}:`, error);
      designerMap.set(id, "طراح ناشناس");
    }
  });
  
  await Promise.all(promises);
  return designerMap;
}