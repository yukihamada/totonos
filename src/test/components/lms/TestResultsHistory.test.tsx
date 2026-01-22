import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestResultsHistory } from '@/components/lms/TestResultsHistory';

// Mock the useLMS hook
vi.mock('@/hooks/useLMS', () => ({
  useTestResults: (testId: string) => ({
    results: testId === 'test-with-data' ? [
      {
        id: '1',
        user_id: 'user-1',
        test_id: 'test-with-data',
        score: 80,
        max_score: 100,
        passed: true,
        completed_at: '2024-01-15T10:00:00Z',
        attempt_number: 1,
      },
      {
        id: '2',
        user_id: 'user-1',
        test_id: 'test-with-data',
        score: 60,
        max_score: 100,
        passed: false,
        completed_at: '2024-01-10T10:00:00Z',
        attempt_number: 2,
      },
    ] : [],
    isLoading: testId === 'loading-test',
  }),
}));

// Mock recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

describe('TestResultsHistory', () => {
  it('should show loading state', () => {
    render(
      <TestResultsHistory
        testId="loading-test"
        testName="テスト名"
        passScore={70}
      />
    );

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('should show stats cards', () => {
    render(
      <TestResultsHistory
        testId="test-with-data"
        testName="テスト名"
        passScore={70}
      />
    );

    expect(screen.getByText('受験回数')).toBeInTheDocument();
    expect(screen.getByText('合格回数')).toBeInTheDocument();
    expect(screen.getByText('平均スコア')).toBeInTheDocument();
    expect(screen.getByText('合格率')).toBeInTheDocument();
  });

  it('should display correct stats values', () => {
    render(
      <TestResultsHistory
        testId="test-with-data"
        testName="テスト名"
        passScore={70}
      />
    );

    // 2 test attempts
    expect(screen.getByText('2')).toBeInTheDocument();
    // 1 pass
    expect(screen.getByText('1')).toBeInTheDocument();
    // 70% average (80+60)/2
    expect(screen.getByText('70%')).toBeInTheDocument();
    // 50% pass rate (1/2)
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('should show chart sections', () => {
    render(
      <TestResultsHistory
        testId="test-with-data"
        testName="テスト名"
        passScore={70}
      />
    );

    expect(screen.getByText('スコア推移')).toBeInTheDocument();
    expect(screen.getByText('直近10回の受験結果')).toBeInTheDocument();
    expect(screen.getByText('スコア分布')).toBeInTheDocument();
    expect(screen.getByText('得点帯別の受験回数')).toBeInTheDocument();
  });

  it('should show results table', () => {
    render(
      <TestResultsHistory
        testId="test-with-data"
        testName="テスト名"
        passScore={70}
      />
    );

    expect(screen.getByText('受験履歴')).toBeInTheDocument();
    expect(screen.getByText('回数')).toBeInTheDocument();
    expect(screen.getByText('受験日時')).toBeInTheDocument();
    expect(screen.getByText('スコア')).toBeInTheDocument();
    expect(screen.getByText('得点率')).toBeInTheDocument();
    expect(screen.getByText('結果')).toBeInTheDocument();
  });

  it('should show pass/fail badges correctly', () => {
    render(
      <TestResultsHistory
        testId="test-with-data"
        testName="テスト名"
        passScore={70}
      />
    );

    expect(screen.getByText('合格')).toBeInTheDocument();
    expect(screen.getByText('不合格')).toBeInTheDocument();
  });

  it('should show empty message when no results', () => {
    render(
      <TestResultsHistory
        testId="no-data-test"
        testName="テスト名"
        passScore={70}
      />
    );

    expect(screen.getByText('まだ受験履歴がありません')).toBeInTheDocument();
  });
});
