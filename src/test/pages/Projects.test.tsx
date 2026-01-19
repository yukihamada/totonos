import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import Projects from '@/pages/Projects';

// Mock hooks
vi.mock('@/hooks/useProjects', () => ({
  useProjects: () => ({
    data: [
      {
        id: '1',
        name: 'ウェブサイトリニューアル',
        status: 'in_progress',
        progress: 65,
        start_date: '2024-01-01',
        end_date: '2024-03-31',
        description: '企業サイトの全面リニューアル',
      },
      {
        id: '2',
        name: 'モバイルアプリ開発',
        status: 'planning',
        progress: 10,
        start_date: '2024-02-01',
        end_date: '2024-06-30',
        description: 'iOS/Android対応アプリ',
      },
    ],
    isLoading: false,
    error: null,
  }),
  useCreateProject: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useDeleteProject: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

describe('Projects Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render page title', async () => {
      render(<Projects />);
      await waitFor(() => {
        expect(screen.getByText('プロジェクト')).toBeInTheDocument();
      });
    });

    it('should render project list', async () => {
      render(<Projects />);
      await waitFor(() => {
        expect(screen.getByText('ウェブサイトリニューアル')).toBeInTheDocument();
        expect(screen.getByText('モバイルアプリ開発')).toBeInTheDocument();
      });
    });

    it('should display project progress', async () => {
      render(<Projects />);
      await waitFor(() => {
        expect(screen.getByText(/65%/)).toBeInTheDocument();
      });
    });
  });

  describe('status display', () => {
    it('should show in progress status', async () => {
      render(<Projects />);
      await waitFor(() => {
        expect(screen.getByText('進行中')).toBeInTheDocument();
      });
    });

    it('should show planning status', async () => {
      render(<Projects />);
      await waitFor(() => {
        expect(screen.getByText('計画中')).toBeInTheDocument();
      });
    });
  });

  describe('create button', () => {
    it('should render create project button', async () => {
      render(<Projects />);
      await waitFor(() => {
        const button = screen.getByRole('link', { name: /新規作成|プロジェクト作成/ });
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe('project cards', () => {
    it('should show project descriptions', async () => {
      render(<Projects />);
      await waitFor(() => {
        expect(screen.getByText('企業サイトの全面リニューアル')).toBeInTheDocument();
      });
    });
  });
});
