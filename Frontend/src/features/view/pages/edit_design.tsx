import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Pencil, ArrowLeft } from "lucide-react";

import {
  getPortfolioDetailsById,
  type PortfolioDetails,
} from "../API/profile_details_API";

import {
  updatePortfolio,
  deletePortfolio,
  type PortfolioEditDto,
} from "../API/edit_design_API";

import CategoryDropdown from "../components/category_dropdown";
import Alert from "../components/alert";

import "../styles/edit_design.css";

/* ---------- Categories ---------- */
const CATEGORIES = [
  { id: 1, title: "اتاق خواب" },
  { id: 2, title: "پذیرایی" },
  { id: 3, title: "آشپزخانه" },
  { id: 4, title: "اتاق کار" },
  { id: 5, title: "عروسی و نامزدی" },
  { id: 6, title: "جشن تولد" },
  { id: 7, title: "کافی‌ شاپ و رستوران" },
];

export default function PortfolioEditPage() {
  const { id } = useParams<{ id: string }>();
  const portfolioId = Number(id);

  const [data, setData] = useState<PortfolioDetails | null>(null);
  const [inputs, setInputs] = useState<PortfolioEditDto | null>(null);
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  /* ---------- Dirty state ---------- */
  const [isDirty, setIsDirty] = useState(false);

  /* ---------- Alert ---------- */
  const [alert, setAlert] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showAlert = (
    message: string,
    type: "success" | "error" = "success"
  ) => setAlert({ message, type });

  /* ---------- Fetch data ---------- */
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    getPortfolioDetailsById(portfolioId, controller.signal)
      .then(res => {
        setData(res);
        setInputs({
          id: res.id,
          title: res.title || "",
          categoryId: res.categoryId ?? 0,
          description: res.description || "",
          imageUrl: res.imageUrl || "",
          imageFile: null,
        });
        setIsDirty(false); // مهم
      })
      .catch(err => {
        if (err.name !== "AbortError") {
          showAlert("خطا در دریافت داده‌ها", "error");
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [portfolioId]);

  /* ---------- Handlers ---------- */
  const handleChange = (
    field: keyof PortfolioEditDto,
    value: string | number | null
  ) => {
    if (!inputs) return;

    setInputs(prev => {
      if (!prev) return prev;
      if (!isDirty) setIsDirty(true);
      return { ...prev, [field]: value };
    });
  };

  const handleEditToggle = (field: keyof PortfolioEditDto) => {
    setEditing(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleImageChange = (file: File | null) => {
    if (!file || !inputs) return;

    setInputs(prev => {
      if (!prev) return prev;
      if (!isDirty) setIsDirty(true);

      return {
        ...prev,
        imageFile: file,
        imageUrl: URL.createObjectURL(file),
      };
    });
  };

  /* ---------- Submit ---------- */
  const handleSubmit = async () => {
    if (!inputs) return;

    if (!inputs.title || !inputs.imageUrl || !inputs.categoryId) {
      showAlert("عنوان، تصویر و دسته‌بندی نمی‌توانند خالی باشند.", "error");
      return;
    }

    try {
      await updatePortfolio(inputs);
      showAlert("ویرایش با موفقیت انجام شد");
      setIsDirty(false); // 🔒 دوباره disable
    } catch (err: any) {
      showAlert(err?.message || "خطا در بروزرسانی نمونه‌کار", "error");
    }
  };

  /* ---------- Delete ---------- */
  const confirmDelete = async () => {
    if (!data) return;

    try {
      await deletePortfolio(data.id);
      showAlert("نمونه‌کار حذف شد");
      window.location.href = "/";
    } catch (err: any) {
      showAlert(err?.message || "خطا در حذف نمونه‌کار", "error");
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  if (loading || !inputs) {
    return <div className="portfolioEdit-layout">در حال دریافت داده‌ها...</div>;
  }

  const selectedCategory = CATEGORIES.find(
    c => c.id === inputs.categoryId
  );

  return (
    <div className="portfolioEdit-layout">
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="portfolioEdit-card">
        {/* ---------- Header ---------- */}
        <div className="portfolioEdit-header">
          <h2 className="portfolioEdit-title">ویرایش نمونه‌کار</h2>

          <Link to={-1 as any} className="portfolioEdit-iconBackBtn">
            <ArrowLeft size={20} />
          </Link>
        </div>

        <div className="portfolioEdit-grid">
          {/* ---------- Image ---------- */}
          <div className="portfolioEdit-imageContainer">
            <img
              className="portfolioEdit-image"
              src={
                inputs.imageUrl ||
                "https://via.placeholder.com/800x600?text=No+Image"
              }
              alt={inputs.title || "portfolio"}
            />

            <label className="portfolioEdit-imageLabel">
              تغییر عکس
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={e =>
                  handleImageChange(
                    e.target.files ? e.target.files[0] : null
                  )
                }
              />
            </label>
          </div>

          {/* ---------- Info ---------- */}
          <div className="portfolioEdit-info">
            {/* Title */}
            <div className="portfolioEdit-section">
              <label className="portfolioEdit-label">عنوان طرح</label>
              <input
                className="portfolioEdit-input"
                readOnly={!editing.title}
                value={inputs.title}
                onChange={e => handleChange("title", e.target.value)}
              />
              <button
                className="portfolioEdit-editBtn"
                onClick={() => handleEditToggle("title")}
              >
                <Pencil size={15} />
              </button>
            </div>

            {/* Category */}
            <div className="portfolioEdit-section">
              <label className="portfolioEdit-label">دسته‌بندی</label>

              {!editing.categoryId ? (
                <input
                  className="portfolioEdit-input"
                  readOnly
                  value={selectedCategory?.title || ""}
                />
              ) : (
                <CategoryDropdown
                  value={inputs.categoryId}
                  onChange={id => {
                    handleChange("categoryId", id);
                    handleEditToggle("categoryId");
                  }}
                />
              )}

              <button
                className="portfolioEdit-editBtn"
                onClick={() => handleEditToggle("categoryId")}
              >
                <Pencil size={15} />
              </button>
            </div>

            {/* Description */}
            <div className="portfolioEdit-section">
              <label className="portfolioEdit-label">درباره طرح</label>
              <textarea
                className="portfolioEdit-input"
                style={{ height: 120 }}
                readOnly={!editing.description}
                value={inputs.description}
                onChange={e =>
                  handleChange("description", e.target.value)
                }
              />
              <button
                className="portfolioEdit-editBtn"
                onClick={() => handleEditToggle("description")}
              >
                <Pencil size={15} />
              </button>
            </div>

            {/* Actions */}
            <div className="portfolioEdit-actions">
              <button
                className="portfolioEdit-submitBtn"
                onClick={handleSubmit}
                disabled={!isDirty}
                style={{
                  opacity: !isDirty ? 0.5 : 1,
                  cursor: !isDirty ? "not-allowed" : "pointer",
                }}
              >
                ذخیره
              </button>

              <button
                className="portfolioEdit-deleteBtn"
                onClick={() => setShowDeleteConfirm(true)}
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Delete Modal ---------- */}
      {showDeleteConfirm && (
        <div className="portfolioEdit-modal">
          <div className="portfolioEdit-modalContent">
            <p>آیا مطمئن هستید که می‌خواهید این نمونه‌کار حذف شود؟</p>
            <div className="portfolioEdit-modalActions">
              <button
                className="portfolioEdit-confirmBtn"
                onClick={confirmDelete}
              >
                بله
              </button>
              <button
                className="portfolioEdit-cancelBtn"
                onClick={() => setShowDeleteConfirm(false)}
              >
                خیر
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
