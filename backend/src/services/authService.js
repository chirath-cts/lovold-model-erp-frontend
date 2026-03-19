import {
  badRequestError,
  forbiddenError,
  unauthorizedError,
} from "../lib/appError.js";
import { mapSafeUser } from "../mappers/userMapper.js";

export function createAuthService({ userRepository }) {
  return {
    async login(payload) {
      const { username, password } = payload ?? {};
      if (!username || !password) {
        throw badRequestError("username and password are required");
      }

      const row = await userRepository.getUserByUsername(username);
      if (!row) throw unauthorizedError("Invalid username or password");
      if (row.status && row.status !== "active") {
        throw forbiddenError("User is not active");
      }
      if (row.password !== password) {
        throw unauthorizedError("Invalid username or password");
      }

      return mapSafeUser(row);
    },
  };
}
