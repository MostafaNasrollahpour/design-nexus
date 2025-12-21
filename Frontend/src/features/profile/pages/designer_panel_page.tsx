import { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../../shared/components/navbar";
import Footer from "../../../shared/components/footer";
import "../styles/user_panel_page.css";

import { Menu, UnstyledButton } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
// import "../API/testapi"

import {
  saveProfileSettings,
  uploadDesignerDesign,
  saveDesignerExtraProfile,
  type ProfileSettingsPayload,
  type UploadDesignPayload,
} from "../API/testapi";

/** ---------------------- ثابت‌ها ---------------------- */
type DesignerTab = "profile" | "upload" | "projects" | "requests" | "wallet" | "settings" | "designerProfile";
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

/**
 * ✅ چون UploadDesignPayload.imageFile اجباریه، برای فرم state جدا می‌گیریم که null هم بشه.
 */
type UploadFormState = Omit<UploadDesignPayload, "imageFile" | "description"> & {
  imageFile: File | null;
  description: string;
};

export default function DesignerPanelPage() {
  const navigate = useNavigate();

  const userRaw = localStorage.getItem("user");
  const user = useMemo(() => safeJsonParse<any>(userRaw), [userRaw]);

  const fullNameLS = localStorage.getItem("fullName") || user?.FullName || user?.fullName || "";
  const emailLS = user?.Email || user?.email || "";

  const [activeTab, setActiveTab] = useState<DesignerTab>("profile");

  /* ---------------- Settings state ---------------- */
  const [settingsError, setSettingsError] = useState("");
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState<Record<EditableField, boolean>>({
    fullName: false,
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });

  const readLatestFromStorage = useCallback((): Pick<ProfileSettingsPayload, "fullName"> => {
    const latestFullName = localStorage.getItem("fullName") || "";
    return { fullName: latestFullName };
  }, []);

  type ProfileDraft = Omit<ProfileSettingsPayload, "email"> & { email?: string };

  const [draft, setDraft] = useState<ProfileDraft>(() => ({
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

    const profileChanged = (draft.fullName || "").trim() !== (current.fullName || "").trim();

    const passwordTouched =
      !!draft.currentPassword?.trim() || !!draft.newPassword?.trim() || !!draft.confirmNewPassword?.trim();

    return profileChanged || passwordTouched;
  };

  const saveAll = async () => {
    setSettingsError("");

    const payload: ProfileSettingsPayload = {
      fullName: (draft.fullName || "").trim(),
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

    setDraft((d) => ({
      ...d,
      fullName: latest.fullName,
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
      email: emailLS,
    }));

    setEditing({
      fullName: false,
      currentPassword: false,
      newPassword: false,
      confirmNewPassword: false,
    });
  };

  /* ---------------- Upload state ---------------- */
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState("");

  const [uploadForm, setUploadForm] = useState<UploadFormState>(() => ({
    title: "",
    categoryId: 0,
    description: "",
    imageFile: null,
  }));

  const [designerExtra, setDesignerExtra] = useState({
    bio: "",
    location: "",
    specialty: "",
    avatarFile: null as File | null,
  });

  const [designerSaving, setDesignerSaving] = useState(false);
  const [designerError, setDesignerError] = useState("");


  const setUploadField = <K extends keyof UploadFormState>(key: K, value: UploadFormState[K]) => {
    // ✅ وقتی کاربر چیزی تغییر میده، پیام قبلی پاک بشه
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

  // ✅ بعد از موفقیت: فقط فیلدها ریست شوند، پیام موفقیت باقی بماند
  const resetUploadFieldsAfterSuccess = () => {
    setUploadError("");
    setUploadForm({
      title: "",
      categoryId: 0,
      description: "",
      imageFile: null,
    });
  };

  // ✅ دکمه "پاک کردن": هم فیلدها هم پیام‌ها پاک شود
  const clearUploadForm = () => {
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

    const title = uploadForm.title.trim();
    const descriptionTrimmed = uploadForm.description.trim();

    if (!title) {
      setUploadError("عنوان طرح الزامی است.");
      return;
    }
    if (!uploadForm.categoryId) {
      setUploadError("دسته‌بندی الزامی است.");
      return;
    }
    if (!uploadForm.imageFile) {
      setUploadError("لطفاً یک تصویر برای طرح انتخاب کنید.");
      return;
    }

    const payload: UploadDesignPayload = {
      title,
      categoryId: uploadForm.categoryId,
      description: descriptionTrimmed ? descriptionTrimmed : null,
      imageFile: uploadForm.imageFile,
    };

    setUploading(true);
    try {
      await uploadDesignerDesign(payload);

      // ✅ پیام موفقیت نمایش داده میشه و پاک نمیشه
      setUploadSuccess("طرح با موفقیت ارسال شد ✅");

      // ✅ فقط فرم پاک میشه
      resetUploadFieldsAfterSuccess();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "خطای ناشناخته");
    } finally {
      setUploading(false);
    }
  };

  /* ---------------- UI Helpers ---------------- */
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
      <button className={`sidebar-item ${active ? "active" : ""}`} onClick={onClick} type="button">
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

          <SidebarButton label="صفحه اصلی" onClick={() => navigate("/", { replace: true })} />
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
            tab="designerProfile"
            label="اطلاعات تکمیلی طراح"
            onClick={() => setActiveTab("designerProfile")}
          />


          <SidebarButton label="مشاوره و پشتیبانی" onClick={() => navigate("/support", { replace: true })} />
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
                  <input className="settings-input" value={fullNameLS} readOnly placeholder="نام طراح" />
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
                          {uploadForm.categoryId ? `دسته‌بندی: ${selectedCategoryTitle}` : "انتخاب دسته‌بندی"}
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
                  {uploadForm.imageFile ? `فایل انتخاب شده: ${uploadForm.imageFile.name}` : "فقط تصاویر (jpg, png, ...)"}
                </div>
              </div>

              <div className="settings-footer">
                <button type="button" className="btn-ghost" onClick={clearUploadForm} disabled={uploading}>
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

          {activeTab === "designerProfile" && (
            <div className="panel-card">
              <h2>اطلاعات تکمیلی طراح</h2>

              {designerError && <p className="settings-error">{designerError}</p>}

              <div className="settings-row">
                <div className="settings-label">بیوگرافی</div>
                <div className="settings-control">
                  <textarea
                    className="settings-input"
                    value={designerExtra.bio}
                    onChange={(e) =>
                      setDesignerExtra((p) => ({ ...p, bio: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="settings-row">
                <div className="settings-label">لوکیشن</div>
                <div className="settings-control">
                  <input
                    className="settings-input"
                    value={designerExtra.location}
                    onChange={(e) =>
                      setDesignerExtra((p) => ({ ...p, location: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="settings-row">
                <div className="settings-label">تخصص</div>
                <div className="settings-control">
                  <input
                    className="settings-input"
                    value={designerExtra.specialty}
                    onChange={(e) =>
                      setDesignerExtra((p) => ({ ...p, specialty: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="settings-row">
                <div className="settings-label">عکس پروفایل</div>
                <div className="settings-control">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setDesignerExtra((p) => ({
                        ...p,
                        avatarFile: e.target.files?.[0] || null,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="settings-footer">
                <button
                  className="btn-primary"
                  disabled={designerSaving}
                  onClick={async () => {
                    setDesignerError("");
                    setDesignerSaving(true);
                    try {
                      await saveDesignerExtraProfile(designerExtra);
                    } catch (e) {
                      setDesignerError(
                        e instanceof Error ? e.message : "خطا"
                      );
                    } finally {
                      setDesignerSaving(false);
                    }
                  }}
                >
                  {designerSaving ? "در حال ذخیره..." : "ذخیره اطلاعات"}
                </button>
              </div>
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
                        value={draft.fullName || ""}
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
