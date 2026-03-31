export type AuthUser = {
  id: number;
  username: string;
};

export type AuthCredentials = {
  username: string;
  password: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};
