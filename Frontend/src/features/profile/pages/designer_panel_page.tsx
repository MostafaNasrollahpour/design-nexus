import { useMemo, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../../shared/components/navbar";
import Footer from "../../../shared/components/footer";
import "../styles/user_panel_page.css";

import { Menu, UnstyledButton } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";

import Cropper from "react-easy-crop";

import {
  saveProfileSettings,
  uploadDesignerDesign,
  saveDesignerExtraProfile,
  getDesignerProjects,
  type ProfileSettingsPayload,
  type UploadDesignPayload,
  type DesignerProjectDto,
} from "../API/testapi";

/** ---------------------- ثابت‌ها ---------------------- */
type DesignerTab =
  | "profile"
  | "upload"
  | "projects"
  | "requests"
  | "wallet"
  | "settings"
  | "designerProfile";
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

const CATEGORY_TITLES: Record<number, string> = {
  1: "اتاق خواب",
  2: "پذیرایی",
  3: "آشپزخانه",
  4: "اتاق کار",
  5: "عروسی و نامزدی",
  6: "جشن تولد",
  7: "کافی‌ شاپ و رستوران",
};

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

/** ---------------------- Crop Helpers ---------------------- */
type Area = { x: number; y: number; width: number; height: number };

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (e) => reject(e));
    img.setAttribute("crossOrigin", "anonymous");
    img.src = url;
  });
}

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

async function getCroppedImageBlob(imageSrc: string, pixelCrop: Area, rotation = 0): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  const rotRad = getRadianAngle(rotation);

  const { width: bBoxW, height: bBoxH } = (() => {
    const w = image.width;
    const h = image.height;
    const cos = Math.abs(Math.cos(rotRad));
    const sin = Math.abs(Math.sin(rotRad));
    return { width: w * cos + h * sin, height: w * sin + h * cos };
  })();

  const dpr = window.devicePixelRatio || 1;

  canvas.width = Math.round(pixelCrop.width * dpr);
  canvas.height = Math.round(pixelCrop.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingQuality = "high";

  ctx.translate(bBoxW / 2, bBoxH / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);

  const tempCanvas = document.createElement("canvas");
  const tctx = tempCanvas.getContext("2d");
  if (!tctx) throw new Error("Canvas not supported");

  tempCanvas.width = Math.ceil(bBoxW);
  tempCanvas.height = Math.ceil(bBoxH);

  tctx.translate(bBoxW / 2, bBoxH / 2);
  tctx.rotate(rotRad);
  tctx.translate(-image.width / 2, -image.height / 2);
  tctx.drawImage(image, 0, 0);

  ctx.drawImage(
    tempCanvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error("خطا در ساخت فایل تصویر"));
      resolve(blob);
    }, "image/jpeg", 0.92);
  });
}

/** ---------------------- Auth helper ---------------------- */
function getAuthTokenFromStorage() {
  // چند کلید رایج رو پوشش می‌دیم که هر پروژه‌ای یه چیزی می‌ذاره 😄
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("jwt") ||
    ""
  );
}

