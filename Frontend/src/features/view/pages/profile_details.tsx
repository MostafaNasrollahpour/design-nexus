import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

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
    data?.imageUrl || "https://via.placeholder.com/800x600?text=No+Image";

  return (
    <div className="portfolioD-layout">
      <div className="portfolioD-card">
        {/* ---------- Header ---------- */}
        <div className="portfolioD-header">
          <div className="portfolioD-headerText">
            <h2 className="portfolioD-title">
              {loading ? "در حال دریافت..." : data?.title || "جزئیات نمونه‌کار"}
            </h2>
          </div>

          {/* ---------- Back Button with Icon ---------- */}
          <Link to={-1 as any} className="portfolioD-iconBackBtn">
            <ArrowLeft size={20} />
          </Link>
        </div>

        {error && (
          <div className="portfolioD-alert portfolioD-alert--error">{error}</div>
        )}

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
        ) : data ? (
          <div className="portfolioD-grid">
            {/* RIGHT: BIG IMAGE */}
            <div className="portfolioD-imageContainer">
              <div className="portfolioD-imageBox">
                <img
                  className="portfolioD-image"
                  src={imageSrc}
                  alt={data.title ?? "portfolio"}
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://via.placeholder.com/800x600?text=No+Image";
                  }}
                />
              </div>
            </div>

            {/* LEFT: INFO */}
            <div className="portfolioD-info">
              <div className="portfolioD-infoContent">
                <div className="portfolioD-section">
                  <div className="portfolioD-label">طراح</div>
                  <div className="portfolioD-value">
                    {data.designerName?.trim() ? data.designerName : "—"}
                  </div>
                </div>

                <div className="portfolioD-section">
                  <div className="portfolioD-label">دسته بندی</div>
                  <div className="portfolioD-value">
                    {data.description?.trim() && data.categoryId != null
                      ? CATEGORY_TITLES[data.categoryId]
                      : "—"}
                  </div>
                </div>

                <div className="portfolioD-section">
                  <div className="portfolioD-label">درباره طرح</div>
                  <div className="portfolioD-value">
                    {data.description?.trim() ? data.description : "—"}
                  </div>
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
