import { useEffect } from "react";
import "../styles/login_modal.css";

type LoginRequiredModalProps = {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
};

export default function LoginRequiredModal({
  open,
  title = "ورود لازم است",
  description = "برای استفاده از چت باید وارد حساب کاربری شوید. آیا می‌خواهید وارد شوید؟",
  confirmText = "ورود",
  cancelText = "فعلاً نه",
  onConfirm,
  onClose,
}: LoginRequiredModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="lrmodal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="lrmodal" onClick={(e) => e.stopPropagation()}>
        <div className="lrmodal-title">{title}</div>
        <div className="lrmodal-desc">{description}</div>

        <div className="lrmodal-actions">
          <button type="button" className="lrmodal-cancel" onClick={onClose}>
            {cancelText}
          </button>
          <button type="button" className="lrmodal-confirm" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
