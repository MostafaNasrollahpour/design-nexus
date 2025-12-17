import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/verify_email_page.css";
import design_img from "../assets/design_img.png";

import {
  verifyCode,
  resendVerificationCode,
  type VerifyPayload,
  type ResendCodePayload,
} from "../API/authAPI";

export default function VerifyCodePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>(""); // ✅ اضافه شد

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(300);

  /* ---------------------- Load Email + FullName ---------------------- */
  useEffect(() => {
    const stateEmail = (location.state as any)?.email;
    const savedEmail = localStorage.getItem("signupEmail");

    if (stateEmail) {
      setEmail(stateEmail);
      localStorage.setItem("signupEmail", stateEmail);
    } else if (savedEmail) {
      setEmail(savedEmail);
    } else {
      setError("ایمیل کاربر یافت نشد. لطفاً دوباره ثبت‌نام کنید.");
    }

    // ✅ فول نیم ثبت‌نام شده (از SignupPage)
    const savedFullName = localStorage.getItem("signupFullName");
    if (savedFullName) setFullName(savedFullName);
  }, [location.state]);

  /* ---------------------- Timer Logic ---------------------- */
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  /* ---------------------- Submit Verify Code ---------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("ایمیل کاربر مشخص نیست.");
      return;
    }

    if (!code.trim()) {
      setError("کد تأیید را وارد کنید");
      return;
    }

    setLoading(true);

    const payload: VerifyPayload = { email, otp: code };

    try {
      const data = await verifyCode(payload);

      // ✅ دقیقاً مثل لاگین: ذخیره token + fullName
      const nameToSave = fullName || data?.name || email.split("@")[0];

      if (data?.token) localStorage.setItem("token", data.token);
      if (nameToSave) localStorage.setItem("fullName", nameToSave);

      // ✅ برای سازگاری با refreshAccessToken فعلی خودت (که user.token می‌خونه)
      localStorage.setItem(
        "user",
        JSON.stringify({
          Email: email,
          FullName: nameToSave,
          token: data?.token,
          refreshToken: data?.refreshToken,
        })
      );

      localStorage.removeItem("signupEmail");
      localStorage.removeItem("signupFullName");

      // ✅ خیلی مهم: تا Navbar بدون رفرش آپدیت شه
      window.dispatchEvent(new Event("authChanged"));

      // ✅ برو Home
      navigate("/", { replace: true });
      // اگر Home رو روی /dashboard داری:
      // navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "خطا در ارتباط با سرور");
      } else {
        setError("خطای ناشناخته‌ای رخ داد");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------- Resend Code ---------------------- */
  const handleResend = async () => {
    if (!email) {
      setError("ایمیل کاربر مشخص نیست.");
      return;
    }

    setResendLoading(true);
    setError("");

    const payload: ResendCodePayload = { email };

    try {
      await resendVerificationCode(payload);
      setResendTimer(300);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "خطا در ارسال کد جدید");
      } else {
        setError("خطای ناشناخته‌ای رخ داد");
      }
    } finally {
      setResendLoading(false);
    }
  };

  /* ---------------------- Format Timer ---------------------- */
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="verify-container">
      <form className="verify-card" onSubmit={handleSubmit}>
        <img src={design_img} className="verify-image" alt="design" />

        <h3 className="verify-title">کد تأیید را وارد کنید</h3>

        <p className="verify-subtitle">
          {email
            ? `کدی که به ایمیل ${email} ارسال شده را وارد کنید`
            : "کدی که به ایمیل شما ارسال شده را وارد کنید"}
        </p>

        {error && <p className="verify-error">{error}</p>}

        <input
          className="verify-input"
          type="text"
          placeholder="کد تأیید"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <button className="verify-button" disabled={loading}>
          {loading ? "در حال بررسی..." : "تأیید"}
        </button>

        <div className="resend-container">
          <span className="resend-timer">{formatTime(resendTimer)}</span>

          <button
            type="button"
            className="resend-button"
            onClick={handleResend}
            disabled={resendLoading || resendTimer > 0}
          >
            {resendLoading ? "در حال ارسال..." : "ارسال مجدد کد"}
          </button>
        </div>
      </form>
    </div>
  );
}
