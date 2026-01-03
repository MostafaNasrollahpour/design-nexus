// pages/OrderFormPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "../styles/order_form.css";
import FloatingMessage from "../components/floating_alert";
import { submitOrder } from "../API/orderAPI";

const CATEGORIES = [
  { id: 1, title: "اتاق خواب" },
  { id: 2, title: "پذیرایی" },
  { id: 3, title: "آشپزخانه" },
  { id: 4, title: "اتاق کار" },
  { id: 5, title: "عروسی و نامزدی" },
  { id: 6, title: "جشن تولد" },
  { id: 7, title: "کافی شاپ و رستوران" },
] as const;

interface FormData {
  name: string;
  email: string;
  title: string;
  categoryId: number;
  budget: number;
  address: string;
  deadline: string;
  description: string;
}

export default function OrderFormPage() {
  const navigate = useNavigate();
  const { designerId } = useParams<{ designerId: string }>();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    title: "",
    categoryId: 0,
    budget: 0,
    address: "",
    deadline: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [floatingMsg, setFloatingMsg] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // بررسی لاگین و پر کردن نام و ایمیل
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setFloatingMsg({
        type: "error",
        message: "لطفاً ابتدا وارد حساب کاربری خود شوید.",
      });
      navigate("/login");
      return;
    }

    setIsLoggedIn(true);

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setFormData((prev) => ({
      ...prev,
      name: user.FullName || "",
      email: user.Email || "",
    }));
  }, [navigate]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "categoryId" || name === "budget" ? Number(value) : value,
    }));
  };

  const handleSubmit = async () => {
  if (
    !formData.title ||
    !formData.categoryId ||
    !formData.budget ||
    !formData.address ||
    !formData.deadline ||
    !formData.description
  ) {
    setError("لطفاً همه فیلدها را پر کنید.");
    return;
  }

  setError("");
  setLoading(true);

  try {
    const numericDesignerId = designerId ? Number(designerId) : undefined;

    await submitOrder({
      title: formData.title,
      categoryId: formData.categoryId,
      budget: formData.budget,
      address: formData.address,
      deadline: new Date(formData.deadline), // ← تبدیل به Date
      description: formData.description,
      designerId: numericDesignerId,
    });

    setFloatingMsg({
      type: "success",
      message: "سفارش شما با موفقیت ثبت شد!",
    });

    setFormData((prev) => ({
      ...prev,
      title: "",
      categoryId: 0,
      budget: 0,
      address: "",
      deadline: "",
      description: "",
    }));
  } catch (err: any) {
    setFloatingMsg({
      type: "error",
      message: err.message || "خطا در ثبت سفارش",
    });
  } finally {
    setLoading(false);
  }
};


  if (!isLoggedIn) return null;

  return (
    <div className="order-form-layout">
      {floatingMsg && (
        <FloatingMessage
          type={floatingMsg.type}
          message={floatingMsg.message}
          onClose={() => setFloatingMsg(null)}
        />
      )}

      <button className="order-back-btn-left" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
      </button>

      <h2 className="order-form-title">ثبت سفارش جدید</h2>

      {error && <div className="form-error">{error}</div>}

      <div className="order-form">
        <label>
          نام:
          <input type="text" value={formData.name} readOnly />
        </label>

        <label>
          ایمیل:
          <input type="email" value={formData.email} readOnly />
        </label>

        <label>
          عنوان سفارش:
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />
        </label>

        <label>
          دسته‌بندی:
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
          >
            <option value={0}>انتخاب کنید</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>

        <label>
          بودجه (تومان):
          <input
            type="number"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
          />
        </label>

        <label>
          آدرس:
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </label>

        <label>
          ددلاین:
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
          />
        </label>

        <label>
          توضیحات:
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </label>

        <button
          className="order-submit-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "در حال ارسال..." : "ثبت سفارش"}
        </button>
      </div>
    </div>
  );
}
