// src/API/edit_design_API.ts

export type PortfolioEditDto = {
  id: number;
  title: string;
  categoryId: number;
  description: string;
  imageFile?: File | null;
  imageUrl?: string; // برای preview در frontend
};

/**
 * بروزرسانی نمونه‌کار
 * @param data اطلاعات نمونه‌کار شامل title, categoryId, description و imageFile
 */
export async function updatePortfolio(data: PortfolioEditDto) {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("categoryId", String(data.categoryId));
  formData.append("description", data.description);
  if (data.imageFile) {
    formData.append("image", data.imageFile);
  }

  const response = await fetch(`https://localhost:5157/portfolio/api`, {
    method: "POST", // یا POST بسته به بک‌اند شما
    body: formData,
    credentials: "include", // توکن بصورت cookie ارسال می‌شود
  });

  if (!response.ok) {
    let errorMessage = "خطا در بروزرسانی نمونه‌کار";
    try {
      const errorData = await response.json();
      if (errorData?.message) errorMessage = errorData.message;
    } catch {
      // اگر JSON نبود، پیام پیش‌فرض استفاده شود
    }
    throw new Error(errorMessage);
  }

  return await response.json();
}

/**
 * حذف نمونه‌کار
 * @param id آیدی نمونه‌کار که در URL فرستاده می‌شود
 */
export async function deletePortfolio(id: number) {
  const response = await fetch(`https://localhost:5157/portfolio/api/${id}`, {
    method: "DELETE",
    credentials: "include", // توکن بصورت cookie ارسال می‌شود
  });

  if (!response.ok) {
    let errorMessage = "خطا در حذف نمونه‌کار";
    try {
      const errorData = await response.json();
      if (errorData?.message) errorMessage = errorData.message;
    } catch {
      // اگر JSON نبود، پیام پیش‌فرض استفاده شود
    }
    throw new Error(errorMessage);
  }

  return await response.json();
}
