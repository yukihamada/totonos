import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import Payslips from '@/pages/Payslips';

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
}));

describe('Payslips Page', () => {
  describe('rendering', () => {
    it('should render page title', async () => {
      render(<Payslips />);
      await waitFor(() => {
        expect(screen.getByText('給与明細')).toBeInTheDocument();
      });
    });

    it('should render page description', async () => {
      render(<Payslips />);
      await waitFor(() => {
        expect(screen.getByText('従業員の給与明細を確認・発行')).toBeInTheDocument();
      });
    });

    it('should render action buttons', async () => {
      render(<Payslips />);
      await waitFor(() => {
        expect(screen.getByText('一括ダウンロード')).toBeInTheDocument();
        expect(screen.getByText('一括配信')).toBeInTheDocument();
      });
    });

    it('should render summary cards', async () => {
      render(<Payslips />);
      await waitFor(() => {
        expect(screen.getByText('対象人数')).toBeInTheDocument();
        expect(screen.getByText('総支給額合計')).toBeInTheDocument();
        expect(screen.getByText('控除額合計')).toBeInTheDocument();
        expect(screen.getByText('差引支給額合計')).toBeInTheDocument();
      });
    });

    it('should render status section', async () => {
      render(<Payslips />);
      await waitFor(() => {
        expect(screen.getByText('ステータス')).toBeInTheDocument();
      });
    });

    it('should render payslips list section', async () => {
      render(<Payslips />);
      await waitFor(() => {
        expect(screen.getByText('給与明細一覧')).toBeInTheDocument();
      });
    });

    it('should render table headers', async () => {
      render(<Payslips />);
      await waitFor(() => {
        expect(screen.getByText('社員番号')).toBeInTheDocument();
        expect(screen.getByText('氏名')).toBeInTheDocument();
        expect(screen.getByText('部署')).toBeInTheDocument();
        expect(screen.getByText('基本給')).toBeInTheDocument();
      });
    });
  });
});
