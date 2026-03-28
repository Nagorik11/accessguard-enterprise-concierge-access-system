import type { ApiResponse } from "@shared/types"
import { useAuthStore } from "./auth-store"
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  if (token && typeof token === 'string' && token.length > 0) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  try {
    const res = await fetch(path, {
      ...init,
      headers
    });
    // Handle 204 No Content or empty bodies
    if (res.status === 204) {
      return {} as T;
    }
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      if (res.ok) return {} as T;
      const text = await res.text();
      console.error(`[API FATAL] Non-JSON response from ${path}:`, text.slice(0, 200));
      throw new Error(`Error ${res.status}: Respuesta del servidor no válida.`);
    }
    let json: ApiResponse<T>;
    try {
      json = (await res.json()) as ApiResponse<T>;
    } catch (parseError) {
      console.warn(`[API] Path ${path} returned malformed JSON`);
      throw new Error(`Error ${res.status}: Respuesta corrupta.`);
    }
    if (!res.ok || !json.success) {
      const errMsg = json.error || `Error ${res.status}: ${res.statusText}`;
      console.warn(`[API FAIL] ${path}:`, errMsg);
      throw new Error(errMsg);
    }
    // Return empty object as T if data is missing but success is true
    return (json.data ?? ({} as T)) as T;
  } catch (err) {
    if (err instanceof Error) {
      console.error(`[API ERROR] ${path}:`, err.message);
      throw err;
    }
    throw new Error('Error de conexión desconocido.');
  }
}