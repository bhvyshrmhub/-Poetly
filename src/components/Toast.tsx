"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, duration = 3000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 250);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed bottom-24 md:bottom-8 left-1/2 z-50 px-4 py-2.5 bg-text-primary text-background text-sm rounded-[var(--radius-full)] shadow-lg font-medium ${
        visible ? "toast-enter" : "toast-exit"
      }`}
    >
      {message}
    </div>
  );
}
