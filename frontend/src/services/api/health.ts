import { API_BASE_URL } from './config';

export async function runApiDiagnostics(): Promise<{ ok: boolean; baseUrl: string; health?: unknown; login?: unknown }> {
  const baseUrl = API_BASE_URL;
  const healthRes = await fetch(`${baseUrl}/health`, { headers: { Accept: 'application/json' } });
  const health = await healthRes.json().catch(() => null);

  let login: unknown = null;
  if (import.meta.env.DEV) {
    const loginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email: 'admin@guichet.ma', password: 'Admin123!' }),
    });
    login = { status: loginRes.status, body: await loginRes.json().catch(() => null) };
  }

  return { ok: healthRes.ok, baseUrl, health, login };
}
