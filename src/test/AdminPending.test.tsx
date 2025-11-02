/// <reference types="vitest" />
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';

// mock the hook before importing the page
vi.mock('../hooks/useAdminPending', () => ({
  useAdminPending: vi.fn()
}));

// dynamically import mocked hook and component after mock is installed
const { useAdminPending } = await import('../hooks/useAdminPending');
const AdminPendingModule = await import('../Pages/AdminPending');
const AdminPending = AdminPendingModule.default ?? AdminPendingModule;

describe('AdminPending page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('redirects to /dashboard when token query param present', async () => {
    (useAdminPending as any).mockReturnValue({
      email: 'a@b.com',
      isSSO: false,
      checkingStatus: false,
      topLogo: '',
      leftBg: '',
      leftLogo: '',
      checkAccountStatus: () => {},
      goBackToLogin: () => {}
    });

    // include a target route to verify navigation
    render(
      <MemoryRouter initialEntries={['/admin-pending?token=tok123&user=%7B%7D']}>
        <Routes>
          <Route path="/admin-pending" element={<AdminPending />} />
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    });

    // token should be stored
    expect(localStorage.getItem('token')).toBe('tok123');
  });

  it('redirects to /login when auth=fail', async () => {
    (useAdminPending as any).mockReturnValue({
      email: 'a@b.com',
      isSSO: false,
      checkingStatus: false,
      topLogo: '',
      leftBg: '',
      leftLogo: '',
      checkAccountStatus: () => {},
      goBackToLogin: () => {}
    });

    render(
      <MemoryRouter initialEntries={['/admin-pending?auth=fail']}>
        <Routes>
          <Route path="/admin-pending" element={<AdminPending />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  it('renders pending UI when no redirect params are present', async () => {
    (useAdminPending as any).mockReturnValue({
      email: 'admin@domain.com',
      isSSO: true,
      checkingStatus: false,
      topLogo: '',
      leftBg: '',
      leftLogo: '',
      checkAccountStatus: () => {},
      goBackToLogin: () => {}
    });

    render(
      <MemoryRouter initialEntries={['/admin-pending']}>
        <Routes>
          <Route path="/admin-pending" element={<AdminPending />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Account Pending Approval/i)).toBeInTheDocument();
    expect(screen.getByText(/admin@domain.com/i)).toBeInTheDocument();
  });
});