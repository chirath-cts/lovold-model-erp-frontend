import { mockDb } from "@/services/mock/mockDb";

export const usersService = {
  getList() {
    return mockDb.listUsers();
  },
};
