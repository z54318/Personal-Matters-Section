import type { AuthUser } from "../pages/auth/model/auth.types";

const AUTH_TOKEN_KEY = "todo_auth_token";
const AUTH_USER_KEY = "todo_auth_user";
const AUTH_CHANGE_EVENT = "todo-auth-change";

// 读取本地保存的登录 token。
export function getAuthToken() {
  return window.localStorage.getItem(AUTH_TOKEN_KEY) || "";
}

// 读取本地保存的用户信息。
export function getAuthUser(): AuthUser | null {
  const rawUser = window.localStorage.getItem(AUTH_USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    return null;
  }
}

// 登录或注册成功后，把 token 和用户信息一起写入本地存储。
export function saveAuthSession(token: string, user: AuthUser) {
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

// 只同步用户资料，不改动已有 token。
export function saveAuthUser(user: AuthUser) {
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

// 退出登录或 token 失效时，统一清理本地登录态。
export function clearAuthSession() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export { AUTH_CHANGE_EVENT };
