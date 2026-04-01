import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  AUTH_CHANGE_EVENT,
  clearAuthSession,
  getAuthToken,
  getAuthUser,
  saveAuthSession,
  saveAuthUser,
} from "../lib/auth-storage";
import { authApi } from "../pages/auth/services/auth-api";
import type { AuthCredentials, AuthUser } from "../pages/auth/model/auth.types";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (payload: AuthCredentials) => Promise<void>;
  register: (payload: AuthCredentials) => Promise<void>;
  syncUser: (nextUser: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export { AuthContext };

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(getAuthUser());
  const [isInitializing, setIsInitializing] = useState(Boolean(getAuthToken()));

  // 统一处理登录成功后的本地状态更新。
  const applyAuthResult = useCallback((token: string, nextUser: AuthUser) => {
    saveAuthSession(token, nextUser);
    setUser(nextUser);
  }, []);

  // 页面刷新后，尝试用本地 token 恢复登录态。
  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      setIsInitializing(false);
      return;
    }

    let isMounted = true;

    authApi
      .getCurrentUser()
      .then((nextUser) => {
        if (!isMounted) {
          return;
        }

        saveAuthSession(token, nextUser);
        setUser(nextUser);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        clearAuthSession();
        setUser(null);
      })
      .finally(() => {
        if (isMounted) {
          setIsInitializing(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 监听全局登录态变化，保证拦截器清理 token 后页面也能立刻同步。
  useEffect(() => {
    const handleAuthChange = () => {
      setUser(getAuthUser());
    };

    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    };
  }, []);

  // 调用登录接口并保存会话。
  const login = useCallback(
    async (payload: AuthCredentials) => {
      const result = await authApi.login(payload);
      applyAuthResult(result.token, result.user);
    },
    [applyAuthResult]
  );

  // 调用注册接口并保存会话。
  const register = useCallback(
    async (payload: AuthCredentials) => {
      const result = await authApi.register(payload);
      applyAuthResult(result.token, result.user);
    },
    [applyAuthResult]
  );

  // 同步当前登录用户资料，供个人中心保存后立即刷新页面头部信息。
  const syncUser = useCallback((nextUser: AuthUser) => {
    saveAuthUser(nextUser);
    setUser(nextUser);
  }, []);

  // 主动退出登录时，清理本地会话并回到未登录状态。
  const logout = useCallback(() => {
    clearAuthSession();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isInitializing,
      login,
      register,
      syncUser,
      logout,
    }),
    [user, isInitializing, login, register, syncUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
