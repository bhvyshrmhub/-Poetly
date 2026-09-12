"use client";

import { X } from "lucide-react";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-surface border border-border-subtle rounded-[var(--radius-lg)] p-6 max-w-sm w-full shadow-xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onCancel} className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary transition-colors">
          <X size={16} strokeWidth={1.5} />
        </button>
        <h3 className="font-medium text-text-primary text-base mb-2 pr-6">{title}</h3>
        <p className="text-sm text-text-secondary mb-6 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors rounded-[var(--radius-sm)]">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-[var(--radius-sm)] transition-colors ${
              danger
                ? "bg-error text-white hover:bg-error/90"
                : "bg-brand text-white hover:bg-brand-hover"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
