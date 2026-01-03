import { useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface FloatingMessageProps {
  message: string;
  type: "success" | "error";
  onClose?: () => void;
}

export default function FloatingMessage({ message, type, onClose }: FloatingMessageProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose?.(), 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "#4CAF50" : "#F44336"; // سبز موفقیت، قرمز خطا
  const iconColor = "#fff";

  return (
    <div
      className={`floating-message ${type}`}
      style={{
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        padding: "14px 20px",
        borderRadius: "12px",
        color: iconColor,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: bgColor,
        boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
        animation: "fadeInOut 2s forwards",
        zIndex: 9999,
      }}
    >
      {type === "success" ? <CheckCircle size={20} /> : <XCircle size={20} />}
      {message}
      <style>
        {`
          @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -10px); }
            10% { opacity: 1; transform: translate(-50%, 0); }
            90% { opacity: 1; transform: translate(-50%, 0); }
            100% { opacity: 0; transform: translate(-50%, -10px); }
          }
        `}
      </style>
    </div>
  );
}
