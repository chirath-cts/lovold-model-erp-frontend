import { mockDb } from "@/services/mock/mockDb";

export const workCentersService = {
  getList() {
    return mockDb.listWorkCenters();
  },
};
