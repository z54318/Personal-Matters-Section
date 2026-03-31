import { useEffect } from "react";

type ToastTone = "success" | "error";

type ToastMessageProps = {
  open: boolean;
  title: string;
  description?: string;
  tone: ToastTone;
  onClose: () => void;
};

// 在页面右上角显示轻量提示，并在几秒后自动关闭。
export function ToastMessage({
  open,
  title,
  description,
  tone,
  onClose,
}: ToastMessageProps) {
  useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(() => {
      onClose();
    }, 2600);

    return () => window.clearTimeout(timer);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="pointer-events-none fixed right-5 top-5 z-50">
      <div
        className={`min-w-72 rounded-5 px-4 py-3 ${
          tone === "success"
            ? "bg-slate-900 text-white shadow-[0_20px_45px_rgba(15,23,42,0.16)]"
            : "bg-white text-slate-900 shadow-[0_20px_45px_rgba(15,23,42,0.16),inset_0_0_0_1px_rgb(248,113,113)]"
        }`}
      >
        <p className="m-0 text-sm font-semibold">{title}</p>
        {description ? (
          <p
            className={`mt-1 text-xs leading-5 ${
              tone === "success" ? "text-slate-200" : "text-slate-500"
            }`}
          >
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
