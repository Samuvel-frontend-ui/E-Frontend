const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export interface ApiRequestOptions extends RequestInit {
  json?: any;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const url = `${API_URL}${path}`;
  const headers = new Headers(options.headers || {});

  // Automatically content-type json if json payload is provided
  if (options.json) {
    headers.set('Content-Type', 'application/json');
    options.body = JSON.stringify(options.json);
  }

  // Always request with credentials to include httpOnly session cookies
  const requestOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include'
  };

  const response = await fetch(url, requestOptions);

  if (!response.ok) {
    let errData: any = {};
    try {
      errData = await response.json();
    } catch {
      try {
        errData = { error: await response.text() };
      } catch {
        errData = { error: 'Unknown API error' };
      }
    }
    throw new ApiError(
      response.status,
      errData.error || `HTTP error! Status: ${response.status}`,
      errData
    );
  }

  // Standard return format is JSON
  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}
