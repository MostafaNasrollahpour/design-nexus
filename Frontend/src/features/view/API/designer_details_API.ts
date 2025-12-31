// src/API/designer_details_API.ts
import type { PortfolioListItem } from "./category_view_API";

// اطلاعات کامل طراح
export type DesignerDetails = {
  id: number;
  name: string;        // این مقدار همون چیزی هست که getDesignerById می‌تونه بده
  biography: string;
  expertise: string;
  location: string;
  imageUrl?: string;
};

// API که اطلاعات کامل طراح را برمی‌گرداند
export async function getDesignerDetailsById(
  designerId: number,
  signal?: AbortSignal
): Promise<DesignerDetails> {
  const res = await fetch(`http://localhost:5157/portfolio/api/portfolios/designer-details/${designerId}`, { signal });
  if (!res.ok) throw new Error("خطا در دریافت اطلاعات طراح");
  return res.json();
}

// API که تمام پورتفولیوهای یک طراح را برمی‌گرداند
export async function getPortfoliosByDesignerId(
  designerId: number,
  signal?: AbortSignal
): Promise<PortfolioListItem[]> {
  const res = await fetch(`http://localhost:5157/portfolio/api/portfolios/designer/${designerId}`, { signal });
  if (!res.ok) throw new Error("خطا در دریافت پورتفولیوها");
  return res.json();
}
