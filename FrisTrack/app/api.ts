const DEFAULT_BASE = "http://localhost:3000/api"; // changez si nécessaire (ex: Docker/émulateur)
let API_BASE =
  (global as any).API_BASE_URL || process.env.API_BASE_URL || DEFAULT_BASE;

function buildUrl(path: string) {
  // accepte soit un chemin relatif, soit une url absolue
  if (/^https?:\/\//.test(path)) return path;
  return `${API_BASE.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

async function request<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = buildUrl(path);
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const err: any = new Error(
      data?.message || res.statusText || "Request failed"
    );
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data as T;
}

export const api = {
  get: <T = any>(path: string) => request<T>(path, { method: "GET" }),
  post: <T = any>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  put: <T = any>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  del: <T = any>(path: string) => request<T>(path, { method: "DELETE" }),
  // utilitaires
  setBaseUrl: (url: string) => {
    API_BASE = url;
    (global as any).API_BASE_URL = url;
  },
  getBaseUrl: () => API_BASE,
};

export default api;
