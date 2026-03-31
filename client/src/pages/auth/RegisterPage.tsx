import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 提交注册表单，成功后直接进入事项页。
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      setErrorMessage("请完整填写注册信息");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("两次输入的密码不一致");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await register({
        username: username.trim(),
        password,
      });
      navigate("/todos", { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "注册失败，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="card-surface w-full max-w-md">
        <div className="mb-6">
          <p className="mb-2 inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
            创建账号
          </p>
          <h1 className="m-0 text-3xl font-800 text-slate-900">注册账号</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            注册后即可拥有自己的事项空间，数据会和其他用户隔离。
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600" htmlFor="register-username">
              用户名
            </label>
            <input
              id="register-username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="只能包含字母、数字和下划线"
              className="field-base"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600" htmlFor="register-password">
              密码
            </label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="密码长度 6 到 32 位"
              className="field-base"
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-slate-600"
              htmlFor="register-confirm-password"
            >
              确认密码
            </label>
            <input
              id="register-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="请再次输入密码"
              className="field-base"
            />
          </div>

          {errorMessage ? (
            <div className="rounded-4 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {errorMessage}
            </div>
          ) : null}

          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? "注册中..." : "立即注册"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          已经有账号？
          <Link
            to="/login"
            className="ml-1 font-medium text-cyan-700 no-underline hover:text-cyan-600"
          >
            去登录
          </Link>
        </p>
      </section>
    </main>
  );
}
