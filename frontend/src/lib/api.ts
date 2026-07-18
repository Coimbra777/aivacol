import axios, { AxiosError } from "axios";

const TOKEN_KEY = "aivacol_token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
});

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Callback registrado pelo AuthContext para reagir a 401 sem acoplar ao router.
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      tokenStore.clear();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

/** Extrai a mensagem de erro da API (400/404/409...) para exibir ao usuário. */
export function apiErrorMessage(error: unknown, fallback = "Algo deu errado."): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] } | undefined;
    const message = data?.message;
    if (Array.isArray(message)) return message.join(" · ");
    if (typeof message === "string") return message;
    if (error.code === "ERR_NETWORK") return "Sem conexão com a API.";
  }
  return fallback;
}
