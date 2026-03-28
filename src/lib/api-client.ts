import type { ApiResponse } from "@shared/types"
import { useAuthStore } from "./auth-store"
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  try {
    const res = await fetch(path, {
      ...init,
      headers
    });
    let json: ApiResponse<T>;
    try {
      json = (await res.json()) as ApiResponse<T>;
    } catch (parseError) {
      console.warn(`[API] Path ${path} returned malformed JSON`);
      throw new Error(`Error del servidor (${res.status}): Respuesta no válida.`);
    }
    if (!res.ok || !json.success) {
      const errMsg = json.error || `Error ${res.status}: ${res.statusText}`;
      console.warn(`[API FAIL] ${path}:`, errMsg);
      throw new Error(errMsg);
    }
    if (json.data === undefined) {
      // Some endpoints might return success but no data (e.g. 204 behavior simulation)
      return {} as T;
    }
    return json.data;
  } catch (err) {
    if (err instanceof Error) {
      console.error(`[API ERROR] ${path}:`, err.message);
      throw err;
    }
    throw new Error('Error de conexión desconocido.');
  }
}