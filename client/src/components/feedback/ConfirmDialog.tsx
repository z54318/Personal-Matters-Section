import { AlertDialog } from "@radix-ui/themes";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
};

// 统一封装二次确认弹窗，删除和批量清理都可以复用。
export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "确认",
  cancelText = "取消",
  loading = false,
  onConfirm,
  onOpenChange,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Content
        maxWidth="420px"
        className="rounded-5 border-0 bg-white/98 shadow-[0_20px_45px_rgba(15,23,42,0.16)]"
      >
        <AlertDialog.Title className="text-slate-900">{title}</AlertDialog.Title>
        <AlertDialog.Description className="leading-6 text-slate-500">
          {description}
        </AlertDialog.Description>
        <div className="mt-5 flex justify-end gap-3">
          <AlertDialog.Cancel>
            <button
              type="button"
              className="appearance-none rounded-full border-0 bg-white px-4 py-2 text-sm font-medium text-slate-500 outline-none shadow-[inset_0_0_0_1px_rgb(100,116,139)] transition-colors duration-200 hover:bg-white hover:text-slate-700"
            >
              {cancelText}
            </button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <button
              type="button"
              onClick={() => {
                void onConfirm();
              }}
              disabled={loading}
              className="appearance-none rounded-full border-0 bg-slate-900 px-4 py-2 text-sm font-medium text-white outline-none shadow-none transition-colors duration-200 hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "处理中..." : confirmText}
            </button>
          </AlertDialog.Action>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
