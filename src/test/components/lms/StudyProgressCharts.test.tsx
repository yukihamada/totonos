import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StudyProgressCharts } from '@/components/lms/StudyProgressCharts';
import type { LmsEnrollment, LmsTestResult } from '@/hooks/useLMS';

// Mock recharts to avoid rendering issues in tests
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

describe('StudyProgressCharts', () => {
  const mockEnrollments: LmsEnrollment[] = [
    {
      id: '1',
      user_id: 'user-1',
      course_id: 'course-1',
      started_at: '2024-01-01',
      progress: 100,
      completed_at: '2024-01-15',
      last_accessed_at: '2024-01-15',
    },
    {
      id: '2',
      user_id: 'user-1',
      course_id: 'course-2',
      started_at: '2024-01-10',
      progress: 50,
      completed_at: null,
      last_accessed_at: '2024-01-12',
    },
    {
      id: '3',
      user_id: 'user-1',
      course_id: 'course-3',
      started_at: '2024-01-20',
      progress: 0,
      completed_at: null,
      last_accessed_at: '2024-01-20',
    },
  ];

  const mockTestResults: LmsTestResult[] = [
    {
      id: '1',
      user_id: 'user-1',
      test_id: 'test-1',
      company_id: 'company-1',
      score: 80,
      max_score: 100,
      passed: true,
      started_at: '2024-01-01T10:00:00Z',
      completed_at: new Date().toISOString(),
      created_at: '2024-01-01',
      attempt_number: 1,
      answers: null,
      test: {
        id: 'test-1',
        company_id: 'company-1',
        course_id: 'course-1',
        title: 'テスト1',
        description: null,
        pass_score: 70,
        time_limit_minutes: 30,
        max_attempts: 3,
        is_published: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    },
    {
      id: '2',
      user_id: 'user-1',
      test_id: 'test-2',
      company_id: 'company-1',
      score: 60,
      max_score: 100,
      passed: false,
      started_at: '2024-01-02T10:00:00Z',
      completed_at: new Date().toISOString(),
      created_at: '2024-01-02',
      attempt_number: 1,
      answers: null,
      test: {
        id: 'test-2',
        company_id: 'company-1',
        course_id: 'course-1',
        title: 'テスト2',
        description: null,
        pass_score: 70,
        time_limit_minutes: 30,
        max_attempts: 3,
        is_published: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    },
  ];

  it('should render course progress section', () => {
    render(<StudyProgressCharts enrollments={mockEnrollments} testResults={mockTestResults} />);

    expect(screen.getByText('コース進捗状況')).toBeInTheDocument();
    expect(screen.getByText('受講コースのステータス分布')).toBeInTheDocument();
  });

  it('should render test scores section', () => {
    render(<StudyProgressCharts enrollments={mockEnrollments} testResults={mockTestResults} />);

    expect(screen.getByText('テストスコア')).toBeInTheDocument();
    expect(screen.getByText('直近10件のテスト結果')).toBeInTheDocument();
  });

  it('should render monthly trend section', () => {
    render(<StudyProgressCharts enrollments={mockEnrollments} testResults={mockTestResults} />);

    expect(screen.getByText('月別学習推移')).toBeInTheDocument();
    expect(screen.getByText('過去6ヶ月のテスト受験数と平均スコア')).toBeInTheDocument();
  });

  it('should show empty message when no enrollments', () => {
    render(<StudyProgressCharts enrollments={[]} testResults={mockTestResults} />);

    expect(screen.getAllByText('データがありません').length).toBeGreaterThan(0);
  });

  it('should show empty message when no test results', () => {
    render(<StudyProgressCharts enrollments={mockEnrollments} testResults={[]} />);

    expect(screen.getAllByText('データがありません').length).toBeGreaterThan(0);
  });

  it('should render charts when data is provided', () => {
    render(<StudyProgressCharts enrollments={mockEnrollments} testResults={mockTestResults} />);

    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });
});
