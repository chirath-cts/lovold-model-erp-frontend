export const mapCustomer = (row) => ({
  id: row.id,
  customerCode: row.customer_code,
  companyName: row.name,
  contactPerson: row.name,
  country: "N/A",
  name: row.name,
  email: row.email,
  phone: row.phone,
  address: row.address,
  status: row.status,
  createdAt: null,
});
