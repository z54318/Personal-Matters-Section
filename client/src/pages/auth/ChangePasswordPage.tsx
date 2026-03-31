import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "./services/auth-api";

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 提交修改密码表单，成功后自动返回事项页。
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setErrorMessage("请完整填写旧密码、新密码和确认密码");
      setSuccessMessage("");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("两次输入的新密码不一致");
      setSuccessMessage("");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const result = await authApi.changePassword({
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccessMessage(result.message);

      window.setTimeout(() => {
        navigate("/todos", { replace: true });
      }, 800);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "修改密码失败，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="card-surface w-full max-w-md">
        <div className="mb-6">
          <p className="mb-2 inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
            账号安全
          </p>
          <h1 className="m-0 text-3xl font-800 text-slate-900">修改密码</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            修改成功后会自动返回事项页，下次登录请使用新密码。
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-slate-600"
              htmlFor="change-current-password"
            >
              旧密码
            </label>
            <input
              id="change-current-password"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder="请输入当前密码"
              className="field-base"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600" htmlFor="change-new-password">
              新密码
            </label>
            <input
              id="change-new-password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="请输入 6 到 32 位新密码"
              className="field-base"
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-slate-600"
              htmlFor="change-confirm-password"
            >
              确认新密码
            </label>
            <input
              id="change-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="请再次输入新密码"
              className="field-base"
            />
          </div>

          {errorMessage ? (
            <div className="rounded-4 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {errorMessage}
            </div>
          ) : null}

          {successMessage ? (
            <div className="rounded-4 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
              {successMessage}
            </div>
          ) : null}

          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? "提交中..." : "确认修改密码"}
          </button>
        </form>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={() => navigate("/todos")}
            className="appearance-none rounded-full border-0 bg-white px-4 py-2 text-sm font-medium text-slate-500 outline-none shadow-[inset_0_0_0_1px_rgb(148,163,184)] transition-colors duration-200 hover:text-slate-700"
          >
            返回事项页
          </button>
        </div>
      </section>
    </main>
  );
}
