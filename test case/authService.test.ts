import { vi, describe, it, expect, afterEach } from 'vitest';
import { login } from '../src/services/authService';

vi.mock('../src/services/apiClient', () => ({
  default: { post: vi.fn() },
}));

// use ESM import instead of require so vitest gives the mocked module
import api from '../src/services/apiClient';

describe('authService.login', () => {
  afterEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  it('saves token and user to localStorage when login succeeds', async () => {
    const payload = { token: 'abc.xyz', user: { Account_id: 3, Username: 'john.doe', Roles: 1 } };
    (api.post as any).mockResolvedValueOnce({ data: payload });

    const res = await login('john.doe', 'password123');

    expect(localStorage.getItem('token')).toBe('abc.xyz');
    expect(JSON.parse(localStorage.getItem('user') || '{}').Username).toBe('john.doe');
    expect(res).toEqual(payload);
  });

  it('does not set localStorage when no token in response', async () => {
    (api.post as any).mockResolvedValueOnce({ data: { user: { Username: 'no.token' } } });

    const res = await login('no.token', 'pw');

    expect(localStorage.getItem('token')).toBeNull();
    expect(JSON.parse(localStorage.getItem('user') || '{}').Username).toBe('no.token');
    expect(res).toEqual({ user: { Username: 'no.token' } });
  });
});