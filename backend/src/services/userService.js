import { mapUser } from "../mappers/userMapper.js";

export function createUserService({ userRepository }) {
  return {
    async listUsers(query) {
      const rows = await userRepository.listUsers(query);
      return rows.map(mapUser);
    },
  };
}
