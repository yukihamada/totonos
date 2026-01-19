import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import Invoices from '@/pages/Invoices';

// Mock hooks
vi.mock('@/hooks/useInvoices', () => ({
  useInvoices: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
  useCreateInvoice: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useUpdateInvoiceStatus: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useDeleteInvoice: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/hooks/useClients', () => ({
  useClients: () => ({
    data: [],
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useEmailSending', () => ({
  useSendEmail: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/hooks/useStripePayment', () => ({
  useCreatePaymentSession: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

describe('Invoices Page', () => {
  describe('rendering', () => {
    it('should render page title', async () => {
      render(<Invoices />);
      await waitFor(() => {
        expect(screen.getByText('請求書一覧')).toBeInTheDocument();
      });
    });

    it('should render the page container', async () => {
      const { container } = render(<Invoices />);
      await waitFor(() => {
        expect(container.querySelector('main')).toBeInTheDocument();
      });
    });
  });
});
