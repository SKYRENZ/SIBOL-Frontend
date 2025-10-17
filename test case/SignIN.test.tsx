import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, afterEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom'

vi.mock('../src/services/auth'); // mock the auth service

import * as auth from '../src/services/auth';
import SignIN from '../src/Pages/SignIN';

const mockLogin = (auth as any).login as vi.Mock;

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

    // wait for navigation to dashboard
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
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});