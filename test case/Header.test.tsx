import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, afterEach } from 'vitest';

vi.mock('../src/services/apiClient', () => ({
  default: { get: vi.fn() },
}));

// replace require(...) with ESM import so vitest returns the mocked module
import api from '../src/services/apiClient';
import Header from '../src/Components/Header';

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
    (api.get as any).mockResolvedValueOnce({ data: allowed });

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
    (api.get as any).mockResolvedValueOnce({ data: [] });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });
  });
});