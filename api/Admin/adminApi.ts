// Standalone fetch-based client for the /admin/* panel. Deliberately not
// reusing `api/index.tsx`'s axios instance: admin sessions use their own
// token store (see below) so an admin login never touches the guest/host
// cookie session (and vice versa). Calls use relative URLs so they go
// through the same next.config.js rewrite as the rest of the site.

const TOKEN_KEY = "lidoma_admin_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function apiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const res = await fetch(path, {
    ...options,
    headers: {
      // Omit Content-Type for FormData — the browser must set its own
      // multipart boundary, which a manual header would clobber.
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) {
      clearToken();
      if (typeof window !== "undefined") window.location.href = "/admin/login";
    }
    throw new ApiError(res.status, body?.message ?? "خطای غیرمنتظره", body?.code);
  }

  return body.data ?? body;
}

export async function apiFetchPaginated<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<{ items: T[]; meta: { page: number; pageSize: number; total: number; pageCount: number } }> {
  const token = getToken();
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const body = await res.json();
  if (!res.ok) throw new ApiError(res.status, body?.message ?? "خطا", body?.code);
  return { items: body.data, meta: body.meta };
}
