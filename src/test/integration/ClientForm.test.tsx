import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ClientDuplicateDialog } from '@/components/ClientDuplicateDialog';
import React from 'react';

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('ClientDuplicateDialog', () => {
  const mockDuplicates = [
    { id: '1', name: '株式会社テスト', email: 'test@example.com', matchType: 'both' as const },
    { id: '2', name: 'テスト商事', email: null, matchType: 'name' as const },
  ];

  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders duplicate clients list', () => {
    render(
      <ClientDuplicateDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        duplicates={mockDuplicates}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('重複の可能性がある取引先')).toBeInTheDocument();
    expect(screen.getByText('株式会社テスト')).toBeInTheDocument();
    expect(screen.getByText('テスト商事')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('displays correct match type badges', () => {
    render(
      <ClientDuplicateDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        duplicates={mockDuplicates}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('名前・メール一致')).toBeInTheDocument();
    expect(screen.getByText('名前一致')).toBeInTheDocument();
  });

  it('calls onConfirm when force register button is clicked', async () => {
    render(
      <ClientDuplicateDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        duplicates={mockDuplicates}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
      { wrapper: createWrapper() }
    );

    const confirmButton = screen.getByText('それでも登録する');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalled();
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    render(
      <ClientDuplicateDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        duplicates={mockDuplicates}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
      { wrapper: createWrapper() }
    );

    const cancelButton = screen.getByText('キャンセル');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  it('does not render when closed', () => {
    render(
      <ClientDuplicateDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        duplicates={mockDuplicates}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.queryByText('重複の可能性がある取引先')).not.toBeInTheDocument();
  });

  it('handles email-only match type', () => {
    const emailOnlyDuplicates = [
      { id: '3', name: '別の会社', email: 'same@email.com', matchType: 'email' as const },
    ];

    render(
      <ClientDuplicateDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        duplicates={emailOnlyDuplicates}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('メール一致')).toBeInTheDocument();
  });
});
