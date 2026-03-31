import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 提交登录表单，并在成功后跳转回受保护页面。
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      setErrorMessage("请输入用户名和密码");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await login({
        username: username.trim(),
        password,
      });

      const redirectTo =
        (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ||
        "/todos";

      navigate(redirectTo, { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "登录失败，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="card-surface w-full max-w-md">
        <div className="mb-6">
          <p className="mb-2 inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
            欢迎回来
          </p>
          <h1 className="m-0 text-3xl font-800 text-slate-900">登录账号</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            登录后可以查看和管理你自己的事项列表。
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600" htmlFor="login-username">
              用户名
            </label>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="请输入用户名"
              className="field-base"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600" htmlFor="login-password">
              密码
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="请输入密码"
              className="field-base"
            />
          </div>

          {errorMessage ? (
            <div className="rounded-4 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {errorMessage}
            </div>
          ) : null}

          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? "登录中..." : "立即登录"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          还没有账号？
          <Link
            to="/register"
            className="ml-1 font-medium text-cyan-700 no-underline hover:text-cyan-600"
          >
            去注册
          </Link>
        </p>
      </section>
    </main>
  );
}
