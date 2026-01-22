import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CourseEnrollmentsTab } from '@/components/lms/CourseEnrollmentsTab';

// Mock the hooks
vi.mock('@/hooks/useLMS', () => ({
  useEnrollments: (courseId: string) => ({
    enrollments: courseId === 'course-with-data' ? [
      {
        id: '1',
        user_id: 'user-123',
        course_id: 'course-with-data',
        started_at: '2024-01-01T00:00:00Z',
        progress: 100,
        completed_at: '2024-01-15T00:00:00Z',
      },
      {
        id: '2',
        user_id: 'user-456',
        course_id: 'course-with-data',
        started_at: '2024-01-10T00:00:00Z',
        progress: 50,
        completed_at: null,
      },
      {
        id: '3',
        user_id: 'user-789',
        course_id: 'course-with-data',
        started_at: '2024-01-20T00:00:00Z',
        progress: 0,
        completed_at: null,
      },
    ] : [],
    isLoading: courseId === 'loading-course',
    enrollUser: { mutateAsync: vi.fn() },
    updateProgress: { mutateAsync: vi.fn() },
  }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'current-user-id' },
  }),
}));

describe('CourseEnrollmentsTab', () => {
  it('should show loading state', () => {
    render(
      <CourseEnrollmentsTab
        courseId="loading-course"
        courseName="テストコース"
      />
    );

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('should show stats cards', () => {
    render(
      <CourseEnrollmentsTab
        courseId="course-with-data"
        courseName="テストコース"
      />
    );

    expect(screen.getByText('総受講者数')).toBeInTheDocument();
    expect(screen.getByText('完了者')).toBeInTheDocument();
    // '進行中' appears multiple times (in stats and table), use getAllByText
    expect(screen.getAllByText('進行中').length).toBeGreaterThan(0);
    expect(screen.getByText('平均進捗')).toBeInTheDocument();
  });

  it('should display correct stats values', () => {
    render(
      <CourseEnrollmentsTab
        courseId="course-with-data"
        courseName="テストコース"
      />
    );

    // Check that stats are rendered (values may appear multiple times)
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('50%').length).toBeGreaterThan(0);
  });

  it('should show search input', () => {
    render(
      <CourseEnrollmentsTab
        courseId="course-with-data"
        courseName="テストコース"
      />
    );

    expect(screen.getByPlaceholderText('受講者を検索...')).toBeInTheDocument();
  });

  it('should show enroll button when user not enrolled', () => {
    render(
      <CourseEnrollmentsTab
        courseId="course-with-data"
        courseName="テストコース"
      />
    );

    expect(screen.getByText('このコースに登録')).toBeInTheDocument();
  });

  it('should show enrollments table with headers', () => {
    render(
      <CourseEnrollmentsTab
        courseId="course-with-data"
        courseName="テストコース"
      />
    );

    expect(screen.getByText('受講者ID')).toBeInTheDocument();
    expect(screen.getByText('開始日')).toBeInTheDocument();
    expect(screen.getByText('進捗')).toBeInTheDocument();
    expect(screen.getByText('ステータス')).toBeInTheDocument();
    expect(screen.getByText('完了日')).toBeInTheDocument();
    expect(screen.getByText('アクション')).toBeInTheDocument();
  });

  it('should show completed and in-progress badges', () => {
    render(
      <CourseEnrollmentsTab
        courseId="course-with-data"
        courseName="テストコース"
      />
    );

    expect(screen.getAllByText('完了').length).toBeGreaterThan(0);
    expect(screen.getAllByText('進行中').length).toBeGreaterThan(0);
  });

  it('should show update progress buttons', () => {
    render(
      <CourseEnrollmentsTab
        courseId="course-with-data"
        courseName="テストコース"
      />
    );

    const updateButtons = screen.getAllByText('進捗更新');
    expect(updateButtons.length).toBe(3);
  });

  it('should show empty message when no enrollments', () => {
    render(
      <CourseEnrollmentsTab
        courseId="empty-course"
        courseName="テストコース"
      />
    );

    expect(screen.getByText('受講者がまだいません')).toBeInTheDocument();
  });

  it('should open enroll dialog on button click', () => {
    render(
      <CourseEnrollmentsTab
        courseId="course-with-data"
        courseName="テストコース"
      />
    );

    const enrollButton = screen.getByText('このコースに登録');
    fireEvent.click(enrollButton);

    expect(screen.getByText('コースに登録')).toBeInTheDocument();
    expect(screen.getByText(/テストコース/)).toBeInTheDocument();
  });

  it('should filter enrollments by search term', () => {
    render(
      <CourseEnrollmentsTab
        courseId="course-with-data"
        courseName="テストコース"
      />
    );

    const searchInput = screen.getByPlaceholderText('受講者を検索...');
    fireEvent.change(searchInput, { target: { value: 'user-123' } });

    // Should show only one enrollment
    const updateButtons = screen.getAllByText('進捗更新');
    expect(updateButtons.length).toBe(1);
  });
});
