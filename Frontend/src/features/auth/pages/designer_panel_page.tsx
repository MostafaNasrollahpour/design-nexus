import { useMemo, useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import "../styles/user_panel_page.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import { saveProfileSettings, type ProfileSettingsPayload } from "../API/authAPI";

type DesignerTab = "profile" | "projects" | "requests" | "wallet" | "settings";
type EditableField =
  | "fullName"
  | "email"
  | "currentPassword"
  | "newPassword"
  | "confirmNewPassword";

function notifyAuthChanged() {
  window.dispatchEvent(new Event("authChanged"));
}

export default function DesignerPanelPage() {
  const userRaw = localStorage.getItem("user");
  const fullNameLS = localStorage.getItem("fullName") || "";
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      return userRaw ? JSON.parse(userRaw) : null;
    } catch {
      return null;
    }
  }, [userRaw]);

  const emailLS = user?.Email || "";
  const [activeTab, setActiveTab] = useState<DesignerTab>("profile");

  /* ---------------- Settings state ---------------- */
  const [settingsError, setSettingsError] = useState("");
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState<Record<EditableField, boolean>>({
    fullName: false,
    email: false,
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });

  const [draft, setDraft] = useState<ProfileSettingsPayload>(() => ({
    fullName: fullNameLS,
    email: emailLS,
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  }));

  const readLatestFromStorage = (): Pick<ProfileSettingsPayload, "fullName"> => {
    const latestFullName = localStorage.getItem("fullName") || "";
    let latestEmail = "";
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      latestEmail = u?.Email || "";
    } catch {}
    return { fullName: latestFullName };
  };

  const refreshDraft = () => {
    const latest = readLatestFromStorage();
    setDraft((d) => ({
      ...d,
      fullName: latest.fullName
    }));
  };

  const startEdit = (field: EditableField) => {
    setSettingsError("");
    refreshDraft();
    setEditing((e) => ({ ...e, [field]: true }));
  };

  const stopEdit = (field: EditableField) => {
    setEditing((e) => ({ ...e, [field]: false }));
  };

  const isDirty = () => {
    const current = readLatestFromStorage();

    const profileChanged =
      draft.fullName.trim() !== current.fullName.trim();

    const passwordTouched =
      !!draft.currentPassword?.trim() ||
      !!draft.newPassword?.trim() ||
      !!draft.confirmNewPassword?.trim();

    return profileChanged || passwordTouched;
  };

  const saveAll = async () => {
    setSettingsError("");

    const payload: ProfileSettingsPayload = {
      fullName: draft.fullName.trim(),
      
      currentPassword: draft.currentPassword?.trim() || "",
      newPassword: draft.newPassword?.trim() || "",
      confirmNewPassword: draft.confirmNewPassword?.trim() || "",
    };

    if (!payload.fullName) {
      setSettingsError("نام نمی‌تواند خالی باشد.");
      return;
    }
   

    setSaving(true);
    try {
      await saveProfileSettings(payload);

      // ✅ sync localStorage
      localStorage.setItem("fullName", payload.fullName);

      try {
        const u = JSON.parse(localStorage.getItem("user") || "null") || {};
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...u,
            FullName: payload.fullName
          })
        );
      } catch {}

      notifyAuthChanged();

      // ✅ پاک کردن فیلدهای پسورد بعد از ذخیره موفق
      setDraft((d) => ({
        ...d,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      }));

      setEditing({
        fullName: false,
        email: false,
        currentPassword: false,
        newPassword: false,
        confirmNewPassword: false,
      });
    } catch (err) {
      setSettingsError(err instanceof Error ? err.message : "خطای ناشناخته");
    } finally {
      setSaving(false);
    }
  };

  const cancelAll = () => {
    setSettingsError("");
    const latest = readLatestFromStorage();
    setDraft({
      fullName: latest.fullName,
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    setEditing({
      fullName: false,
      email: false,
      currentPassword: false,
      newPassword: false,
      confirmNewPassword: false,
    });
  };

  return (
    <div className="panel-container">
      <Navbar />

      <div className="panel-layout">
        {/* سایدبار راست */}
        <aside className="panel-sidebar">
          <div className="sidebar-header">
            <div className="sidebar-name">{fullNameLS || "طراح"}</div>
            <div className="sidebar-email">{emailLS}</div>
          </div>

          <button className="sidebar-item" onClick={() => navigate("/", { replace: true })} type="button">
            صفحه اصلی
          </button>

          <button
            className={`sidebar-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
            type="button"
          >
            اطلاعات طراح
          </button>

          <button
            className={`sidebar-item ${activeTab === "projects" ? "active" : ""}`}
            onClick={() => setActiveTab("projects")}
            type="button"
          >
            پروژه‌ها
          </button>

          <button
            className={`sidebar-item ${activeTab === "requests" ? "active" : ""}`}
            onClick={() => setActiveTab("requests")}
            type="button"
          >
            درخواست‌ها
          </button>

          <button
            className={`sidebar-item ${activeTab === "wallet" ? "active" : ""}`}
            onClick={() => setActiveTab("wallet")}
            type="button"
          >
            کیف پول / درآمد
          </button>

          <button
            className={`sidebar-item ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("settings");
              refreshDraft();
            }}
            type="button"
          >
            ویرایش اطلاعات
          </button>

          <button className="sidebar-item" onClick={() => navigate("/support", { replace: true })} type="button">
            مشاوره و پشتیبانی
          </button>
        </aside>

        {/* محتوا */}
        <main className="panel-content">
          {activeTab === "profile" && (
            <div className="panel-card">
              <h2>اطلاعات طراح</h2>

              <div className="panel-row">
                <span>نام:</span>
                <b>{fullNameLS || "—"}</b>
              </div>

              <div className="panel-row">
                <span>ایمیل:</span>
                <b>{emailLS || "—"}</b>
              </div>

              <div className="panel-row">
                <span>نقش:</span>
                <b>{user?.Role || localStorage.getItem("userRole") || "طراح"}</b>
              </div>
            </div>
          )}

          {activeTab === "projects" && (
            <div className="panel-card">
              <h2>پروژه‌ها</h2>
              <p className="panel-muted">اینجا لیست پروژه‌های شما نمایش داده می‌شود.</p>
            </div>
          )}

          {activeTab === "requests" && (
            <div className="panel-card">
              <h2>درخواست‌ها</h2>
              <p className="panel-muted">اینجا درخواست‌های جدید مشتری‌ها می‌آید.</p>
            </div>
          )}

          {activeTab === "wallet" && (
            <div className="panel-card">
              <h2>کیف پول / درآمد</h2>
              <p className="panel-muted">گزارش درآمد و تسویه‌ها اینجا قرار می‌گیرد.</p>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="panel-card">
              <h2>ویرایش اطلاعات</h2>

              {settingsError && <p className="settings-error">{settingsError}</p>}

              {/* FullName */}
              <div className="settings-row">
                <div className="settings-label">نام و نام خانوادگی</div>
                <div className="settings-control">
                  {!editing.fullName ? (
                    <>
                      <div className="settings-value">{draft.fullName || "—"}</div>
                      <button type="button" className="icon-btn" onClick={() => startEdit("fullName")} title="ویرایش">
                        ✎
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        className="settings-input"
                        value={draft.fullName}
                        onChange={(e) => setDraft((d) => ({ ...d, fullName: e.target.value }))}
                        placeholder="نام و نام خانوادگی"
                      />
                      <button type="button" className="icon-btn" onClick={() => stopEdit("fullName")} title="تمام">
                        ✓
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Email */}
              {/* <div className="settings-row">
                <div className="settings-label">ایمیل</div>
                <div className="settings-control"> */}
                  {/* {!editing.email ? (
                    <>
                      <div className="settings-value">{draft.email || "—"}</div>
                      <button type="button" className="icon-btn" onClick={() => startEdit("email")} title="ویرایش">
                        ✎
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        className="settings-input"
                        value={draft.email}
                        onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                        placeholder="ایمیل"
                        dir="ltr"
                      />
                      <button type="button" className="icon-btn" onClick={() => stopEdit("email")} title="تمام">
                        ✓
                      </button>
                    </>
                  )} */}
                {/* </div>
              </div> */}

              {/* Current Password */}
              <div className="settings-row">
                <div className="settings-label">رمز عبور قبلی</div>
                <div className="settings-control">
                  {!editing.currentPassword ? (
                    <>
                      <div className="settings-value">{draft.currentPassword ? "********" : "—"}</div>
                      <button type="button" className="icon-btn" onClick={() => startEdit("currentPassword")} title="ویرایش">
                        ✎
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        className="settings-input"
                        type="password"
                        value={draft.currentPassword || ""}
                        onChange={(e) => setDraft((d) => ({ ...d, currentPassword: e.target.value }))}
                        placeholder="رمز عبور قبلی"
                      />
                      <button type="button" className="icon-btn" onClick={() => stopEdit("currentPassword")} title="تمام">
                        ✓
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* New Password */}
              <div className="settings-row">
                <div className="settings-label">رمز عبور جدید</div>
                <div className="settings-control">
                  {!editing.newPassword ? (
                    <>
                      <div className="settings-value">{draft.newPassword ? "********" : "—"}</div>
                      <button type="button" className="icon-btn" onClick={() => startEdit("newPassword")} title="ویرایش">
                        ✎
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        className="settings-input"
                        type="password"
                        value={draft.newPassword || ""}
                        onChange={(e) => setDraft((d) => ({ ...d, newPassword: e.target.value }))}
                        placeholder="رمز عبور جدید"
                      />
                      <button type="button" className="icon-btn" onClick={() => stopEdit("newPassword")} title="تمام">
                        ✓
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="settings-row">
                <div className="settings-label">تکرار رمز عبور جدید</div>
                <div className="settings-control">
                  {!editing.confirmNewPassword ? (
                    <>
                      <div className="settings-value">{draft.confirmNewPassword ? "********" : "—"}</div>
                      <button type="button" className="icon-btn" onClick={() => startEdit("confirmNewPassword")} title="ویرایش">
                        ✎
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        className="settings-input"
                        type="password"
                        value={draft.confirmNewPassword || ""}
                        onChange={(e) => setDraft((d) => ({ ...d, confirmNewPassword: e.target.value }))}
                        placeholder="تکرار رمز عبور جدید"
                      />
                      <button type="button" className="icon-btn" onClick={() => stopEdit("confirmNewPassword")} title="تمام">
                        ✓
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="settings-footer">
                <button type="button" className="btn-ghost" onClick={cancelAll} disabled={saving}>
                  انصراف
                </button>

                <button type="button" className="btn-primary" onClick={saveAll} disabled={saving || !isDirty()}>
                  {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
                </button>
              </div>
            </div>
          )}
          
        </main>
      </div>

      <Footer />
    </div>
  );
}
