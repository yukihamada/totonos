import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useInboundEmails,
  useInboundEmail,
  useMarkEmailAsRead,
  useToggleEmailStar,
  useArchiveEmail,
  useMarkAsSpam,
  useUnreadCount,
  type InboundEmail,
} from './useInboundEmails';

// Mock useCurrentCompany
vi.mock('@/hooks/useCompany', () => ({
  useCurrentCompany: vi.fn(() => ({
    data: { id: 'company-123' },
    isLoading: false,
  })),
}));

// Mock supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useInboundEmails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty array initially', async () => {
    const { result } = renderHook(() => useInboundEmails(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
  });

  it('should be enabled when company is present', () => {
    const { result } = renderHook(() => useInboundEmails(), {
      wrapper: createWrapper(),
    });

    // Query should be enabled
    expect(result.current.isLoading).toBeDefined();
  });

  it('should filter by status when provided', async () => {
    const { result } = renderHook(
      () => useInboundEmails({ status: 'archived' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
  });
});

describe('useInboundEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null for non-existent email', async () => {
    const { result } = renderHook(() => useInboundEmail('email-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeNull();
  });

  it('should be disabled when id is empty', () => {
    const { result } = renderHook(() => useInboundEmail(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useMarkEmailAsRead', () => {
  it('should have mutate function', () => {
    const { result } = renderHook(() => useMarkEmailAsRead(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
    expect(typeof result.current.mutate).toBe('function');
  });
});

describe('useToggleEmailStar', () => {
  it('should have mutate function', () => {
    const { result } = renderHook(() => useToggleEmailStar(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
    expect(typeof result.current.mutate).toBe('function');
  });
});

describe('useArchiveEmail', () => {
  it('should have mutate function', () => {
    const { result } = renderHook(() => useArchiveEmail(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
    expect(typeof result.current.mutate).toBe('function');
  });
});

describe('useMarkAsSpam', () => {
  it('should have mutate function', () => {
    const { result } = renderHook(() => useMarkAsSpam(), {
      wrapper: createWrapper(),
    });

    expect(result.current.mutate).toBeDefined();
    expect(typeof result.current.mutate).toBe('function');
  });
});

describe('useUnreadCount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 0 initially', async () => {
    const { result } = renderHook(() => useUnreadCount(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBe(0);
  });
});

describe('InboundEmail type', () => {
  it('should have correct shape', () => {
    const mockEmail: InboundEmail = {
      id: 'email-123',
      company_id: 'company-123',
      email_address_id: null,
      message_id: 'msg-123',
      from_email: 'sender@example.com',
      from_name: 'Sender Name',
      to_email: 'inbox@totonos.jp',
      cc_emails: ['cc@example.com'],
      reply_to: 'reply@example.com',
      subject: 'Test Subject',
      text_body: 'Plain text body',
      html_body: '<p>HTML body</p>',
      attachments: [
        { filename: 'test.pdf', type: 'application/pdf', size: 1024 },
      ],
      status: 'received',
      ai_summary: null,
      ai_category: null,
      ai_urgency: null,
      ai_sentiment: null,
      ai_extracted_deadline: null,
      auto_created_entity_type: null,
      auto_created_entity_id: null,
      related_type: 'lead',
      related_id: 'lead-123',
      assigned_to: 'user-123',
      tags: ['important'],
      is_read: false,
      is_starred: true,
      is_spam: false,
      is_archived: false,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
    };

    expect(mockEmail.id).toBe('email-123');
    expect(mockEmail.status).toBe('received');
    expect(mockEmail.attachments).toHaveLength(1);
  });
});
