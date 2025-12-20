import { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../../shared/components/navbar";
import Footer from "../../../shared/components/footer";
import "../styles/user_panel_page.css";

import { Menu, UnstyledButton } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";

import {
  saveProfileSettings,
  uploadDesignerDesign,
  type ProfileSettingsPayload,
  type UploadDesignPayload,
} from "../API/profileAPI";

/** ---------------------- ثابت‌ها ---------------------- */
type DesignerTab = "profile" | "upload" | "projects" | "requests" | "wallet" | "settings";

type EditableField = "fullName" | "currentPassword" | "newPassword" | "confirmNewPassword";

const CATEGORIES = [
  { id: 1, title: "اتاق خواب" },
  { id: 2, title: "پذیرایی" },
  { id: 3, title: "آشپزخانه" },
  { id: 4, title: "اتاق کار" },
  { id: 5, title: "عروسی و نامزدی" },
  { id: 6, title: "جشن تولد" },
  { id: 7, title: "کافی شاپ و رستوران" },
] as const;

function notifyAuthChanged() {
  window.dispatchEvent(new Event("authChanged"));
}

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** ---------------------- کامپوننت ---------------------- */
export default function DesignerPanelPage() {
  const navigate = useNavigate();

  const userRaw = localStorage.getItem("user");
  const user = useMemo(() => safeJsonParse<any>(userRaw), [userRaw]);

  // بعضی جاها FullName / Email با حروف بزرگ ذخیره میشه، بعضی جاها fullName
  const fullNameLS = localStorage.getItem("fullName") || user?.FullName || user?.fullName || "";
  const emailLS = user?.Email || user?.email || "";

  const [activeTab, setActiveTab] = useState<DesignerTab>("profile");

  /** ---------------- Settings ---------------- */
  const [settingsError, setSettingsError] = useState("");
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState<Record<EditableField, boolean>>({
    fullName: false,
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });

  const readLatestFromStorage = useCallback(() => {
    const latestFullName = localStorage.getItem("fullName") || "";
    return { fullName: latestFullName };
  }, []);

  const [draft, setDraft] = useState<ProfileSettingsPayload>(() => ({
    fullName: fullNameLS,
    email: emailLS,
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  }));

  const refreshDraft = useCallback(() => {
    const latest = readLatestFromStorage();
    setDraft((d) => ({
      ...d,
      fullName: latest.fullName,
    }));
  }, [readLatestFromStorage]);

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

    if (payload.newPassword || payload.confirmNewPassword) {
      if (payload.newPassword !== payload.confirmNewPassword) {
        setSettingsError("رمز عبور جدید با تکرار آن یکسان نیست.");
        return;
      }
    }

    setSaving(true);
    try {
      await saveProfileSettings(payload);

      // ذخیره در لوکال
      localStorage.setItem("fullName", payload.fullName);

      try {
        const u = safeJsonParse<any>(localStorage.getItem("user")) || {};
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...u,
            FullName: payload.fullName,
          })
        );
      } catch {}

      notifyAuthChanged();

      // ریست پسوردها
      setDraft((d) => ({
        ...d,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      }));

      setEditing({
        fullName: false,
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
      // @ts-expect-error اگر در تایپ شما email وجود دارد، این خط مشکلی ندارد؛ اگر ندارد، حذفش کنید
      email: emailLS,
    });
    setEditing({
      fullName: false,
      currentPassword: false,
      newPassword: false,
      confirmNewPassword: false,
    });
  };

  /** ---------------- Upload ---------------- */
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState("");

  // این کامپوننت فرض می‌گیرد UploadDesignPayload شما با categoryId است (مثل اصلاحی که گفتیم)
  const [uploadForm, setUploadForm] = useState<UploadDesignPayload>(() => ({
    title: "",
    categoryId: 0, // 0 یعنی انتخاب نشده
    description: "",
    imageFile: null,
  }));

  const setUploadField = <K extends keyof UploadDesignPayload>(key: K, value: UploadDesignPayload[K]) => {
    setUploadError("");
    setUploadSuccess("");
    setUploadForm((p) => ({ ...p, [key]: value }));
  };

  const selectedCategoryTitle = useMemo(() => {
    if (!uploadForm.categoryId) return "";
    return CATEGORIES.find((c) => c.id === uploadForm.categoryId)?.title || "";
  }, [uploadForm.categoryId]);

  const isUploadDirty = () => {
    return (
      !!uploadForm.title.trim() ||
      uploadForm.categoryId !== 0 ||
      !!uploadForm.description.trim() ||
      !!uploadForm.imageFile
    );
  };

  const resetUploadForm = () => {
    setUploadError("");
    setUploadSuccess("");
    setUploadForm({
      title: "",
      categoryId: 0,
      description: "",
      imageFile: null,
    });
  };

  const submitUpload = async () => {
    setUploadError("");
    setUploadSuccess("");

    const payload: UploadDesignPayload = {
      ...uploadForm,
      title: uploadForm.title.trim(),
      description: uploadForm.description.trim(),
      // categoryId همون عدد باقی می‌ماند
    };

    if (!payload.title) {
      setUploadError("عنوان طرح الزامی است.");
      return;
    }
    if (!payload.categoryId) {
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

  /** ---------------- UI Helpers ---------------- */
  const SidebarButton = ({
    tab,
    label,
    onClick,
  }: {
    tab?: DesignerTab;
    label: string;
    onClick: () => void;
  }) => {
    const active = tab ? activeTab === tab : false;
    return (
      <button
        className={`sidebar-item ${active ? "active" : ""}`}
        onClick={onClick}
        type="button"
      >
        {label}
      </button>
    );
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

          <SidebarButton
            label="صفحه اصلی"
            onClick={() => navigate("/", { replace: true })}
          />

          <SidebarButton tab="profile" label="اطلاعات طراح" onClick={() => setActiveTab("profile")} />
          <SidebarButton tab="upload" label="بارگذاری طرح" onClick={() => setActiveTab("upload")} />
          <SidebarButton tab="projects" label="پروژه‌ها" onClick={() => setActiveTab("projects")} />
          <SidebarButton tab="requests" label="درخواست‌ها" onClick={() => setActiveTab("requests")} />
          <SidebarButton tab="wallet" label="کیف پول / درآمد" onClick={() => setActiveTab("wallet")} />

          <SidebarButton
            tab="settings"
            label="ویرایش اطلاعات"
            onClick={() => {
              setActiveTab("settings");
              refreshDraft();
            }}
          />

          <SidebarButton
            label="مشاوره و پشتیبانی"
            onClick={() => navigate("/support", { replace: true })}
          />
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
                    value={fullNameLS}
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

                {/* دسته‌بندی */}
                <div className="settings-control" style={{ justifyContent: "flex-start" }}>
                  <Menu shadow="md" width={240} position="bottom-start" withinPortal={false}>
                    <Menu.Target>
                      <UnstyledButton className="settings-dropdown-trigger" type="button">
                        <span>
                          {uploadForm.categoryId
                            ? `دسته‌بندی: ${selectedCategoryTitle}`
                            : "انتخاب دسته‌بندی"}
                        </span>
                        <IconChevronDown size={16} />
                      </UnstyledButton>
                    </Menu.Target>

                    <Menu.Dropdown dir="rtl">
                      <Menu.Label>دسته بندی‌ها</Menu.Label>
                      {CATEGORIES.map((c) => (
                        <Menu.Item key={c.id} onClick={() => setUploadField("categoryId", c.id)}>
                          {c.title}
                        </Menu.Item>
                      ))}
                    </Menu.Dropdown>
                  </Menu>

                  {uploadForm.categoryId !== 0 && (
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => setUploadField("categoryId", 0)}
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
                  {uploadForm.imageFile
                    ? `فایل انتخاب شده: ${uploadForm.imageFile.name}`
                    : "فقط تصاویر (jpg, png, ...)"}
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
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => startEdit("fullName")}
                        title="ویرایش"
                      >
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
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => stopEdit("fullName")}
                        title="تمام"
                      >
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
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => startEdit("newPassword")}
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
                        value={draft.newPassword || ""}
                        onChange={(e) => setDraft((d) => ({ ...d, newPassword: e.target.value }))}
                        placeholder="رمز عبور جدید"
                      />
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => stopEdit("newPassword")}
                        title="تمام"
                      >
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
