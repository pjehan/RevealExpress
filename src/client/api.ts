import type { PublicConfig } from '../shared/types';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`${init?.method ?? 'GET'} ${url} failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function fetchConfig(): Promise<PublicConfig> {
  return request('/api/config');
}

export function fetchChapters(): Promise<string[]> {
  return request('/api/chapters');
}

export async function checkPassword(password: string): Promise<boolean> {
  const { valid } = await request<{ valid: boolean }>('/api/check-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  return valid;
}
