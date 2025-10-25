import { vi, describe, it, expect, afterEach } from 'vitest';
import { login } from '../services/authService';

vi.mock('../services/apiClient', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    default: { post: vi.fn() },    // keep default shape used by some tests
    fetchJson: vi.fn(),            // used by authService.login
    apiFetch: vi.fn(),             // keep available if other modules need it
  };
});

// use ESM import so vitest gives the mocked module
import api, { fetchJson } from '../services/apiClient';

describe('authService.login', () => {
  afterEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  it('saves token and user to localStorage when login succeeds', async () => {
    const payload = { token: 'abc.xyz', user: { Account_id: 3, Username: 'john.doe', Roles: 1 } };
    (fetchJson as any).mockResolvedValueOnce(payload);   // authService.login calls fetchJson
    const res = await login('john.doe', 'password123');
    expect(localStorage.getItem('token')).toBe('abc.xyz');
    expect(JSON.parse(localStorage.getItem('user') || '{}').Username).toBe('john.doe');
    expect(res).toEqual(payload);
  });

  it('does not set localStorage when no token in response', async () => {
    (fetchJson as any).mockResolvedValueOnce({ user: { Username: 'no.token' } });
    const res = await login('no.token', 'pw');
    expect(localStorage.getItem('token')).toBeNull();
    expect(JSON.parse(localStorage.getItem('user') || '{}').Username).toBe('no.token');
    expect(res).toEqual({ user: { Username: 'no.token' } });
  });
});