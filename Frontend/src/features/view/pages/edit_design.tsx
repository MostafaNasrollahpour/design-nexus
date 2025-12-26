import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPortfolioDetailsById, type PortfolioDetails } from "../API/profile_details_API";
import { updatePortfolio, deletePortfolio, type PortfolioEditDto } from "../API/edit_design_API";
import "../styles/edit_design.css";

declare function prettyAlert(message: string, type?: "success" | "error"): void;

export default function PortfolioEditPage() {
  const { id } = useParams<{ id: string }>();
  const portfolioId = Number(id);

  const [data, setData] = useState<PortfolioDetails | null>(null);
  const [inputs, setInputs] = useState<PortfolioEditDto & { imageFile?: File | null } | null>(null);
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    getPortfolioDetailsById(portfolioId, controller.signal)
      .then(res => {
        setData(res);
        setInputs({
          id: res.id,
          title: res.title,
          imageUrl: res.imageUrl,
          categoryId: res.categoryId,
          name: res.designerName,
          description: res.description,
          location: res.location,
          biography: res.biography,
          expertise: res.expertise,
          imageFile: null,
        });
      })
      .catch(err => {
        if (err.name !== "AbortError") {
          prettyAlert("خطا در دریافت داده‌ها", "error");
          console.error(err);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [portfolioId]);

  const handleChange = (field: keyof PortfolioEditDto, value: string | number | null) => {
    if (!inputs) return;
    setInputs({ ...inputs, [field]: value });
  };

  const handleEditToggle = (field: keyof PortfolioEditDto) => {
    setEditing(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleImageChange = (file: File | null) => {
    if (!file || !inputs) return;
    setInputs({ ...inputs, imageFile: file, imageUrl: URL.createObjectURL(file) });
  };

  const handleSubmit = async () => {
    if (!inputs) return;
    if (!inputs.title || !inputs.imageUrl || !inputs.categoryId) {
      prettyAlert("عنوان، تصویر و دسته‌بندی نمی‌توانند خالی باشند.", "error");
      return;
    }

    try {
      // ارسال داده‌ها به سرور
      const formData = new FormData();
      formData.append("title", inputs.title);
      formData.append("categoryId", String(inputs.categoryId));
      if (inputs.name) formData.append("name", inputs.name);
      if (inputs.description) formData.append("description", inputs.description);
      if (inputs.location) formData.append("location", inputs.location);
      if (inputs.biography) formData.append("biography", inputs.biography);
      if (inputs.expertise) formData.append("expertise", inputs.expertise);
      if (inputs.imageFile) formData.append("image", inputs.imageFile);

      await updatePortfolio(inputs); // فرض می‌کنیم API FormData می‌پذیرد
      prettyAlert("ویرایش با موفقیت انجام شد", "success");
    } catch (err: any) {
      prettyAlert(err?.message || "خطا در بروزرسانی نمونه‌کار", "error");
    }
  };

  const handleDelete = () => setShowDeleteConfirm(true);

  const confirmDelete = async () => {
    if (!data) return;
    try {
      await deletePortfolio(data.id);
      prettyAlert("نمونه‌کار حذف شد", "success");
      window.location.href = "/";
    } catch (err: any) {
      prettyAlert(err?.message || "خطا در حذف نمونه‌کار", "error");
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const cancelDelete = () => setShowDeleteConfirm(false);

  if (loading || !inputs) {
    return <div className="portfolioEdit-layout">در حال دریافت داده‌ها...</div>;
  }

  return (
    <div className="portfolioEdit-layout">
      <div className="portfolioEdit-card">
        <div className="portfolioEdit-header">
          <h2 className="portfolioEdit-title">ویرایش نمونه‌کار</h2>
          <div className="portfolioEdit-headerActions">
            <Link className="portfolioEdit-backBtn" to={-1 as any}>بازگشت</Link>
            <Link className="portfolioEdit-homeBtn" to="/">صفحه اصلی</Link>
          </div>
        </div>

        <div className="portfolioEdit-grid">
          {/* تصویر */}
          <div className="portfolioEdit-imageContainer">
            <img
              className="portfolioEdit-image"
              src={inputs.imageUrl || "https://via.placeholder.com/800x600?text=No+Image"}
              alt={inputs.title || "portfolio"}
            />
            <label className="portfolioEdit-imageLabel">
              تغییر عکس
              <input
                type="file"
                accept="image/*"
                onChange={e => handleImageChange(e.target.files ? e.target.files[0] : null)}
                hidden
              />
            </label>
          </div>

          {/* اطلاعات */}
          <div className="portfolioEdit-info">
            {([
              { key: "title", label: "عنوان طرح", type: "text" },
              { key: "name", label: "طراح", type: "text" },
              { key: "biography", label: "بیوگرافی", type: "text" },
              { key: "location", label: "لوکیشن", type: "text" },
              { key: "expertise", label: "تخصص", type: "text" },
              { key: "description", label: "درباره طرح", type: "text" },
            ] as const).map(field => (
              <div className="portfolioEdit-section" key={field.key}>
                <label className="portfolioEdit-label">{field.label}</label>
                <input
                  type={field.type}
                  className="portfolioEdit-input"
                  readOnly={!editing[field.key]}
                  placeholder={(data as any)[field.key] ?? ""}
                  value={(inputs as any)[field.key] ?? ""}
                  onChange={e => handleChange(field.key, e.target.value)}
                />
                <button
                  className="portfolioEdit-editBtn"
                  type="button"
                  onClick={() => handleEditToggle(field.key)}
                  title={editing[field.key] ? "غیر فعال کردن ویرایش" : "ویرایش"}
                >
                  ✎
                </button>
              </div>
            ))}

            {/* دکمه‌های ذخیره و حذف */}
            <div className="portfolioEdit-actions">
              <button className="portfolioEdit-submitBtn" onClick={handleSubmit}>
                ذخیره
              </button>
              <button className="portfolioEdit-deleteBtn" onClick={handleDelete}>
                حذف
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal تایید حذف */}
      {showDeleteConfirm && (
        <div className="portfolioEdit-modal">
          <div className="portfolioEdit-modalContent">
            <p>آیا مطمئن هستید که می‌خواهید این نمونه‌کار حذف شود؟</p>
            <div className="portfolioEdit-modalActions">
              <button onClick={confirmDelete} className="portfolioEdit-confirmBtn">بله</button>
              <button onClick={cancelDelete} className="portfolioEdit-cancelBtn">خیر</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
