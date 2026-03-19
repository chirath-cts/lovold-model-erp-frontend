export const mapUser = (row) => ({
  id: row.id,
  username: row.username,
  password: row.password,
  firstName: row.first_name,
  lastName: row.last_name,
  email: row.email,
  role: row.role,
  status: row.status,
  createdAt: null,
});

export const mapSafeUser = (row) => {
  const { password, ...user } = mapUser(row);
  return user;
};
