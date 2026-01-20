import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import LeaveRequests from '@/pages/LeaveRequests';

// Mock hooks
vi.mock('@/hooks/useHR', () => ({
  useEmployees: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
  useAttendanceRecords: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
}));

describe('LeaveRequests Page', () => {
  describe('rendering', () => {
    it('should render page title', async () => {
      render(<LeaveRequests />);
      await waitFor(() => {
        expect(screen.getByText('休暇管理')).toBeInTheDocument();
      });
    });

    it('should render page description', async () => {
      render(<LeaveRequests />);
      await waitFor(() => {
        expect(screen.getByText('休暇申請と取得状況の管理')).toBeInTheDocument();
      });
    });

    it('should render add leave button', async () => {
      render(<LeaveRequests />);
      await waitFor(() => {
        expect(screen.getByText('休暇を登録')).toBeInTheDocument();
      });
    });

    it('should render statistics cards', async () => {
      render(<LeaveRequests />);
      await waitFor(() => {
        expect(screen.getByText('有給取得')).toBeInTheDocument();
        expect(screen.getByText('病欠')).toBeInTheDocument();
        expect(screen.getByText('半休')).toBeInTheDocument();
        expect(screen.getByText('欠勤')).toBeInTheDocument();
        expect(screen.getByText('合計休暇')).toBeInTheDocument();
      });
    });

    it('should render leave history section', async () => {
      render(<LeaveRequests />);
      await waitFor(() => {
        expect(screen.getByText('休暇履歴')).toBeInTheDocument();
        expect(screen.getByText('直近の休暇取得記録')).toBeInTheDocument();
      });
    });

    it('should render employee leave summary section', async () => {
      render(<LeaveRequests />);
      await waitFor(() => {
        expect(screen.getByText('従業員別休暇取得状況')).toBeInTheDocument();
      });
    });

    it('should render leave summary table headers', async () => {
      render(<LeaveRequests />);
      await waitFor(() => {
        expect(screen.getByText('従業員番号')).toBeInTheDocument();
        expect(screen.getAllByText('氏名').length).toBeGreaterThan(0);
      });
    });
  });
});
