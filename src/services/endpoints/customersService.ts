import { mockDb } from "@/services/mock/mockDb";

export const customersService = {
  getList() {
    return mockDb.listCustomers();
  },
  getById(id: string) {
    return mockDb.getCustomerById(id);
  },
};
