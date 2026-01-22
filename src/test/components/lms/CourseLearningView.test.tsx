import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CourseLearningView } from '@/components/lms/CourseLearningView';
import type { LmsCourse } from '@/hooks/useLMS';

// Mock the hooks
const mockEnrollUser = { mutateAsync: vi.fn() };
const mockUpdateProgress = { mutateAsync: vi.fn() };

vi.mock('@/hooks/useLMS', () => ({
  useLessons: (courseId: string) => ({
    lessons: courseId === 'course-with-lessons' ? [
      {
        id: 'lesson-1',
        course_id: 'course-with-lessons',
        title: 'レッスン1: 基礎編',
        content_type: 'text',
        content_text: 'レッスン1のコンテンツです',
        content_url: null,
        sort_order: 1,
      },
      {
        id: 'lesson-2',
        course_id: 'course-with-lessons',
        title: 'レッスン2: 動画編',
        content_type: 'video',
        content_text: null,
        content_url: 'https://example.com/video.mp4',
        sort_order: 2,
      },
      {
        id: 'lesson-3',
        course_id: 'course-with-lessons',
        title: 'レッスン3: まとめ',
        content_type: 'text',
        content_text: 'レッスン3のまとめです',
        content_url: null,
        sort_order: 3,
      },
    ] : [],
    isLoading: courseId === 'loading-course',
  }),
  useEnrollments: () => ({
    enrollments: [
      {
        id: 'enrollment-1',
        user_id: 'current-user-id',
        course_id: 'course-with-lessons',
        started_at: '2024-01-01',
        progress: 33,
        completed_at: null,
        last_accessed_at: '2024-01-01',
      },
    ],
    enrollUser: mockEnrollUser,
    updateProgress: mockUpdateProgress,
  }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'current-user-id' },
  }),
}));

describe('CourseLearningView', () => {
  const mockCourse: LmsCourse = {
    id: 'course-with-lessons',
    company_id: 'company-1',
    title: 'テストコース',
    description: 'テストコースの説明',
    category: 'general',
    is_published: true,
    instructor_id: null,
    thumbnail_url: null,
    duration_hours: 10,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  };

  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state', () => {
    const loadingCourse: LmsCourse = { ...mockCourse, id: 'loading-course' };
    render(<CourseLearningView course={loadingCourse} onClose={mockOnClose} />);

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('should display course title', () => {
    render(<CourseLearningView course={mockCourse} onClose={mockOnClose} />);

    expect(screen.getByText('テストコース')).toBeInTheDocument();
  });

  it('should display lesson count', () => {
    render(<CourseLearningView course={mockCourse} onClose={mockOnClose} />);

    expect(screen.getByText('3 レッスン')).toBeInTheDocument();
  });

  it('should display progress', () => {
    render(<CourseLearningView course={mockCourse} onClose={mockOnClose} />);

    expect(screen.getByText('進捗')).toBeInTheDocument();
    expect(screen.getByText('33%')).toBeInTheDocument();
  });

  it('should show lesson list in sidebar', () => {
    render(<CourseLearningView course={mockCourse} onClose={mockOnClose} />);

    // Use getAllByText since lesson title appears in both sidebar and main content
    expect(screen.getAllByText('レッスン1: 基礎編').length).toBeGreaterThan(0);
    expect(screen.getAllByText('レッスン2: 動画編').length).toBeGreaterThan(0);
    expect(screen.getAllByText('レッスン3: まとめ').length).toBeGreaterThan(0);
  });

  it('should show current lesson indicator', () => {
    render(<CourseLearningView course={mockCourse} onClose={mockOnClose} />);

    expect(screen.getByText('レッスン 1 / 3')).toBeInTheDocument();
  });

  it('should display current lesson title', () => {
    render(<CourseLearningView course={mockCourse} onClose={mockOnClose} />);

    expect(screen.getAllByText('レッスン1: 基礎編').length).toBeGreaterThan(0);
  });

  it('should show lesson content', () => {
    render(<CourseLearningView course={mockCourse} onClose={mockOnClose} />);

    expect(screen.getByText('レッスン1のコンテンツです')).toBeInTheDocument();
  });

  it('should have close button', () => {
    render(<CourseLearningView course={mockCourse} onClose={mockOnClose} />);

    const closeButton = screen.getByText('閉じる');
    expect(closeButton).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(<CourseLearningView course={mockCourse} onClose={mockOnClose} />);

    const closeButton = screen.getByText('閉じる');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should have navigation buttons', () => {
    render(<CourseLearningView course={mockCourse} onClose={mockOnClose} />);

    expect(screen.getByText('前のレッスン')).toBeInTheDocument();
    expect(screen.getByText('次のレッスン')).toBeInTheDocument();
    expect(screen.getByText('完了にする')).toBeInTheDocument();
  });

  it('should disable previous button on first lesson', () => {
    render(<CourseLearningView course={mockCourse} onClose={mockOnClose} />);

    const prevButton = screen.getByText('前のレッスン');
    expect(prevButton).toBeDisabled();
  });

  it('should navigate to next lesson when clicking next button', () => {
    render(<CourseLearningView course={mockCourse} onClose={mockOnClose} />);

    const nextButton = screen.getByText('次のレッスン');
    fireEvent.click(nextButton);

    expect(screen.getByText('レッスン 2 / 3')).toBeInTheDocument();
  });

  it('should navigate to lesson when clicking sidebar item', () => {
    render(<CourseLearningView course={mockCourse} onClose={mockOnClose} />);

    const lesson3Button = screen.getByText('レッスン3: まとめ');
    fireEvent.click(lesson3Button);

    expect(screen.getByText('レッスン 3 / 3')).toBeInTheDocument();
  });

  it('should show empty message when no lessons', () => {
    const emptyCourse: LmsCourse = { ...mockCourse, id: 'empty-course' };
    render(<CourseLearningView course={emptyCourse} onClose={mockOnClose} />);

    expect(screen.getByText('このコースにはまだレッスンがありません')).toBeInTheDocument();
  });
});
