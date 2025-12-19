import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../shared/components/navbar";
// import Footer from "../components/footer";

import "../styles/support_page.css";

type SupportCategory = "support" | "consulting" | "order";

type SupportPayload = {
  category: SupportCategory;
  subject: string;
  message: string;
  phone?: string;
  orderId?: string;
};

export default function SupportConsultPage() {
  const navigate = useNavigate();

  const userRaw = localStorage.getItem("user");
  const fullNameLS = localStorage.getItem("fullName") || "";

  const user = useMemo(() => {
    try {
      return userRaw ? JSON.parse(userRaw) : null;
    } catch {
      return null;
    }
  }, [userRaw]);

  const emailLS = user?.Email || "";

  const [form, setForm] = useState<SupportPayload>({
    category: "support",
    subject: "",
    message: "",
    phone: "",
    orderId: "",
  });

  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const canSend =
    form.subject.trim().length >= 3 &&
    form.message.trim().length >= 10 &&
    !sending;

  const submit = async () => {
    setError("");
    setOk("");

    const payload: SupportPayload = {
      category: form.category,
      subject: form.subject.trim(),
      message: form.message.trim(),
      phone: (form.phone || "").trim() || undefined,
      orderId: (form.orderId || "").trim() || undefined,
    };

    if (payload.subject.length < 3) {
      setError("موضوع باید حداقل ۳ کاراکتر باشد.");
      return;
    }
    if (payload.message.length < 10) {
      setError("متن پیام باید حداقل ۱۰ کاراکتر باشد.");
      return;
    }

    setSending(true);
    try {
      // اگر بک‌اند شما پشت همان دامنه است همین کافیست:
      // اگر بیس URL دارید می‌توانید از VITE_API_BASE_URL استفاده کنید.
      const baseUrl = (import.meta as any).env?.VITE_API_BASE_URL || "";
      const url = `${baseUrl}/api/support/messages`;

      const token = localStorage.getItem("token"); // اگر توکن دارید
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {}

      if (!res.ok) {
        throw new Error(data?.message || "ارسال پیام ناموفق بود.");
      }

      setOk("پیام شما با موفقیت برای پشتیبانی ثبت شد. به‌زودی پاسخ می‌دهیم.");
      setForm((f) => ({ ...f, subject: "", message: "", orderId: "" }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطای ناشناخته");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="panel-container">
      <Navbar />

      <div className="panel-layout">
        <aside className="panel-sidebar">
          <div className="sidebar-header">
            <div className="sidebar-name">{fullNameLS || "کاربر"}</div>
            <div className="sidebar-email">{emailLS}</div>
          </div>

          <button
            className="sidebar-item"
            onClick={() => navigate("/", { replace: true })}
            type="button"
          >
            صفحه اصلی
          </button>

          <button
            className="sidebar-item"
            onClick={() => navigate("/panel", { replace: true })}
            type="button"
          >
            پنل کاربری
          </button>

          <button className="sidebar-item active" type="button">
            پشتیبانی و مشاوره
          </button>
        </aside>

        <main className="panel-content">
          <div className="panel-card">
            <h2>پشتیبانی و مشاوره</h2>

            {error && <p className="support-error">{error}</p>}
            {ok && <p className="support-ok">{ok}</p>}

            <div className="support-grid">
              <div className="support-form">
                <div className="support-row">
                  <label className="support-label">نوع درخواست</label>
                  <select
                    className="support-input"
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        category: e.target.value as SupportCategory,
                      }))
                    }
                  >
                    <option value="support">پشتیبانی</option>
                    <option value="consulting">مشاوره</option>
                    <option value="order">پیگیری سفارش</option>
                  </select>
                </div>

                <div className="support-row">
                  <label className="support-label">موضوع</label>
                  <input
                    className="support-input"
                    value={form.subject}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, subject: e.target.value }))
                    }
                    placeholder="مثلاً: مشکل در پرداخت / سوال درباره محصول"
                  />
                </div>

                <div className="support-row support-two">
                  <div>
                    <label className="support-label">شماره تماس (اختیاری)</label>
                    <input
                      className="support-input"
                      value={form.phone || ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone: e.target.value }))
                      }
                      placeholder="09xxxxxxxxx"
                    />
                  </div>

                  <div>
                    <label className="support-label">
                      کد سفارش (اختیاری)
                    </label>
                    <input
                      className="support-input"
                      value={form.orderId || ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, orderId: e.target.value }))
                      }
                      placeholder="مثلاً: 14521"
                    />
                  </div>
                </div>

                <div className="support-row">
                  <label className="support-label">متن پیام</label>
                  <textarea
                    className="support-textarea"
                    value={form.message}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, message: e.target.value }))
                    }
                    placeholder="جزئیات را بنویسید..."
                    rows={7}
                  />
                  <div className="support-hint">
                    حداقل ۱۰ کاراکتر — {form.message.trim().length} کاراکتر
                  </div>
                </div>

                <div className="support-actions">
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => {
                      setError("");
                      setOk("");
                      setForm((f) => ({
                        ...f,
                        subject: "",
                        message: "",
                        orderId: "",
                      }));
                    }}
                    disabled={sending}
                  >
                    پاک کردن
                  </button>

                  <button
                    type="button"
                    className="btn-primary"
                    onClick={submit}
                    disabled={!canSend}
                  >
                    {sending ? "در حال ارسال..." : "ارسال پیام"}
                  </button>
                </div>
              </div>

              <div className="support-info">
                <div className="support-box">
                  <h3>راهنما</h3>
                  <ul className="support-list">
                    <li>برای پاسخ سریع‌تر، موضوع را دقیق بنویسید.</li>
                    <li>اگر مربوط به سفارش است، کد سفارش را وارد کنید.</li>
                    <li>در صورت نیاز، پشتیبان با شما تماس می‌گیرد.</li>
                  </ul>
                </div>

                <div className="support-box">
                  <h3>سوالات متداول</h3>

                  <details className="support-faq">
                    <summary>چقدر طول می‌کشد پاسخ بگیرم؟</summary>
                    <p>معمولاً در ساعات کاری در کوتاه‌ترین زمان ممکن پاسخ می‌دهیم.</p>
                  </details>

                  <details className="support-faq">
                    <summary>مشاوره شامل چه مواردی است؟</summary>
                    <p>راهنمایی قبل از خرید، انتخاب محصول، و پاسخ به سوالات تخصصی.</p>
                  </details>

                  <details className="support-faq">
                    <summary>اگر مشکل پرداخت داشتم چه کنم؟</summary>
                    <p>اسکرین‌شات خطا و زمان دقیق را در پیام ذکر کنید.</p>
                  </details>
                </div>

                <div className="support-box">
                  <h3>راه‌های ارتباطی</h3>
                  <div className="support-contact">
                    <div><b>ایمیل:</b> support@example.com</div>
                    <div><b>تلفن:</b> 021-xxxxxxx</div>
                    <div><b>اینستاگرام:</b> @design_nexus</div>
                    {/* <div className="support-note">
                      (این‌ها نمونه است؛ با اطلاعات خودتان جایگزین کنید.)
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* <Footer /> */}
    </div>
  );
}
