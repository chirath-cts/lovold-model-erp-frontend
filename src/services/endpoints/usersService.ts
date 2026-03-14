import { apiClient } from "@/services/http/apiClient";
import type { User } from "@/shared/types/domain";

const RESOURCE = "users";

export const usersService = {
  getList() {
    return apiClient.getList<User>(RESOURCE);
  },
};
