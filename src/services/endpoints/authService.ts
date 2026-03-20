import { ApiError } from "@/services/errors";
import { mockDb } from "@/services/mock/mockDb";
import type { AuthUser } from "@/shared/types/auth";

export interface LoginPayload {
  username: string;
  password: string;
}

export const authService = {
  async login(payload: LoginPayload) {
    const username = payload.username.trim();
    const user = mockDb.findUser(username);

    if (!user || user.password !== payload.password || user.status !== "active") {
      throw new ApiError("Invalid username or password.", 401);
    }

    const { password: passwordToOmit, ...authUser } = user;
    void passwordToOmit;
    return authUser as AuthUser;
  },
};
