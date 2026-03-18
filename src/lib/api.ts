import type {
  ApiEnvelope,
  CreateRolePayload,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
} from '@/types/api';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1';

interface RequestOptions extends RequestInit {
  token?: string | null;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers ?? {});

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const raw = await response.text();
  const body = raw ? JSON.parse(raw) : null;

  if (!response.ok) {
    const message =
      body?.message ??
      body?.error ??
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return body as T;
}

export const api = {
  async login(payload: LoginPayload) {
    const response = await request<ApiEnvelope<LoginResponse>>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ user: payload }),
    });

    return response.data;
  },

  async register(payload: RegisterPayload) {
    const response = await request<ApiEnvelope<{ success: boolean }>>(
      '/users/register',
      {
        method: 'POST',
        body: JSON.stringify({
          ...payload,
          role: 'user',
        }),
      },
    );

    return response.data;
  },

  async createRole(payload: CreateRolePayload, token?: string | null) {
    const response = await request<ApiEnvelope<unknown>>('/roles/register', {
      method: 'POST',
      body: JSON.stringify(payload),
      token,
    });

    return response.data;
  },
};
