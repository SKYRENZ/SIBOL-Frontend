export {}; // ensure this file is a module and avoid polluting global scope

/// <reference types="vitest" />
import { vi, describe, it, expect, afterEach } from 'vitest';
import type { Mock } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock the correct service module that SignIN.tsx actually imports
vi.mock('../services/auth', () => ({
  login: vi.fn(),
  isAuthenticated: vi.fn(() => false), // Mock isAuthenticated to return false
  getToken: vi.fn(() => null),
  getUser: vi.fn(() => null),
  logout: vi.fn(),
  register: vi.fn(),
  verifyToken: vi.fn()
}));

import * as auth from '../services/authService';
import SignIN from '../Pages/SignIN';

const mockLogin = auth.login as Mock;

describe('SignIN (frontend)', () => {
  afterEach(() => {
    mockLogin?.mockReset?.();
    localStorage.clear();
  });

  it('calls auth.login and navigates to dashboard on success', async () => {
    const mockUser = { Account_id: 1, Username: 'john.doe', Roles: 1 };
    const mockToken = 'test-token-123';
    
    mockLogin.mockResolvedValue({ 
      user: mockUser,
      token: mockToken
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<SignIN />} />
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    const usernameInput = screen.getByPlaceholderText(/enter your username/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const signInButton = screen.getByRole('button', { name: /^Sign in$/i });

    await userEvent.type(usernameInput, 'john.doe');
    await userEvent.type(passwordInput, 'SIBOL12345');
    await userEvent.click(signInButton);

    await waitFor(() => {
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    });

    expect(mockLogin).toHaveBeenCalledWith('john.doe', 'SIBOL12345');
    expect(localStorage.getItem('token')).toBe(mockToken);
    expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
  });

  it('shows error message on failed login', async () => {
    const errorMessage = 'Invalid credentials';
    
    mockLogin.mockRejectedValue(new Error(errorMessage));

    render(
      <MemoryRouter>
        <SignIN />
      </MemoryRouter>
    );

    const usernameInput = screen.getByPlaceholderText(/enter your username/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const signInButton = screen.getByRole('button', { name: /^Sign in$/i });

    await userEvent.type(usernameInput, 'bad.user');
    await userEvent.type(passwordInput, 'wrong');
    await userEvent.click(signInButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials|login failed/i)).toBeInTheDocument();
    });
    
    expect(mockLogin).toHaveBeenCalledWith('bad.user', 'wrong');
  });
});