import { request } from "../../../lib/request";
import type {
  AuthCredentials,
  AuthResponse,
  AuthUser,
  ChangePasswordPayload,
  UpdateProfilePayload,
} from "../model/auth.types";

const AUTH_API_URL = "/auth";

export const authApi = {
  // 调用登录接口，返回 token 和当前用户信息。
  login: async (payload: AuthCredentials) => {
    const response = await request.post<AuthResponse>(`${AUTH_API_URL}/login`, payload);
    return response.data;
  },

  // 调用注册接口，注册成功后直接拿到登录态。
  register: async (payload: AuthCredentials) => {
    const response = await request.post<AuthResponse>(
      `${AUTH_API_URL}/register`,
      payload
    );
    return response.data;
  },

  // 页面刷新后，用本地 token 拉取当前用户信息。
  getCurrentUser: async () => {
    const response = await request.get<AuthUser>(`${AUTH_API_URL}/me`);
    return response.data;
  },

  // 获取个人中心需要展示的完整资料。
  getProfile: async () => {
    const response = await request.get<AuthUser>(`${AUTH_API_URL}/profile`);
    return response.data;
  },

  // 更新个人中心中的昵称和个人简介。
  updateProfile: async (payload: UpdateProfilePayload) => {
    const response = await request.put<AuthUser>(`${AUTH_API_URL}/profile`, payload);
    return response.data;
  },

  // 登录后允许用户修改自己的密码。
  changePassword: async (payload: ChangePasswordPayload) => {
    const response = await request.post<{ success: true; message: string }>(
      `${AUTH_API_URL}/change-password`,
      payload
    );
    return response.data;
  },
};
