import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { getPortfoliosByCategoryId } from "../API/category_view_API";
import type { PortfolioListItem } from "../API/category_view_API";
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

export default function CategoryPortfoliosPage() {
  const { categoryId: categoryIdParam } = useParams<{ categoryId: string }>();
  const location = useLocation();

  const categoryId = useMemo(() => {
    const n = Number(categoryIdParam);
    return Number.isFinite(n) ? n : NaN;
  }, [categoryIdParam]);

  const title = CATEGORY_TITLES[categoryId] ?? "دسته‌بندی";

  const [items, setItems] = useState<PortfolioListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    setError("");

    if (!Number.isFinite(categoryId)) {
      setItems([]);
      setLoading(false);
      setError("آیدی دسته‌بندی معتبر نیست.");
      return () => controller.abort();
    }

    // ✅ اگر از اسلایدر با state آمده باشیم، همان دیتا را استفاده کن
    const st = location.state as LocationState | null;
    const prefetched = st?.pageData;

    if (prefetched && prefetched.categoryId === categoryId) {
      setItems(prefetched.items);
      setLoading(false);
      return () => controller.abort();
    }

    // ✅ حالت عادی: صفحه خودش API را صدا می‌زند
    setLoading(true);
    getPortfoliosByCategoryId(categoryId, controller.signal)
      .then((data) => setItems(data))
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

            <div className="designer-headerActions">
              <Link className="designer-backBtn" to="/">
                برگشت به صفحه اصلی
              </Link>
            </div>
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
                      {p.imageUrl ? (
                        <img
                          className="designer-image"
                          src={p.imageUrl}
                          alt={p.title}
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "https://via.placeholder.com/600x340?text=No+Image";
                          }}
                        />
                      ) : (
                        <img
                          className="designer-image"
                          src="https://via.placeholder.com/600x340?text=No+Image"
                          alt="No Image"
                          loading="lazy"
                        />
                      )}

                      <div className="designer-badge">{title}</div>
                    </div>

                    <div className="designer-body">
                      <div className="designer-nameRow">
                        <div className="designer-name">{p.title}</div>
                      </div>

                      <div className="designer-meta">
                        <div className="designer-chip">طراح: {p.designerId}</div>
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
