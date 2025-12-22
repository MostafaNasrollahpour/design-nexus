import { getPortfoliosByCategoryId } from "../../view/API/category_view_API";
import type { PortfolioListItem } from "../../view/API/category_view_API";

// اگر ResolveSlideResponse را از قبل داری همون را استفاده کن.
// اینجا فرض کردم شکلش اینه:
export type ResolveSlideResponse = {
  route: string;
  pageData?: unknown;
};

export async function resolveCategorySlide(key: string): Promise<ResolveSlideResponse> {
  const categoryId = Number(key);

  if (!Number.isFinite(categoryId)) {
    throw new Error("categoryId نامعتبر است");
  }

  const items: PortfolioListItem[] = await getPortfoliosByCategoryId(categoryId);

  return {
    route: `/category/${categoryId}`,
    pageData: {
      categoryId,
      items,
    },
  };
}
