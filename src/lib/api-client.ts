// const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const BASE_URL = 'http://76.13.192.114:3001';
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiClient<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  if (!res.ok) {
    throw new ApiError(res.status, `Request failed: ${res.status} ${res.statusText}`);
  }

  const json: unknown = await res.json();

  if (typeof json !== 'object' || json === null || !('success' in json) || !(json as { success: unknown }).success) {
    throw new ApiError(res.status, 'API returned an unsuccessful response');
  }

  return json as T;
}
