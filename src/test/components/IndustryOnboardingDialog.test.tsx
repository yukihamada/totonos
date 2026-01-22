import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IndustryOnboardingDialog } from '@/components/IndustryOnboardingDialog';

// Mock the hooks
vi.mock('@/hooks/useIndustryTemplates', () => ({
  useIndustryTemplatesWithConfig: () => ({
    data: [
      {
        id: '1',
        template_key: 'retail-general',
        name: '小売店',
        description: '一般的な小売業向け',
        category: 'retail',
        icon: 'ShoppingCart',
        color: '#3B82F6',
        is_featured: true,
        keywords: ['小売', '店舗'],
      },
      {
        id: '2',
        template_key: 'restaurant',
        name: '飲食店',
        description: 'レストラン・カフェ向け',
        category: 'service',
        icon: 'Utensils',
        color: '#F59E0B',
        is_featured: false,
        keywords: ['飲食', 'レストラン'],
      },
      {
        id: '3',
        template_key: 'it-services',
        name: 'ITサービス',
        description: 'IT企業向け',
        category: 'it',
        icon: 'Code',
        color: '#10B981',
        is_featured: true,
        keywords: ['IT', 'ソフトウェア'],
      },
    ],
    isLoading: false,
  }),
}));

describe('IndustryOnboardingDialog', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dialog when open', () => {
    render(
      <IndustryOnboardingDialog
        open={true}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByText('業種を選択')).toBeInTheDocument();
    expect(screen.getByText(/業種を選択すると/)).toBeInTheDocument();
  });

  it('should render search input', () => {
    render(
      <IndustryOnboardingDialog
        open={true}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByPlaceholderText('業種を検索...')).toBeInTheDocument();
  });

  it('should render category tabs', () => {
    render(
      <IndustryOnboardingDialog
        open={true}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByText('すべて')).toBeInTheDocument();
  });

  it('should render template cards', () => {
    render(
      <IndustryOnboardingDialog
        open={true}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByText('小売店')).toBeInTheDocument();
    expect(screen.getByText('飲食店')).toBeInTheDocument();
    expect(screen.getByText('ITサービス')).toBeInTheDocument();
  });

  it('should show featured badge on featured templates', () => {
    render(
      <IndustryOnboardingDialog
        open={true}
        onComplete={mockOnComplete}
      />
    );

    // Featured templates should show "おすすめ" badge
    expect(screen.getAllByText('おすすめ').length).toBeGreaterThan(0);
  });

  it('should filter templates when searching', () => {
    render(
      <IndustryOnboardingDialog
        open={true}
        onComplete={mockOnComplete}
      />
    );

    const searchInput = screen.getByPlaceholderText('業種を検索...');
    fireEvent.change(searchInput, { target: { value: 'IT' } });

    expect(screen.getByText('ITサービス')).toBeInTheDocument();
    expect(screen.queryByText('小売店')).not.toBeInTheDocument();
  });

  it('should show selection prompt when no template selected', () => {
    render(
      <IndustryOnboardingDialog
        open={true}
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByText('業種を選択してください')).toBeInTheDocument();
  });

  it('should have disabled button when no template selected', () => {
    render(
      <IndustryOnboardingDialog
        open={true}
        onComplete={mockOnComplete}
      />
    );

    const submitButton = screen.getByText('この業種で始める');
    expect(submitButton).toBeDisabled();
  });

  it('should enable button when template is selected', () => {
    render(
      <IndustryOnboardingDialog
        open={true}
        onComplete={mockOnComplete}
      />
    );

    // Click on a template card
    const templateCard = screen.getByText('小売店').closest('[class*="cursor-pointer"]');
    if (templateCard) {
      fireEvent.click(templateCard);
    }

    const submitButton = screen.getByText('この業種で始める');
    expect(submitButton).not.toBeDisabled();
  });

  it('should show loading state', () => {
    render(
      <IndustryOnboardingDialog
        open={true}
        onComplete={mockOnComplete}
        isLoading={true}
      />
    );

    expect(screen.getByText('設定中...')).toBeInTheDocument();
  });

  it('should call onComplete when submit is clicked', async () => {
    render(
      <IndustryOnboardingDialog
        open={true}
        onComplete={mockOnComplete}
      />
    );

    // Click on a template card
    const templateCard = screen.getByText('小売店').closest('[class*="cursor-pointer"]');
    if (templateCard) {
      fireEvent.click(templateCard);
    }

    const submitButton = screen.getByText('この業種で始める');
    fireEvent.click(submitButton);

    expect(mockOnComplete).toHaveBeenCalledWith('retail-general');
  });
});
