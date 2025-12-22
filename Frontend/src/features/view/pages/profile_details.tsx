import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getPortfolioDetailsById,
  type PortfolioDetails,
} from "../API/profile_details_API";
import "../styles/profile_details.css";

const CATEGORY_TITLES: Record<number, string> = {
  1: "اتاق خواب",
  2: "پذیرایی",
  3: "آشپزخانه",
  4: "اتاق کار",
  5: "عروسی و نامزدی",
  6: "جشن تولد",
  7: "کافی‌ شاپ و رستوران",
};

export default function PortfolioDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const portfolioId = useMemo(() => {
    const n = Number(id);
    return Number.isFinite(n) ? n : NaN;
  }, [id]);

  const [data, setData] = useState<PortfolioDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    setError("");
    setData(null);

    if (!Number.isFinite(portfolioId)) {
      setLoading(false);
      setError("آیدی نمونه‌کار معتبر نیست.");
      return () => controller.abort();
    }

    setLoading(true);
    getPortfolioDetailsById(portfolioId, controller.signal)
      .then((res) => setData(res))
      .catch((err: any) => {
        if (err?.name === "AbortError") return;
        setError(err?.message || "خطا در دریافت اطلاعات نمونه‌کار");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [portfolioId]);

  const imageSrc =
    data?.imageUrl || "https://via.placeholder.com/1200x900?text=No+Image";

  const categoryTitle =
    data?.categoryId != null
      ? CATEGORY_TITLES[data.categoryId] ?? `دسته‌بندی #${data.categoryId}`
      : "نامشخص";

  return (
    <div className="portfolioD-layout">
      <div className="portfolioD-card">
        <div className="portfolioD-header">
          <div className="portfolioD-headerText">
            <h2 className="portfolioD-title">
              {loading ? "در حال دریافت..." : data?.title || "جزئیات نمونه‌کار"}
            </h2>
            <div className="portfolioD-subtitle">
              نمایش جزئیات کامل نمونه‌کار
            </div>
          </div>

          <div className="portfolioD-headerActions">
            <Link className="portfolioD-backBtn" to={-1 as any}>
              برگشت
            </Link>
            <Link className="portfolioD-homeBtn" to="/">
              صفحه اصلی
            </Link>
          </div>
        </div>

        {error ? <div className="portfolioD-alert portfolioD-alert--error">{error}</div> : null}

        {loading ? (
          <div className="portfolioD-grid portfolioD-grid--skeleton">
            <div className="portfolioD-imageSkeleton skeleton-box" />
            <div className="portfolioD-infoSkeleton">
              <div className="skeleton-line w-70" />
              <div className="skeleton-line w-60" />
              <div className="skeleton-line w-80" />
              <div className="skeleton-line w-60" />
              <div className="skeleton-line w-70" />
              <div className="skeleton-line w-80" />
              <div className="skeleton-line w-60" />
            </div>
          </div>
        ) : !error && data ? (
          <div className="portfolioD-grid">
            {/* RIGHT: BIG IMAGE */}
            <div className="portfolioD-imageWrap">
              <img
                className="portfolioD-image"
                src={imageSrc}
                alt={data.title ?? "portfolio"}
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "https://via.placeholder.com/1200x900?text=No+Image";
                }}
              />

              <div className="portfolioD-badges">
                <span className="portfolioD-badge">{categoryTitle}</span>
                {data.designerId != null ? (
                  <span className="portfolioD-badge portfolioD-badge--light">
                    طراح #{data.designerId}
                  </span>
                ) : null}
              </div>
            </div>

            {/* LEFT: INFO */}
            <div className="portfolioD-info">
              <div className="portfolioD-section">
                <div className="portfolioD-label">توضیحات</div>
                <div className="portfolioD-value">
                  {data.description?.trim() ? data.description : "—"}
                </div>
              </div>

              <div className="portfolioD-row">
                <div className="portfolioD-chip">
                  <span className="portfolioD-chipKey">آیدی نمونه‌کار:</span>
                  <span className="portfolioD-chipVal">{data.id}</span>
                </div>

                <div className="portfolioD-chip">
                  <span className="portfolioD-chipKey">آیدی دسته‌بندی:</span>
                  <span className="portfolioD-chipVal">
                    {data.categoryId ?? "—"}
                  </span>
                </div>

                <div className="portfolioD-chip">
                  <span className="portfolioD-chipKey">آیدی طراح:</span>
                  <span className="portfolioD-chipVal">
                    {data.designerId ?? "—"}
                  </span>
                </div>
              </div>

              <div className="portfolioD-section">
                <div className="portfolioD-label">لوکیشن</div>
                <div className="portfolioD-value">
                  {data.location?.trim() ? data.location : "—"}
                </div>
              </div>

              <div className="portfolioD-section">
                <div className="portfolioD-label">بیوگرافی</div>
                <div className="portfolioD-value">
                  {data.biography?.trim() ? data.biography : "—"}
                </div>
              </div>

              <div className="portfolioD-section">
                <div className="portfolioD-label">تخصص</div>
                <div className="portfolioD-value">
                  {data.expertise?.trim() ? data.expertise : "—"}
                </div>
              </div>

              <div className="portfolioD-actions">
                {data.imageUrl ? (
                  <a
                    className="portfolioD-openImage"
                    href={data.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    title="باز کردن تصویر"
                  >
                    باز کردن تصویر ⤴
                  </a>
                ) : (
                  <span className="portfolioD-openImage portfolioD-openImage--disabled">
                    تصویری موجود نیست
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
