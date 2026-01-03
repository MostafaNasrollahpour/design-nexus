import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "../styles/order_form.css";
import FloatingMessage from "../components/floating_alert";

const CATEGORIES = [
  "اتاق خواب",
  "پذیرایی",
  "آشپزخانه",
  "اتاق کار",
  "عروسی و نامزدی",
  "جشن تولد",
  "کافی‌ شاپ و رستوران",
];

export default function OrderFormPage() {
  const navigate = useNavigate();
  const { designerId } = useParams<{ designerId: string }>();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    title: "",
    category: "",
    budget: "",
    address: "",
    deadline: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [floatingMsg, setFloatingMsg] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // بررسی ورود کاربر و پر کردن نام و ایمیل
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setFloatingMsg({ type: "error", message: "لطفاً ابتدا وارد حساب کاربری خود شوید." });
      navigate("/login");
      return;
    }
    setIsLoggedIn(true);

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const name = user.FullName || "";
    const email = user.Email || "";
    setFormData((prev) => ({ ...prev, name, email }));
  }, [navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setFloatingMsg({ type: "error", message: "لطفاً ابتدا وارد حساب کاربری خود شوید." });
      navigate("/login");
      return;
    }

    const emptyField = Object.entries(formData).find(([_, value]) => value === "");
    if (emptyField) {
      setError("لطفاً همه فیلدها را پر کنید.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`https://your-api.com/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, designerId }),
      });

      if (!res.ok) throw new Error("خطا در ارسال سفارش");

      setFloatingMsg({ type: "success", message: "سفارش شما با موفقیت ثبت شد!" });
      setFormData({
        name: formData.name,
        email: formData.email,
        title: "",
        category: "",
        budget: "",
        address: "",
        deadline: "",
        description: "",
      });
    } catch (err: any) {
      setFloatingMsg({ type: "error", message: err.message || "خطا در ثبت سفارش" });
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
          <input
            type="text"
            name="name"
            value={formData.name}
            readOnly
            className="readonly-input"
          />
        </label>

        <label>
          ایمیل:
          <input
            type="email"
            name="email"
            value={formData.email}
            readOnly
            className="readonly-input"
          />
        </label>

        <label>
          عنوان سفارش:
          <input type="text" name="title" value={formData.title} onChange={handleChange} />
        </label>

        <label>
          دسته‌بندی:
          <select name="category" value={formData.category} onChange={handleChange}>
            <option value="">انتخاب کنید</option>
            {CATEGORIES.map((c, idx) => (
              <option key={idx} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label>
          بودجه (تومان):
          <input type="number" name="budget" value={formData.budget} onChange={handleChange} />
        </label>

        <label>
          آدرس:
          <input type="text" name="address" value={formData.address} onChange={handleChange} />
        </label>

        <label>
          ددلاین:
          <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} />
        </label>

        <label>
          توضیحات:
          <textarea name="description" value={formData.description} onChange={handleChange}></textarea>
        </label>

       <button
  className="order-submit-btn"
  onClick={handleSubmit}
  disabled={loading} // اینجا دکمه هنگام ارسال غیر فعال است
>
  {loading ? "در حال ارسال..." : "ثبت سفارش"}
</button>

      </div>
    </div>
  );
}
