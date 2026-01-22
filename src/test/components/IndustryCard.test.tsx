import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { IndustryCard } from '@/components/IndustryCard';

// Wrapper with router
const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('IndustryCard', () => {
  const mockTemplate = {
    id: '1',
    template_key: 'retail-general',
    name: '小売店',
    name_en: 'Retail',
    description: '一般的な小売業向けテンプレート',
    category: 'retail' as const,
    icon: 'ShoppingCart',
    color: '#3B82F6',
    is_featured: true,
    is_active: true,
    sort_order: 1,
    hero_image_url: null,
    keywords: ['小売', '店舗'],
    created_at: '2024-01-01',
    menu_config: {
      menu_groups: [
        { id: 'crm', priority: 1 },
        { id: 'sales', priority: 2 },
        { id: 'inventory', priority: 3 },
      ],
      hidden_features: ['accounting', 'hr'],
      emphasized_features: ['crm'],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render template name', () => {
    renderWithRouter(<IndustryCard template={mockTemplate} />);
    expect(screen.getByText('小売店')).toBeInTheDocument();
  });

  it('should render template description', () => {
    renderWithRouter(<IndustryCard template={mockTemplate} />);
    expect(screen.getByText('一般的な小売業向けテンプレート')).toBeInTheDocument();
  });

  it('should render featured badge for featured templates', () => {
    renderWithRouter(<IndustryCard template={mockTemplate} />);
    expect(screen.getByText('おすすめ')).toBeInTheDocument();
  });

  it('should not render featured badge for non-featured templates', () => {
    const nonFeaturedTemplate = { ...mockTemplate, is_featured: false };
    renderWithRouter(<IndustryCard template={nonFeaturedTemplate} />);
    expect(screen.queryByText('おすすめ')).not.toBeInTheDocument();
  });

  it('should render detail link button', () => {
    renderWithRouter(<IndustryCard template={mockTemplate} />);
    expect(screen.getByText('詳細を見る')).toBeInTheDocument();
  });

  it('should render feature selection button', () => {
    renderWithRouter(<IndustryCard template={mockTemplate} />);
    expect(screen.getByText('機能を選んで始める')).toBeInTheDocument();
  });

  it('should open dialog when feature selection button is clicked', () => {
    renderWithRouter(<IndustryCard template={mockTemplate} />);
    const button = screen.getByText('機能を選んで始める');
    fireEvent.click(button);
    expect(screen.getAllByText('小売店').length).toBeGreaterThan(1);
  });

  it('should render fallback description when description is null', () => {
    const templateWithoutDesc = { ...mockTemplate, description: null };
    renderWithRouter(<IndustryCard template={templateWithoutDesc} />);
    expect(screen.getByText('小売店に特化した業務管理テンプレート')).toBeInTheDocument();
  });

  it('should have correct link href', () => {
    renderWithRouter(<IndustryCard template={mockTemplate} />);
    const link = screen.getByText('詳細を見る').closest('a');
    expect(link).toHaveAttribute('href', '/lp/retail-general');
  });
});
