import { useState, type ChangeEvent, type FormEvent, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "../styles/login_page.css";
import design_img from "../../../shared/assets/design_img.png";
import { loginUser } from "../API/authAPI";
import { isLoggedIn, persistAuth } from "../utils/authStorage";

interface LoginFormState {
  email: string;
  password: string;
}

interface FieldErrors {
  email: boolean;
  password: boolean;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState<LoginFormState>({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({ email: false, password: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // اگر لاگین هست، نبرش توی لاگین
  useEffect(() => {
    if (isLoggedIn()) navigate("/", { replace: true });
  }, [navigate]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: false }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const newErrors: FieldErrors = {
      email: form.email.trim() === "",
      password: form.password.trim() === "",
    };

    setFieldErrors(newErrors);
    if (newErrors.email || newErrors.password) {
      setError("لطفاً همه فیلدها را پر کنید");
      return;
    }

    setLoading(true);
    try {
      const data = await loginUser({ email: form.email, password: form.password });

      // ✅ ذخیره استاندارد + event
      persistAuth({
        token: data.Token,
        refreshToken: data.RefreshToken,
        user: data.User,
        fullName: data.User.FullName,
      });

      // ✅ برگشت به مقصد قبلی (مثلا /panel) یا پیش‌فرض /
      const from = (location.state as any)?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof Error) setError(err.message || "خطایی رخ داده است");
      else setError("خطای ناشناخته‌ای رخ داده است");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <img src={design_img} className="design_image" alt="design" />

        {error && <p className="login-error">{error}</p>}

        <input
          className={`login-input ${fieldErrors.email ? "input-error" : ""}`}
          type="email"
          name="email"
          placeholder="ایمیل"
          value={form.email}
          onChange={handleChange}
        />

        <input
          className={`login-input ${fieldErrors.password ? "input-error" : ""}`}
          type="password"
          name="password"
          placeholder="رمز عبور"
          value={form.password}
          onChange={handleChange}
        />

        <p className="forget-link">
          <Link to="/forgot-password">فراموشی رمز عبور</Link>
        </p>

        <button className="login-button" disabled={loading}>
          {loading ? "لطفا صبر کنید..." : "ورود"}
        </button>

        <p className="login-link">
          حساب ندارید؟ <Link to="/signup">ثبت‌نام کنید</Link>
        </p>
      </form>
    </div>
  );
}
