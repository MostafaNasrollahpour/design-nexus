import { useMemo, useState } from "react";
import Navbar from "../../../shared/components/navbar";
import Footer from "../../../shared/components/footer";
import "../styles/user_panel_page.css";
import { useNavigate } from "react-router-dom";

import { Menu, UnstyledButton } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";

import { saveProfileSettings, type ProfileSettingsPayload } from "../API/profileAPI";
import { uploadDesignerDesign, type UploadDesignPayload } from "../API/profileAPI";

type DesignerTab = "profile" | "upload" | "projects" | "requests" | "wallet" | "settings";
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
    return { fullName: latestFullName };
  };

  const refreshDraft = () => {
    const latest = readLatestFromStorage();
    setDraft((d) => ({
      ...d,
      fullName: latest.fullName,
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

    const profileChanged = draft.fullName.trim() !== current.fullName.trim();

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

      localStorage.setItem("fullName", payload.fullName);

      try {
        const u = JSON.parse(localStorage.getItem("user") || "null") || {};
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...u,
            FullName: payload.fullName,
          })
        );
      } catch {}

      notifyAuthChanged();

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

  /* ---------------- Upload state ---------------- */
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState("");

  const [uploadForm, setUploadForm] = useState<UploadDesignPayload>(() => ({
    designerName: fullNameLS || localStorage.getItem("fullName") || "",
    title: "",
    category: "",
    price: "",
    description: "",
    imageFile: null,
  }));

  const setUploadField = <K extends keyof UploadDesignPayload>(
    key: K,
    value: UploadDesignPayload[K]
  ) => {
    setUploadError("");
    setUploadSuccess("");
    setUploadForm((p) => ({ ...p, [key]: value }));
  };

  const isUploadDirty = () => {
    return (
      !!uploadForm.title.trim() ||
      !!uploadForm.category.trim() ||
      !!uploadForm.price.trim() ||
      !!uploadForm.description.trim() ||
      !!uploadForm.imageFile
    );
  };

  const resetUploadForm = () => {
    const latestName = localStorage.getItem("fullName") || fullNameLS || "";
    setUploadError("");
    setUploadSuccess("");
    setUploadForm({
      designerName: latestName,
      title: "",
      category: "",
      price: "",
      description: "",
      imageFile: null,
    });
  };

  const submitUpload = async () => {
    setUploadError("");
    setUploadSuccess("");

    const latestName = localStorage.getItem("fullName") || fullNameLS || "";

    const payload: UploadDesignPayload = {
      ...uploadForm,
      designerName: latestName,
      title: uploadForm.title.trim(),
      category: uploadForm.category.trim(),
      price: uploadForm.price.trim(),
      description: uploadForm.description.trim(),
      imageFile: uploadForm.imageFile,
    };

    if (!payload.designerName) {
      setUploadError("نام طراح پیدا نشد. لطفاً دوباره وارد شوید.");
      return;
    }
    if (!payload.title) {
      setUploadError("عنوان طرح الزامی است.");
      return;
    }
    if (!payload.category) {
      setUploadError("دسته‌بندی الزامی است.");
      return;
    }
    if (!payload.imageFile) {
      setUploadError("لطفاً یک تصویر برای طرح انتخاب کنید.");
      return;
    }

    setUploading(true);
    try {
      await uploadDesignerDesign(payload);
      setUploadSuccess("طرح با موفقیت ارسال شد ✅");
      resetUploadForm();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "خطای ناشناخته");
    } finally {
      setUploading(false);
    }
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
            className={`sidebar-item ${activeTab === "upload" ? "active" : ""}`}
            onClick={() => setActiveTab("upload")}
            type="button"
          >
            بارگذاری طرح
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

          {activeTab === "upload" && (
            <div className="panel-card">
              <h2>بارگذاری طرح</h2>

              {uploadError && <p className="settings-error">{uploadError}</p>}
              {uploadSuccess && <p style={{ fontWeight: 800 }}>{uploadSuccess}</p>}

              {/* اطلاعات طراح */}
              <div className="settings-row">
                <div className="settings-label">اطلاعات طراح</div>
                <div className="settings-control">
                  <input
                    className="settings-input"
                    value={localStorage.getItem("fullName") || fullNameLS || ""}
                    readOnly
                    placeholder="نام طراح"
                  />
                </div>
              </div>

              {/* اطلاعات طرح */}
              <div className="settings-row">
                <div className="settings-label">اطلاعات طرح</div>

                <div className="settings-control" style={{ marginBottom: 10 }}>
                  <input
                    className="settings-input"
                    value={uploadForm.title}
                    onChange={(e) => setUploadField("title", e.target.value)}
                    placeholder="عنوان طرح (مثلاً: طراحی پذیرایی مدرن)"
                  />
                </div>

                <div className="settings-control" style={{ marginBottom: 10 }}>
                  <input
                    className="settings-input"
                    value={uploadForm.price}
                    onChange={(e) => setUploadField("price", e.target.value)}
                    placeholder="قیمت / بودجه (اختیاری)"
                  />
                </div>

                {/* دسته‌بندی */}
                <div className="settings-control" style={{ justifyContent: "flex-start" }}>
                  <Menu shadow="md" width={220} position="bottom-start" withinPortal={false}>
                    <Menu.Target>
                      <UnstyledButton className="settings-dropdown-trigger" type="button">
                        <span>
                          {uploadForm.category ? `دسته‌بندی: ${uploadForm.category}` : "انتخاب دسته‌بندی"}
                        </span>
                        <IconChevronDown size={16} />
                      </UnstyledButton>
                    </Menu.Target>

                    <Menu.Dropdown dir="rtl">
                      <Menu.Label>دسته بندی‌ها</Menu.Label>
                      <Menu.Item onClick={() => setUploadField("category", "پذیرایی")}>پذیرایی</Menu.Item>
                      <Menu.Item onClick={() => setUploadField("category", "آشپزخانه")}>آشپزخانه</Menu.Item>
                      <Menu.Item onClick={() => setUploadField("category", "اتاق کار")}>اتاق کار</Menu.Item>
                      <Menu.Item onClick={() => setUploadField("category", "عروسی و نامزدی")}>عروسی و نامزدی</Menu.Item>
                      <Menu.Item onClick={() => setUploadField("category", "جشن تولد")}>جشن تولد</Menu.Item>
                      <Menu.Item onClick={() => setUploadField("category", "کافی‌ شاپ و رستوران")}>
                        کافی‌ شاپ و رستوران
                      </Menu.Item>
                      <Menu.Item onClick={() => setUploadField("category", "اتاق خواب")}>اتاق خواب</Menu.Item>
                    </Menu.Dropdown>
                  </Menu>

                  {uploadForm.category && (
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => setUploadField("category", "")}
                      title="پاک کردن دسته‌بندی"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* توضیحات */}
              <div className="settings-row">
                <div className="settings-label">توضیحات / نکات</div>
                <div className="settings-control">
                  <textarea
                    className="settings-input"
                    style={{ minHeight: 110, resize: "vertical" }}
                    value={uploadForm.description}
                    onChange={(e) => setUploadField("description", e.target.value)}
                    placeholder="اگر توضیحات یا نکته‌ای درباره این طرح دارید اینجا بنویسید..."
                  />
                </div>
              </div>

              {/* آپلود تصویر */}
              <div className="settings-row">
                <div className="settings-label">آپلود تصویر طرح</div>
                <div className="settings-control">
                  <input
                    className="settings-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setUploadField("imageFile", e.target.files?.[0] || null)}
                  />
                </div>
                <div className="settings-hint">
                  {uploadForm.imageFile ? `فایل انتخاب شده: ${uploadForm.imageFile.name}` : "فقط تصاویر (jpg, png, ...)"}
                </div>
              </div>

              <div className="settings-footer">
                <button type="button" className="btn-ghost" onClick={resetUploadForm} disabled={uploading}>
                  پاک کردن
                </button>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={submitUpload}
                  disabled={uploading || !isUploadDirty()}
                >
                  {uploading ? "در حال ارسال..." : "بارگذاری"}
                </button>
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

              {/* Current Password */}
              <div className="settings-row">
                <div className="settings-label">رمز عبور قبلی</div>
                <div className="settings-control">
                  {!editing.currentPassword ? (
                    <>
                      <div className="settings-value">{draft.currentPassword ? "********" : "—"}</div>
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => startEdit("currentPassword")}
                        title="ویرایش"
                      >
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
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => stopEdit("currentPassword")}
                        title="تمام"
                      >
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
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => startEdit("confirmNewPassword")}
                        title="ویرایش"
                      >
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
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => stopEdit("confirmNewPassword")}
                        title="تمام"
                      >
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
