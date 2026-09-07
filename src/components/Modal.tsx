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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background rounded-lg shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border-light">
          {title && (
            <h2 className="font-serif text-lg font-medium">{title}</h2>
          )}
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-foreground transition-colors p-1"
            aria-label="Close"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
