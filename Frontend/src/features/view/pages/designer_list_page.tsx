import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllDesigners, getPortfoliosByCategoryId } from "../API/designer_list_API";
import type {DesignerItem} from "../API/designer_list_API"
import "../styles/designer_list_page.css";
import { MdLocationOn } from "react-icons/md";


export default function DesignerListPage() {
  const [designers, setDesigners] = useState<DesignerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    const fetchDesigners = async () => {
      try {
        const data = await getAllDesigners(controller.signal);

        // پر کردن نام هر طراح با اولین پورتفولیو (یا خالی)
        const designersWithNames = await Promise.all(
          data.map(async designer => {
            const portfolios = await getPortfoliosByCategoryId(designer.id, controller.signal);
            return {
              ...designer,
              name: portfolios[0]?.title || `Designer ${designer.id}`,
            };
          })
        );

        setDesigners(designersWithNames);
      } catch (err: any) {
        if (err.name !== "AbortError") setError(err.message || "خطا در دریافت اطلاعات");
      } finally {
        setLoading(false);
      }
    };

    fetchDesigners();

    return () => controller.abort();
  }, []);

  return (
    <div className="designer-panel-layout">
      <div className="designer-panel-content">
        <div className="designer-panel-card">
          <div className="designer-header">
            <h2 className="designer-title">فهرست طراحان</h2>
            <Link className="designer-backBtn" to="/">بازگشت به صفحه اصلی</Link>
          </div>

          {error && <div className="designer-alert designer-alert--error">{error}</div>}

          <div className="designer-grid">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={`skeleton-${i}`} className="designer-card designer-card--skeleton">
                    <div className="designer-imageWrap">
                      <div className="designer-image skeleton-box" />
                    </div>
                    <div className="designer-body">
                      <div className="skeleton-line w-70" />
                      <div className="skeleton-line w-60" />
                      <div className="skeleton-line w-80" />
                    </div>
                  </div>
                ))
              : designers.map(d => (
                  <div key={d.id} className="designer-card">
                    <div className="designer-imageWrap">
                      <img
                        className="designer-image"
                        src={d.imageUrl || "https://via.placeholder.com/600x340?text=No+Image"}
                        alt={d.name}
                        loading="lazy"
                      />
                    </div>

                    <div className="designer-body">
                      <div className="designer-nameRow">
                        <div className="designer-name">{d.name}</div>
                      </div>

<div className="designer-location">
  <MdLocationOn style={{ color: "red"}} />
  {d.location}
</div>

                    </div>

                    <div className="designer-actions">
                      <Link className="designer-viewBtn" to={`/designer-details/${d.id}`}>
                        مشاهده بیشتر
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
