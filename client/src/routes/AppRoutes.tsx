import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { ChangePasswordPage, LoginPage, RegisterPage } from "../pages/auth";
import { TodoPage } from "../pages/todo";
import { GuestRoute, ProtectedRoute } from "./RouteGuards";

// 根据当前登录态，把首页自动导向合适的页面。
function IndexRedirect() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return null;
  }

  return <Navigate to={isAuthenticated ? "/todos" : "/login"} replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<IndexRedirect />} />
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/todos" element={<TodoPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
