import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

function FullPageState({ title }: { title: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="card-surface w-full max-w-md text-center">
        <p className="m-0 text-sm font-medium text-slate-500">{title}</p>
      </div>
    </main>
  );
}

// 保护需要登录后才能访问的页面。
export function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <FullPageState title="正在恢复登录状态..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

// 拦截登录后不该再访问的页面，例如登录页和注册页。
export function GuestRoute() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return <FullPageState title="正在检查登录状态..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/todos" replace />;
  }

  return <Outlet />;
}
