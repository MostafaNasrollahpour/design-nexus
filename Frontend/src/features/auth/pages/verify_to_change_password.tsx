import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/verify_to_change_password.css";
import design_img from "../../../shared/assets/design_img.png";

import logoImg from "../../../shared/assets/design_img.png";


import {
  verifyCodeToChangePassword,
  type VerifyPayload,
  type ResendCodePayload,
  resendCodeToChangePassword,
} from "../API/authAPI";

export default function VerifyToChangePassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(300);

  useEffect(() => {
    const stateEmail = (location.state as any)?.email;
    const savedEmail = localStorage.getItem("userEmailToChangePass");

    if (stateEmail) {
      setEmail(stateEmail);
      localStorage.setItem("userEmailToChangePass", stateEmail);
    } else if (savedEmail) {
      setEmail(savedEmail);
    } else {
      setError("ایمیل کاربر یافت نشد. لطفاً دوباره ثبت‌نام کنید.");
    }
  }, [location.state]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

    try {
      setLoading(true);

      const payload: VerifyPayload = { email, otp: code };
      const data = await verifyCodeToChangePassword(payload);

      localStorage.setItem(
        "user",
        JSON.stringify({
          email,
          name: data?.name ?? email.split("@")[0],
          token: data?.token,
        })
      );
      localStorage.setItem("otp", code);
      localStorage.setItem("reset_email", email);
      localStorage.removeItem("userEmailToChangePass");

      navigate("/change-password");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("ایمیل کاربر مشخص نیست.");
      return;
    }

    setResendLoading(true);
    setError("");

    const payload: ResendCodePayload = { email };

    try {
      await resendCodeToChangePassword(payload);
      setResendTimer(300);
    } catch (err: any) {
      setError(err?.message || "خطا در ارسال کد جدید");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="verify-container">
      <form className="verify-card" onSubmit={handleSubmit}>
        <div
          className="card-background"
          style={{ backgroundImage: `url(${logoImg})` }}
        />
        <div className="card-content">
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

          <button className="verify-button" type="submit" disabled={loading}>
            {loading ? "در حال بررسی..." : "تأیید"}
          </button>

          <div className="resend-container">
            <span className="resend-timer">
              {Math.floor(resendTimer / 60)
                .toString()
                .padStart(2, "0")}
              :
              {(resendTimer % 60).toString().padStart(2, "0")}
            </span>

            <button
              type="button"
              className="resend-button"
              onClick={handleResend}
              disabled={resendLoading || resendTimer > 0}
            >
              {resendLoading ? "در حال ارسال..." : "ارسال مجدد کد"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
