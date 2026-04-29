"use client";

import { useApp } from "@/contexts/AppContext";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

export default function Notification() {
  const { notification, showNotification } = useApp();
  if (!notification) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-green-400" />,
    error: <XCircle className="w-4 h-4 text-red-400" />,
    info: <Info className="w-4 h-4 text-[#6366f1]" />,
  };

  const styles = {
    success: "bg-green-500/10 border-green-500/25 text-green-300",
    error: "bg-red-500/10 border-red-500/25 text-red-300",
    info: "bg-[#6366f1]/10 border-[#6366f1]/25 text-[#a5b4fc]",
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] slide-up">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-xl ${styles[notification.type]}`}
      >
        {icons[notification.type]}
        <span className="text-sm font-medium">{notification.message}</span>
        <button
          onClick={() => showNotification("", "info")}
          className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
