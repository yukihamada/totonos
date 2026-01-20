import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import Payroll from '@/pages/Payroll';

// Mock hooks
vi.mock('@/hooks/useHR', () => ({
  useEmployees: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
  usePayrollRecords: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
  useAttendanceRecords: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
  useCreatePayroll: () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

describe('Payroll Page', () => {
  describe('rendering', () => {
    it('should render page title', async () => {
      render(<Payroll />);
      await waitFor(() => {
        expect(screen.getByText('給与計算')).toBeInTheDocument();
      });
    });

    it('should render page description', async () => {
      render(<Payroll />);
      await waitFor(() => {
        expect(screen.getByText('給与明細の作成・管理')).toBeInTheDocument();
      });
    });

    it('should render add payroll button', async () => {
      render(<Payroll />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /給与計算/ })).toBeInTheDocument();
      });
    });

    it('should render summary cards', async () => {
      render(<Payroll />);
      await waitFor(() => {
        expect(screen.getByText('総支給額')).toBeInTheDocument();
        expect(screen.getByText('差引支給額')).toBeInTheDocument();
        expect(screen.getByText('給与明細')).toBeInTheDocument();
      });
    });

    it('should render month selector', async () => {
      render(<Payroll />);
      await waitFor(() => {
        expect(screen.getByText(/月を選択/)).toBeInTheDocument();
      });
    });

    it('should render payroll table headers', async () => {
      render(<Payroll />);
      await waitFor(() => {
        expect(screen.getByText('社員番号')).toBeInTheDocument();
        expect(screen.getByText('氏名')).toBeInTheDocument();
        expect(screen.getByText('支給期間')).toBeInTheDocument();
        expect(screen.getByText('ステータス')).toBeInTheDocument();
      });
    });
  });
});
