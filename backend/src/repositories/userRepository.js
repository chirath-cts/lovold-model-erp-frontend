import { buildOrderClause } from "../lib/sortUtils.js";

export function createUserRepository(db) {
  return {
    listUsers(query) {
      const orderClause = buildOrderClause(
        query,
        {
          createdAt: "id",
          username: "username",
          role: "role",
        },
        "createdAt",
        "DESC",
      );

      return db.all(
        `SELECT id, username, password, first_name, last_name, email, role, status
         FROM users${orderClause}`,
      );
    },
    getUserByUsername(username) {
      return db.get(
        `SELECT id, username, password, first_name, last_name, email, role, status
         FROM users
         WHERE LOWER(username) = LOWER(?)
         LIMIT 1`,
        username,
      );
    },
  };
}
