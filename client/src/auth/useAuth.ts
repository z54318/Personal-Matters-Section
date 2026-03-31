import { useContext } from "react";
import { AuthContext } from "./AuthProvider";

// 统一读取认证上下文，避免在页面里直接操作 Context 对象。
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth 必须在 AuthProvider 内使用");
  }

  return context;
}
