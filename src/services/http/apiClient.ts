import { ApiError } from "@/services/http/errors";

type QueryValue = string | number | boolean | undefined | null;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4001";

const buildQuery = (query?: Record<string, QueryValue>): string => {
  if (!query) return "";

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, String(value));
  });

  const parsed = params.toString();
  return parsed ? `?${parsed}` : "";
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(text || "Request failed", response.status);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
};

export const apiClient = {
  getList<T>(resource: string, query?: Record<string, QueryValue>) {
    return request<T[]>(`/${resource}${buildQuery(query)}`);
  },
  getById<T>(resource: string, id: string) {
    return request<T>(`/${resource}/${id}`);
  },
  create<T, TPayload>(resource: string, payload: TPayload) {
    return request<T>(`/${resource}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  update<T, TPayload>(resource: string, id: string, payload: TPayload) {
    return request<T>(`/${resource}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  remove(resource: string, id: string) {
    return request<void>(`/${resource}/${id}`, {
      method: "DELETE",
    });
  },
};
