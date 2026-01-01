import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { getPortfoliosByCategoryId } from "../API/designer_list_API";
import { getDesignersByIds } from "../API/designerAPI";
import type { PortfolioListItem } from "../API/designer_list_API";
import "../styles/category_view.css";

const CATEGORY_TITLES: Record<number, string> = {
  1: "اتاق خواب",
  2: "پذیرایی",
  3: "آشپزخانه",
  4: "اتاق کار",
  5: "عروسی و نامزدی",
  6: "جشن تولد",
  7: "کافی‌ شاپ و رستوران",
};

type LocationState = {
  pageData?: {
    categoryId: number;
    items: PortfolioListItem[];
  };
};

type DesignerNamesMap = Map<number, string>;

export default function CategoryPortfoliosPage() {
  const { categoryId: categoryIdParam } = useParams<{ categoryId: string }>();
  const location = useLocation();

  const categoryId = useMemo(() => {
    const n = Number(categoryIdParam);
    return Number.isFinite(n) ? n : NaN;
  }, [categoryIdParam]);

  const title = CATEGORY_TITLES[categoryId] ?? "دسته‌بندی";

  const [items, setItems] = useState<PortfolioListItem[]>([]);
  const [designerNames, setDesignerNames] = useState<DesignerNamesMap>(new Map());
  const [loading, setLoading] = useState(true);
  const [loadingDesigners, setLoadingDesigners] = useState(false);
  const [error, setError] = useState("");

  const fetchDesignerNames = async (designerIds: number[], signal?: AbortSignal) => {
    if (designerIds.length === 0) return;
    
    setLoadingDesigners(true);
    try {
      const namesMap = await getDesignersByIds(designerIds, signal);
      setDesignerNames(namesMap);
    } catch (err) {
      console.error("Error fetching designer names:", err);
    } finally {
      setLoadingDesigners(false);
    }
  };

  const getDesignerName = (designerId: number): string => {
    return designerNames.get(designerId) || "در حال دریافت...";
  };

  useEffect(() => {
    const controller = new AbortController();
    setError("");

    if (!Number.isFinite(categoryId)) {
      setItems([]);
      setLoading(false);
      setError("آیدی دسته‌بندی معتبر نیست.");
      return () => controller.abort();
    }

    const st = location.state as LocationState | null;
    const prefetched = st?.pageData;

    if (prefetched && prefetched.categoryId === categoryId) {
      setItems(prefetched.items);
      const designerIds = prefetched.items.map(item => item.designerId);
      fetchDesignerNames(designerIds, controller.signal);
      setLoading(false);
      return () => controller.abort();
    }

    setLoading(true);
    getPortfoliosByCategoryId(categoryId, controller.signal)
      .then((data) => {
        setItems(data);
        const designerIds = data.map(item => item.designerId);
        return fetchDesignerNames(designerIds, controller.signal);
      })
      .catch((err: any) => {
        if (err?.name === "AbortError") return;
        setItems([]);
        setError(err?.message || "خطا در دریافت اطلاعات");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [categoryId, location.state]);

  return (
    <div className="designer-panel-layout">
      <div className="designer-panel-content">
        <div className="designer-panel-card">
          <div className="designer-header">
            <div>
              <h2 className="designer-title">نمونه‌کارهای {title}</h2>
            </div>

            {/* ---------- Back Button as Icon ---------- */}
            <Link to="/" className="designer-iconBackBtn">
              <ArrowLeft size={20} />
            </Link>
          </div>

          {error ? <div className="designer-alert designer-alert--error">{error}</div> : null}

          {!loading && !error && items.length === 0 ? (
            <div className="designer-alert designer-alert--empty">
              نمونه‌کاری برای این دسته‌بندی ثبت نشده.
            </div>
          ) : null}

          <div className="designer-grid">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={`sk-${i}`} className="designer-card designer-card--skeleton">
                    <div className="designer-imageWrap">
                      <div className="designer-image skeleton-box" />
                      <div className="designer-badge skeleton-box" style={{ width: 90, height: 26 }} />
                    </div>
                    <div className="designer-body">
                      <div className="skeleton-line w-70" />
                      <div className="skeleton-line w-60" />
                      <div className="skeleton-line w-80" />
                      <div className="skeleton-line w-60" />
                    </div>
                  </div>
                ))
              : items.map((p) => (
                  <div key={p.id} className="designer-card">
                    <div className="designer-imageWrap">
                      <img
                        className="designer-image"
                        src={p.imageUrl || "https://via.placeholder.com/600x340?text=No+Image"}
                        alt={p.title}
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "https://via.placeholder.com/600x340?text=No+Image";
                        }}
                      />
                      <div className="designer-badge">{title}</div>
                    </div>

                    <div className="designer-body">
                      <div className="designer-nameRow">
                        <div className="designer-name">{p.title}</div>
                      </div>

                      <div className="designer-meta">
                        <div className="designer-chip">
                          طراح: {loadingDesigners ? "در حال دریافت..." : getDesignerName(p.designerId)}
                        </div>
                      </div>

                      <p className="designer-desc">
                        برای مشاهده جزئیات، روی دکمه «مشاهده» کلیک کنید.
                      </p>
                    </div>

                    <div className="designer-actions">
                      {p.imageUrl ? (
                        <a
                          className="designer-iconBtn"
                          href={p.imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          title="باز کردن تصویر"
                        >
                          ⤴
                        </a>
                      ) : (
                        <span className="designer-iconBtn" title="تصویر موجود نیست">
                          —
                        </span>
                      )}

                      <Link className="designer-viewBtn" to={`/portfolio/${p.id}`}>
                        مشاهده
                      </Link>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}
