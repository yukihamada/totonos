import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IndustrySelector } from '@/components/IndustrySelector';
import type { IndustryTemplate } from '@/types/industry-template';

// Mock the hooks
vi.mock('@/hooks/useIndustryTemplates', () => ({
  useTemplatesGroupedByCategory: () => ({
    data: {
      retail: [
        {
          id: '1',
          template_key: 'retail-general',
          name: '小売店',
          name_en: 'Retail',
          description: '一般的な小売業向け',
          category: 'retail',
          icon: '🛒',
          color: '#3B82F6',
          is_featured: true,
          is_active: true,
          sort_order: 1,
          hero_image_url: null,
          keywords: [],
          created_at: '2024-01-01',
        },
      ],
      service: [
        {
          id: '2',
          template_key: 'restaurant',
          name: '飲食店',
          name_en: 'Restaurant',
          description: 'レストラン向け',
          category: 'service',
          icon: '🍽️',
          color: '#F59E0B',
          is_featured: false,
          is_active: true,
          sort_order: 1,
          hero_image_url: null,
          keywords: [],
          created_at: '2024-01-01',
        },
      ],
      professional: [],
      healthcare: [],
      construction: [],
      it: [
        {
          id: '3',
          template_key: 'it-services',
          name: 'ITサービス',
          name_en: 'IT Services',
          description: 'IT企業向け',
          category: 'it',
          icon: '💻',
          color: '#10B981',
          is_featured: true,
          is_active: true,
          sort_order: 1,
          hero_image_url: null,
          keywords: [],
          created_at: '2024-01-01',
        },
      ],
      logistics: [],
      education: [],
    },
    isLoading: false,
  }),
}));

describe('IndustrySelector', () => {
  const mockOnSelect = vi.fn();
  const mockTemplate: IndustryTemplate = {
    id: '1',
    template_key: 'retail-general',
    name: '小売店',
    name_en: 'Retail',
    description: '一般的な小売業向け',
    category: 'retail',
    icon: '🛒',
    color: '#3B82F6',
    is_featured: true,
    is_active: true,
    sort_order: 1,
    hero_image_url: null,
    keywords: [],
    created_at: '2024-01-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render search input', () => {
    render(
      <IndustrySelector
        selectedTemplate={null}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByPlaceholderText('業種を検索...')).toBeInTheDocument();
  });

  it('should render category tabs', () => {
    render(
      <IndustrySelector
        selectedTemplate={null}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('すべて')).toBeInTheDocument();
  });

  it('should render template cards', () => {
    render(
      <IndustrySelector
        selectedTemplate={null}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('小売店')).toBeInTheDocument();
    expect(screen.getByText('飲食店')).toBeInTheDocument();
    expect(screen.getByText('ITサービス')).toBeInTheDocument();
  });

  it('should call onSelect when template card is clicked', () => {
    render(
      <IndustrySelector
        selectedTemplate={null}
        onSelect={mockOnSelect}
      />
    );

    const templateCard = screen.getByText('小売店').closest('[class*="cursor-pointer"]');
    if (templateCard) {
      fireEvent.click(templateCard);
    }

    expect(mockOnSelect).toHaveBeenCalled();
  });

  it('should show selected state for selected template', () => {
    render(
      <IndustrySelector
        selectedTemplate={mockTemplate}
        onSelect={mockOnSelect}
      />
    );

    const templateCard = screen.getByText('小売店').closest('[class*="cursor-pointer"]');
    expect(templateCard?.className).toContain('ring');
  });

  it('should filter templates when searching', () => {
    render(
      <IndustrySelector
        selectedTemplate={null}
        onSelect={mockOnSelect}
      />
    );

    const searchInput = screen.getByPlaceholderText('業種を検索...');
    fireEvent.change(searchInput, { target: { value: 'IT' } });

    expect(screen.getByText('ITサービス')).toBeInTheDocument();
    expect(screen.queryByText('小売店')).not.toBeInTheDocument();
  });

  it('should filter by English name', () => {
    render(
      <IndustrySelector
        selectedTemplate={null}
        onSelect={mockOnSelect}
      />
    );

    const searchInput = screen.getByPlaceholderText('業種を検索...');
    fireEvent.change(searchInput, { target: { value: 'Retail' } });

    expect(screen.getByText('小売店')).toBeInTheDocument();
    expect(screen.queryByText('飲食店')).not.toBeInTheDocument();
  });

  it('should filter by description', () => {
    render(
      <IndustrySelector
        selectedTemplate={null}
        onSelect={mockOnSelect}
      />
    );

    const searchInput = screen.getByPlaceholderText('業種を検索...');
    fireEvent.change(searchInput, { target: { value: 'レストラン' } });

    expect(screen.getByText('飲食店')).toBeInTheDocument();
    expect(screen.queryByText('小売店')).not.toBeInTheDocument();
  });
});
