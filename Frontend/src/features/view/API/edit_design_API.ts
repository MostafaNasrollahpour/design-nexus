// src/API/portfolio_API.ts

export type PortfolioEditDto = {
  id: number;
  title: string;
  categoryId: number;
  description: string;
  imageFile?: File | null;
  imageUrl?: string; // برای پیش‌نمایش در frontend
};

/**
 * گرفتن توکن از localStorage
 */
function getToken() {
  return localStorage.getItem("token") || "";
}

/**
 * بروزرسانی نمونه‌کار
 * @param data اطلاعات نمونه‌کار شامل title, categoryId, description و imageFile
 */
export async function updatePortfolio(data: PortfolioEditDto) {
  const token = getToken();

  const formData = new FormData();
  formData.append("title", data.title);
  
  formData.append("description", data.description);
  formData.append("categoryId", String(data.categoryId));
  if (data.imageFile) {
    formData.append("imageFile", data.imageFile);
  }

  const response = await fetch(`http://gateway:5157/portfolio/api/portfolios/${data.id}`, {
    method: "PUT", // معمولاً برای بروزرسانی PUT استفاده می‌شود
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
      // Content-Type را نگذارید، fetch خودش تنظیم می‌کند
    },
  });

  if (!response.ok) {
    let errorMessage = "خطا در بروزرسانی نمونه‌کار";
    try {
      const errorData = await response.json();
      if (errorData?.message) errorMessage = errorData.message;
    } catch {}
    throw new Error(errorMessage);
  }

  return await response.json();
}

/**
 * حذف نمونه‌کار
 * @param id آیدی نمونه‌کار
 */
export async function deletePortfolio(id: number) {
  const token = getToken();

  const response = await fetch(`http://gateway:5157/portfolio/api/portfolios/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let errorMessage = "خطا در حذف نمونه‌کار";
    try {
      const errorData = await response.json();
      if (errorData?.message) errorMessage = errorData.message;
    } catch {}
    throw new Error(errorMessage);
  }

  return await response.json();
}
