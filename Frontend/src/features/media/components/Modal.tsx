import React from "react";
import "../styles/Modal.css";

interface ConfirmModalProps {
  title: string;
  message: string;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ title, message, isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3 className="modal-title">{title}</h3>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onCancel}>
            لغو
          </button>
          <button className="btn-confirm" onClick={onConfirm}>
            تایید
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
