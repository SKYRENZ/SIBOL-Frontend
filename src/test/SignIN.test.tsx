/// <reference types="vitest" />
import { vi, describe, it, expect, afterEach } from 'vitest';
import type { Mock } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom';

// mock the actual service module used by the component
vi.mock('../services/authService', () => ({
  login: vi.fn()
}));

import * as auth from '../services/authService';
import SignIN from '../Pages/SignIN';

const mockLogin = (auth as any).login as Mock;

describe('SignIN (frontend)', () => {
  afterEach(() => {
    mockLogin?.mockReset?.();
    localStorage.clear();
  });

  it('calls auth.login and navigates to dashboard on success', async () => {
    mockLogin.mockResolvedValue({ user: { Username: 'john.doe' } });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<SignIN />} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText(/enter your username/i), 'john.doe');
    await userEvent.type(screen.getByPlaceholderText(/enter your password/i), 'SIBOL12345');
    await userEvent.click(screen.getByRole('button', { name: /^Sign in$/i }));

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    expect(mockLogin).toHaveBeenCalledWith('john.doe', 'SIBOL12345');
  });

  it('shows error message on failed login', async () => {
    mockLogin.mockRejectedValue({ response: { data: { message: 'Invalid credentials' } } });

    render(
      <MemoryRouter>
        <SignIN />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText(/enter your username/i), 'bad.user');
    await userEvent.type(screen.getByPlaceholderText(/enter your password/i), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /^Sign in$/i }));

    await waitFor(() => {
      // component may render a generic "Login failed" message or the server message.
      expect(screen.getByText(/invalid credentials|login failed/i)).toBeInTheDocument();
    });
    expect(mockLogin).toHaveBeenCalledWith('bad.user', 'wrong');
  });
});