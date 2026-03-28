import type { ApiResponse } from "@shared/types"
import { useAuthStore } from "./auth-store"
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const res = await fetch(path, {
    ...init,
    headers
  })
  const json = (await res.json()) as ApiResponse<T>
  if (!res.ok || !json.success || json.data === undefined) {
    throw new Error(json.error || 'Request failed')
  }
  return json.data
}