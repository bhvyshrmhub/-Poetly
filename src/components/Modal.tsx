"use client";

import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-scale-in">
      <div className="absolute inset-0 bg-text-primary/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface rounded-[var(--radius-lg)] shadow-lg max-w-lg w-full max-h-[85vh] overflow-y-auto border border-border-subtle">
        <div className="flex items-center justify-between p-4 border-b border-border-subtle">
          {title && (
            <h2 className="font-poem text-lg font-medium text-text-primary">{title}</h2>
          )}
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary transition-colors p-1 rounded-[var(--radius-sm)] hover:bg-surface-hover"
            aria-label="Close"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
