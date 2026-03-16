import { apiClient } from "@/services/http/apiClient";
import type { AuthUser } from "@/shared/types/auth";

export interface LoginPayload {
  username: string;
  password: string;
}

export const authService = {
  login(payload: LoginPayload) {
    return apiClient.create<AuthUser, LoginPayload>("auth/login", payload);
  },
};
