import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/verify_email_page.css";
import design_img from "../../../shared/assets/design_img.png";


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
  const [fullName, setFullName] = useState<string>("");
  const [role, setRole] = useState<string>("کاربر");

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(300);

  /* ---------------------- Load Email + FullName + Role ---------------------- */
  useEffect(() => {
    const stateEmail = (location.state as any)?.email as string | undefined;

    const savedEmail = localStorage.getItem("signupEmail");
    const savedFullName = localStorage.getItem("signupFullName");
    const savedRole = localStorage.getItem("signupRole");

    const finalEmail = stateEmail || savedEmail;

    if (!finalEmail) {
      setError("ایمیل کاربر یافت نشد. لطفاً دوباره ثبت‌نام کنید.");
      return;
    }

    setEmail(finalEmail);
    localStorage.setItem("signupEmail", finalEmail);

    if (savedFullName) setFullName(savedFullName);
    if (savedRole) setRole(savedRole);
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

    const otp = code.trim();
    if (!otp) {
      setError("کد تأیید را وارد کنید");
      return;
    }

    setLoading(true);

    const payload: VerifyPayload = { email, otp };

    try {
      const data = await verifyCode(payload);

      // ✅ FullName نهایی
      const nameToSave = fullName || data?.name || email.split("@")[0];

      // ✅ Role نهایی (از ثبت‌نام)
      const roleFromSignup = localStorage.getItem("signupRole") || role || "کاربر";

      // ✅ ذخیره مثل لاگین
      if (data?.token) localStorage.setItem("token", data.token);
      if (data?.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);

      localStorage.setItem("fullName", nameToSave);
      localStorage.setItem("userRole", roleFromSignup);

      // ✅ سازگار با refreshAccessToken قدیمی (user.token / user.refreshToken)
      localStorage.setItem(
        "user",
        JSON.stringify({
          Email: email,
          FullName: nameToSave,
          Role: roleFromSignup,
          token: data?.token,
          refreshToken: data?.refreshToken,
        })
      );

      // پاکسازی مقادیر موقت ثبت‌نام
      localStorage.removeItem("signupEmail");
      localStorage.removeItem("signupFullName");
      localStorage.removeItem("signupRole");

      // ✅ آپدیت Navbar بدون رفرش
      window.dispatchEvent(new Event("authChanged"));

      // ✅ برو Home
      navigate("/", { replace: true });
      // اگر Home روی /dashboard هست:
      // navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err instanceof Error) setError(err.message || "خطا در ارتباط با سرور");
      else setError("خطای ناشناخته‌ای رخ داد");
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
      if (err instanceof Error) setError(err.message || "خطا در ارسال کد جدید");
      else setError("خطای ناشناخته‌ای رخ داد");
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
