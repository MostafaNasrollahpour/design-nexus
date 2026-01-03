/** -----------------------------
 * رفرش کردن توکن
 * ----------------------------- */
async function refreshToken(): Promise<string> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("رفرش توکن پیدا نشد.");

  const res = await fetch("https://api.example.com/auth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || "خطا در رفرش توکن");
  }

  const data = await res.json();
  const newAccessToken = data.accessToken;

  if (!newAccessToken) throw new Error("توکن جدید دریافت نشد.");

  // ذخیره توکن جدید
  localStorage.setItem("accessToken", newAccessToken);
  return newAccessToken;
}

/** -----------------------------
 * دریافت درخواست‌های مشتری برای طراح
 * ----------------------------- */


export interface DesignerRequestDto {
  id: number | string;
  userName: string;
  title: string;
  categoryId: number | null;
  deadline: string;
  budget: number | null;
  address: string;
  description: string;
  status: string;
}

export async function fetchDesignerRequests(): Promise<DesignerRequestDto[]> {
  // ابتدا رفرش توکن
  const token = await refreshToken();

  const res = await fetch("https://api.example.com/designer/requests", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || "خطا در دریافت درخواست‌ها");
  }

  const data = await res.json();

  if (!Array.isArray(data)) throw new Error("داده‌های دریافت شده نامعتبر است.");

  return data.map((item: any) => ({
    id: item.id,
    userName: item.userName || item.name || "—",
    title: item.title || "—",
    categoryId: item.categoryId ?? null,
    deadline: item.deadline || "",
    budget: item.budget ?? null,
    address: item.address || "—",
    description: item.description || "—",
    status: item.status || "pending",
  }));
}
