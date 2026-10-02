import axios, { AxiosError } from 'axios';

export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

export const api = axios.create({ baseURL: API_BASE_URL, timeout: 30000, withCredentials: true });

let unauthorizedHandler: (() => void) | null = null;

/** Lets the auth provider react when the session expires (any 401 outside the auth endpoints). */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && !error.config?.url?.startsWith('/auth/')) {
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  },
);

interface ApiErrorBody {
  message?: string;
  errors?: Record<string, string>;
}

/** Turns any thrown value into a message that is safe to show to the user. */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<ApiErrorBody>;
    if (!err.response) {
      return 'Unable to connect to server.';
    }
    if (err.response.status === 413) {
      return 'File is too large. The maximum size is 10 MB.';
    }
    const body = err.response.data;
    if (body && typeof body === 'object') {
      const firstField = body.errors ? Object.values(body.errors)[0] : undefined;
      return firstField ?? body.message ?? fallback;
    }
  }
  return fallback;
}
