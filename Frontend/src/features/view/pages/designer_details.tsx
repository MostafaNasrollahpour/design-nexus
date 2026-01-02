// src/pages/DesignerDetailsPage.tsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getDesignerDetailsById, getPortfoliosByDesignerId } from "../API/designer_details_API";
import type { DesignerDetails, PortfolioListItem } from "../API/designer_details_API";
import "../styles/designer_details.css";
import { ArrowLeft, MessageCircle } from "lucide-react";

const CATEGORIES: Record<number, string> = {
  1: "اتاق خواب",
  2: "پذیرایی",
  3: "آشپزخانه",
  4: "اتاق کار",
  5: "عروسی و نامزدی",
  6: "جشن تولد",
  7: "کافی‌ شاپ و رستوران",
};

type PageState = {
  loading: boolean;
  error: string | null;
  designer: DesignerDetails | null;
  portfolios: PortfolioListItem[];
};

export default function DesignerDetailsPage() {
  const { designerId } = useParams<{ designerId: string }>();
  const id = Number(designerId);
  const navigate = useNavigate();

  const [state, setState] = useState<PageState>({
    loading: true,
    error: null,
    designer: null,
    portfolios: [],
  });

  useEffect(() => {
    const controller = new AbortController();

    const fetchAll = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const designerData = await getDesignerDetailsById(id, controller.signal);
        const portfoliosData = await getPortfoliosByDesignerId(id, controller.signal);

        setState({
          loading: false,
          error: null,
          designer: designerData ?? null,
          portfolios: Array.isArray(portfoliosData) ? portfoliosData : [],
        });
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setState((prev) => ({ ...prev, loading: false, error: err.message || "خطا در دریافت اطلاعات" }));
        }
      }
    };

    fetchAll();
    return () => controller.abort();
  }, [id]);

  const safeValue = (value?: string | null) => (value && value.trim() ? value : "-");

  const { loading, error, designer, portfolios } = state;

  if (loading) return <div className="designer-details-layout">در حال بارگذاری...</div>;
  if (error) return <div className="designer-details-layout designer-alert">{error}</div>;
  if (!designer) return <div className="designer-details-layout">اطلاعات طراح موجود نیست</div>;

  return (
    <div className="designer-details-layout">
      {/* Header */}
      <div className="designer-details-header">
        <Link to="/designers" className="designer-back-icon" title="بازگشت به لیست طراحان">
          <ArrowLeft size={24} />
        </Link>

        <img
          className="designer-details-image"
          src={designer.imageUrl ?? "https://via.placeholder.com/400x400?text=No+Image"}
          alt={safeValue(designer.name)}
        />

        <div className="designer-details-info">
          <h2 className="designer-details-name">{safeValue(designer.name)}</h2>
          <p><strong>تخصص:</strong> {safeValue(designer.expertise)}</p>
          <p><strong>لوکیشن:</strong> {safeValue(designer.location)}</p>
          <p><strong>بیوگرافی:</strong> {safeValue(designer.biography)}</p>
        </div>
      </div>

      {/* Portfolio Section */}
      <div className="portfolio-section">
        <h3 className="designer-portfolio-title">نمونه‌کارها</h3>
        {portfolios.length > 0 ? (
          <div className="designer-portfolio-grid">
            {portfolios.map((p) => (
              <div key={p.id} className="designer-portfolio-card">
                <div className="portfolio-imageWrap">
                  <img
                    src={p.imageUrl ?? "https://via.placeholder.com/300x200?text=No+Image"}
                    alt={safeValue(p.title)}
                    loading="lazy"
                  />
                  <div className="portfolio-badge">
                    {CATEGORIES[p.categoryId ?? 0] ?? "نامشخص"}
                  </div>
                </div>
                <div className="portfolio-body">
                  <div className="portfolio-title">{safeValue(p.title)}</div>
                  <div className="portfolio-designer">طراح: {safeValue(designer.name)}</div>
                </div>
                <Link className="portfolio-viewBtn" to={`/portfolio/${p.id}`}>
                  مشاهده
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p>نمونه‌کار موجود نیست</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="designer-actions-wrapper">
        <div className="designer-actions">
          {/* دکمه ثبت سفارش */}
         <button
  className="btn btn-request"
  onClick={() => navigate(`/designer-details/${id}/order`)}
>
  ثبت درخواست
</button>


          {/* دکمه ارسال پیام */}
          <button className="btn btn-message">
            <MessageCircle size={18} /> ارسال پیام
          </button>
        </div>
      </div>
    </div>
  );
}
