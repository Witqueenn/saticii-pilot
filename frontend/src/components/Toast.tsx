"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const STYLES = {
  success: "bg-gray-900 text-white border-gray-700",
  error:   "bg-red-600 text-white border-red-500",
  info:    "bg-white text-gray-900 border-gray-200 shadow-lg",
};

const ICON_COLORS = {
  success: "text-green-400",
  error:   "text-red-200",
  info:    "text-orange-500",
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
  const Icon = ICONS[toast.type];
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium
        shadow-xl pointer-events-auto animate-in slide-in-from-bottom-2 fade-in duration-200
        ${STYLES[toast.type]}`}
      style={{ minWidth: 280, maxWidth: 400 }}
    >
      <Icon className={`w-4 h-4 flex-shrink-0 ${ICON_COLORS[toast.type]}`} />
      <span className="flex-1 leading-snug">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++counter.current;
    setToasts((prev) => [...prev.slice(-3), { id, type, message }]);
    setTimeout(() => remove(id), 3500);
  }, [remove]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
