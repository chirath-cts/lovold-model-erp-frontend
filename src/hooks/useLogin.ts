import type { User } from "models/user";
import { useState, useCallback } from "react";

interface UseLoginReturn {
  handleLogin: (username: string, password: string) => Promise<User | null>;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}

const API_URL = "http://localhost:4000/users";

export const useLogin = (): UseLoginReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = useCallback(
    async (username: string, password: string): Promise<User | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const users: User[] = await response.json();

        if (!users || !Array.isArray(users)) {
          throw new Error("Invalid response format from server");
        }

        const user = users.find(
          (u: User) => u.username === username && u.password === password,
        );

        if (!user) {
          setError("Invalid username or password");
          setIsLoading(false);
          return null;
        }

        setIsLoading(false);
        return user;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to connect to the server";
        setError(errorMessage);
        setIsLoading(false);
        return null;
      }
    },
    [],
  );

  return {
    handleLogin,
    isLoading,
    error,
    setError,
  };
};
