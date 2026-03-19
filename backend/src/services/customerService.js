import { notFoundError } from "../lib/appError.js";
import { mapCustomer } from "../mappers/customerMapper.js";

export function createCustomerService({ customerRepository }) {
  return {
    async listCustomers(query) {
      const rows = await customerRepository.listCustomers(query);
      return rows.map(mapCustomer);
    },
    async getCustomerById(id) {
      const row = await customerRepository.getCustomerById(id);
      if (!row) throw notFoundError("Customer not found");
      return mapCustomer(row);
    },
  };
}
