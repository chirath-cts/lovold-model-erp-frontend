import type { User } from "@/shared/types/domain";

export type AuthUser = Omit<User, "password">;
