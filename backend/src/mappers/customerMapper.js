export const mapCustomer = (row) => ({
  id: row.id,
  customerCode: row.customer_code,
  name: row.name,
  email: row.email,
  phone: row.phone,
  address: row.address,
  status: row.status,
});
