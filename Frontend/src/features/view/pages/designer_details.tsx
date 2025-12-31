// src/pages/DesignerDetailsPage.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getDesignerById } from "../API/designerAPI"; // ✅ فقط این API آماده برای نام
import { getDesignerDetailsById, getPortfoliosByDesignerId } from "../API/designer_details_API";
import type { DesignerDetails } from "../API/designer_details_API";
import type { PortfolioListItem } from "../API/category_view_API";
import "../styles/designer_details.css";

const CATEGORIES: Record<number, string> = {
  1: "اتاق خواب",
  2: "پذیرایی",
  3: "آشپزخانه",
  4: "اتاق کار",
  5: "عروسی و نامزدی",
  6: "جشن تولد",
  7: "کافی‌ شاپ و رستوران",
};

export default function DesignerDetailsPage() {
  const { designerId: designerIdParam } = useParams<{ designerId: string }>();
  const designerId = Number(designerIdParam);

  const [designer, setDesigner] = useState<DesignerDetails | null>(null);
  const [portfolios, setPortfolios] = useState<PortfolioListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    const fetchData = async () => {
      try {
        // اطلاعات کامل طراح
        const designerData = await getDesignerDetailsById(designerId, controller.signal);

        // اگر نام طراح نیاز به API جدا داشت
        const designerName = await getDesignerById(designerId, controller.signal); // ✅ فقط نام
        designerData.name = designerName.name;

        setDesigner(designerData);

        // تمام پورتفولیوهای طراح
        const portfoliosData = await getPortfoliosByDesignerId(designerId, controller.signal);
        setPortfolios(portfoliosData);
      } catch (err: any) {
        if (err.name !== "AbortError") setError(err.message || "خطا در دریافت اطلاعات");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [designerId]);

  if (loading) return <div className="designer-details-layout">در حال بارگذاری...</div>;
  if (error) return <div className="designer-details-layout designer-alert">{error}</div>;
  if (!designer) return null;

  return (
    <div className="designer-details-layout">
      {/* Header */}
      <div className="designer-details-header">
        <img
          className="designer-details-image"
          src={designer.imageUrl || "https://via.placeholder.com/400x400?text=No+Image"}
          alt={designer.name}
        />
        <div className="designer-details-info">
          <h2 className="designer-details-name">{designer.name}</h2>
          <p className="designer-details-expertise"><strong>تخصص:</strong> {designer.expertise}</p>
          <p className="designer-details-location"><strong>لوکیشن:</strong> {designer.location}</p>
          <p className="designer-details-biography">{designer.biography}</p>
          <Link className="designer-backBtn" to="/designers">بازگشت به لیست طراحان</Link>
        </div>
      </div>

      {/* Portfolio */}
      <h3 className="designer-portfolio-title">نمونه‌کارها</h3>
      <div className="designer-portfolio-grid">
        {portfolios.map(p => (
          <div key={p.id} className="designer-portfolio-card">
            <div className="portfolio-imageWrap">
              <img
                src={p.imageUrl || "https://via.placeholder.com/300x200?text=No+Image"}
                alt={p.title}
                loading="lazy"
              />
              <div className="portfolio-badge">{CATEGORIES[p.categoryId ?? 0] || "نامشخص"}</div>
            </div>
            <div className="portfolio-body">
              <div className="portfolio-title">{p.title}</div>
              <div className="portfolio-designer">طراح: {designer.name}</div>
            </div>
            <Link className="portfolio-viewBtn" to={`/portfolio/${p.id}`}>مشاهده</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
