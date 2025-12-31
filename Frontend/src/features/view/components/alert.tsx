import { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

type AlertProps = {
  message: string;
  type?: "success" | "error";
  duration?: number; // مدت زمان نمایش به میلی‌ثانیه
  onClose?: () => void;
};

export default function Alert({ message, type = "success", duration = 3000, onClose }: AlertProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  /* ---------- رنگ‌ها ---------- */
  const backgroundColor = type === "success" ? "#38a169" : "#e53e3e"; // سبز برای موفقیت، قرمز برای خطا
  const iconColor = "white";

  return (
    <div
      className={`alert-container`}
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        minWidth: 250,
        padding: "12px 16px",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        gap: 10,
        color: "white",
        backgroundColor,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        zIndex: 9999,
      }}
    >
      {type === "success" ? <CheckCircle size={20} color={iconColor} /> : <XCircle size={20} color={iconColor} />}
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={() => setVisible(false)}
        style={{
          background: "transparent",
          border: "none",
          color: "inherit",
          cursor: "pointer",
          fontSize: 16,
          fontWeight: "bold",
        }}
      >
        ×
      </button>
    </div>
  );
}
