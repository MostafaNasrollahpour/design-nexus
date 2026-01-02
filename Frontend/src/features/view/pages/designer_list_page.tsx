import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllDesigners, getDesignerNameById } from "../API/designer_list_API";
import type { DesignerItem } from "../API/designer_list_API";
import "../styles/designer_list_page.css";
import { MdLocationOn } from "react-icons/md";
import { MdArrowBack } from "react-icons/md";

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

      // گرفتن نام هر طراح به صورت جداگانه
      const designersWithNames = await Promise.all(
        data.map(async (d) => {
          const name = await getDesignerNameById(d.id, controller.signal);
          return {
            ...d,
            name: name || `Designer ${d.id}`,
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
            <Link className="designer-backBtn" to="/">
              <MdArrowBack size={78} />
            </Link>
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
              : designers.map((d) => (
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
                        <MdLocationOn style={{ color: "red", fontSize: "20px", verticalAlign: "middle" }} />
                        <span style={{ verticalAlign: "middle" }}>{d.location || "بدون لوکیشن"}</span>
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
