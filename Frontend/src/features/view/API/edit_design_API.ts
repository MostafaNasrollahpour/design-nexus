export type PortfolioEditDto = {
  id: number;
  title?: string | null;
  imageUrl?: string | null;
  categoryId?: number | null;
  name?: string | null;
  description?: string | null;
  location?: string | null;
  biography?: string | null;
  expertise?: string | null;
  imageFile?: File | null; // برای آپلود عکس
};

/**
 * بروزرسانی نمونه‌کار
 * تمام فیلدها به همراه عکس (در صورت انتخاب) به سرور ارسال می‌شوند
 */
export async function updatePortfolio(data: PortfolioEditDto): Promise<void> {
  const formData = new FormData();
  formData.append("title", data.title || "");
  formData.append("categoryId", String(data.categoryId || ""));
  if (data.name) formData.append("name", data.name);
  if (data.description) formData.append("description", data.description);
  if (data.location) formData.append("location", data.location);
  if (data.biography) formData.append("biography", data.biography);
  if (data.expertise) formData.append("expertise", data.expertise);
  if (data.imageFile) formData.append("image", data.imageFile);

  const response = await fetch(`/api/portfolio/${data.id}`, {
    method: "PUT",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "خطا در بروزرسانی نمونه‌کار" }));
    throw new Error(error.message);
  }
}

/**
 * حذف نمونه‌کار
 */
export async function deletePortfolio(id: number): Promise<void> {
  const response = await fetch(`/api/portfolio/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "خطا در حذف نمونه‌کار" }));
    throw new Error(error.message);
  }
}
