import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../test-utils';
import Attendance from '@/pages/Attendance';

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
  useClockIn: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useClockOut: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

describe('Attendance Page', () => {
  describe('rendering', () => {
    it('should render page title', async () => {
      render(<Attendance />);
      await waitFor(() => {
        expect(screen.getByText('勤怠管理')).toBeInTheDocument();
      });
    });

    it('should render page description', async () => {
      render(<Attendance />);
      await waitFor(() => {
        expect(screen.getByText('出退勤記録・勤務時間管理')).toBeInTheDocument();
      });
    });

    it('should render clock in/out section', async () => {
      render(<Attendance />);
      await waitFor(() => {
        expect(screen.getByText(/今日の打刻/)).toBeInTheDocument();
      });
    });

    it('should render summary cards', async () => {
      render(<Attendance />);
      await waitFor(() => {
        expect(screen.getByText('出勤日数')).toBeInTheDocument();
        expect(screen.getByText('総労働時間')).toBeInTheDocument();
        expect(screen.getByText('残業時間')).toBeInTheDocument();
      });
    });

    it('should render month selector', async () => {
      render(<Attendance />);
      await waitFor(() => {
        expect(screen.getByText(/月を選択/)).toBeInTheDocument();
      });
    });

    it('should render employee selector', async () => {
      render(<Attendance />);
      await waitFor(() => {
        expect(screen.getByText('全従業員')).toBeInTheDocument();
      });
    });

    it('should render attendance table headers', async () => {
      render(<Attendance />);
      await waitFor(() => {
        expect(screen.getByText('日付')).toBeInTheDocument();
        expect(screen.getByText('従業員')).toBeInTheDocument();
        expect(screen.getByText('出勤')).toBeInTheDocument();
        expect(screen.getByText('退勤')).toBeInTheDocument();
        expect(screen.getByText('労働時間')).toBeInTheDocument();
        expect(screen.getByText('残業')).toBeInTheDocument();
      });
    });
  });
});
