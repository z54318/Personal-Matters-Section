export type AuthUser = {
  id: number;
  username: string;
  nickname: string;
  bio: string;
  create_time: string;
  update_time: string;
};

export type AuthCredentials = {
  username: string;
  password: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type UpdateProfilePayload = {
  nickname: string;
  bio: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};
