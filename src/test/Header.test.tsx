import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, afterEach } from 'vitest';

// partially mock apiClient so both default and named helpers exist
vi.mock('../services/apiClient', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    default: { get: vi.fn() },   // legacy usage in some tests/components
    apiFetch: vi.fn(),           // used by moduleService / Header
    fetchJson: vi.fn(),
  };
});

// replace require(...) with ESM import so vitest returns the mocked module
import api, { apiFetch } from '../services/apiClient';
import Header from '../Components/Header';

describe('Header component', () => {
  afterEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  it('renders allowed links returned by API', async () => {
    const allowed = [
      { Module_id: 1, Name: 'Dashboard', Path: '/dashboard' },
      { Module_id: 3, Name: 'Maintenance', Path: '/maintenance' },
    ];
    // Header (via moduleService) calls apiFetch, mock that to return a Response-like object
    (apiFetch as any).mockResolvedValueOnce({
      text: async () => JSON.stringify(allowed)
    });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Maintenance')).toBeInTheDocument();
    });
  });

  it('renders no links when API returns empty', async () => {
    // API returns empty allowed modules — component should still render default links,
    // but Admin (module id 6) shouldn't be present.
    (apiFetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => []
    });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    });
  });
});