/** ---------------------- Component ---------------------- */
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

  // ✅ Crop state فقط برای avatar
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [avatarCropError, setAvatarCropError] = useState("");

  const setUploadField = <K extends keyof UploadFormState>(key: K, value: UploadFormState[K]) => {
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

  const resetUploadFieldsAfterSuccess = () => {
    setUploadError("");
    setUploadForm({
      title: "",
      categoryId: 0,
      description: "",
      imageFile: null,
    });
  };

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

    setUploadSuccess("طرح با موفقیت ارسال شد ✅");
    resetUploadFieldsAfterSuccess();

    /* ✅ ریفرش لیست پروژه‌ها */
    await loadProjects();

    /* ✅ UX بهتر: رفتن خودکار به تب پروژه‌ها */
    setActiveTab("projects");
  } catch (err) {
    setUploadError(err instanceof Error ? err.message : "خطای ناشناخته");
  } finally {
    setUploading(false);
  }
};


  /* ---------------- Avatar handlers ---------------- */
  const onAvatarFilePicked = async (file: File | null) => {
    setAvatarCropError("");
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarCropError("فقط فایل تصویری قابل قبول است.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      setAvatarSrc(result);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setIsCropOpen(true);
    };
    reader.onerror = () => setAvatarCropError("خطا در خواندن فایل تصویر.");
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixelsValue: Area) => {
    setCroppedAreaPixels(croppedAreaPixelsValue);
  }, []);

  const closeCropper = () => {
    setIsCropOpen(false);
    setAvatarSrc(null);
    setCroppedAreaPixels(null);
    setAvatarCropError("");
  };

  const confirmCroppedAvatar = async () => {
    setAvatarCropError("");

    if (!avatarSrc || !croppedAreaPixels) {
      setAvatarCropError("لطفاً ابتدا محدوده برش را مشخص کنید.");
      return;
    }

    try {
      const blob = await getCroppedImageBlob(avatarSrc, croppedAreaPixels, 0);
      const file = new File([blob], `avatar_${Date.now()}.jpg`, { type: "image/jpeg" });

      const previewUrl = URL.createObjectURL(blob);
      setAvatarPreviewUrl(previewUrl);

      setDesignerExtra((p) => ({
        ...p,
        avatarFile: file,
      }));

      closeCropper();
    } catch (e) {
      setAvatarCropError(e instanceof Error ? e.message : "خطا در برش تصویر");
    }
  };

  /* ---------------- Projects state (✅ تب پروژه‌ها) ---------------- */
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState("");
  const [projects, setProjects] = useState<DesignerProjectDto[]>([]);

  const loadProjects = useCallback(async () => {
    setProjectsError("");
    setProjectsLoading(true);
    try {
      const token = getAuthTokenFromStorage() || user?.Token || user?.token || "";
      if (!token) {
        setProjects([]);
        setProjectsError("توکن پیدا نشد. لطفاً دوباره وارد شوید.");
        return;
      }
      const data = await getDesignerProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (e) {
      setProjectsError(e instanceof Error ? e.message : "خطا در دریافت پروژه‌ها");
      setProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "projects") {
      loadProjects();
    }
  }, [activeTab, loadProjects]);

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

  const toCategoryTitle = (id: number | null | undefined) => {
    if (!id) return "—";
    return CATEGORY_TITLES[id] || `دسته‌بندی #${id}`;
  };

  const openEditProject = (p: DesignerProjectDto) => {
    // مسیر رو با روت پروژه‌ات تنظیم کن
    // مثال: /designer/projects/:id/edit
    navigate(`/portfolio/edit/${p.id}`, { state: { project: p } });
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
          <SidebarButton tab="designerProfile" label="اطلاعات تکمیلی طراح" onClick={() => setActiveTab("designerProfile")} />

          <SidebarButton label="مشاوره و پشتیبانی" onClick={() => navigate("/support", { replace: true })} />
        </aside>

        {/* محتوا */}
        <main className="panel-content">

    
  <div className="panel-note">
    با درست وارد کردن اطلاعات تکمیلی خود در فهرست طراحان سایت قرار بگیرید!
  </div>

 




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
                        <span>{uploadForm.categoryId ? `دسته‌بندی: ${selectedCategoryTitle}` : "انتخاب دسته‌بندی"}</span>
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

                <button type="button" className="btn-primary" onClick={submitUpload} disabled={uploading || !isUploadDirty()}>
                  {uploading ? "در حال ارسال..." : "بارگذاری"}
                </button>
              </div>
            </div>
          )}

          {/* ✅ پروژه‌ها */}
          {activeTab === "projects" && (
            <div className="panel-card">
              <div className="projects-header">
                <div>
                  <h2 style={{ margin: 0 }}>پروژه‌ها</h2>
                  <div className="panel-muted" style={{ marginTop: 6 }}>
                    تمام طرح‌های ثبت‌شده‌ی شما اینجا نمایش داده می‌شود.
                  </div>
                </div>

                {/* <div className="projects-actions">
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={loadProjects}
                    disabled={projectsLoading}
                    title="رفرش"
                  >
                    {projectsLoading ? "در حال دریافت..." : "رفرش"}
                  </button>
                </div> */}
              </div>

              {projectsError && <div className="projects-alert projects-alert--error">{projectsError}</div>}

              {projectsLoading ? (
                <div className="projects-grid-wrapper">
                  <div className="projects-grid">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div className="project-card project-card--skeleton" key={i}>
                        <div className="project-img skeleton-box" />
                        <div className="project-body">
                          <div className="skeleton-line w-80" />
                          <div className="skeleton-line w-60" />
                          <div className="skeleton-line w-70" />
                          <div className="project-footer">
                            <div className="skeleton-line w-60" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : projects.length === 0 ? (
                <div className="projects-empty">
                  <div className="projects-emptyTitle">فعلاً پروژه‌ای ندارید 🧩</div>
                  <div className="projects-emptyText">از تب «بارگذاری طرح» اولین پروژه‌تون رو اضافه کنید.</div>
                </div>
              ) : (
                <div className="projects-grid-wrapper">
                  <div className="projects-grid">
                    {projects.map((p) => (
                      <div className="project-card" key={p.id}>
                        <div className="project-imgWrap">
                          {p.imageUrl ? (
                            <img className="project-img" src={p.imageUrl} alt={p.title || "project"} />
                          ) : (
                            <div className="project-img project-img--empty">بدون تصویر</div>
                          )}

                          <div className="project-badges">
                            <span className="project-badge">{toCategoryTitle(p.categoryId)}</span>
                            {/* <span className="project-badge project-badge--light">#{p.id}</span> */}
                          </div>
                        </div>

                        <div className="project-body">
                          <div className="project-title">{p.title || "—"}</div>
                          {/* <div className="project-desc">{p.description?.trim() ? p.description : "بدون توضیحات"}</div> */}

                          <div className="project-footer">
                            <button type="button" className="project-editBtn" onClick={() => openEditProject(p)}>
                              ویرایش طرح
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
              {avatarCropError && <p className="settings-error">{avatarCropError}</p>}

              <div className="settings-row">
                <div className="settings-label">بیوگرافی</div>
                <div className="settings-control">
                  <textarea
                    className="settings-input"
                    value={designerExtra.bio}
                    onChange={(e) => setDesignerExtra((p) => ({ ...p, bio: e.target.value }))}
                  />
                </div>
              </div>

              <div className="settings-row">
                <div className="settings-label">لوکیشن</div>
                <div className="settings-control">
                  <input
                    className="settings-input"
                    value={designerExtra.location}
                    onChange={(e) => setDesignerExtra((p) => ({ ...p, location: e.target.value }))}
                  />
                </div>
              </div>

              <div className="settings-row">
                <div className="settings-label">تخصص</div>
                <div className="settings-control">
                  <input
                    className="settings-input"
                    value={designerExtra.specialty}
                    onChange={(e) => setDesignerExtra((p) => ({ ...p, specialty: e.target.value }))}
                  />
                </div>
              </div>

              {/* ✅ عکس پروفایل + کراپ */}
              <div className="settings-row">
                <div className="settings-label">عکس پروفایل</div>

                <div className="settings-control">
                  <input type="file" accept="image/*" onChange={(e) => onAvatarFilePicked(e.target.files?.[0] || null)} />
                </div>

                <div className="settings-hint">
                  {designerExtra.avatarFile ? `آماده‌ی ارسال: ${designerExtra.avatarFile.name}` : "یک تصویر انتخاب کنید، سپس در پنجره کراپ برش بزنید."}
                </div>

                {avatarPreviewUrl && (
                  <div className="settings-hint" style={{ marginTop: 12 }}>
                    <div style={{ fontWeight: 800, marginBottom: 6 }}>پیش‌نمایش:</div>
                    <img src={avatarPreviewUrl} alt="avatar preview" className="avatar-preview" />
                  </div>
                )}
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

      /* ✅ چند ثانیه صبر کن تا پیام موفقیت دیده شود */
      setTimeout(() => {
        window.location.reload();
      }, 1500); // هم‌زمان با prettyAlert
    } catch (e) {
      setDesignerError(e instanceof Error ? e.message : "خطا");
    } finally {
      setDesignerSaving(false);
    }
  }}
>
  {designerSaving ? "در حال ذخیره..." : "ذخیره اطلاعات"}
</button>


              </div>

              {/* ✅ مودال کراپ */}
              {isCropOpen && avatarSrc && (
                <div className="crop-modal-overlay" role="dialog" aria-modal="true">
                  <div className="crop-modal">
                    <div className="crop-modal-header">
                      <div className="crop-title">برش عکس پروفایل</div>
                      <button type="button" className="icon-btn" onClick={closeCropper} title="بستن">
                        ×
                      </button>
                    </div>

                    <div className="crop-container">
                      <Cropper
                        image={avatarSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                      />
                    </div>

                    <div className="crop-controls">
                      <div className="crop-zoom-row">
                        <span style={{ fontWeight: 800 }}>زوم</span>
                        <input
                          className="crop-zoom"
                          type="range"
                          min={1}
                          max={3}
                          step={0.01}
                          value={zoom}
                          onChange={(e) => setZoom(Number(e.target.value))}
                        />
                      </div>

                      <div className="crop-actions">
                        <button type="button" className="btn-ghost" onClick={closeCropper}>
                          انصراف
                        </button>
                        <button type="button" className="btn-primary" onClick={confirmCroppedAvatar}>
                          تایید برش
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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